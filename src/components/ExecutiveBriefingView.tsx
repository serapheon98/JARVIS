import React from 'react';
import { Volume2, RefreshCw, Compass, ShieldCheck, Flame, ArrowRight, Quote } from 'lucide-react';
import { TaskItem, MemoryDirective } from '../types/jarvis';

interface ExecutiveBriefingData {
  greeting: string;
  situationSummary: string;
  topPriorities: string[];
  tacticalAdvice: string;
  quote: string;
}

interface ExecutiveBriefingViewProps {
  briefing: ExecutiveBriefingData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onSpeak: (text: string) => void;
  onSelectTask: (taskTitle: string) => void;
  tasks: TaskItem[];
  assistantName: string;
  userName: string;
}

export const ExecutiveBriefingView: React.FC<ExecutiveBriefingViewProps> = ({
  briefing,
  isLoading,
  onRefresh,
  onSpeak,
  onSelectTask,
  tasks,
  assistantName,
  userName,
}) => {
  const handleVocalizeAll = () => {
    if (!briefing) return;
    const textToSpeak = `${briefing.greeting}. ${briefing.situationSummary}. Your top priorities today are: ${briefing.topPriorities.join(', ')}. Tactical guidance: ${briefing.tacticalAdvice}. ${briefing.quote}`;
    onSpeak(textToSpeak);
  };

  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>SITUATION REPORT</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">EXECUTIVE PROTOCOL</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">
            Daily Operational Intelligence
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Recalibrate Briefing</span>
          </button>
          {briefing && (
            <button
              onClick={handleVocalizeAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Vocalize Full Briefing</span>
            </button>
          )}
        </div>
      </div>

      {isLoading && !briefing ? (
        <div className="hud-glass p-8 rounded-xl border border-cyan-500/20 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
          <p className="text-sm text-slate-300 font-mono">
            {assistantName} is compiling today’s telemetry, priorities, and intelligence parameters...
          </p>
        </div>
      ) : briefing ? (
        <div className="space-y-6">
          {/* Greeting & Situation Banner */}
          <div className="hud-glass-active p-6 rounded-xl border border-cyan-500/30 relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-mono text-cyan-400 tracking-wider">
                TRANSMISSION // {assistantName.toUpperCase()}
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-1">
                {briefing.greeting}
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {briefing.situationSummary}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Subsystems: 100% Nominal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Pending Directives: {pendingTasksCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Priorities Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider">
                01. Strategic Priorities for Today
              </h4>
              <span className="text-xs text-slate-500 font-mono">FOCUS MATRIX</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {briefing.topPriorities.map((priority, index) => (
                <div
                  key={index}
                  className="hud-glass p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span className="text-cyan-400 font-bold">ALPHA 0{index + 1}</span>
                      <span>HIGH LEVERAGE</span>
                    </div>
                    <p className="text-sm font-medium text-slate-100 leading-snug">
                      {priority}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectTask(priority)}
                    className="mt-4 flex items-center justify-between text-xs text-cyan-400 hover:text-cyan-300 transition-colors pt-2 border-t border-slate-800/80 cursor-pointer"
                  >
                    <span>Execute Focus Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Advice & Philosophy Quote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="hud-glass p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <Compass className="w-4 h-4" />
                <span>TACTICAL DIRECTIVE</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {briefing.tacticalAdvice}
              </p>
            </div>

            <div className="hud-glass p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Quote className="w-4 h-4 text-cyan-400" />
                <span>PHILOSOPHICAL ANCHOR</span>
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                {briefing.quote}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 font-mono text-xs">
          Click "Recalibrate Briefing" to generate today’s executive situation analysis.
        </div>
      )}
    </div>
  );
};
