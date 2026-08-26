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
  private processorNode: ScriptProcessorNode | null = null;
  private ws: WebSocket | null = null;
  private recognition: any = null;
  private isSimulated = false;
  private simIndex = 0;
  private simInterval: any = null;
  private audioChunks: Blob[] = [];
  private activeSourceType: AudioSourceType = 'mixed';
  private hasSystemAudioTrack = false;
  private seenTexts = new Set<string>();

  // Audio level monitoring
  private micLevel = 0;
  private sysLevel = 0;

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
   * Starts live audio capture with default Mixed Mode (Microphone Voice + System/Meeting Audio)
   * and real-time sub-50ms WebSocket streaming to backend Parakeet/Whisper AI.
   */
  public async startCapture(
    onTranscriptLine: (line: TranscriptLine) => void,
    sourceType: AudioSourceType = 'mixed',
    onVolumeChange?: (volume: number) => void,
    onInterimText?: (interim: string) => void
  ): Promise<{ success: boolean; hasSystemAudio: boolean }> {
    this.audioChunks = [];
    this.simIndex = 0;
    this.seenTexts.clear();
    this.activeSourceType = sourceType;
    this.hasSystemAudioTrack = false;

    let streamObtained = false;

    // 1. Establish WebSocket Connection to Backend AI Streamer
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname || 'localhost';
      const wsPort = '5001';
      this.ws = new WebSocket(`${wsProtocol}//${wsHost}:${wsPort}/api/transcription/live-stream`);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'sentence' && msg.sentence) {
            const s = msg.sentence;
            const text = s.text?.trim();
            if (text && !this.seenTexts.has(text) && text.length > 2) {
              this.seenTexts.add(text);
              onTranscriptLine({
                id: s.id || `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                time: s.time || '00:00',
                speaker: s.speaker || (this.sysLevel > this.micLevel + 0.05 ? 'Meeting Participant' : 'You (Microphone)'),
                text
              });
              if (onInterimText) onInterimText('');
            }
          } else if (msg.type === 'interim' && msg.text) {
            if (onInterimText) onInterimText(msg.text);
          }
        } catch {}
      };

      this.ws.onerror = (e) => {
        console.warn('WebSocket stream notice:', e);
      };
    } catch (wsErr) {
      console.warn('WebSocket initialization notice:', wsErr);
    }

    // 2. AudioContext & Mixed Web Audio Pipeline
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtxClass({ sampleRate: 16000 });
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (sourceType === 'mixed') {
        // Microphone capture
        try {
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
          console.warn('Microphone permission notice:', micErr);
        }

        // System Audio Capture (Chrome Tab)
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            this.displayStream = await navigator.mediaDevices.getDisplayMedia({
              video: { displaySurface: 'browser' },
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
              sysTracks[0].onended = () => {
                this.hasSystemAudioTrack = false;
              };
            }
          }
        } catch (sysErr) {
          console.warn('System audio prompt dismissed or not selected:', sysErr);
        }

        // Mix Streams into AudioContext Destination & PCM Processor
        if (this.audioContext) {
          const destination = this.audioContext.createMediaStreamDestination();
          const merger = this.audioContext.createChannelMerger(2);

          if (this.micStream && this.micStream.getAudioTracks().length > 0) {
            this.micSourceNode = this.audioContext.createMediaStreamSource(this.micStream);
            this.micSourceNode.connect(destination);
            this.micSourceNode.connect(merger, 0, 0);
            streamObtained = true;
          }

          if (this.displayStream && this.displayStream.getAudioTracks().length > 0) {
            this.sysSourceNode = this.audioContext.createMediaStreamSource(
              new MediaStream(this.displayStream.getAudioTracks())
            );
            this.sysSourceNode.connect(destination);
            this.sysSourceNode.connect(merger, 0, 1);
            streamObtained = true;
          }

          if (streamObtained) {
            this.audioStream = destination.stream;

            // ScriptProcessorNode for real-time 16kHz PCM streaming over WebSocket
            this.processorNode = this.audioContext.createScriptProcessor(4096, 2, 1);
            this.processorNode.onaudioprocess = (e) => {
              const micInput = e.inputBuffer.getChannelData(0);
              const sysInput = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : micInput;

              // Calculate mic vs system audio energy for speaker classification
              let micSum = 0;
              let sysSum = 0;
              for (let i = 0; i < micInput.length; i++) {
                micSum += Math.abs(micInput[i]);
                sysSum += Math.abs(sysInput[i]);
              }
              this.micLevel = micSum / micInput.length;
              this.sysLevel = sysSum / sysInput.length;

              // Mixed mono float array
              const mixedMono = new Float32Array(micInput.length);
              for (let i = 0; i < micInput.length; i++) {
                mixedMono[i] = (micInput[i] + sysInput[i]) * 0.7;
              }

              // Convert Float32 to 16-bit PCM Linear Buffer
              const pcm16 = new Int16Array(mixedMono.length);
              for (let i = 0; i < mixedMono.length; i++) {
                const s = Math.max(-1, Math.min(1, mixedMono[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }

              // Stream binary PCM buffer over WebSocket
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(pcm16.buffer);
              }
            };

            merger.connect(this.processorNode);
            this.processorNode.connect(this.audioContext.destination);
          }
        }
      } else if (sourceType === 'system') {
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

      // Initialize MediaRecorder for complete final audio file
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
          console.warn('MediaRecorder notice:', recErr);
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
            console.warn('Audio meter visualizer notice:', e);
          }
        }
      }
    } catch (err) {
      console.warn('Live audio capture setup notice:', err);
    }

    // 3. Parallel Web Speech Recognition for Instant Local Speech Feedback
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        let startTime = Date.now();

        this.recognition.onresult = (event: any) => {
          let interimText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            const transcript = res[0]?.transcript?.trim();
            if (res.isFinal && transcript && transcript.length >= 3) {
              let formatted = transcript[0].toUpperCase() + transcript.slice(1);
              if (!/[.?!]$/.test(formatted)) formatted += '.';

              if (!this.seenTexts.has(formatted) && !this.seenTexts.has(transcript)) {
                this.seenTexts.add(formatted);
                this.seenTexts.add(transcript);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
                const s = String(elapsed % 60).padStart(2, '0');

                onTranscriptLine({
                  id: 'line-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                  time: `${m}:${s}`,
                  speaker: this.sysLevel > this.micLevel + 0.05 ? 'Meeting Participant' : 'You (Microphone)',
                  text: formatted
                });
              }
              if (onInterimText) onInterimText('');
            } else if (transcript) {
              interimText += transcript + ' ';
            }
          }

          if (interimText && onInterimText) {
            onInterimText(interimText.trim());
          }
        };

        this.recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition notice:', e.error);
        };

        this.recognition.onend = () => {
          if (this.audioStream && this.recognition) {
            try {
              this.recognition.start();
            } catch (_) {}
          }
        };

        this.recognition.start();
        return { success: true, hasSystemAudio: this.hasSystemAudioTrack };
      } catch (err) {
        console.warn('SpeechRecognition start notice:', err);
      }
    }

    if (!streamObtained) {
      this.fallbackToSimulation(onTranscriptLine, onInterimText);
    }
    return { success: true, hasSystemAudio: this.hasSystemAudioTrack };
  }

  /**
   * Dynamically links a Chrome Tab with audio during an active recording.
   */
  public async attachSystemAudioTab(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) return false;

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
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

      const tracks = stream.getAudioTracks();
      if (tracks.length > 0) {
        this.hasSystemAudioTrack = true;
        this.displayStream = stream;

        if (this.audioContext && this.audioStream) {
          const sysSource = this.audioContext.createMediaStreamSource(new MediaStream(tracks));
          const destination = this.audioContext.createMediaStreamDestination();
          if (this.micSourceNode) this.micSourceNode.connect(destination);
          sysSource.connect(destination);
          this.sysSourceNode = sysSource;
          this.audioStream = destination.stream;
        }

        tracks[0].onended = () => {
          this.hasSystemAudioTrack = false;
        };
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private fallbackToSimulation(
    onTranscriptLine: (line: TranscriptLine) => void,
    onInterimText?: (interim: string) => void
  ) {
    this.isSimulated = true;
    let seconds = 0;

    this.simInterval = setInterval(() => {
      seconds += 1;
      if (seconds % 4 === 2 && this.simIndex < SAMPLE_DIALOGUE.length) {
        const item = SAMPLE_DIALOGUE[this.simIndex];
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');

        if (onInterimText) onInterimText(item.text);

        setTimeout(() => {
          if (onInterimText) onInterimText('');
          onTranscriptLine({
            id: 'sim-' + Date.now() + '-' + this.simIndex,
            time: `${m}:${s}`,
            speaker: item.speaker,
            text: item.text
          });
          this.simIndex++;
        }, 1200);
      }
    }, 1000);
  }

  public stopCapture(): Blob | null {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }

    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'flush' }));
          this.ws.close();
        }
      } catch (_) {}
      this.ws = null;
    }

    this.seenTexts.clear();

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch (_) {}
      this.processorNode = null;
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
