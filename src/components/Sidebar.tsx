import React from 'react';
import { BookOpen, Calendar, Sparkles, Shield, PenTool } from 'lucide-react';

interface SidebarProps {
  currentTab: 'editor' | 'calendar' | 'insights' | 'settings';
  onTabChange: (tab: 'editor' | 'calendar' | 'insights' | 'settings') => void;
  onNewEntry: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onNewEntry }) => {
  return (
    <aside
      id="app-sidebar"
      className="w-[80px] bg-[#6366F1] flex flex-col items-center py-8 gap-8 shadow-[4px_0_20px_rgba(99,102,241,0.2)] shrink-0 z-20 h-full"
    >
      {/* App Logo */}
      <button
        id="sidebar-logo-btn"
        onClick={onNewEntry}
        title="Nieuw dagboekbericht"
        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 hover:scale-105 transition-all cursor-pointer"
      >
        <div className="w-6 h-6 bg-[#6366F1] rounded-lg rotate-12 flex items-center justify-center text-white text-xs font-black">
          <PenTool className="w-3.5 h-3.5" />
        </div>
      </button>

      {/* Main Navigation */}
      <nav id="sidebar-nav" className="flex flex-col gap-5 flex-1">
        <button
          id="nav-editor-btn"
          onClick={() => onTabChange('editor')}
          title="Schrijf dagboek"
          className={`p-3 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'editor'
              ? 'bg-white/20 text-white shadow-inner scale-105'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BookOpen className="w-6 h-6" strokeWidth={2.2} />
        </button>

        <button
          id="nav-calendar-btn"
          onClick={() => onTabChange('calendar')}
          title="Kalender & Overzicht"
          className={`p-3 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'calendar'
              ? 'bg-white/20 text-white shadow-inner scale-105'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Calendar className="w-6 h-6" strokeWidth={2.2} />
        </button>

        <button
          id="nav-insights-btn"
          onClick={() => onTabChange('insights')}
          title="AI Stemmingen & Inzichten"
          className={`p-3 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'insights'
              ? 'bg-white/20 text-white shadow-inner scale-105'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Sparkles className="w-6 h-6" strokeWidth={2.2} />
        </button>

        <div className="mt-auto flex flex-col gap-4">
          <button
            id="nav-settings-btn"
            onClick={() => onTabChange('settings')}
            title="Beveiliging & Instellingen"
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-white/20 text-white shadow-inner scale-105'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Shield className="w-6 h-6" strokeWidth={2.2} />
          </button>
        </div>
      </nav>
    </aside>
  );
};
