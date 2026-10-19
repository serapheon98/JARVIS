/**
 * Web Audio API synthesizer for sci-fi Stark HUD acoustic feedback
 * Pure synthesized sound - zero external audio asset dependencies!
 */

class SoundFX {
  private ctx: AudioContext | null = null;
  private focusOsc1: OscillatorNode | null = null;
  private focusOsc2: OscillatorNode | null = null;
  private focusGain: GainNode | null = null;
  private isFocusPlaying = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Crisp tactical UI tap/blip
   */
  blip(volume = 0.05) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // Audio autoplay policy catch
    }
  }

  /**
   * Harmonious Stark reactor boot chime
   */
  chime(volume = 0.08) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const freqs = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6 chord
      freqs.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(volume / (i + 1), this.ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5 + i * 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.06);
        osc.stop(this.ctx.currentTime + 0.6 + i * 0.06);
      });
    } catch {}
  }

  /**
   * Directive confirmation chime
   */
  confirm(volume = 0.06) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime + 0.08); // B5

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.24);
    } catch {}
  }

  /**
   * Alert or critical prompt notification
   */
  alert(volume = 0.08) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.setValueAtTime(330, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(volume * 0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch {}
  }

  /**
   * Deep Focus ambient binaural frequency drone (40Hz gamma beat carrier)
   */
  toggleFocusAmbience(enable: boolean, volume = 0.04) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (!enable) {
        if (this.focusGain) {
          this.focusGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
          setTimeout(() => {
            this.focusOsc1?.stop();
            this.focusOsc2?.stop();
            this.focusOsc1?.disconnect();
            this.focusOsc2?.disconnect();
            this.focusOsc1 = null;
            this.focusOsc2 = null;
            this.focusGain = null;
            this.isFocusPlaying = false;
          }, 900);
        }
        return;
      }

      if (this.isFocusPlaying) return;

      this.focusGain = this.ctx.createGain();
      this.focusGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.focusGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.2);

      // Carrier 216Hz + 256Hz binaural alpha/gamma wave
      this.focusOsc1 = this.ctx.createOscillator();
      this.focusOsc1.type = 'sine';
      this.focusOsc1.frequency.setValueAtTime(216, this.ctx.currentTime);

      this.focusOsc2 = this.ctx.createOscillator();
      this.focusOsc2.type = 'sine';
      this.focusOsc2.frequency.setValueAtTime(226, this.ctx.currentTime); // 10Hz alpha difference

      this.focusOsc1.connect(this.focusGain);
      this.focusOsc2.connect(this.focusGain);
      this.focusGain.connect(this.ctx.destination);

      this.focusOsc1.start();
      this.focusOsc2.start();
      this.isFocusPlaying = true;
    } catch {}
  }
}

export const soundFX = new SoundFX();

/**
 * Speech synthesis player with Gemini TTS server integration and fallback to Web Speech API
 */
export async function speakText(
  text: string,
  voiceName: string = 'Fenrir',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  const cleanText = text
    .replace(/```[\s\S]*?```/g, ' Code snippet displayed on your console. ')
    .replace(/[*_#>`]/g, '')
    .trim();

  if (!cleanText) return;

  onStart?.();

  // Try Server-side Gemini TTS first
  try {
    const res = await fetch('/api/jarvis/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, voiceName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audio.onended = () => onEnd?.();
        audio.onerror = () => {
          fallbackWebSpeech(cleanText, onEnd);
        };
        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn('Backend TTS request error, switching to browser Web Speech API:', err);
  }

  // Fallback to browser SpeechSynthesis
  fallbackWebSpeech(cleanText, onEnd);
}

function fallbackWebSpeech(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 0.95;

  const voices = window.speechSynthesis.getVoices();
  // Prefer British English or sleek male voice to mimic J.A.R.V.I.S.
  const britishVoice = voices.find(
    v => v.lang.includes('en-GB') || v.name.toLowerCase().includes('british') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('george')
  );
  if (britishVoice) {
    utterance.voice = britishVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}
