import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { JournalEditor } from './components/JournalEditor';
import { DailyQuoteCard } from './components/DailyQuoteCard';
import { WeeklyInsightCard } from './components/WeeklyInsightCard';
import { RecentEntriesList } from './components/RecentEntriesList';
import { CalendarView } from './components/CalendarView';
import { InsightsView } from './components/InsightsView';
import { SettingsModal } from './components/SettingsModal';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import { PinLockModal } from './components/PinLockModal';
import { JournalEntry, AppSettings, WeeklyInsight, MoodType, DailyQuote } from './types';
import {
  loadStoredEntries,
  saveStoredEntries,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredWeeklyInsight,
  saveStoredWeeklyInsight,
  loadStoredDailyQuote,
  saveStoredDailyQuote,
  fetchServerEntries,
  subscribeFirestoreEntries,
  syncEntryToFirestore,
  deleteEntryFromFirestore,
  mergeEntries,
  exportEntriesToJson,
  exportEntriesToPrintable,
} from './utils/storage';
import { getRandomCuratedQuote } from './data/quotes';

export default function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadStoredSettings());
  const [weeklyInsight, setWeeklyInsight] = useState<WeeklyInsight>(loadStoredWeeklyInsight());
  const [dailyQuote, setDailyQuote] = useState<DailyQuote>(() => loadStoredDailyQuote() || getRandomCuratedQuote());
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  
  const [currentTab, setCurrentTab] = useState<'editor' | 'calendar' | 'insights' | 'settings'>('editor');
  const [editingEntry, setEditingEntry] = useState<Partial<JournalEntry> | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWeeklySummaryModalOpen, setIsWeeklySummaryModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize data on mount and sync with server & Firestore cloud for cross-device usage (phone & laptop)
  useEffect(() => {
    const loadedEntries = loadStoredEntries();
    setEntries(loadedEntries);
    const loadedSettings = loadStoredSettings();
    setSettings(loadedSettings);
    if (loadedSettings.pinEnabled && loadedSettings.isLocked) {
      setIsLocked(true);
    }

    // Pull latest entries from server to keep laptop and phone synchronized
    fetchServerEntries().then((serverEntries) => {
      if (serverEntries && serverEntries.length > 0) {
        setEntries((prev) => mergeEntries(prev, serverEntries));
      }
    });

    // Realtime Cloud synchronization with Firestore across laptop and phone
    const unsubscribeFirestore = subscribeFirestoreEntries((cloudEntries) => {
      if (cloudEntries && cloudEntries.length > 0) {
        setEntries(cloudEntries);
      }
    });

    return () => {
      unsubscribeFirestore();
    };
  }, []);

  // Compute current latest mood
  const currentMood: MoodType = entries.length > 0 ? entries[0].mood : 'Kalm';

  // Save or update an entry (with autosave support and real-time cloud multi-device sync)
  const handleSaveEntry = (entryData: Partial<JournalEntry>) => {
    const now = Date.now();
    let updatedEntries: JournalEntry[];
    let savedTargetEntry: JournalEntry;

    const entryId = entryData.id || `entry-${now}`;

    if (entryData.id) {
      // Update existing
      savedTargetEntry = {
        id: entryId,
        title: entryData.title || 'Mijn Dagboekbericht',
        content: entryData.content || '',
        date: entryData.date || new Date().toISOString().split('T')[0],
        createdAt: entryData.createdAt || now,
        mood: entryData.mood || 'Kalm',
        emoji: entryData.emoji || '🌿',
        photos: entryData.photos || [],
        aiInsight: entryData.aiInsight,
        updatedAt: now,
      };
      updatedEntries = entries.map((e) =>
        e.id === entryId ? savedTargetEntry : e
      );
      // In case it wasn't in array yet
      if (!updatedEntries.some((e) => e.id === entryId)) {
        updatedEntries = [savedTargetEntry, ...entries];
      }
    } else {
      // Create new
      savedTargetEntry = {
        id: entryId,
        title: entryData.title || 'Mijn Dagboekbericht',
        content: entryData.content || '',
        date: entryData.date || new Date().toISOString().split('T')[0],
        createdAt: now,
        mood: entryData.mood || 'Kalm',
        emoji: entryData.emoji || '🌿',
        photos: entryData.photos || [],
        aiInsight: entryData.aiInsight,
      };
      updatedEntries = [savedTargetEntry, ...entries];
    }

    setEntries(updatedEntries);
    saveStoredEntries(updatedEntries);
    syncEntryToFirestore(savedTargetEntry);
    setEditingEntry(savedTargetEntry);
  };

  // Delete an entry
  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveStoredEntries(updated);
    deleteEntryFromFirestore(id);
    if (editingEntry?.id === id) {
      setEditingEntry(null);
    }
  };

  // Select an entry to view/edit in editor
  const handleSelectEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setCurrentTab('editor');
    setIsCalendarOpen(false);
  };

  // Start fresh entry
  const handleNewEntry = () => {
    setEditingEntry({
      id: `entry-${Date.now()}`,
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      mood: 'Kalm',
      photos: [],
    });
    setCurrentTab('editor');
    setIsCalendarOpen(false);
  };

  // Start new entry for a specific date from calendar
  const handleNewEntryForDate = (dateStr: string) => {
    setEditingEntry({
      id: `entry-${Date.now()}`,
      title: '',
      content: '',
      date: dateStr,
      mood: 'Kalm',
      photos: [],
    });
    setCurrentTab('editor');
    setIsCalendarOpen(false);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Lock App
  const handleLockApp = () => {
    setIsLocked(true);
    const updatedSettings = { ...settings, isLocked: true };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
  };

  // Unlock App
  const handleUnlock = () => {
    setIsLocked(false);
    const updatedSettings = { ...settings, isLocked: false };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
  };

  // Trigger AI Weekly Summary refresh via server endpoint
  const handleRefreshWeeklySummary = async () => {
    try {
      const res = await fetch('/api/ai/weekly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      if (data.summary) {
        const newInsight: WeeklyInsight = {
          summary: data.summary,
          keyThemes: data.keyThemes || ['Persoonlijke groei', 'Rust & Natuur'],
          moodTrend: data.moodTrend || 'Overwegend kalm en vreugdevol',
          encouragement: data.encouragement || 'Blijf trouw aan je dagelijkse reflectietijd!',
          updatedAt: new Date().toISOString(),
        };
        setWeeklyInsight(newInsight);
        saveStoredWeeklyInsight(newInsight);
      }
    } catch (err) {
      console.error('Fout bij wekelijkse samenvatting:', err);
    }
  };

  // Export handlers
  const handleExportJson = () => {
    exportEntriesToJson(entries, settings);
  };

  const handleExportPrintable = () => {
    exportEntriesToPrintable(entries, settings.userName);
  };

  // Import handler
  const handleImportEntries = (imported: JournalEntry[]) => {
    setEntries(imported);
    saveStoredEntries(imported);
  };

  // Request a fresh quote: immediately shows a fresh inspirational quote and enhances it via AI
  const handleRequestNewQuote = async () => {
    setIsQuoteLoading(true);
    // Directly supply an inspiring fresh quote so the screen is NEVER blank
    const immediateFresh = getRandomCuratedQuote();
    setDailyQuote(immediateFresh);
    saveStoredDailyQuote(immediateFresh);

    try {
      const res = await fetch('/api/ai/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data && data.text) {
        const newQuote: DailyQuote = {
          id: data.id || `quote-${Date.now()}`,
          text: data.text,
          author: data.author || 'Motivator',
          theme: data.theme || 'Motivatie',
          reflection: data.reflection,
          date: new Date().toISOString().split('T')[0],
          isGenerated: true,
        };
        setDailyQuote(newQuote);
        saveStoredDailyQuote(newQuote);
      }
    } catch (err) {
      console.error('Fout bij ophalen nieuwe spreuk:', err);
    } finally {
      setIsQuoteLoading(false);
    }
  };

  // Auto-generate fresh quote on a new day if not already generated
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!dailyQuote || !dailyQuote.text || dailyQuote.date !== todayStr) {
      handleRequestNewQuote();
    }
  }, []);

  // Navigation tab click handler
  const handleTabChange = (tab: 'editor' | 'calendar' | 'insights' | 'settings') => {
    if (tab === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    setCurrentTab(tab);
    if (tab === 'calendar') {
      setIsCalendarOpen(true);
    } else {
      setIsCalendarOpen(false);
    }
  };

  return (
    <div
      id="dagboek-app-root"
      className="min-h-screen w-full bg-[#F8F9FE] flex overflow-hidden font-sans text-slate-900"
    >
      {/* If app is locked with PIN */}
      {isLocked && settings.pinEnabled && (
        <PinLockModal
          correctPin={settings.pinCode}
          onUnlock={handleUnlock}
          userName={settings.userName}
        />
      )}

      {/* Vibrant Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onNewEntry={handleNewEntry}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen scroll-smooth">
        {/* Top Header */}
        <Header
          userName={settings.userName}
          currentMood={currentMood}
          pinEnabled={settings.pinEnabled}
          onLockApp={handleLockApp}
          onOpenExport={handleExportPrintable}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewEntry={handleNewEntry}
          dailyReminderEnabled={settings.dailyReminderEnabled}
        />

        {/* Dynamic Views according to selected tab */}
        {currentTab === 'editor' && (
          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 pb-16">
            {/* Mobile / Tablet Daily Quote Card: top placement for instant visibility */}
            <div className="block lg:hidden shrink-0">
              <DailyQuoteCard
                quote={dailyQuote}
                onNewQuote={handleRequestNewQuote}
                isLoading={isQuoteLoading}
              />
            </div>

            {/* Left 7 Columns: Main Journal Editor Card */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <JournalEditor
                key={editingEntry?.id || 'new'}
                currentEntry={editingEntry}
                onSave={handleSaveEntry}
                onCancel={() => setEditingEntry(null)}
              />
            </div>

            {/* Right 5 Columns: Daily Quote + Weekly AI Insight + Recent Memories List */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Daily Quote Card for desktop */}
              <div className="hidden lg:block">
                <DailyQuoteCard
                  quote={dailyQuote}
                  onNewQuote={handleRequestNewQuote}
                  isLoading={isQuoteLoading}
                />
              </div>

              {/* Weekly AI Insight card */}
              <WeeklyInsightCard
                insight={weeklyInsight}
                entries={entries}
                onOpenDetails={() => setIsWeeklySummaryModalOpen(true)}
                onRefreshInsight={handleRefreshWeeklySummary}
              />

              {/* Recente Herinneringen card */}
              <RecentEntriesList
                entries={entries}
                selectedEntryId={editingEntry?.id}
                onSelectEntry={handleSelectEntry}
                onDeleteEntry={handleDeleteEntry}
                onToggleCalendar={() => {
                  setCurrentTab('calendar');
                  setIsCalendarOpen(true);
                }}
                isCalendarActive={isCalendarOpen}
              />
            </div>
          </div>
        )}

        {currentTab === 'calendar' && (
          <div className="flex-1 flex flex-col overflow-y-auto pb-4">
            <CalendarView
              entries={entries}
              onSelectEntry={handleSelectEntry}
              onNewEntryForDate={handleNewEntryForDate}
            />
          </div>
        )}

        {currentTab === 'insights' && (
          <div className="flex-1 flex flex-col overflow-y-auto pb-4">
            <InsightsView
              entries={entries}
              weeklyInsight={weeklyInsight}
              onRefreshWeeklyInsight={handleRefreshWeeklySummary}
              onNewEntry={handleNewEntry}
              dailyQuote={dailyQuote}
              onNewQuote={handleRequestNewQuote}
              isQuoteLoading={isQuoteLoading}
            />
          </div>
        )}
      </main>

      {/* Settings & Security Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        entries={entries}
        onImportEntries={handleImportEntries}
        onExportJson={handleExportJson}
        onExportPrintable={handleExportPrintable}
      />

      {/* Weekly AI Summary Modal */}
      <WeeklySummaryModal
        isOpen={isWeeklySummaryModalOpen}
        onClose={() => setIsWeeklySummaryModalOpen(false)}
        insight={weeklyInsight}
        onRefresh={handleRefreshWeeklySummary}
      />
    </div>
  );
}
