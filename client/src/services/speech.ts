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
  private recognition: any = null;
  private isSimulated = false;
  private simIndex = 0;
  private simInterval: any = null;
  private audioChunks: Blob[] = [];
  private activeSourceType: AudioSourceType = 'mic';

  public getIsSimulationActive(): boolean {
    return this.isSimulated;
  }

  public getActiveSourceType(): AudioSourceType {
    return this.activeSourceType;
  }

  public async startCapture(
    onTranscriptLine: (line: TranscriptLine) => void,
    sourceType: AudioSourceType = 'mic',
    onVolumeChange?: (volume: number) => void
  ): Promise<void> {
    this.audioChunks = [];
    this.simIndex = 0;
    this.activeSourceType = sourceType;

    // Check if browser supports Web Speech API
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    let streamObtained = false;
    try {
      if (sourceType === 'system' && navigator.mediaDevices.getDisplayMedia) {
        // System audio capture
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        const audioTracks = displayStream.getAudioTracks();
        if (audioTracks.length > 0) {
          this.audioStream = new MediaStream(audioTracks);
          streamObtained = true;
        } else {
          this.audioStream = displayStream;
          streamObtained = true;
        }
      } else if (sourceType === 'mixed' && navigator.mediaDevices.getUserMedia && navigator.mediaDevices.getDisplayMedia) {
        // Mixed Mic + System Audio
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const dest = audioCtx.createMediaStreamDestination();

          const micSource = audioCtx.createMediaStreamSource(micStream);
          micSource.connect(dest);

          if (displayStream.getAudioTracks().length > 0) {
            const sysSource = audioCtx.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));
            sysSource.connect(dest);
          }

          this.audioStream = dest.stream;
          streamObtained = true;
        } catch (e) {
          console.warn('Mixed audio capture fallback to mic:', e);
          this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamObtained = true;
        }
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Default Microphone
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamObtained = true;
      }

      if (this.audioStream && streamObtained) {
        this.mediaRecorder = new MediaRecorder(this.audioStream);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };
        this.mediaRecorder.start(1000);

        if (onVolumeChange) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(this.audioStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkVol = () => {
              if (!this.audioStream) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              onVolumeChange(Math.min(100, Math.round(avg * 1.5)));
              requestAnimationFrame(checkVol);
            };
            checkVol();
          } catch (e) {
            console.warn('Web Audio meter error:', e);
          }
        }
      }
    } catch (err) {
      console.warn('Microphone/System audio access not available or denied, running in high-fidelity simulation mode:', err);
    }

    if (SpeechRecognitionClass && streamObtained) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        let startTime = Date.now();

        this.recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript.trim();
          if (transcriptText) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const s = String(elapsed % 60).padStart(2, '0');

            onTranscriptLine({
              id: 'line-' + Date.now(),
              time: `${m}:${s}`,
              speaker: 'Speaker',
              text: transcriptText
            });
          }
        };

        this.recognition.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e.error);
          this.fallbackToSimulation(onTranscriptLine);
        };

        this.recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition start failed, switching to realistic simulation:', err);
      }
    }

    // Fallback or offline environment
    this.fallbackToSimulation(onTranscriptLine);
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
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (_) {}
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(t => t.stop());
      this.audioStream = null;
    }

    return this.audioChunks.length > 0 ? new Blob(this.audioChunks, { type: 'audio/webm' }) : null;
  }
}

export const speechService = new SpeechCaptureService();
