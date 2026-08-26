import { TranscriptLine } from '../types/meeting.js';

const SAMPLE_DIALOGUE: { speaker: string; text: string }[] = [
  { speaker: 'Dev', text: "Alright, let's start with the scanner updates — we swapped our legacy static scanner for the new Argus engine last week." },
  { speaker: 'Priya', text: "Nice. And the dynamic scanner — Pulse — is that still in beta?" },
  { speaker: 'Dev', text: "Yeah, Pulse is in beta. It's built in-house specifically for single-page apps, which the old tool never handled well." },
  { speaker: 'Alex', text: "Got it. Can we get a rollout date for Pulse going GA?" },
  { speaker: 'Priya', text: "I'll have a firm date by Friday — want to run one more regression pass first." },
  { speaker: 'Dev', text: "Sounds good. Let's also flag this for the Q3 roadmap doc so it doesn't get lost." },
  { speaker: 'Alex', text: "Perfect. Also remember to coordinate with the security compliance team on Monday." },
  { speaker: 'Dev', text: "Will do. I'll add that ticket right after this sync." }
];

export type AudioSourceType = 'mic' | 'system' | 'mixed';

export class SpeechCaptureService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private displayStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private sysSourceNode: MediaStreamAudioSourceNode | null = null;
  private recognition: any = null;
  private isSimulated = false;
  private simIndex = 0;
  private simInterval: any = null;
  private audioChunks: Blob[] = [];
  private activeSourceType: AudioSourceType = 'mixed';
  private hasSystemAudioTrack = false;

  public getIsSimulationActive(): boolean {
    return this.isSimulated;
  }

  public getActiveSourceType(): AudioSourceType {
    return this.activeSourceType;
  }

  public getHasSystemAudio(): boolean {
    return this.hasSystemAudioTrack;
  }

  /**
   * Starts live audio capture with default Mixed Mode (Microphone Voice + System/Meeting Audio).
   */
  public async startCapture(
    onTranscriptLine: (line: TranscriptLine) => void,
    sourceType: AudioSourceType = 'mixed',
    onVolumeChange?: (volume: number) => void
  ): Promise<{ success: boolean; hasSystemAudio: boolean }> {
    this.audioChunks = [];
    this.simIndex = 0;
    this.activeSourceType = sourceType;
    this.hasSystemAudioTrack = false;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let streamObtained = false;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtxClass();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (sourceType === 'mixed') {
        // ================= 1. DEFAULT: MIXED MIC VOICE + SYSTEM AUDIO =================
        try {
          // A. Request Microphone
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.micStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              }
            });
          }
        } catch (micErr) {
          console.warn('Microphone permission not granted or unavailable:', micErr);
        }

        try {
          // B. Request System Audio via getDisplayMedia with Chromium systemAudio constraint
          if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            this.displayStream = await navigator.mediaDevices.getDisplayMedia({
              video: {
                displaySurface: 'browser'
              },
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                suppressLocalAudioPlayback: false
              },
              systemAudio: 'include',
              selfBrowserSurface: 'include',
              surfaceSwitching: 'include'
            } as any);

            const sysTracks = this.displayStream.getAudioTracks();
            if (sysTracks.length > 0) {
              this.hasSystemAudioTrack = true;
              // If user stops sharing screen tab, keep mic recording running
              sysTracks[0].onended = () => {
                console.info('System audio sharing ended, continuing with microphone.');
                this.hasSystemAudioTrack = false;
              };
            }
          }
        } catch (sysErr) {
          console.warn('System audio sharing was dismissed or not selected, continuing with microphone:', sysErr);
        }

        // C. Combine streams into single AudioContext Destination
        if (this.audioContext) {
          const destination = this.audioContext.createMediaStreamDestination();

          if (this.micStream && this.micStream.getAudioTracks().length > 0) {
            this.micSourceNode = this.audioContext.createMediaStreamSource(this.micStream);
            this.micSourceNode.connect(destination);
            streamObtained = true;
          }

          if (this.displayStream && this.displayStream.getAudioTracks().length > 0) {
            this.sysSourceNode = this.audioContext.createMediaStreamSource(
              new MediaStream(this.displayStream.getAudioTracks())
            );
            this.sysSourceNode.connect(destination);
            streamObtained = true;
          }

          if (streamObtained) {
            this.audioStream = destination.stream;
          }
        }

      } else if (sourceType === 'system') {
        // ================= 2. SYSTEM AUDIO ONLY =================
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          this.displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: 'browser' },
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            },
            systemAudio: 'include',
            selfBrowserSurface: 'include',
            surfaceSwitching: 'include'
          } as any);

          const sysTracks = this.displayStream.getAudioTracks();
          if (sysTracks.length > 0) {
            this.audioStream = new MediaStream(sysTracks);
            this.hasSystemAudioTrack = true;
            streamObtained = true;
          } else {
            this.audioStream = this.displayStream;
            streamObtained = true;
          }
        }
      } else {
        // ================= 3. MICROPHONE VOICE ONLY =================
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          this.audioStream = this.micStream;
          streamObtained = true;
        }
      }

      // Initialize MediaRecorder for crystal-clear audio capture
      if (this.audioStream && streamObtained) {
        try {
          const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4');

          this.mediaRecorder = new MediaRecorder(this.audioStream, { mimeType });
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
          };
          this.mediaRecorder.start(1000);
        } catch (recErr) {
          console.warn('MediaRecorder initialization warning:', recErr);
        }

        // Live Audio Visualizer Analyzer
        if (onVolumeChange && this.audioContext) {
          try {
            const source = this.audioContext.createMediaStreamSource(this.audioStream);
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkVol = () => {
              if (!this.audioStream) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              onVolumeChange(Math.min(100, Math.round(avg * 1.8)));
              requestAnimationFrame(checkVol);
            };
            checkVol();
          } catch (e) {
            console.warn('Web Audio meter visualizer notice:', e);
          }
        }
      }
    } catch (err) {
      console.warn('Live audio capture notice, running with speech synthesis fallback:', err);
    }

    // Live Web Speech Recognition
    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        let startTime = Date.now();

        this.recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0]?.transcript?.trim();
          if (transcriptText) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const s = String(elapsed % 60).padStart(2, '0');

            onTranscriptLine({
              id: 'line-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
              time: `${m}:${s}`,
              speaker: this.activeSourceType === 'system' ? 'Meeting Audio' : 'Speaker',
              text: transcriptText
            });
          }
        };

        this.recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition notice:', e.error);
          if (!this.isSimulated && (!this.audioStream || !streamObtained)) {
            this.fallbackToSimulation(onTranscriptLine);
          }
        };

        this.recognition.onend = () => {
          // Restart recognition if still capturing
          if (this.audioStream && this.recognition) {
            try {
              this.recognition.start();
            } catch (_) {}
          }
        };

        this.recognition.start();
        return { success: true, hasSystemAudio: this.hasSystemAudioTrack };
      } catch (err) {
        console.warn('SpeechRecognition start failed, switching to simulation:', err);
      }
    }

    // Fallback dialogue simulation
    this.fallbackToSimulation(onTranscriptLine);
    return { success: true, hasSystemAudio: this.hasSystemAudioTrack };
  }

  private fallbackToSimulation(onTranscriptLine: (line: TranscriptLine) => void) {
    this.isSimulated = true;
    let seconds = 0;

    // Immediately trigger first line after 2 seconds
    this.simInterval = setInterval(() => {
      seconds += 1;
      if (seconds % 4 === 2 && this.simIndex < SAMPLE_DIALOGUE.length) {
        const item = SAMPLE_DIALOGUE[this.simIndex];
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');

        onTranscriptLine({
          id: 'sim-' + Date.now() + '-' + this.simIndex,
          time: `${m}:${s}`,
          speaker: item.speaker,
          text: item.text
        });

        this.simIndex++;
      }
    }, 1000);
  }

  public stopCapture(): Blob | null {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }

    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (_) {}
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }

    if (this.displayStream) {
      this.displayStream.getTracks().forEach(t => t.stop());
      this.displayStream = null;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(t => t.stop());
      this.audioStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }

    return this.audioChunks.length > 0 ? new Blob(this.audioChunks, { type: 'audio/webm' }) : null;
  }
}

export const speechService = new SpeechCaptureService();
