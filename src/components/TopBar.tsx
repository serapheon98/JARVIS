import React from 'react';
import { SlidersHorizontal, LogIn, LogOut, LayoutTemplate, ShieldCheck, Flame } from 'lucide-react';
import { User } from 'firebase/auth';

export type MainTabType = 'lockin' | 'terminal' | 'briefing' | 'tasks' | 'memory';

interface TopBarProps {
  currentTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  onOpenSettings: () => void;
  onGoToLanding: () => void;
  assistantName: string;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onGoToLanding,
  assistantName,
  currentUser,
  onSignIn,
  onSignOut,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Wordmark & Landing page shortcut */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold tracking-wider text-cyan-400">
            {assistantName}
          </span>
          <span className="text-[11px] text-cyan-300/80 hidden md:inline font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
            LOCK-IN OS
          </span>
        </div>

        <button
          onClick={onGoToLanding}
          className="text-xs text-slate-400 hover:text-slate-200 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          title="View product landing page & pricing"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-cyan-400" />
          <span>Landing Page</span>
        </button>
      </div>

      {/* Zone 2: Streamlined Clean Navigation Tabs */}
      <nav className="flex items-center gap-1 sm:gap-4 text-xs sm:text-sm font-medium overflow-x-auto py-1 scrollbar-none">
        <button
          onClick={() => onSelectTab('lockin')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'lockin'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Lock-In & Plan</span>
        </button>

        <button
          onClick={() => onSelectTab('terminal')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'terminal'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Voice & Chat
        </button>

        <button
          onClick={() => onSelectTab('briefing')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'briefing'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Morning Briefing
        </button>

        <button
          onClick={() => onSelectTab('tasks')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'tasks'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tasks
        </button>

        <button
          onClick={() => onSelectTab('memory')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'memory'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Memory
        </button>
      </nav>

      {/* Zone 3: User Status & Personalize */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {currentUser ? (
          <div className="flex items-center gap-1.5">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[100px]">{currentUser.displayName || currentUser.email || 'Officer'}</span>
            </div>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="p-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:border-cyan-400 transition-colors rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/60 hover:border-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
