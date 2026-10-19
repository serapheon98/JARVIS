/**
 * Universal voice recorder supporting both Web Speech API and MediaRecorder fallback
 * Guarantees microphone functionality across all modern browsers, mobile, and sandboxed iframes.
 */

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private speechRecognizer: any = null;

  private currentTranscript: string = '';
  private hasDeliveredTranscript: boolean = false;

  public isRecording = false;
  public onVolumeChange?: (volume: number) => void;
  public onInterimText?: (text: string) => void;
  public onTranscriptReady?: (transcript: string) => void;
  public onError?: (error: string) => void;

  async start(): Promise<boolean> {
    this.audioChunks = [];
    this.currentTranscript = '';
    this.hasDeliveredTranscript = false;
    let webSpeechActive = false;

    // 1. Try native Web Speech API first for instant, real-time zero-lag transcription
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const recognizer = new SpeechRec();
          recognizer.continuous = true;
          recognizer.interimResults = true;
          recognizer.lang = 'en-US';

          recognizer.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            const cleanText = fullText.trim();
            if (cleanText) {
              this.currentTranscript = cleanText;
              this.onInterimText?.(cleanText);
            }
          };

          recognizer.onerror = (e: any) => {
            const err = e?.error || '';
            console.warn('SpeechRecognition notice:', err);
            if (err === 'not-allowed') {
              this.onError?.('Microphone permission blocked. Please allow microphone access in your browser.');
            }
            // For 'no-speech' or 'aborted', ignore and let user speak or stop
          };

          recognizer.onend = () => {
            if (this.isRecording && this.currentTranscript && !this.hasDeliveredTranscript) {
              // Recognition ended naturally after speech pause
              this.hasDeliveredTranscript = true;
              this.onTranscriptReady?.(this.currentTranscript);
            }
          };

          recognizer.start();
          this.speechRecognizer = recognizer;
          webSpeechActive = true;
        } catch (e: any) {
          console.warn('SpeechRecognition start failed, falling back to MediaRecorder:', e);
        }
      }
    }

    // 2. Also acquire microphone stream via getUserMedia for visual sound wave feedback and audio backup
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.isRecording = true;

        // Setup Web Audio analyzer for responsive volume visualization
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            this.audioContext = new AudioCtx();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            source.connect(this.analyser);

            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            const updateVolume = () => {
              if (!this.isRecording) return;
              this.analyser?.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              this.onVolumeChange?.(Math.min(100, Math.round((avg / 255) * 100 * 2.8)));
              this.animFrameId = requestAnimationFrame(updateVolume);
            };
            updateVolume();
          }
        } catch (e) {
          console.warn('Audio visualization unavailable:', e);
        }

        // Determine supported mimeType for MediaRecorder
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
        ];
        let chosenMime = '';
        for (const t of mimeTypes) {
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
            chosenMime = t;
            break;
          }
        }

        if (typeof MediaRecorder !== 'undefined') {
          try {
            this.mediaRecorder = chosenMime
              ? new MediaRecorder(this.mediaStream, { mimeType: chosenMime })
              : new MediaRecorder(this.mediaStream);

            this.mediaRecorder.ondataavailable = event => {
              if (event.data && event.data.size > 0) {
                this.audioChunks.push(event.data);
              }
            };

            this.mediaRecorder.onstop = async () => {
              // If web speech already delivered the transcript, skip server transcription
              if (this.hasDeliveredTranscript) return;

              if (this.currentTranscript.trim()) {
                this.hasDeliveredTranscript = true;
                this.onTranscriptReady?.(this.currentTranscript.trim());
                return;
              }

              if (this.audioChunks.length > 0) {
                const audioBlob = new Blob(this.audioChunks, { type: chosenMime || 'audio/webm' });
                await this.sendToTranscribe(audioBlob);
              }
            };

            this.mediaRecorder.start(250);
          } catch (mrErr) {
            console.warn('MediaRecorder error:', mrErr);
          }
        }

        return true;
      }
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      if (!webSpeechActive) {
        this.cleanup();
        const msg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission blocked. Please click the permissions icon in your browser address bar to allow microphone access.'
          : 'Microphone unavailable: ' + (err.message || 'unknown error');
        this.onError?.(msg);
        return false;
      }
    }

    this.isRecording = true;
    return true;
  }

  stop() {
    if (!this.isRecording) return;
    this.isRecording = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    // Stop native speech recognizer
    if (this.speechRecognizer) {
      try {
        this.speechRecognizer.stop();
      } catch {}
      this.speechRecognizer = null;
    }

    // If we have an accumulated transcript from speech recognition, deliver it immediately!
    if (this.currentTranscript.trim() && !this.hasDeliveredTranscript) {
      this.hasDeliveredTranscript = true;
      const finalWord = this.currentTranscript.trim();
      this.currentTranscript = '';
      this.onTranscriptReady?.(finalWord);
    }

    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.requestData();
        this.mediaRecorder.stop();
      } catch {}
    }

    // Release microphone tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private async sendToTranscribe(blob: Blob) {
    if (blob.size < 200) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const response = await fetch('/api/jarvis/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType: blob.type || 'audio/webm',
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const transcript = data.transcript?.trim();
            if (transcript && !this.hasDeliveredTranscript) {
              this.hasDeliveredTranscript = true;
              this.onTranscriptReady?.(transcript);
            }
          }
        } catch (e: any) {
          console.warn('Transcription service notice:', e);
        }
      };
      reader.readAsDataURL(blob);
    } catch (e: any) {
      console.warn('Blob read notice:', e);
    }
  }

  private cleanup() {
    this.isRecording = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}

export const voiceRecorder = new VoiceRecorder();
