import { AppSettings, DailyQuote, JournalEntry, WeeklyInsight } from '../types';
import { INITIAL_ENTRIES, INITIAL_WEEKLY_INSIGHT } from '../data/constants';
import { getDailyQuoteForDate } from '../data/quotes';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const STORAGE_KEY_ENTRIES = 'dagboek_entries_v1';
const STORAGE_KEY_SETTINGS = 'dagboek_settings_v1';
const STORAGE_KEY_INSIGHT = 'dagboek_weekly_insight_v1';
const STORAGE_KEY_DAILY_QUOTE = 'dagboek_daily_quote_v1';

const ENTRIES_COLLECTION = 'entries';
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'user_config';

export const defaultSettings: AppSettings = {
  userName: 'Tygo',
  pinEnabled: false,
  pinCode: '1234',
  isLocked: false,
  dailyReminderEnabled: true,
  dailyReminderTime: '20:30',
};

// Helper to remove any undefined fields before sending to Firestore
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = sanitizeForFirestore(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// Firestore real-time synchronization for multi-device (phone + laptop)
export async function syncEntryToFirestore(entry: JournalEntry): Promise<void> {
  try {
    const entryRef = doc(db, ENTRIES_COLLECTION, entry.id);
    const cleanEntry = sanitizeForFirestore(entry);
    await setDoc(entryRef, cleanEntry, { merge: true });
  } catch (err) {
    console.warn('Firestore sync mislukt voor bericht:', entry.id, err);
  }
}

export async function deleteEntryFromFirestore(id: string): Promise<void> {
  try {
    const entryRef = doc(db, ENTRIES_COLLECTION, id);
    await deleteDoc(entryRef);
  } catch (err) {
    console.warn('Firestore verwijderen mislukt voor bericht:', id, err);
  }
}

export async function syncAllEntriesToFirestore(entries: JournalEntry[]): Promise<void> {
  try {
    await Promise.all(
      entries.map((entry) => {
        const entryRef = doc(db, ENTRIES_COLLECTION, entry.id);
        const cleanEntry = sanitizeForFirestore(entry);
        return setDoc(entryRef, cleanEntry, { merge: true });
      })
    );
  } catch (err) {
    console.warn('Fout bij sync van berichten naar Firestore:', err);
  }
}

export function subscribeFirestoreEntries(
  onUpdate: (entries: JournalEntry[]) => void
): () => void {
  try {
    const q = query(collection(db, ENTRIES_COLLECTION));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: JournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as JournalEntry;
          if (data && data.id) {
            list.push(data);
          }
        });

        if (list.length > 0) {
          // Sort chronologically descending (newest first)
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(list));
          pushEntriesToServer(list);
          onUpdate(list);
        }
      },
      (err) => {
        console.warn('Firestore snapshot listener waarschuwing:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Kon Firestore listener niet starten:', err);
    return () => {};
  }
}

export async function fetchServerEntries(): Promise<JournalEntry[] | null> {
  try {
    const res = await fetch('/api/entries');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.entries) && data.entries.length > 0) {
        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(data.entries));
        return data.entries;
      }
    }
  } catch (err) {
    console.warn('Kon server berichten niet ophalen:', err);
  }
  return null;
}

export async function pushEntriesToServer(entries: JournalEntry[]): Promise<void> {
  try {
    await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
  } catch (err) {
    console.warn('Fout bij synchroniseren naar server:', err);
  }
}

export function mergeEntries(local: JournalEntry[], remote: JournalEntry[]): JournalEntry[] {
  const map = new Map<string, JournalEntry>();
  for (const item of remote) {
    map.set(item.id, item);
  }
  for (const item of local) {
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const localTime = item.updatedAt || item.createdAt || 0;
      const remoteTime = existing.updatedAt || existing.createdAt || 0;
      if (localTime > remoteTime) {
        map.set(item.id, item);
      }
    }
  }
  const result = Array.from(map.values());
  result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return result;
}

export function loadStoredEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (!raw) {
      // Return initial entries for immediate preview, but DO NOT overwrite cloud/server!
      return INITIAL_ENTRIES;
    }
    const entries = JSON.parse(raw);
    return Array.isArray(entries) && entries.length > 0 ? entries : INITIAL_ENTRIES;
  } catch (e) {
    console.error('Fout bij inladen dagboekberichten:', e);
    return INITIAL_ENTRIES;
  }
}

export function saveStoredEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    // Asynchronously push to server and cloud Firestore for cross-device persistence (phone & laptop)
    pushEntriesToServer(entries);
    syncAllEntriesToFirestore(entries);
  } catch (e) {
    console.error('Fout bij opslaan dagboekberichten:', e);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    const parsed = JSON.parse(raw);
    const settings = { ...defaultSettings, ...parsed };
    if (settings.userName === 'Thomas') {
      settings.userName = 'Tygo';
      saveStoredSettings(settings);
    }
    return settings;
  } catch (e) {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Fout bij opslaan instellingen:', e);
  }
}

export function loadStoredWeeklyInsight(): WeeklyInsight {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INSIGHT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INSIGHT, JSON.stringify(INITIAL_WEEKLY_INSIGHT));
      return INITIAL_WEEKLY_INSIGHT;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_WEEKLY_INSIGHT;
  }
}

export function saveStoredWeeklyInsight(insight: WeeklyInsight): void {
  try {
    localStorage.setItem(STORAGE_KEY_INSIGHT, JSON.stringify(insight));
  } catch (e) {
    console.error('Fout bij opslaan wekelijks inzicht:', e);
  }
}

export function loadStoredDailyQuote(): DailyQuote {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_QUOTE);
    if (raw) {
      const parsed: DailyQuote = JSON.parse(raw);
      // If the stored quote is from today, keep it!
      if (parsed.date === todayStr) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Fout bij inladen dagelijkse spreuk:', e);
  }

  // Automatic new quote for today!
  const todayQuote = getDailyQuoteForDate(todayStr);
  saveStoredDailyQuote(todayQuote);
  return todayQuote;
}

export function saveStoredDailyQuote(quote: DailyQuote): void {
  try {
    localStorage.setItem(STORAGE_KEY_DAILY_QUOTE, JSON.stringify(quote));
  } catch (e) {
    console.error('Fout bij opslaan dagelijkse spreuk:', e);
  }
}

export function exportEntriesToJson(entries: JournalEntry[], settings: AppSettings) {
  const data = {
    appName: 'Dagboek App',
    exportDate: new Date().toISOString(),
    userName: settings.userName,
    totalEntries: entries.length,
    entries,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dagboek_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportEntriesToPrintable(entries: JournalEntry[], userName: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const entriesHtml = entries
    .map(
      (e) => `
      <article style="margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0; color: #1e293b;">
            ${e.emoji} ${escapeHtml(e.title || 'Zonder titel')}
          </h2>
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">
            ${e.date} • ${e.mood}
          </span>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; margin: 8px 0;">
          ${escapeHtml(e.content)}
        </p>
        ${
          e.aiInsight
            ? `<div style="background: #eef2ff; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #4338ca; margin-top: 8px;">
                💡 <strong>AI Inzicht:</strong> ${escapeHtml(e.aiInsight)}
              </div>`
            : ''
        }
      </article>
    `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dagboek van ${escapeHtml(userName)} - Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #0f172a; }
          h1 { font-size: 24px; color: #4f46e5; margin-bottom: 4px; }
          .meta { font-size: 13px; color: #94a3b8; margin-bottom: 30px; }
          @media print {
            body { margin: 0; max-width: 100%; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
          <div>
            <h1>📖 Dagboek van ${escapeHtml(userName)}</h1>
            <div class="meta">Geëxporteerd op ${new Date().toLocaleDateString('nl-NL')} • ${entries.length} berichten</div>
          </div>
          <button onclick="window.print()" style="padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Afdrukken / Opslaan als PDF
          </button>
        </div>
        ${entriesHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
