import React, { useState } from 'react';
import { Sparkles, TrendingUp, Calendar, Heart, Award, Loader2, RefreshCw, Quote } from 'lucide-react';
import { DailyQuote, JournalEntry, MoodType, WeeklyInsight } from '../types';
import { MOODS } from '../data/constants';

interface InsightsViewProps {
  entries: JournalEntry[];
  weeklyInsight: WeeklyInsight;
  onRefreshWeeklyInsight: () => Promise<void>;
  onNewEntry: () => void;
  dailyQuote?: DailyQuote;
  onNewQuote?: () => Promise<void>;
  isQuoteLoading?: boolean;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  entries,
  weeklyInsight,
  onRefreshWeeklyInsight,
  onNewEntry,
  dailyQuote,
  onNewQuote,
  isQuoteLoading = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute mood distribution
  const moodCounts: Partial<Record<MoodType, number>> = {};
  entries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  const totalEntries = entries.length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshWeeklyInsight();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      id="insights-view-container"
      className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1"
    >
      {/* Top Banner with AI Deep Insight */}
      <div className="bg-[#1E1B4B] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-indigo-300 font-black uppercase text-xs tracking-widest block">
                Gemini AI Reflectie & Stemmingsanalyse
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Wekelijks Psychologisch Inzicht
              </h3>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-indigo-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-400" />
            )}
            <span>{isRefreshing ? 'AI Analyseert...' : 'Nieuwe analyse genereren'}</span>
          </button>
        </div>

        <p className="text-base sm:text-lg font-medium leading-relaxed mb-6 text-slate-100 relative z-10">
          "{weeklyInsight.summary}"
        </p>

        {/* Highlighted Themes */}
        <div className="flex flex-wrap items-center gap-2 relative z-10 pt-2 border-t border-white/10">
          <span className="text-xs font-bold text-indigo-300 mr-2">Thema's:</span>
          {weeklyInsight.keyThemes.map((theme, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/20"
            >
              #{theme}
            </span>
          ))}
          <span className="ml-auto text-xs text-indigo-300/80 font-medium">
            Trend: {weeklyInsight.moodTrend}
          </span>
        </div>
      </div>

      {/* Grid with Stats & Mood distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mood Distribution Card */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col">
          <h4 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#6366F1]" />
            <span>Emotie- & Stemmingsverdeling</span>
          </h4>

          <div className="space-y-4 flex-1">
            {(Object.keys(MOODS) as MoodType[]).map((mKey) => {
              const meta = MOODS[mKey];
              const count = moodCounts[mKey] || 0;
              const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;

              if (count === 0) return null;

              return (
                <div key={mKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </div>
                    <span className="text-slate-400">
                      {count}x ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${meta.dotColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Highlights & Metrics Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
            <h4 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Jouw Schrijfgewoonten</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/60">
                <span className="text-xs font-bold text-[#6366F1] block">Totaal Berichten</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {totalEntries}
                </span>
                <span className="text-[11px] text-slate-400">Levensherinneringen</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/60">
                <span className="text-xs font-bold text-emerald-600 block">Favoriete Mood</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Kalm'}
                </span>
                <span className="text-[11px] text-slate-400">Meest ervaren</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Heart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Bemoediging van vandaag:</strong> {weeklyInsight.encouragement}
              </p>
            </div>
          </div>

          {/* Daily Quote Box */}
          {dailyQuote && (
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-7 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Quote className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Spreuk van de dag
                  </span>
                </div>
                {onNewQuote && (
                  <button
                    onClick={onNewQuote}
                    disabled={isQuoteLoading}
                    className="text-xs font-bold text-[#6366F1] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isQuoteLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>Nieuwe spreuk</span>
                  </button>
                )}
              </div>
              <p className="text-slate-800 text-sm font-semibold italic leading-relaxed">
                "{dailyQuote.text}"
              </p>
              <p className="text-xs text-[#6366F1] font-bold mt-2">
                — {dailyQuote.author}
              </p>
            </div>
          )}

          <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-[2.5rem] p-6 sm:p-8 text-white flex flex-col justify-between shadow-lg">
            <div>
              <h4 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-2">
                Klaar voor vandaag?
              </h4>
              <p className="text-sm font-medium text-white/90 leading-relaxed mb-4">
                Elke dag 5 minuten schrijven verlaagt stress en versterkt je emotionele helderheid.
              </p>
            </div>
            <button
              onClick={onNewEntry}
              className="px-6 py-3 bg-white text-[#6366F1] rounded-2xl font-bold text-sm shadow-md hover:bg-indigo-50 transition-all cursor-pointer self-start"
            >
              + Schrijf nu nieuw bericht
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
