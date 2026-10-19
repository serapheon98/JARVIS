export type PriorityLevel = 'critical' | 'high' | 'normal' | 'low';

export interface TaskItem {
  id: string;
  title: string;
  priority: PriorityLevel;
  category: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

export interface ScheduleBlock {
  id: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  title: string;
  category: 'deep_work' | 'routine' | 'health' | 'learning' | 'admin';
  completed: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface MemoryDirective {
  id: string;
  fact: string;
  category: 'preference' | 'routine' | 'work' | 'biography' | 'directive';
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  title: string;
  role: string;
  assistantName: string;
  persona: 'stark_butler' | 'tactical' | 'analytical' | 'witty';
  voiceName: 'Fenrir' | 'Puck' | 'Charon' | 'Kore' | 'Zephyr';
  soundEffectsEnabled: boolean;
  autoSpeak: boolean;
  wakeWordEnabled: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolInvocations?: Array<{
    name: string;
    args: Record<string, any>;
    status?: 'executed' | 'pending';
  }>;
  audioBase64?: string;
  suggestions?: string[];
}

export type ProtocolType = 'morning_briefing' | 'deep_focus' | 'system_diagnostics' | 'night_debrief';

export interface ProtocolState {
  activeProtocol: ProtocolType | null;
  timerTotalSec: number;
  timerRemainingSec: number;
  isTimerRunning: boolean;
  protocolTitle?: string;
}

export interface SystemTelemetry {
  batteryLevel: number | null;
  isCharging: boolean | null;
  online: boolean;
  localTime: string;
  timezone: string;
  screenResolution: string;
  apiStatus: 'nominal' | 'checking' | 'degraded';
  latencyMs: number;
}
