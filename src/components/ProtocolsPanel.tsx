import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Shield, Zap, Sparkles, CheckCircle2, Moon } from 'lucide-react';
import { ProtocolType, ProtocolState, TaskItem } from '../types/jarvis';
import { soundFX } from '../utils/audioSynthesizer';

interface ProtocolsPanelProps {
  protocolState: ProtocolState;
  onStartProtocol: (type: ProtocolType, durationMinutes?: number, title?: string) => void;
  onPauseProtocol: () => void;
  onResumeProtocol: () => void;
  onResetProtocol: () => void;
  tasks: TaskItem[];
  onTriggerAction: (actionText: string) => void;
}

export const ProtocolsPanel: React.FC<ProtocolsPanelProps> = ({
  protocolState,
  onStartProtocol,
  onPauseProtocol,
  onResumeProtocol,
  onResetProtocol,
  tasks,
  onTriggerAction,
}) => {
  const [focusTask, setFocusTask] = useState('');
  const [ambienceEnabled, setAmbienceEnabled] = useState(false);

  const toggleAmbience = () => {
    const nextState = !ambienceEnabled;
    setAmbienceEnabled(nextState);
    soundFX.toggleFocusAmbience(nextState);
  };

  useEffect(() => {
    // If protocol is active deep focus and ambience was enabled, keep it synced
    return () => {
      soundFX.toggleFocusAmbience(false);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isDeepFocus = protocolState.activeProtocol === 'deep_focus';
  const progressPercent = protocolState.timerTotalSec > 0
    ? ((protocolState.timerTotalSec - protocolState.timerRemainingSec) / protocolState.timerTotalSec) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>AUTOMATION SUITE</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">STARK PROTOCOLS</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">
            Operational Directives & Protocols
          </h2>
        </div>
      </div>

      {/* Active Protocol Live HUD Box */}
      {protocolState.activeProtocol && (
        <div className="hud-glass-active p-6 rounded-xl border border-cyan-500/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-mono text-cyan-400 tracking-wider">
                ACTIVE PROTOCOL // {protocolState.activeProtocol.toUpperCase().replace('_', ' ')}
              </span>
              <h3 className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                {protocolState.protocolTitle || 'Deep Work Immersion'}
              </h3>
              <p className="text-xs text-slate-400">
                All non-essential interruptions silenced. Cognitive bandwidth allocated.
              </p>
            </div>

            {/* Big Countdown Timer */}
            <div className="flex flex-col items-center">
              <div className="text-5xl font-mono font-bold text-cyan-300 tracking-wider tabular-nums">
                {formatTime(protocolState.timerRemainingSec)}
              </div>
              <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Protocol Controls */}
            <div className="flex items-center gap-2">
              {protocolState.isTimerRunning ? (
                <button
                  onClick={onPauseProtocol}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-medium cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={onResumeProtocol}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-medium cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={onResetProtocol}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs cursor-pointer"
                title="Abort Protocol"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleAmbience}
                className={`p-2 rounded-lg border text-xs cursor-pointer ${
                  ambienceEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={ambienceEnabled ? 'Mute Binaural Focus Audio' : 'Play Binaural Focus Wave'}
              >
                {ambienceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protocol Selection Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Protocol 1: Deep Focus Protocol */}
        <div className="hud-glass p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">01. Deep Focus Protocol</h3>
                <span className="text-xs text-slate-400 font-mono">POMODORO // BINAURAL SYNC</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminates cognitive drag by establishing a dedicated work sprint with optional 40Hz gamma beat audio.
          </p>

          <div className="space-y-2">
            <input
              type="text"
              value={focusTask}
              onChange={e => setFocusTask(e.target.value)}
              placeholder="Target focus objective (e.g. Finish Core API Module)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onStartProtocol('deep_focus', 25, focusTask || 'High-Leverage Work Sprint')}
                className="flex-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium cursor-pointer"
              >
                Initiate 25 Min
              </button>
              <button
                onClick={() => onStartProtocol('deep_focus', 50, focusTask || 'Deep Cognitive Marathon')}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
              >
                Initiate 50 Min
              </button>
            </div>
          </div>
        </div>

        {/* Protocol 2: Morning Calibration */}
        <div className="hud-glass p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">02. Morning Calibration</h3>
                <span className="text-xs text-slate-400 font-mono">AGENDA // STRATEGY</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Synthesizes your priority queue, checks time parameters, and compiles an executive situational report.
          </p>

          <button
            onClick={() => onTriggerAction('Run executive morning briefing protocol')}
            className="w-full px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Engage Morning Calibration</span>
          </button>
        </div>

        {/* Protocol 3: System Diagnostics */}
        <div className="hud-glass p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">03. Diagnostics & Telemetry</h3>
                <span className="text-xs text-slate-400 font-mono">SENSOR SUITE // HEALTH</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Performs a real-time probe of browser sensors, battery state, network throughput, and model latency.
          </p>

          <button
            onClick={() => onTriggerAction('Execute full system diagnostic sweep and report status')}
            className="w-full px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Execute Diagnostics</span>
          </button>
        </div>

        {/* Protocol 4: Night Debrief */}
        <div className="hud-glass p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">04. Night Debrief & Archive</h3>
                <span className="text-xs text-slate-400 font-mono">CLOSING // REST CYCLE</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Audits tasks finished during today's operation, logs closing thoughts, and sets up tomorrow's objectives.
          </p>

          <button
            onClick={() => onTriggerAction('Run night debrief and summarize accomplishments')}
            className="w-full px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Engage Night Debrief</span>
          </button>
        </div>
      </div>
    </div>
  );
};
