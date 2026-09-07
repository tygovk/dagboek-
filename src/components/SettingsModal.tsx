import React, { useState, useRef } from 'react';
import {
  X,
  Shield,
  Bell,
  Download,
  Upload,
  Printer,
  Check,
  User,
  AlertTriangle,
} from 'lucide-react';
import { AppSettings, JournalEntry } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  entries: JournalEntry[];
  onImportEntries: (imported: JournalEntry[]) => void;
  onExportJson: () => void;
  onExportPrintable: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  entries,
  onImportEntries,
  onExportJson,
  onExportPrintable,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [pinEnabled, setPinEnabled] = useState(settings.pinEnabled);
  const [pinCode, setPinCode] = useState(settings.pinCode);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(
    settings.dailyReminderEnabled
  );
  const [dailyReminderTime, setDailyReminderTime] = useState(
    settings.dailyReminderTime
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  const importInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      userName: userName.trim() || 'Gebruiker',
      pinEnabled,
      pinCode: pinCode.length === 4 ? pinCode : '1234',
      dailyReminderEnabled,
      dailyReminderTime,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationStatus('Notificaties zijn ingeschakeld!');
        new Notification('Dagboek Herinnering', {
          body: `Tijd voor je dagelijkse reflectiemoment om ${dailyReminderTime}!`,
          icon: '/favicon.ico',
        });
      } else {
        setNotificationStatus('Notificatie-toestemming geweigerd.');
      }
    } else {
      setNotificationStatus('Meldingen worden in-app getoond.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const imported = json.entries || (Array.isArray(json) ? json : null);
        if (Array.isArray(imported) && imported.length > 0) {
          onImportEntries(imported);
          alert(`${imported.length} dagboekberichten succesvol geïmporteerd!`);
          onClose();
        } else {
          alert('Geen geldige dagboekberichten gevonden in het bestand.');
        }
      } catch (err) {
        alert('Fout bij het parsen van het JSON-bestand.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                Beveiliging & Instellingen
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Personaliseer je dagboek en beheer je privacy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-6">
          {/* Profile Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Jouw Naam</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Bijv. Tygo"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold outline-none focus:border-[#6366F1] transition-all"
            />
          </div>

          {/* Security & PIN */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#6366F1]" />
                  <span>Pincode Beveiliging</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Vergrendel de app met een 4-cijferige pincode
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinEnabled}
                  onChange={(e) => setPinEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
              </label>
            </div>

            {pinEnabled && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-600">4-cijferige pincode:</span>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-24 text-center px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono font-bold tracking-widest text-base outline-none focus:border-[#6366F1]"
                  placeholder="1234"
                />
              </div>
            )}
          </div>

          {/* Daily Notifications */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Dagelijkse Herinnering</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Ontvang een melding om je dagboek in te vullen
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dailyReminderEnabled}
                  onChange={(e) => setDailyReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {dailyReminderEnabled && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-4 flex-wrap">
                <span className="text-xs font-bold text-slate-600">Herinneringstijd:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={dailyReminderTime}
                    onChange={(e) => setDailyReminderTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs outline-none focus:border-[#6366F1]"
                  />
                  <button
                    type="button"
                    onClick={handleRequestNotification}
                    className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-200 transition-all cursor-pointer"
                  >
                    Test Notificatie
                  </button>
                </div>
              </div>
            )}
            {notificationStatus && (
              <p className="text-[11px] font-semibold text-emerald-600">
                {notificationStatus}
              </p>
            )}
          </div>

          {/* Data Export & Backup */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Data Beheer & Exporteren ({entries.length} berichten)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onExportPrintable}
                className="p-3 bg-white border border-slate-200 hover:border-[#6366F1] text-slate-700 hover:text-[#6366F1] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#6366F1]" />
                <span>PDF / Afdrukken</span>
              </button>

              <button
                type="button"
                onClick={onExportJson}
                className="p-3 bg-white border border-slate-200 hover:border-[#6366F1] text-slate-700 hover:text-[#6366F1] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>JSON Backup</span>
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Herstel / Importeer JSON bestand</span>
              </button>
              <input
                type="file"
                ref={importInputRef}
                onChange={handleFileImport}
                accept=".json,application/json"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Annuleren
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Opgeslagen!</span>
              </>
            ) : (
              <span>Wijzigingen Opslaan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
