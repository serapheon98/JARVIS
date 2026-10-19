import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle,
  XCircle,
  Zap,
  Clock,
  Plus,
  Trash2,
  ShieldAlert,
  Sparkles,
  ListTodo
} from 'lucide-react';
import { TaskItem, ProtocolState, ScheduleBlock } from '../types/jarvis';
import { soundFX, speakText } from '../utils/audioSynthesizer';

interface LockInHubProps {
  tasks: TaskItem[];
  protocolState: ProtocolState;
  onStartLockIn: (goal: string, minutes: number) => void;
  onPauseLockIn: () => void;
  onResumeLockIn: () => void;
  onResetLockIn: () => void;
  onLogAccountability: (goal: string, completed: boolean, notes: string) => void;
  onVoiceCommand: (text: string) => void;
  assistantName: string;
  userName: string;
  voiceName: string;
}

const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  {
    id: 'sched-1',
    startTime: '08:00',
    endTime: '08:45',
    title: 'Morning Routine & Executive Briefing',
    category: 'routine',
    completed: true,
    notes: 'Hydrate, review schedule, set day objectives',
  },
  {
    id: 'sched-2',
    startTime: '09:00',
    endTime: '11:30',
    title: 'Deep Work Chamber: Priority Build Sprint',
    category: 'deep_work',
    completed: false,
    isActive: true,
    notes: 'Zero notifications. Primary high-leverage project.',
  },
  {
    id: 'sched-3',
    startTime: '12:00',
    endTime: '13:00',
    title: 'Mid-Day Recalibration & Fuel',
    category: 'health',
    completed: false,
    notes: 'Nutritious meal, screen-free walk',
  },
  {
    id: 'sched-4',
    startTime: '13:30',
    endTime: '16:00',
    title: 'Execution & Engineering Block',
    category: 'deep_work',
    completed: false,
    notes: 'Iterate on user feedback and feature delivery',
  },
  {
    id: 'sched-5',
    startTime: '17:00',
    endTime: '17:45',
    title: 'Daily Debrief & Plan Tomorrow',
    category: 'admin',
    completed: false,
    notes: 'Review completed tasks, log lessons learned',
  },
];

export const LockInHub: React.FC<LockInHubProps> = ({
  tasks,
  protocolState,
  onStartLockIn,
  onPauseLockIn,
  onResumeLockIn,
  onResetLockIn,
  onLogAccountability,
  onVoiceCommand,
  assistantName,
  userName,
  voiceName,
}) => {
  const [targetGoal, setTargetGoal] = useState('');
  const [duration, setDuration] = useState<number>(25);
  const [binauralAudio, setBinauralAudio] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  
  // Schedule state persisted in localStorage
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_daily_schedule');
      return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
    } catch {
      return DEFAULT_SCHEDULE;
    }
  });

  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('14:00');
  const [newBlockEnd, setNewBlockEnd] = useState('15:00');
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('jarvis_lockin_streak') || '3', 10);
    } catch {
      return 3;
    }
  });

  const [sprintsToday, setSprintsToday] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('jarvis_sprints_today') || '2', 10);
    } catch {
      return 2;
    }
  });

  const isLockInActive = protocolState.activeProtocol === 'deep_focus';

  const toggleBinaural = () => {
    const nextState = !binauralAudio;
    setBinauralAudio(nextState);
    soundFX.toggleFocusAmbience(nextState);
  };

  const handleStart = () => {
    const goal = targetGoal.trim() || 'Execute primary operational deliverable';
    onStartLockIn(goal, duration);
    if (binauralAudio) soundFX.toggleFocusAmbience(true);
    speakText(
      `Lock-in initiated, ${userName}. All distractions are now off-limits. Focus solely on: ${goal}.`,
      voiceName
    );
  };

  const handleCompleteCheckIn = (success: boolean) => {
    onLogAccountability(protocolState.protocolTitle || targetGoal, success, '');
    if (success) {
      setStreakDays(prev => {
        const next = prev + 1;
        localStorage.setItem('jarvis_lockin_streak', next.toString());
        return next;
      });
      setSprintsToday(prev => {
        const next = prev + 1;
        localStorage.setItem('jarvis_sprints_today', next.toString());
        return next;
      });
      soundFX.confirm();
      speakText(
        `Outstanding execution, ${userName}. Milestone achieved and logged to your daily streak.`,
        voiceName
      );
    } else {
      speakText(
        `Understood, ${userName}. Acknowledging the friction. We recalibrate and reset immediately. No excuses.`,
        voiceName
      );
    }
    setCheckInModalOpen(false);
    onResetLockIn();
    soundFX.toggleFocusAmbience(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleBlockCompleted = (id: string) => {
    setSchedule(prev => {
      const next = prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b);
      localStorage.setItem('jarvis_daily_schedule', JSON.stringify(next));
      return next;
    });
    soundFX.blip();
  };

  const handleLockInOnBlock = (block: ScheduleBlock) => {
    setTargetGoal(block.title);
    setDuration(45);
    onStartLockIn(block.title, 45);
    speakText(`Locking in on scheduled block: ${block.title}. Stay disciplined, ${userName}.`, voiceName);
  };

  const handleAddScheduleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTitle.trim()) return;
    const newBlock: ScheduleBlock = {
      id: 'sched-' + Date.now(),
      startTime: newBlockStart,
      endTime: newBlockEnd,
      title: newBlockTitle.trim(),
      category: 'deep_work',
      completed: false,
    };
    setSchedule(prev => {
      const next = [...prev, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime));
      localStorage.setItem('jarvis_daily_schedule', JSON.stringify(next));
      return next;
    });
    setNewBlockTitle('');
    setIsAddingBlock(false);
    soundFX.confirm();
  };

  const handleDeleteScheduleBlock = (id: string) => {
    setSchedule(prev => {
      const next = prev.filter(b => b.id !== id);
      localStorage.setItem('jarvis_daily_schedule', JSON.stringify(next));
      return next;
    });
    soundFX.blip();
  };

  const askJarvisToInspectPlan = () => {
    const uncompleted = schedule.filter(s => !s.completed).map(s => `${s.startTime}-${s.endTime}: ${s.title}`).join(', ');
    const prompt = `Review my daily schedule. My remaining blocks today are: ${uncompleted || 'All current scheduled blocks are checked off'}. Instruct me with high accountability on what I should execute next and how to eliminate distractions.`;
    onVoiceCommand(prompt);
  };

  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-cyan-400 font-bold">LOCK-IN COMMAND CENTER</span>
            <span aria-hidden="true">·</span>
            <span>DAY PLAN & ACCOUNTABILITY</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">
            Your Personal Lock-In Assistant
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Declare your milestones, adhere to your daily schedule, and let {assistantName} hold you strictly accountable.
          </p>
        </div>

        {/* Streaks and metrics */}
        <div className="flex items-center gap-3">
          <div className="hud-glass px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 text-xs">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-mono">
              <strong className="text-slate-100">{streakDays}</strong> Day Streak
            </span>
          </div>

          <div className="hud-glass px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-mono">
              <strong className="text-slate-100">{sprintsToday}</strong> Sprints Today
            </span>
          </div>

          <button
            onClick={askJarvisToInspectPlan}
            className="hud-glass hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30 flex items-center gap-1.5 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
            title="Ask Jarvis to review your schedule and instruct you"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instruct Me</span>
          </button>
        </div>
      </div>

      {/* Active Lock-In Immersion Mode */}
      {isLockInActive ? (
        <div className="hud-glass-active p-8 rounded-2xl border-2 border-cyan-500/40 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              LOCK-IN CHAMBER ACTIVE · ZERO DISTRACTIONS
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              "{protocolState.protocolTitle || 'Execute Priority Task'}"
            </h3>
            <p className="text-xs text-slate-400">
              Do not touch social media, unrelated tabs, or message threads. Focus exclusively on this deliverable.
            </p>
          </div>

          {/* Big countdown timer */}
          <div className="text-6xl sm:text-7xl font-mono font-black text-cyan-300 tracking-widest tabular-nums drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]">
            {formatTime(protocolState.timerRemainingSec)}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {protocolState.isTimerRunning ? (
              <button
                onClick={onPauseLockIn}
                className="px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={onResumeLockIn}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={toggleBinaural}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer ${
                binauralAudio
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={binauralAudio ? 'Disable Focus Audio' : 'Enable 40Hz Focus Wave'}
            >
              {binauralAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setCheckInModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Sprint</span>
            </button>

            <button
              onClick={onResetLockIn}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs cursor-pointer"
              title="Abort Sprint"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Configuration Form to Enter Lock-In */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Goal Input (7 cols) */}
          <div className="lg:col-span-7 hud-glass p-6 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <div className="text-xs font-mono text-cyan-400 font-semibold mb-1">
                STEP 1: DECLARE YOUR TARGET
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                What single commitment are you locking in on?
              </h3>
            </div>

            <input
              type="text"
              value={targetGoal}
              onChange={e => setTargetGoal(e.target.value)}
              placeholder="e.g. Write core algorithm, finish slide deck, or study chapter 4"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />

            {/* Quick-pick from pending tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-2">Or select from your active tasks:</div>
                <div className="flex flex-wrap gap-2">
                  {pendingTasks.slice(0, 4).map(task => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setTargetGoal(task.title)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-left truncate max-w-xs"
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Selector */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400">SESSION DURATION:</div>
              <div className="grid grid-cols-4 gap-2">
                {[15, 25, 45, 90].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all border ${
                      duration === mins
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Options & Launch */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={binauralAudio}
                  onChange={toggleBinaural}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                />
                <span>Enable 40Hz Gamma Focus Audio</span>
              </label>

              <button
                type="button"
                onClick={handleStart}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-400/20 transition-all hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>ENTER LOCK-IN CHAMBER</span>
              </button>
            </div>
          </div>

          {/* Accountability Rules Card (5 cols) */}
          <div className="lg:col-span-5 hud-glass p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>THE LOCK-IN CODE OF CONDUCT</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  <span><strong>One target only.</strong> Multitasking is strictly forbidden in the chamber.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  <span><strong>No tab hopping.</strong> Close messaging apps and put your phone out of reach.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  <span><strong>Mandatory check-in.</strong> When the timer expires, JARVIS prompts for honest proof of execution.</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 italic">
              "Amateurs wait for motivation. Professionals build systems and execute regardless of emotion."
            </div>
          </div>
        </div>
      )}

      {/* Daily Schedule & Plan Adherence Section */}
      <div className="hud-glass p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Today's Daily Plan & Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Your timetable for peak performance. Check off blocks as you execute through the day.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingBlock(!isAddingBlock)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Block</span>
            </button>
          </div>
        </div>

        {/* Form to add schedule block */}
        {isAddingBlock && (
          <form onSubmit={handleAddScheduleBlock} className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="text-[10px] font-mono text-slate-400 block mb-1">START TIME</label>
              <input
                type="time"
                value={newBlockStart}
                onChange={e => setNewBlockStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="text-[10px] font-mono text-slate-400 block mb-1">END TIME</label>
              <input
                type="time"
                value={newBlockEnd}
                onChange={e => setNewBlockEnd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="text-[10px] font-mono text-slate-400 block mb-1">BLOCK OBJECTIVE</label>
              <input
                type="text"
                placeholder="e.g. Gym workout, review design spec"
                value={newBlockTitle}
                onChange={e => setNewBlockTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Schedule List */}
        <div className="space-y-2.5">
          {schedule.map(block => (
            <div
              key={block.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                block.completed
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                  : block.isActive
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleBlockCompleted(block.id)}
                  className={`w-5 h-5 rounded flex items-center justify-center border cursor-pointer ${
                    block.completed
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-600 hover:border-cyan-400'
                  }`}
                  title={block.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {block.completed && <CheckCircle className="w-3.5 h-3.5" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      {block.startTime} – {block.endTime}
                    </span>
                    {block.isActive && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        ACTIVE NOW
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-semibold mt-0.5 ${block.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {block.title}
                  </div>
                  {block.notes && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {block.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!block.completed && (
                  <button
                    onClick={() => handleLockInOnBlock(block)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lock In</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteScheduleBlock(block.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Sprint Accountability Check-In Modal */}
      {checkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="hud-glass-active w-full max-w-md rounded-2xl border-2 border-cyan-500/40 p-6 space-y-5 text-center">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400 uppercase font-bold">SPRINT CONCLUDED</div>
              <h3 className="text-xl font-bold text-slate-100">
                Accountability Check-In
              </h3>
              <p className="text-xs text-slate-300">
                Did you successfully complete: <br />
                <strong className="text-cyan-300">"{protocolState.protocolTitle || targetGoal}"</strong>?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleCompleteCheckIn(true)}
                className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Yes, Completed!</span>
              </button>

              <button
                onClick={() => handleCompleteCheckIn(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Got Distracted / Incomplete</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Honest feedback trains {assistantName} to understand your true execution patterns.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
