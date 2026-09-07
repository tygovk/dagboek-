import React, { useState, useRef, useEffect } from 'react';
import { Image, Sparkles, Wand2, X, Check, Calendar, Loader2, Cloud } from 'lucide-react';
import { JournalEntry, MoodType } from '../types';
import { MOODS } from '../data/constants';

interface JournalEditorProps {
  currentEntry: Partial<JournalEntry> | null;
  onSave: (entry: Partial<JournalEntry>) => void;
  onCancel?: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  currentEntry,
  onSave,
}) => {
  const [title, setTitle] = useState(currentEntry?.title || '');
  const [content, setContent] = useState(currentEntry?.content || '');
  const [date, setDate] = useState(
    currentEntry?.date || new Date().toISOString().split('T')[0]
  );
  const [mood, setMood] = useState<MoodType>(currentEntry?.mood || 'Kalm');
  const [photos, setPhotos] = useState<string[]>(currentEntry?.photos || []);
  const [aiInsight, setAiInsight] = useState<string>(currentEntry?.aiInsight || '');

  const [isSaved, setIsSaved] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [promptSuggestion, setPromptSuggestion] = useState<string | null>(null);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Reflectie');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Sync state if currentEntry changes (e.g., when editing existing entry)
  useEffect(() => {
    if (currentEntry) {
      setTitle(currentEntry.title || '');
      setContent(currentEntry.content || '');
      setDate(currentEntry.date || new Date().toISOString().split('T')[0]);
      setMood(currentEntry.mood || 'Kalm');
      setPhotos(currentEntry.photos || []);
      setAiInsight(currentEntry.aiInsight || '');
      setIsSaved(true);
      setIsAutoSaving(false);
    }
  }, [currentEntry?.id]);

  // Automatic saving effect (auto-save with 750ms debounce)
  useEffect(() => {
    if (!title.trim() && !content.trim()) {
      return;
    }
    if (isSaved) {
      return;
    }

    setIsAutoSaving(true);
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const currentMoodMeta = MOODS[mood] || MOODS.Kalm;
      onSave({
        id: currentEntry?.id,
        title: title.trim() || 'Mijn Dagboekbericht',
        content,
        date,
        mood,
        emoji: currentMoodMeta.emoji,
        photos,
        aiInsight: aiInsight || undefined,
      });
      setIsAutoSaving(false);
      setIsSaved(true);
    }, 750);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, date, mood, photos, aiInsight, isSaved]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  // Image Upload Handling (Drag & Drop + File Picker)
  const handlePhotoFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotos((prev) => [...prev, result]);
          setIsSaved(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setIsSaved(false);
  };

  // AI Journal Prompt Fetcher
  const handleFetchAiPrompt = async (category = selectedCategory) => {
    setIsPromptLoading(true);
    setShowPromptBanner(true);
    try {
      const res = await fetch('/api/ai/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, currentText: content }),
      });
      const data = await res.json();
      if (data.prompt) {
        setPromptSuggestion(data.prompt);
      }
    } catch (err) {
      console.error('Kon geen AI prompt ophalen:', err);
      setPromptSuggestion('Waar ben je vandaag het meest dankbaar voor en waarom gaf dit je energie?');
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleApplyPrompt = () => {
    if (!promptSuggestion) return;
    setContent((prev) => {
      const separator = prev.trim().length > 0 ? '\n\n' : '';
      return `${prev}${separator}✨ Vraag: ${promptSuggestion}\n`;
    });
    setShowPromptBanner(false);
    setIsSaved(false);
  };

  // AI Emotion & Mood Analyzer
  const handleAnalyzeMood = async () => {
    if (!content.trim()) {
      alert('Schrijf eerst een stukje tekst om je stemming te analyseren.');
      return;
    }
    setIsAnalyzingMood(true);
    try {
      const res = await fetch('/api/ai/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, title }),
      });
      const data = await res.json();
      if (data.mood && MOODS[data.mood as MoodType]) {
        setMood(data.mood as MoodType);
      }
      if (data.insight) {
        setAiInsight(data.insight);
      }
      setIsSaved(false);
    } catch (err) {
      console.error('Mood analyse fout:', err);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  // Save Handler
  const handleSave = () => {
    if (!content.trim() && !title.trim()) {
      alert('Vul alsjeblieft minimaal een titel of tekst in.');
      return;
    }

    const currentMoodMeta = MOODS[mood] || MOODS.Kalm;
    onSave({
      id: currentEntry?.id,
      title: title.trim() || 'Mijn Dagboekbericht',
      content,
      date,
      mood,
      emoji: currentMoodMeta.emoji,
      photos,
      aiInsight: aiInsight || undefined,
    });
    setIsSaved(true);
  };

  const categories = ['Reflectie', 'Dankbaarheid', 'Focus & Doelen', 'Emoties', 'Natuur & Rust'];

  return (
    <div
      id="journal-editor-card"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        handlePhotoFiles(e.dataTransfer.files);
      }}
      className={`bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border transition-all flex flex-col relative ${
        isDraggingOver ? 'border-[#6366F1] ring-4 ring-[#6366F1]/10' : 'border-slate-100'
      }`}
    >
      {/* Decorative Vibrant Accent in top-right */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#6366F1]/5 rounded-bl-[5rem] -mr-8 -mt-8 pointer-events-none" />

      {/* Editor Header: Title & Save Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10">
        <div className="flex-1 flex items-center gap-3">
          <input
            id="entry-title-input"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Schrijf je dagboek (bijv. Ochtendwandeling)..."
            className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight bg-transparent outline-none w-full placeholder:text-slate-300"
          />
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              id="entry-date-input"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setIsSaved(false);
              }}
              className="bg-transparent outline-none cursor-pointer"
            />
          </div>

          {/* Saved Status Badge */}
          <span
            id="editor-save-status-badge"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isAutoSaving
                ? 'bg-indigo-50 text-[#6366F1] border border-indigo-100'
                : isSaved
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}
          >
            {isAutoSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#6366F1]" />
                <span>Opslaan...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Opgeslagen</span>
              </>
            ) : (
              'Concept'
            )}
          </span>

          {/* Top Quick Save Button for Immediate One-Click Saving without Scrolling */}
          <button
            id="editor-top-save-btn"
            type="button"
            onClick={handleSave}
            className="px-3.5 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Sla je dagboekbericht direct op"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Opslaan</span>
          </button>
        </div>
      </div>

      {/* Mood Selector Bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 z-10 scrollbar-none">
        <span className="text-xs font-bold uppercase text-slate-400 mr-1 shrink-0">
          Stemming:
        </span>
        {(Object.keys(MOODS) as MoodType[]).map((mKey) => {
          const m = MOODS[mKey];
          const isSelected = mood === mKey;
          return (
            <button
              key={mKey}
              type="button"
              onClick={() => {
                setMood(mKey);
                setIsSaved(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                isSelected
                  ? `${m.bgLight} ${m.textColor} border-current shadow-sm scale-105`
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          );
        })}

        {/* AI Analyze Mood Trigger */}
        <button
          type="button"
          onClick={handleAnalyzeMood}
          disabled={isAnalyzingMood || !content.trim()}
          title="Laat AI je stemming analyseren op basis van je tekst"
          className="ml-auto px-3 py-1.5 bg-[#EEF2FF] text-[#6366F1] hover:bg-[#6366F1] hover:text-white rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzingMood ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Wand2 className="w-3 h-3" />
          )}
          <span>{isAnalyzingMood ? 'Analyseren...' : 'AI Analyse'}</span>
        </button>
      </div>

      {/* AI Insight banner if present */}
      {aiInsight && (
        <div
          id="entry-ai-insight-banner"
          className="mb-4 p-3.5 bg-indigo-50/70 border border-indigo-100/60 rounded-2xl flex items-start gap-3 text-xs text-indigo-900 z-10"
        >
          <Sparkles className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-[#6366F1]">AI Inzicht: </span>
            <span>{aiInsight}</span>
          </div>
          <button
            onClick={() => setAiInsight('')}
            className="text-indigo-400 hover:text-indigo-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Prompt Inspiration Banner */}
      {showPromptBanner && (
        <div
          id="ai-prompt-banner"
          className="mb-4 p-4 bg-gradient-to-r from-[#EEF2FF] to-indigo-50/50 border border-[#6366F1]/20 rounded-2xl z-10 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#6366F1]">
                Schrijfinspiratie
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    handleFetchAiPrompt(cat);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#6366F1] text-white'
                      : 'text-indigo-600 hover:bg-white/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setShowPromptBanner(false)}
                className="text-slate-400 hover:text-slate-600 p-1 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isPromptLoading ? (
            <div className="flex items-center gap-2 py-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 text-[#6366F1] animate-spin" />
              <span>Even inspiratie ophalen bij Gemini...</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-slate-800 font-medium text-sm leading-snug italic">
                "{promptSuggestion}"
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleApplyPrompt}
                  className="px-3 py-1.5 bg-[#6366F1] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#4F46E5] transition-all cursor-pointer"
                >
                  Invoegen in tekst
                </button>
                <button
                  onClick={() => handleFetchAiPrompt()}
                  className="px-2.5 py-1.5 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all cursor-pointer"
                >
                  Nieuwe vraag
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Textarea */}
      <textarea
        id="journal-content-textarea"
        value={content}
        onChange={handleTextChange}
        className="w-full flex-1 text-base sm:text-lg text-slate-700 leading-relaxed outline-none resize-none placeholder:text-slate-300 min-h-[180px] sm:min-h-[240px] z-10 py-2"
        placeholder="Hoe was je dag? Deel je gedachten, overwinningen of wat je bezighoudt..."
      />

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div id="journal-photos-preview" className="flex items-center gap-3 overflow-x-auto py-3 z-10">
          {photos.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md group"
            >
              <img
                src={imgUrl}
                alt={`Bijlage ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                title="Foto verwijderen"
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input for Photos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handlePhotoFiles(e.target.files)}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Bottom Action Bar: Sticky at the bottom so Opslaan is ALWAYS directly accessible */}
      <div className="mt-4 pt-4 sm:pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-white/95 backdrop-blur-md pb-1 z-20">
        <div className="flex items-center gap-3">
          {/* Photo Button (coral/red accent from design) */}
          <button
            id="editor-photo-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Foto toevoegen (of sleep foto's hierheen)"
            className="p-3 bg-[#FEE2E2] text-[#EF4444] rounded-2xl hover:scale-105 transition-transform shadow-sm cursor-pointer"
          >
            <Image className="w-6 h-6" strokeWidth={2.2} />
          </button>

          {/* AI Prompt Button from design */}
          <button
            id="editor-ai-prompt-btn"
            type="button"
            onClick={() => {
              if (!showPromptBanner) {
                handleFetchAiPrompt();
              } else {
                setShowPromptBanner(false);
              }
            }}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-[#EEF2FF] text-[#6366F1] rounded-2xl font-bold text-xs sm:text-sm border-2 border-transparent hover:border-[#6366F1]/20 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            <span>AI Prompt</span>
          </button>
        </div>

        {/* Primary Save Button with Cloud Multi-Device Sync Indicator */}
        <div className="flex items-center gap-3 ml-auto">
          {isAutoSaving ? (
            <div className="flex items-center gap-1.5 text-xs text-[#6366F1] font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Synchroniseren...</span>
            </div>
          ) : isSaved ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold" title="Dit bericht is direct opgeslagen en gesynchroniseerd tussen je laptop en telefoon">
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gesynchroniseerd</span>
            </div>
          ) : null}

          <button
            id="editor-save-btn"
            type="button"
            onClick={handleSave}
            className="px-6 sm:px-10 py-3 sm:py-3.5 bg-[#6366F1] text-white rounded-2xl font-bold text-sm sm:text-base shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 hover:bg-[#4F46E5] active:translate-y-0 transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Check className="w-5 h-5" />
            <span>Bericht Opslaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
