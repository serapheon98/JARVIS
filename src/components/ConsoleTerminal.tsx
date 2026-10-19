import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  BookmarkPlus,
  Play,
  Terminal as TermIcon,
  CornerDownLeft,
  Search,
  MapPin,
  FileAudio,
  Loader2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Message } from '../types/jarvis';

interface ConsoleTerminalProps {
  messages: Message[];
  onSendMessage: (text: string, options?: { model?: string; grounding?: 'none' | 'search' | 'maps' }) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleListen: () => void;
  onSpeakMessage: (text: string) => void;
  assistantName: string;
  audioVolume?: number;
  spokenText?: string;
}

export const ConsoleTerminal: React.FC<ConsoleTerminalProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isListening,
  onToggleListen,
  onSpeakMessage,
  assistantName,
  audioVolume = 0,
  spokenText = '',
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('none');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (spokenText && isListening) {
      setInputText(spokenText);
    }
  }, [spokenText, isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim(), { model: selectedModel, grounding: groundingMode });
    setInputText('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Terminal Title Strip */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <TermIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono font-medium text-slate-300">NEURAL CONSOLE</span>
          <span aria-hidden="true" className="text-slate-600">·</span>

          {/* 100% Free Tier Model Selection */}
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-cyan-400 text-[11px] font-mono rounded px-2 py-0.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Free · Deep Reasoning)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Free · High Speed)</option>
          </select>
        </div>

        {/* Real-time Grounding Options */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-500 hidden sm:inline">GROUNDING:</span>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              type="button"
              onClick={() => setGroundingMode('none')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                groundingMode === 'none' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Direct Core
            </button>
            <button
              type="button"
              onClick={() => setGroundingMode('search')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${
                groundingMode === 'search' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
              title="Google Search Grounding"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={() => setGroundingMode('maps')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${
                groundingMode === 'maps' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
              title="Google Maps Grounding"
            >
              <MapPin className="w-3 h-3" />
              <span>Maps</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Header info */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mb-1 px-1">
              <span className={msg.role === 'user' ? 'text-amber-400' : 'text-cyan-400 font-semibold'}>
                {msg.role === 'user' ? 'YOU // DIRECTIVE' : `${assistantName} // RESPONSE`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[92%] md:max-w-[82%] rounded-xl px-4 py-3 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-800/90 text-slate-100 border border-slate-700/60'
                  : 'bg-cyan-950/25 text-slate-200 border border-cyan-500/20 shadow-[0_0_20px_-5px_rgba(56,189,248,0.08)]'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* Tool Execution Cards */}
              {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-cyan-500/20 space-y-2">
                  {msg.toolInvocations.map((inv, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded bg-slate-900/80 border border-slate-700/60 font-mono text-xs text-slate-300"
                    >
                      {inv.name === 'manage_task' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : inv.name === 'manage_memory' ? (
                        <BookmarkPlus className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      ) : (
                        <Play className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-[11px] text-cyan-300 font-semibold uppercase">
                          Action: {inv.name.replace('_', ' ')}
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {inv.args?.title || inv.args?.fact || inv.args?.protocolName || JSON.stringify(inv.args)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Read Aloud & Copy buttons for JARVIS messages */}
              {msg.role === 'assistant' && (
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-cyan-500/10">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSpeakMessage(msg.content)}
                      className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      title="Speak response"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">Vocalize</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer font-mono text-[11px]"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => onSendMessage(sug, { model: selectedModel, grounding: groundingMode })}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-300 transition-colors cursor-pointer border border-slate-700"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono px-1">
              <span>{assistantName}</span>
              <span aria-hidden="true">·</span>
              <span>SYNTHESIZING...</span>
            </div>
            <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl px-4 py-3 text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono text-cyan-300">
                Running multi-turn neural reasoning via {selectedModel}...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-mono text-[11px] shrink-0">QUICK OPS:</span>
        <button
          type="button"
          onClick={() => onSendMessage('Run morning briefing', { model: selectedModel, grounding: groundingMode })}
          className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-cyan-950/80 hover:text-cyan-300 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
        >
          Morning Briefing
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Enter 25m Deep Focus Protocol', { model: selectedModel, grounding: groundingMode })}
          className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-cyan-950/80 hover:text-cyan-300 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
        >
          25m Focus Mode
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Review today’s priority objectives', { model: selectedModel, grounding: groundingMode })}
          className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-cyan-950/80 hover:text-cyan-300 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
        >
          Priority Queue
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('What are the latest breakthroughs in quantum computing?', { model: selectedModel, grounding: 'search' })}
          className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-cyan-950/80 hover:text-cyan-300 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
        >
          Search Grounding
        </button>
      </div>

      {/* Voice Status Banner while recording */}
      {isListening && (
        <div className="px-4 py-2 bg-amber-500/15 border-t border-amber-500/30 flex items-center justify-between text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>LISTENING TO YOUR VOICE... SPEAK FREELY (CLICK MIC AGAIN TO SEND)</span>
          </div>
          <div className="flex items-center gap-1">
            {[10, 30, 60, 90, 40, 70].map((bar, i) => (
              <div
                key={i}
                className="w-1 bg-amber-400 rounded-full transition-all"
                style={{ height: `${Math.max(4, (audioVolume / 100) * 16 + (i % 2) * 3)}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input Formulation Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleListen}
          aria-label={isListening ? 'Halt microphone capture and transcribe' : 'Activate microphone input'}
          className={`p-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            isListening
              ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] font-semibold'
              : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700'
          }`}
          title={isListening ? 'Click to stop & transcribe' : 'Click to talk into microphone'}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 animate-pulse" />
              <span className="text-[11px] font-mono pr-1">Stop & Send</span>
            </>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Recording your voice... Click Stop & Send or speak into your mic.'
              : `Instruct ${assistantName}... (e.g. "Add task: Design propulsion system", "Remember that I wake up at 7am")`
          }
          className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <span>Transmit</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
