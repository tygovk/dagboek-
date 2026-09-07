import React from 'react';
import { Download, Lock, Bell, Plus, Cloud } from 'lucide-react';
import { MoodType } from '../types';
import { MOODS } from '../data/constants';
import { formatDutchDate, getGreeting } from '../utils/date';

interface HeaderProps {
  userName: string;
  currentMood: MoodType;
  pinEnabled: boolean;
  onLockApp: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onNewEntry: () => void;
  dailyReminderEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  currentMood,
  pinEnabled,
  onLockApp,
  onOpenExport,
  onOpenSettings,
  onNewEntry,
  dailyReminderEnabled,
}) => {
  const todayStr = new Date().toISOString();
  const moodMeta = MOODS[currentMood] || MOODS.Kalm;
  const greeting = getGreeting(userName);

  return (
    <header id="app-header" className="flex items-center justify-between mb-6 shrink-0 flex-wrap gap-4">
      <div>
        <h1 id="header-greeting" className="text-3xl font-black text-slate-900 tracking-tight">
          {greeting}
        </h1>
        <p id="header-date" className="text-slate-400 font-medium text-sm mt-0.5">
          {formatDutchDate(todayStr)}
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        {/* Real-time Multi-Device Sync Badge */}
        <div
          id="header-sync-badge"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100/80 shadow-2xs"
          title="Realtime cloud-synchronisatie actief tussen telefoon en laptop"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Telefoon & Laptop Gesynchroniseerd</span>
          <span className="sm:hidden">Gesynchroniseerd</span>
        </div>

        {/* Current Mood Badge from Design */}
        <div
          id="header-current-mood-badge"
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 ${moodMeta.bgLight} ${moodMeta.textColor} rounded-full text-xs sm:text-sm font-bold border-2 border-white shadow-sm flex items-center gap-2 transition-all`}
        >
          <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${moodMeta.dotColor} rounded-full animate-pulse`} />
          <span>Mood: {moodMeta.label}</span>
          <span className="text-sm sm:text-base">{moodMeta.emoji}</span>
        </div>

        {/* Quick New Entry Button */}
        <button
          id="header-new-entry-btn"
          onClick={onNewEntry}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#EEF2FF] text-[#6366F1] hover:bg-[#6366F1] hover:text-white rounded-2xl font-bold text-sm transition-all shadow-sm border border-indigo-100/50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nieuw</span>
        </button>

        {/* Daily Reminder Indicator */}
        <button
          id="header-reminder-btn"
          onClick={onOpenSettings}
          title={dailyReminderEnabled ? 'Dagelijkse herinnering actief' : 'Herinnering instellen'}
          className={`p-3 rounded-2xl shadow-sm border transition-all cursor-pointer ${
            dailyReminderEnabled
              ? 'bg-indigo-50 border-indigo-100 text-[#6366F1]'
              : 'bg-white border-slate-100 text-slate-400 hover:text-[#6366F1]'
          }`}
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Export Data Button from Design */}
        <button
          id="header-export-btn"
          onClick={onOpenExport}
          title="Data exporteren (PDF of JSON)"
          className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-[#6366F1] hover:border-indigo-100 transition-all cursor-pointer"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Lock App Button */}
        {pinEnabled && (
          <button
            id="header-lock-btn"
            onClick={onLockApp}
            title="App direct vergrendelen met pincode"
            className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all cursor-pointer"
          >
            <Lock className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
