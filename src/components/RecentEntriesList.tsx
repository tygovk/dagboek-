import React, { useState } from 'react';
import { Search, Trash2, Edit3, Image as ImageIcon, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { JournalEntry, MoodType } from '../types';
import { MOODS } from '../data/constants';
import { formatRelativeDate } from '../utils/date';

interface RecentEntriesListProps {
  entries: JournalEntry[];
  selectedEntryId?: string;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onToggleCalendar?: () => void;
  isCalendarActive?: boolean;
}

export const RecentEntriesList: React.FC<RecentEntriesListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
  onToggleCalendar,
  isCalendarActive = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.mood.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMood =
      selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;

    return matchesSearch && matchesMood;
  });

  return (
    <div
      id="recent-entries-card"
      className="flex-1 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.02)] min-h-[350px]"
    >
      {/* Header & View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 font-black uppercase text-xs tracking-widest">
          Recente Herinneringen ({filteredEntries.length})
        </h3>

        {onToggleCalendar && (
          <button
            onClick={onToggleCalendar}
            title={isCalendarActive ? 'Toon lijstweergave' : 'Toon kalenderweergave'}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isCalendarActive
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-[#6366F1]'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isCalendarActive ? 'Lijst' : 'Kalender'}
            </span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Zoek in herinneringen..."
            className="bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400 text-xs sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1 font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      <div
        id="recent-memories-list"
        className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin scrollbar-thumb-slate-200"
      >
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-10 text-center text-slate-400">
            <Sparkles className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Geen herinneringen gevonden</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Begin met schrijven in het dagboek of pas je zoekfilter aan.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const moodInfo = MOODS[entry.mood] || MOODS.Kalm;
            const isSelected = selectedEntryId === entry.id;

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-3xl transition-all group cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-100'
                }`}
              >
                {/* Mood Icon Square matching Design */}
                <div
                  className={`w-12 sm:w-14 h-12 sm:h-14 ${moodInfo.bgLight} rounded-2xl flex items-center justify-center shrink-0 text-xl sm:text-2xl group-hover:scale-105 transition-transform shadow-sm`}
                >
                  {moodInfo.emoji}
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate group-hover:text-[#6366F1] transition-colors">
                      {entry.title || 'Zonder titel'}
                    </h4>
                    {entry.photos && entry.photos.length > 0 && (
                      <span
                        title={`${entry.photos.length} foto('s)`}
                        className="text-slate-400 text-xs flex items-center gap-0.5 shrink-0"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[10px] font-bold">
                          {entry.photos.length}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                    {formatRelativeDate(entry.date)} • {entry.mood}
                  </p>
                </div>

                {/* Actions on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEntry(entry);
                    }}
                    title="Bewerken"
                    className="p-2 text-slate-400 hover:text-[#6366F1] hover:bg-white rounded-xl transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Weet je zeker dat je "${entry.title || 'dit bericht'}" wilt verwijderen?`)) {
                        onDeleteEntry(entry.id);
                      }
                    }}
                    title="Verwijderen"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
