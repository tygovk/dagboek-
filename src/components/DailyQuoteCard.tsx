import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Zap, Quote as QuoteIcon } from 'lucide-react';
import { DailyQuote } from '../types';
import { getRandomCuratedQuote } from '../data/quotes';

interface DailyQuoteCardProps {
  quote: DailyQuote | null;
  onNewQuote: () => Promise<void>;
  isLoading: boolean;
}

export const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({
  quote,
  onNewQuote,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const activeQuote = quote || getRandomCuratedQuote();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeQuote) return;
    try {
      await navigator.clipboard.writeText(`"${activeQuote.text}" — ${activeQuote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Kopiëren mislukt:', err);
    }
  };

  return (
    <div
      id="daily-quote-card"
      className="bg-white rounded-[2.5rem] p-6 sm:p-7 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all flex flex-col group hover:border-indigo-100"
    >
      {/* Decorative accent background gradient */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Dagelijkse Motivatie
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100/80">
                Spreuk van de dag
              </span>
            </div>
          </div>
        </div>

        {activeQuote?.theme && (
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-100/60">
            #{activeQuote.theme}
          </span>
        )}
      </div>

      {/* Quote Body: Always immediately visible, never blank */}
      <div className="relative z-10 my-2">
        <div className="flex gap-2.5">
          <QuoteIcon className="w-5 h-5 text-amber-400/80 shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-800 text-sm sm:text-base font-semibold leading-relaxed italic">
              "{activeQuote.text}"
            </p>
            <p className="text-xs text-[#6366F1] font-bold mt-2 tracking-wide not-italic flex items-center gap-1.5">
              <span>— {activeQuote.author}</span>
            </p>
          </div>
        </div>

        {activeQuote.reflection && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100/80 text-[12px] text-slate-500 leading-snug">
            <span className="font-bold text-slate-700">Gedachte van de dag: </span>
            {activeQuote.reflection}
          </div>
        )}

        {isLoading && (
          <div className="mt-2 text-[11px] font-bold text-indigo-600 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Nieuwe inspiratie wordt opgehaald...</span>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 relative z-10">
        {/* Request New Quote Button */}
        <button
          id="request-new-quote-btn"
          type="button"
          onClick={onNewQuote}
          disabled={isLoading}
          title="Genereer direct een nieuwe motiverende spreuk"
          className="px-3.5 py-2 rounded-xl bg-[#EEF2FF] hover:bg-[#6366F1] text-[#6366F1] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6366F1]" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? 'Spreuk vernieuwen...' : 'Nieuwe spreuk'}</span>
        </button>

        {/* Copy Quote Button */}
        <button
          type="button"
          onClick={handleCopy}
          title="Kopieer spreuk"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer ml-auto flex items-center gap-1 text-xs font-semibold"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] text-emerald-600 font-bold">Gekopieerd</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px] text-slate-400">Kopiëren</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
