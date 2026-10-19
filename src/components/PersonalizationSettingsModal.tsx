import React, { useState } from 'react';
import { X, Volume2, Save, User, Sliders, Sparkles, Check } from 'lucide-react';
import { UserProfile } from '../types/jarvis';
import { soundFX, speakText } from '../utils/audioSynthesizer';

interface PersonalizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const PersonalizationSettingsModal: React.FC<PersonalizationSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    soundFX.confirm();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    soundFX.blip();
    const testPhrase = `Greetings ${formData.name || 'Sir'}. All subsystems calibrated. I am ${formData.assistantName}, ready for your command.`;
    speakText(
      testPhrase,
      formData.voiceName,
      () => {},
      () => setIsTestingVoice(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="hud-glass-active w-full max-w-xl rounded-2xl border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight">
              PERSONALIZATION MATRIX
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Identity Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              01. User Identity & Salutation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">How JARVIS Should Address You</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sir, Boss, Tony, recycletrashh"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Your Role / Operational Title</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Chief Architect, Lead Engineer"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Assistant Persona Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              02. Assistant Persona & Behavioral Tone
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Assistant Name</label>
                <input
                  type="text"
                  value={formData.assistantName}
                  onChange={e => setFormData({ ...formData, assistantName: e.target.value })}
                  placeholder="J.A.R.V.I.S."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Personality Tone</label>
                <select
                  value={formData.persona}
                  onChange={e => setFormData({ ...formData, persona: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="stark_butler">Stark Butler (Poised, British, Respectful & Witty)</option>
                  <option value="tactical">Tactical Commander (Military Precision, Zero Fluff)</option>
                  <option value="analytical">Analytical Engine (Pure Logic & Data Focus)</option>
                  <option value="witty">Witty & Sarcastic (Playful, Razor Sharp & Fast)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audio & Vocalization Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              03. Voice Synthesis & Audio Engine
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300">Neural Voice Profile</label>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={isTestingVoice}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isTestingVoice ? 'Testing...' : 'Test Voice Audio'}</span>
                </button>
              </div>

              <select
                value={formData.voiceName}
                onChange={e => setFormData({ ...formData, voiceName: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="Fenrir">Fenrir (Deep, Aristocratic & Articulate)</option>
                <option value="Puck">Puck (Energetic, Modern & Warm)</option>
                <option value="Charon">Charon (Authoritative, Deep & Calm)</option>
                <option value="Kore">Kore (Polished, Crisp & Clear)</option>
                <option value="Zephyr">Zephyr (Contemporary Synthetic & Balanced)</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSpeak}
                  onChange={e => setFormData({ ...formData, autoSpeak: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-medium text-slate-200">Autonomous Vocalization</div>
                  <div className="text-[11px] text-slate-400">
                    Automatically speak every JARVIS response out loud via voice synthesis.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.soundEffectsEnabled}
                  onChange={e => setFormData({ ...formData, soundEffectsEnabled: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-medium text-slate-200">HUD Acoustic Feedback</div>
                  <div className="text-[11px] text-slate-400">
                    Play synthesized Stark tactical audio blips and confirmation chimes.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Directives Saved' : 'Save Personalization'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
