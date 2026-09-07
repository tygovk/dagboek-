import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { WeeklyInsight, JournalEntry } from '../types';

interface WeeklyInsightCardProps {
  insight: WeeklyInsight;
  entries: JournalEntry[];
  onOpenDetails: () => void;
  onRefreshInsight: () => Promise<void>;
}

export const WeeklyInsightCard: React.FC<WeeklyInsightCardProps> = ({
  insight,
  onOpenDetails,
  onRefreshInsight,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await onRefreshInsight();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      id="weekly-ai-insight-card"
      className="bg-[#1E1B4B] rounded-[2.5rem] p-7 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-900/40 shrink-0"
    >
      {/* Decorative ambient blur highlight from design */}
      <div className="absolute -right-4 -top-4 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-indigo-300 font-black uppercase text-xs tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          <span>Wekelijkse AI Inzicht</span>
        </h3>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Nieuwe analyse genereren met Gemini"
          className="text-[11px] font-bold text-indigo-300 hover:text-white px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          {isRefreshing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          <span>{isRefreshing ? 'Analyseren...' : 'Vernieuw'}</span>
        </button>
      </div>

      {/* Summary quote */}
      <p className="text-base sm:text-lg font-medium leading-relaxed mb-6 text-slate-100">
        "{insight.summary}"
      </p>

      {/* Bottom row: Mood dots avatars & Details button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div
              title="Vreugdevol"
              className="w-8 h-8 rounded-full bg-emerald-400 border-2 border-[#1E1B4B] flex items-center justify-center text-xs shadow"
            >
              🌿
            </div>
            <div
              title="Opgewekt"
              className="w-8 h-8 rounded-full bg-amber-400 border-2 border-[#1E1B4B] flex items-center justify-center text-xs shadow"
            >
              ☀️
            </div>
            <div
              title="Gefocust"
              className="w-8 h-8 rounded-full bg-indigo-400 border-2 border-[#1E1B4B] flex items-center justify-center text-xs shadow"
            >
              💻
            </div>
            <div
              title="Dankbaar"
              className="w-8 h-8 rounded-full bg-rose-400 border-2 border-[#1E1B4B] flex items-center justify-center text-xs shadow"
            >
              💖
            </div>
          </div>
          <span className="text-xs text-indigo-300/80 font-semibold hidden sm:inline">
            Stemmingstrends
          </span>
        </div>

        <button
          id="weekly-insight-details-btn"
          onClick={onOpenDetails}
          className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
