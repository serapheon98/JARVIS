import React from 'react';
import { Mic, MicOff, Volume2, Activity } from 'lucide-react';

interface ArcReactorCoreProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onToggleListen: () => void;
  isListening: boolean;
  assistantName: string;
  audioVolume?: number;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  status,
  onToggleListen,
  isListening,
  assistantName,
  audioVolume = 0,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 select-none w-full">
      {/* Outer ambient glow */}
      <div
        className={`absolute w-64 h-64 rounded-full transition-all duration-300 blur-3xl pointer-events-none ${
          status === 'listening'
            ? 'bg-amber-400/25 scale-110'
            : status === 'processing'
            ? 'bg-sky-500/25 animate-pulse scale-105'
            : status === 'speaking'
            ? 'bg-cyan-400/30 scale-125'
            : 'bg-cyan-500/10'
        }`}
      />

      {/* Main Core Housing */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
        {/* Subtle decorative rotating rings */}
        <div className="absolute inset-0 border border-sky-400/20 rounded-full animate-spin-slow pointer-events-none border-dashed" />
        <div className="absolute inset-3 border border-cyan-500/15 rounded-full animate-spin-reverse pointer-events-none" />

        {/* Center Reactor with glowing image */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_35px_rgba(56,189,248,0.3)] bg-slate-950 flex items-center justify-center">
          <img
            src="/src/assets/images/jarvis_core_hologram_1792407718418.jpg"
            alt="JARVIS Arc Reactor"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-300 ${
              status === 'speaking'
                ? 'scale-110 animate-pulse'
                : status === 'listening'
                ? 'scale-105 brightness-125'
                : 'hover:scale-105'
            }`}
          />

          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/80 pointer-events-none" />

          {/* Big, Clear Voice Button */}
          <button
            onClick={onToggleListen}
            aria-label={isListening ? 'Stop listening and send' : 'Tap to speak into microphone'}
            className={`absolute z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer ${
              isListening
                ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.9)] scale-110 ring-4 ring-amber-400/40'
                : status === 'processing'
                ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                : status === 'speaking'
                ? 'bg-cyan-500 text-black shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                : 'bg-slate-900/90 text-cyan-400 border border-cyan-400/50 hover:bg-cyan-950 hover:border-cyan-300 hover:scale-105'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-7 h-7 animate-pulse mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Stop</span>
              </>
            ) : status === 'speaking' ? (
              <>
                <Volume2 className="w-7 h-7 animate-bounce mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Speaking</span>
              </>
            ) : status === 'processing' ? (
              <>
                <Activity className="w-7 h-7 animate-spin mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Thinking</span>
              </>
            ) : (
              <>
                <Mic className="w-7 h-7 mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Tap to Talk</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Clear Status text */}
      <div className="mt-4 text-center space-y-1">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'listening'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : status === 'processing'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : status === 'speaking'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
            status === 'listening' ? 'bg-amber-400 animate-ping' :
            status === 'processing' ? 'bg-sky-400 animate-ping' :
            status === 'speaking' ? 'bg-cyan-400' : 'bg-emerald-400'
          }`} />
          <span>
            {status === 'listening'
              ? 'Listening... Tap to Send'
              : status === 'processing'
              ? 'JARVIS is thinking...'
              : status === 'speaking'
              ? 'JARVIS is speaking...'
              : 'Tap microphone or type below'}
          </span>
        </div>

        <p className="text-xs text-slate-400 max-w-xs mx-auto pt-1">
          Ask questions, create tasks, set focus timers, or request your daily briefing.
        </p>
      </div>
    </div>
  );
};
