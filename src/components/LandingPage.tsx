import React from 'react';
import {
  Mic,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  Volume2,
  Sparkles,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  assistantName: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  assistantName,
}) => {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wider text-cyan-400">
            {assistantName}
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Lock-In AI OS
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-cyan-300 transition-colors">How It Works</a>
          <a href="#lockin" className="hover:text-cyan-300 transition-colors">Lock-In Engine</a>
          <a href="#security" className="hover:text-cyan-300 transition-colors">Data Security</a>
          <a href="#pricing" className="hover:text-cyan-300 transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all rounded-lg whitespace-nowrap cursor-pointer shadow-lg shadow-cyan-400/20"
          >
            <span>Launch Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>YOUR 24/7 PERSONAL LOCK-IN ASSISTANT</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl text-balance leading-tight">
          An AI chief of staff that keeps you{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">
            locked in on your goals
          </span>{' '}
          all day.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl text-balance leading-relaxed">
          Tired of drifting into distractions? {assistantName} runs your morning executive briefings, locks you into high-leverage focus chambers, talks with you naturally, and holds you strictly accountable to your plans.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-cyan-400/25 hover:scale-105"
          >
            <span>Enter Your Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold transition-colors text-center"
          >
            Explore Capabilities
          </a>
        </div>

        {/* Hero Visual Preview */}
        <div className="w-full pt-10">
          <div className="hud-glass rounded-2xl border border-cyan-500/30 p-2 sm:p-4 shadow-2xl relative overflow-hidden group">
            <div className="relative rounded-xl overflow-hidden aspect-video max-h-[500px] bg-slate-950 flex items-center justify-center">
              <img
                src="/src/assets/images/jarvis_hud_backdrop_1792407718059.jpg"
                alt="JARVIS Workspace"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full border-2 border-cyan-400/60 p-1 flex items-center justify-center mb-4 bg-slate-950/70 backdrop-blur-md shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                  <img
                    src="/src/assets/images/jarvis_core_hologram_1792407718418.jpg"
                    alt="Core"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-mono">
                  "Good morning. All systems nominal. Ready to lock in?"
                </h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md">
                  Voice-driven intelligence with permanent memory directives and zero-distraction focus chambers.
                </p>
                <button
                  onClick={onLaunchApp}
                  className="mt-5 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Launch Live OS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars / How It Works */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto space-y-12 border-t border-slate-900">
        <div className="text-center space-y-3">
          <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">
            HOW IT WORKS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Engineered to Eliminate Procrastination
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Most to-do lists are passive. {assistantName} is active, verbal, and relentless about getting things done.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="hud-glass p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              01. Morning Executive Briefing
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Start your day with clarity. JARVIS synthesizes your calendar, top 3 strategic priorities, and tactical guidance, vocalized aloud so you don't waste morning energy.
            </p>
          </div>

          {/* Card 2 */}
          <div className="hud-glass p-6 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              02. The Lock-In Chamber
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pick your single most critical milestone. Enter the chamber with 40Hz focus binaural frequencies and live timers. Multitasking is blocked until completion.
            </p>
          </div>

          {/* Card 3 */}
          <div className="hud-glass p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              03. Voice & Permanent Memory
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Speak naturally via microphone. JARVIS remembers your work routines, goals, and habits permanently in your private database, learning how to serve you better over time.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="px-6 py-20 max-w-6xl mx-auto border-t border-slate-900 space-y-8">
        <div className="hud-glass p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>ZERO-TRUST PRIVACY ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Your Data & Conversations Are 100% Private
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              We enforce strict user-level database isolation via Google Cloud Firestore. Your tasks, memory directives, and personal audio transcripts belong to you alone. No data is shared with third parties or advertisers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <Lock className="w-4 h-4 text-cyan-400 mb-1" />
              <div className="font-bold text-slate-100">AES-256</div>
              <div>Encrypted At Rest</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="font-bold text-slate-100">Strict ABAC</div>
              <div>Isolated User Storage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 max-w-6xl mx-auto border-t border-slate-900 space-y-12">
        <div className="text-center space-y-3">
          <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">
            TRANSPARENT PLANS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Start Free. Upgrade When You Scale.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="hud-glass p-8 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono text-slate-400 uppercase">STARTER PLAN</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-100">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-300">
                Ideal for individuals who want an intelligent voice assistant with daily task tracking.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Full Voice & Microphone Interaction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Executive Morning Briefings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Directives & Priority Task Board</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Standard Memory Matrix</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onLaunchApp}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="hud-glass-active p-8 rounded-2xl border-2 border-cyan-400 shadow-[0_0_40px_rgba(56,189,248,0.2)] flex flex-col justify-between space-y-6 relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">LOCK-IN PRO</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold">
                  RECOMMENDED
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-100">$19</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-300">
                For operators, founders, and students who need strict daily discipline and accountability.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-200 pt-2 border-t border-cyan-500/20">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span><strong>Everything in Starter</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span><strong>Lock-In Chamber with 40Hz Audio</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span><strong>Accountability Verification Prompts</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span><strong>Daily Streak Tracking & Performance Analytics</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span><strong>Cloud Firestore Sync Across All Devices</strong></span>
                </li>
              </ul>
            </div>

            <button
              onClick={onLaunchApp}
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold cursor-pointer transition-all shadow-lg shadow-cyan-400/25"
            >
              Start 14-Day Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} {assistantName} OS. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <button onClick={onLaunchApp} className="text-cyan-400 hover:underline cursor-pointer">
              Launch Assistant
            </button>
            <a href="#security" className="hover:text-slate-300">Privacy & Security</a>
            <a href="#features" className="hover:text-slate-300">Architecture</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
