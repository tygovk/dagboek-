import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { JournalEntry } from '../types';
import { MOODS } from '../data/constants';
import { formatDutchDate } from '../utils/date';

interface CalendarViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntryForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  entries,
  onSelectEntry,
  onNewEntryForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Januari',
    'Februari',
    'Maart',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Augustus',
    'September',
    'Oktober',
    'November',
    'December',
  ];

  // Calculate days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  // Group entries by date (YYYY-MM-DD)
  const entriesByDate: Record<string, JournalEntry[]> = {};
  entries.forEach((e) => {
    if (!entriesByDate[e.date]) {
      entriesByDate[e.date] = [];
    }
    entriesByDate[e.date].push(e);
  });

  const [selectedDayEntries, setSelectedDayEntries] = useState<JournalEntry[] | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const handleDayClick = (dayNumber: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

    setSelectedDateStr(dateKey);
    const dayEntries = entriesByDate[dateKey] || [];
    setSelectedDayEntries(dayEntries);
  };

  return (
    <div
      id="calendar-view-container"
      className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex-1 flex flex-col"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Klik op een datum om herinneringen te bekijken of toe te voegen
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-black uppercase tracking-wider text-slate-400">
            <span>Ma</span>
            <span>Di</span>
            <span>Wo</span>
            <span>Do</span>
            <span>Vr</span>
            <span>Za</span>
            <span>Zo</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="p-2 rounded-2xl bg-slate-50/40 min-h-[64px]" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const formattedMonth = String(month + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

              const dayEntries = entriesByDate[dateKey] || [];
              const hasEntries = dayEntries.length > 0;
              const isSelected = selectedDateStr === dateKey;

              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = todayStr === dateKey;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between min-h-[70px] relative ${
                    isSelected
                      ? 'border-[#6366F1] bg-indigo-50/80 shadow-sm ring-2 ring-[#6366F1]/20'
                      : hasEntries
                      ? 'border-indigo-100 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 shadow-sm'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday
                        ? 'bg-[#6366F1] text-white'
                        : isSelected
                        ? 'text-[#6366F1]'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>

                  {/* Badges / Emojis for entries on this day */}
                  {hasEntries && (
                    <div className="flex items-center justify-center gap-1 my-1 flex-wrap">
                      {dayEntries.slice(0, 2).map((e) => (
                        <span key={e.id} className="text-sm" title={e.title}>
                          {e.emoji || '✨'}
                        </span>
                      ))}
                      {dayEntries.length > 2 && (
                        <span className="text-[10px] font-bold text-[#6366F1]">
                          +{dayEntries.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {!hasEntries && (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent mb-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel */}
        <div className="lg:col-span-4 bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col">
          {selectedDateStr ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {formatDutchDate(selectedDateStr)}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedDayEntries?.length || 0} herinnering(en)
                  </p>
                </div>
                <button
                  onClick={() => onNewEntryForDate(selectedDateStr)}
                  className="p-2 bg-[#6366F1] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#4F46E5] transition-all cursor-pointer shadow-sm"
                  title="Schrijf voor deze dag"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schrijven</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {selectedDayEntries && selectedDayEntries.length > 0 ? (
                  selectedDayEntries.map((entry) => {
                    const moodMeta = MOODS[entry.mood] || MOODS.Kalm;
                    return (
                      <div
                        key={entry.id}
                        onClick={() => onSelectEntry(entry)}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200/60 hover:border-[#6366F1] hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                            <span>{entry.emoji}</span>
                            <span>{entry.title || 'Zonder titel'}</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${moodMeta.bgLight} ${moodMeta.textColor}`}
                          >
                            {entry.mood}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {entry.content}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-slate-400">
                    <p className="text-xs font-medium">Geen herinnering voor deze dag.</p>
                    <button
                      onClick={() => onNewEntryForDate(selectedDateStr)}
                      className="mt-3 px-4 py-2 bg-white text-[#6366F1] border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all cursor-pointer shadow-sm"
                    >
                      + Nu bericht toevoegen
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
              <Sparkles className="w-8 h-8 text-indigo-300 mb-2" />
              <p className="text-xs font-medium max-w-xs">
                Selecteer een dag op de kalender om de geschreven herinneringen te lezen of een nieuw bericht te starten.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
