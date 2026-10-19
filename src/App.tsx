/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TopBar, MainTabType } from './components/TopBar';
import { ArcReactorCore } from './components/ArcReactorCore';
import { ConsoleTerminal } from './components/ConsoleTerminal';
import { ExecutiveBriefingView } from './components/ExecutiveBriefingView';
import { ProtocolsPanel } from './components/ProtocolsPanel';
import { MemoryMatrixPanel } from './components/MemoryMatrixPanel';
import { TasksDirectivesPanel } from './components/TasksDirectivesPanel';
import { PersonalizationSettingsModal } from './components/PersonalizationSettingsModal';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { LandingPage } from './components/LandingPage';
import { LockInHub } from './components/LockInHub';
import { AlertCircle, X } from 'lucide-react';
import {
  UserProfile,
  Message,
  TaskItem,
  MemoryDirective,
  PriorityLevel,
  ProtocolType,
  ProtocolState,
  SystemTelemetry,
} from './types/jarvis';
import { soundFX, speakText } from './utils/audioSynthesizer';
import { voiceRecorder } from './utils/voiceRecorder';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Sir',
  title: 'Executive Architect',
  role: 'Chief Architect & Builder',
  assistantName: 'J.A.R.V.I.S.',
  persona: 'stark_butler',
  voiceName: 'Fenrir',
  soundEffectsEnabled: true,
  autoSpeak: true,
  wakeWordEnabled: true,
};

const INITIAL_MEMORIES: MemoryDirective[] = [
  {
    id: 'mem-1',
    category: 'preference',
    fact: 'Prefers concise, actionable summaries with direct engineering solutions.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    category: 'routine',
    fact: 'Deep cognitive focus blocks are most productive between 09:00 and 13:00.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    category: 'work',
    fact: 'Current primary engineering objective is building high-leverage autonomous AI applications.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-4',
    category: 'directive',
    fact: 'Proactively recommend task breakdowns whenever high-complexity directives are logged.',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Review Mark VIII Core Neural Matrix & Telemetry',
    priority: 'critical',
    category: 'Engineering',
    deadline: 'Today 14:00',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Configure automated personal directives and habits',
    priority: 'high',
    category: 'Personalization',
    deadline: 'Today',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Deploy high-urgency focus sprint for system calibration',
    priority: 'normal',
    category: 'Operations',
    deadline: 'Tomorrow',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  // 1. Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 2. Persistent State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('jarvis_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [memories, setMemories] = useState<MemoryDirective[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_memories');
      return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init-1',
        role: 'assistant',
        content: `Good day, Sir. J.A.R.V.I.S. Mark VIII operational. Core neural matrices are synchronized, quantum audio uplink is nominal, and your personal directives have been loaded into memory. How may I be of assistance?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Run morning briefing', 'Enter 25m Focus Mode', 'Review active priorities'],
      },
    ];
  });

  // 3. Navigation & UI state
  const [viewMode, setViewMode] = useState<'landing' | 'station'>(() => {
    try {
      const saved = localStorage.getItem('jarvis_view_mode');
      return (saved === 'landing' || saved === 'station') ? saved : 'station';
    } catch {
      return 'station';
    }
  });
  const [currentTab, setCurrentTab] = useState<MainTabType>('lockin');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [coreStatus, setCoreStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // 4. Executive Briefing data
  const [briefingData, setBriefingData] = useState<any>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);

  // 5. Protocols & Timer State
  const [protocolState, setProtocolState] = useState<ProtocolState>({
    activeProtocol: null,
    timerTotalSec: 0,
    timerRemainingSec: 0,
    isTimerRunning: false,
    protocolTitle: '',
  });

  // 6. System Telemetry State
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    batteryLevel: null,
    isCharging: null,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080',
    apiStatus: 'nominal',
    latencyMs: 14,
  });

  const recognitionRef = useRef<any>(null);

  // Test Firestore Connection on Boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Firebase Auth Listener & Firestore Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      if (user) {
        // Sync User Profile
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setProfile(prev => ({
              ...prev,
              name: data.name || prev.name,
              title: data.title || prev.title,
              role: data.role || prev.role,
              assistantName: data.assistantName || prev.assistantName,
              persona: data.persona || prev.persona,
              voiceName: data.voiceName || prev.voiceName,
            }));
          } else {
            // Initialize document
            await setDoc(userDocRef, {
              uid: user.uid,
              name: user.displayName || profile.name,
              email: user.email || '',
              assistantName: profile.assistantName,
              persona: profile.persona,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        }

        // Realtime Firestore listeners for Tasks
        const tasksCol = collection(db, 'users', user.uid, 'tasks');
        const unsubTasks = onSnapshot(
          tasksCol,
          snapshot => {
            const remoteTasks: TaskItem[] = [];
            snapshot.forEach(docSnap => {
              remoteTasks.push(docSnap.data() as TaskItem);
            });
            if (remoteTasks.length > 0) {
              setTasks(remoteTasks);
            }
          },
          err => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/tasks`)
        );

        // Realtime Firestore listeners for Memories
        const memCol = collection(db, 'users', user.uid, 'memories');
        const unsubMem = onSnapshot(
          memCol,
          snapshot => {
            const remoteMem: MemoryDirective[] = [];
            snapshot.forEach(docSnap => {
              remoteMem.push(docSnap.data() as MemoryDirective);
            });
            if (remoteMem.length > 0) {
              setMemories(remoteMem);
            }
          },
          err => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/memories`)
        );

        return () => {
          unsubTasks();
          unsubMem();
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('jarvis_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('jarvis_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('jarvis_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('jarvis_messages', JSON.stringify(messages));
  }, [messages]);

  // Audio boot chime
  useEffect(() => {
    if (profile.soundEffectsEnabled) {
      soundFX.chime();
    }
  }, []);

  // System telemetry updates
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }));
    }, 1000);

    const handleOnline = () => setTelemetry(prev => ({ ...prev, online: true }));
    const handleOffline = () => setTelemetry(prev => ({ ...prev, online: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setTelemetry(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }

    return () => {
      clearInterval(clockInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Protocol countdown timer
  useEffect(() => {
    let timer: any = null;
    if (protocolState.isTimerRunning && protocolState.timerRemainingSec > 0) {
      timer = setInterval(() => {
        setProtocolState(prev => {
          if (prev.timerRemainingSec <= 1) {
            if (profile.soundEffectsEnabled) soundFX.confirm();
            speakText(
              `Sir, your ${prev.protocolTitle || 'protocol'} period has concluded. Subsystems returning to standby.`,
              profile.voiceName,
              () => setCoreStatus('speaking'),
              () => setCoreStatus('idle')
            );
            return {
              ...prev,
              timerRemainingSec: 0,
              isTimerRunning: false,
            };
          }
          return {
            ...prev,
            timerRemainingSec: prev.timerRemainingSec - 1,
          };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [protocolState.isTimerRunning, protocolState.timerRemainingSec, profile]);

  // Voice capture setup using universal voiceRecorder (Web Speech API + MediaRecorder fallback)
  const toggleListen = async () => {
    if (isListening) {
      voiceRecorder.stop();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      setCoreStatus('idle');
      setAudioVolume(0);
      if (profile.soundEffectsEnabled) soundFX.blip();
    } else {
      setMicError(null);
      setIsListening(true);
      setCoreStatus('listening');
      if (profile.soundEffectsEnabled) soundFX.blip();

      voiceRecorder.onVolumeChange = (vol) => {
        setAudioVolume(vol);
      };

      voiceRecorder.onInterimText = (text) => {
        setSpokenText(text);
      };

      voiceRecorder.onTranscriptReady = (transcript) => {
        setIsListening(false);
        setCoreStatus('processing');
        setAudioVolume(0);
        setSpokenText('');
        handleSendMessage(transcript);
      };

      voiceRecorder.onError = (err) => {
        setIsListening(false);
        setCoreStatus('idle');
        setAudioVolume(0);
        setSpokenText('');
        setMicError(err);
      };

      const started = await voiceRecorder.start();
      if (!started) {
        setIsListening(false);
        setCoreStatus('idle');
      }
    }
  };

  const handleLogAccountability = async (goal: string, completed: boolean, notes: string) => {
    try {
      const event = {
        goal,
        completed,
        notes,
        timestamp: new Date().toISOString(),
      };
      const saved = localStorage.getItem('jarvis_accountability_logs');
      const logs = saved ? JSON.parse(saved) : [];
      logs.unshift(event);
      localStorage.setItem('jarvis_accountability_logs', JSON.stringify(logs.slice(0, 50)));

      if (currentUser) {
        const colRef = collection(db, 'users', currentUser.uid, 'accountability');
        await setDoc(doc(colRef, `log-${Date.now()}`), event);
      }
    } catch (e) {
      console.warn('Accountability logging notice:', e);
    }
  };

  // Google Sign-In & Sign-Out
  const handleSignIn = async () => {
    try {
      soundFX.blip();
      await signInWithGoogle();
      soundFX.confirm();
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      soundFX.blip();
      await signOutUser();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Main interaction dispatcher to Gemini
  const handleSendMessage = async (
    userText: string,
    options?: { model?: string; grounding?: 'none' | 'search' | 'maps' }
  ) => {
    if (!userText.trim()) return;

    if (profile.soundEffectsEnabled) soundFX.blip();

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setCoreStatus('processing');

    const startBenchmark = performance.now();

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile: profile,
          memoryDirectives: memories,
          activeTasks: tasks,
          modelName: options?.model || 'gemini-3.8-flash',
          grounding: options?.grounding || 'none',
          systemContext: {
            localTime: telemetry.localTime,
            timezone: telemetry.timezone,
            online: telemetry.online,
          },
        }),
      });

      const latency = Math.round(performance.now() - startBenchmark);
      setTelemetry(prev => ({ ...prev, latencyMs: latency }));

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantText = data.reply || 'Command acknowledged, Sir.';

      const toolInvocations: any[] = [];
      if (Array.isArray(data.functionCalls)) {
        for (const call of data.functionCalls) {
          toolInvocations.push({ name: call.name, args: call.args, status: 'executed' });

          if (call.name === 'manage_task') {
            const { action, title, priority = 'high', category = 'General', deadline } = call.args;
            if (action === 'create') {
              handleAddTask(title, priority as PriorityLevel, category, deadline);
            } else if (action === 'complete') {
              const matched = tasks.find(t => t.title.toLowerCase().includes(title.toLowerCase()));
              if (matched) handleToggleTask(matched.id);
            }
          } else if (call.name === 'manage_memory') {
            const { action, fact, category = 'directive' } = call.args;
            if (action === 'save') {
              handleAddMemory(fact, category);
            }
          } else if (call.name === 'trigger_protocol') {
            const { protocolName, durationMinutes = 25, notes } = call.args;
            handleStartProtocol(protocolName as ProtocolType, durationMinutes, notes);
          }
        }
      }

      const jarvisMsg: Message = {
        id: `jarvis-${Date.now()}`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolInvocations,
        suggestions: data.suggestions || [],
      };

      setMessages(prev => [...prev, jarvisMsg]);
      setIsLoading(false);

      if (profile.autoSpeak) {
        speakText(
          assistantText,
          profile.voiceName,
          () => setCoreStatus('speaking'),
          () => setCoreStatus('idle')
        );
      } else {
        setCoreStatus('idle');
      }
    } catch (err: any) {
      console.error('Error contacting JARVIS:', err);
      setIsLoading(false);
      setCoreStatus('idle');

      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `My apologies, Sir. A communication delay occurred with the core neural matrix: ${err.message}. Subsystems remain online; please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const handleSpeakMessage = (text: string) => {
    soundFX.blip();
    speakText(
      text,
      profile.voiceName,
      () => setCoreStatus('speaking'),
      () => setCoreStatus('idle')
    );
  };

  // Task actions with Firestore write
  const handleAddTask = async (title: string, priority: PriorityLevel, category: string, deadline?: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      priority,
      category,
      deadline,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'tasks', newTask.id), {
          ...newTask,
          userId: currentUser.uid,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/tasks/${newTask.id}`);
      }
    }
  };

  const handleToggleTask = async (id: string) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);

    if (currentUser) {
      const task = updated.find(t => t.id === id);
      if (task) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'tasks', id), {
            ...task,
            userId: currentUser.uid,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/tasks/${id}`);
        }
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (profile.soundEffectsEnabled) soundFX.blip();

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/tasks/${id}`);
      }
    }
  };

  // Memory actions with Firestore write
  const handleAddMemory = async (fact: string, category: MemoryDirective['category']) => {
    const newMem: MemoryDirective = {
      id: `mem-${Date.now()}`,
      fact,
      category,
      createdAt: new Date().toISOString(),
    };
    setMemories(prev => [newMem, ...prev]);
    if (profile.soundEffectsEnabled) soundFX.confirm();

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'memories', newMem.id), {
          ...newMem,
          userId: currentUser.uid,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/memories/${newMem.id}`);
      }
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    if (profile.soundEffectsEnabled) soundFX.blip();

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'memories', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/memories/${id}`);
      }
    }
  };

  // Protocol actions
  const handleStartProtocol = (type: ProtocolType, durationMinutes = 25, title?: string) => {
    if (profile.soundEffectsEnabled) soundFX.confirm();
    const totalSec = durationMinutes * 60;
    setProtocolState({
      activeProtocol: type,
      timerTotalSec: totalSec,
      timerRemainingSec: totalSec,
      isTimerRunning: true,
      protocolTitle: title || (type === 'deep_focus' ? 'Deep Work Sprint' : type.replace('_', ' ')),
    });

    if (type === 'deep_focus') {
      soundFX.toggleFocusAmbience(true);
    }

    setCurrentTab('lockin');
  };

  const handlePauseProtocol = () => {
    setProtocolState(prev => ({ ...prev, isTimerRunning: false }));
    soundFX.toggleFocusAmbience(false);
  };

  const handleResumeProtocol = () => {
    setProtocolState(prev => ({ ...prev, isTimerRunning: true }));
    if (protocolState.activeProtocol === 'deep_focus') {
      soundFX.toggleFocusAmbience(true);
    }
  };

  const handleResetProtocol = () => {
    setProtocolState({
      activeProtocol: null,
      timerTotalSec: 0,
      timerRemainingSec: 0,
      isTimerRunning: false,
      protocolTitle: '',
    });
    soundFX.toggleFocusAmbience(false);
    if (profile.soundEffectsEnabled) soundFX.blip();
  };

  // Briefing fetcher
  const handleFetchBriefing = async () => {
    setIsBriefingLoading(true);
    if (profile.soundEffectsEnabled) soundFX.blip();

    try {
      const res = await fetch('/api/jarvis/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: profile.name,
          activeTasks: tasks.filter(t => !t.completed),
          memoryDirectives: memories,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBriefingData(data);
      }
    } catch (err) {
      console.error('Failed to fetch executive briefing:', err);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  useEffect(() => {
    if (!briefingData) {
      handleFetchBriefing();
    }
  }, []);

  if (viewMode === 'landing') {
    return (
      <LandingPage
        assistantName={profile.assistantName}
        onLaunchApp={() => {
          setViewMode('station');
          try {
            localStorage.setItem('jarvis_view_mode', 'station');
          } catch {}
          soundFX.confirm();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black">
      {/* Cinematic Ambient Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/src/assets/images/jarvis_hud_backdrop_1792407718059.jpg"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-15 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/90 via-[#070b12]/95 to-[#070b12]" />
      </div>

      {/* Top Navigation Bar with strict 3-zone contract */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoToLanding={() => {
          setViewMode('landing');
          try {
            localStorage.setItem('jarvis_view_mode', 'landing');
          } catch {}
          soundFX.blip();
        }}
        assistantName={profile.assistantName}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Workspace Frame */}
      <main className="relative z-10 flex-1 max-w-[1520px] w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
        {/* Real-time System Telemetry Strip */}
        <TelemetryDrawer telemetry={telemetry} assistantName={profile.assistantName} />

        {/* Microphone Permission / Diagnostics Alert */}
        {micError && (
          <div className="hud-glass p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/40 flex items-center justify-between text-xs text-amber-200 shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{micError}</span>
            </div>
            <button
              onClick={() => setMicError(null)}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2-Column Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[600px]">
          {/* Left Column: Arc Reactor Core HUD & Command Deck (4 cols on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="hud-glass rounded-2xl border border-cyan-500/20 p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <ArcReactorCore
                status={coreStatus}
                onToggleListen={toggleListen}
                isListening={isListening}
                assistantName={profile.assistantName}
                audioVolume={audioVolume}
              />
            </div>

            {/* Quick Profile Summary Badge */}
            <div className="hud-glass p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">USER DIRECTIVE PROFILE</span>
                <span>{currentUser ? 'CLOUD SYNC' : 'LOCAL CACHE'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">
                  {currentUser?.displayName || profile.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">{profile.role}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>PERSONA: {profile.persona.toUpperCase().replace('_', ' ')}</span>
                <span className="text-cyan-400">VOICE: {profile.voiceName}</span>
              </div>
            </div>

            {/* Active Objectives mini widget */}
            <div className="hud-glass p-4 rounded-xl border border-slate-800 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
                  <span className="text-slate-300 font-semibold">ALPHA OBJECTIVES</span>
                  <button
                    onClick={() => setCurrentTab('tasks')}
                    className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    View All ({tasks.filter(t => !t.completed).length})
                  </button>
                </div>
                <div className="space-y-2">
                  {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200 truncate">{task.title}</span>
                      <span className="font-mono text-[10px] text-amber-400 uppercase shrink-0 ml-2">
                        {task.priority}
                      </span>
                    </div>
                  ))}
                  {tasks.filter(t => !t.completed).length === 0 && (
                    <div className="text-xs text-slate-500 font-mono py-2 text-center">
                      All directives executed, Sir.
                    </div>
                  )}
                </div>
              </div>

              {/* Protocol Quick-Start */}
              <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentTab('lockin');
                    handleStartProtocol('deep_focus', 25, 'High-Priority Focus Session');
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 text-xs font-medium font-mono text-center cursor-pointer transition-colors"
                >
                  Lock In (25m)
                </button>
                <button
                  onClick={() => setCurrentTab('briefing')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium font-mono text-center cursor-pointer transition-colors"
                >
                  Situation Brief
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Workspace View (8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[580px]">
            {/* View Switching Header on Mobile */}
            <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2 mb-2 text-xs">
              {(['lockin', 'terminal', 'briefing', 'tasks', 'memory'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                    currentTab === tab
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {tab === 'lockin' ? 'Lock-In' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Active View Container */}
            <div className="flex-1 flex flex-col">
              {currentTab === 'lockin' && (
                <div className="hud-glass p-6 rounded-2xl border border-slate-800 flex-1 overflow-y-auto">
                  <LockInHub
                    tasks={tasks}
                    protocolState={protocolState}
                    onStartLockIn={(goal, minutes) => handleStartProtocol('deep_focus', minutes, goal)}
                    onPauseLockIn={handlePauseProtocol}
                    onResumeLockIn={handleResumeProtocol}
                    onResetLockIn={handleResetProtocol}
                    onLogAccountability={handleLogAccountability}
                    onVoiceCommand={(cmd) => {
                      setCurrentTab('terminal');
                      handleSendMessage(cmd);
                    }}
                    assistantName={profile.assistantName}
                    userName={profile.name}
                    voiceName={profile.voiceName}
                  />
                </div>
              )}

              {currentTab === 'terminal' && (
                <ConsoleTerminal
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  isListening={isListening}
                  onToggleListen={toggleListen}
                  onSpeakMessage={handleSpeakMessage}
                  assistantName={profile.assistantName}
                  audioVolume={audioVolume}
                  spokenText={spokenText}
                />
              )}

              {currentTab === 'briefing' && (
                <div className="hud-glass p-6 rounded-2xl border border-slate-800 flex-1 overflow-y-auto">
                  <ExecutiveBriefingView
                    briefing={briefingData}
                    isLoading={isBriefingLoading}
                    onRefresh={handleFetchBriefing}
                    onSpeak={handleSpeakMessage}
                    onSelectTask={title => {
                      setCurrentTab('lockin');
                      handleStartProtocol('deep_focus', 25, title);
                    }}
                    tasks={tasks}
                    assistantName={profile.assistantName}
                    userName={profile.name}
                  />
                </div>
              )}

              {currentTab === 'tasks' && (
                <div className="hud-glass p-6 rounded-2xl border border-slate-800 flex-1 overflow-y-auto">
                  <TasksDirectivesPanel
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    assistantName={profile.assistantName}
                  />
                </div>
              )}

              {currentTab === 'memory' && (
                <div className="hud-glass p-6 rounded-2xl border border-slate-800 flex-1 overflow-y-auto">
                  <MemoryMatrixPanel
                    memories={memories}
                    onAddMemory={handleAddMemory}
                    onDeleteMemory={handleDeleteMemory}
                    assistantName={profile.assistantName}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Personalization Settings Modal */}
      <PersonalizationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />
    </div>
  );
}
