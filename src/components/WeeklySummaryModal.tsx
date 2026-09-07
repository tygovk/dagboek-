import React from 'react';
import { X, Sparkles, TrendingUp, Heart, Loader2 } from 'lucide-react';
import { WeeklyInsight } from '../types';
import { formatDutchDate } from '../utils/date';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: WeeklyInsight;
  onRefresh: () => Promise<void>;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
  insight,
  onRefresh,
}) => {
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="weekly-summary-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-[#1E1B4B] text-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-indigo-500/20 overflow-hidden">
        {/* Ambient Blur Accent */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Wekelijkse AI Samenvatting</h3>
              <p className="text-xs text-indigo-300/80">
                Gegenereerd met Gemini AI • {formatDutchDate(insight.updatedAt || new Date().toISOString())}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-indigo-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-5 relative z-10 text-slate-200 text-sm leading-relaxed">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
              Kerninzicht van je week
            </h4>
            <p className="text-base text-white font-medium italic">
              "{insight.summary}"
            </p>
          </div>

          {/* Key Themes */}
          {insight.keyThemes && insight.keyThemes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Belangrijkste Thema's</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {insight.keyThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mood Trend */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">
              Stemmingsverloop
            </h4>
            <p className="text-sm text-slate-300">
              {insight.moodTrend || 'Evenwichtig en ontspannen.'}
            </p>
          </div>

          {/* Encouragement Note */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 flex items-start gap-3">
            <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 mb-0.5">Bemoediging</h4>
              <p className="text-xs text-emerald-100/90 leading-snug">
                {insight.encouragement}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-indigo-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{loading ? 'Opnieuw analyseren...' : 'Opnieuw genereren'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
