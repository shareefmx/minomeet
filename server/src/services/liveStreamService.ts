import { WebSocketServer, WebSocket } from 'ws';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Server } from 'http';
import { transcriptionModelService } from './transcriptionModelService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPTS_DIR = path.join(__dirname, '../../scripts');
const MODELS_DIR = path.join(__dirname, '../../models');

interface ClientSession {
  ws: WebSocket;
  buffer: Buffer[];
  bufferBytes: number;
  offsetSeconds: number;
  lastSpeaker: string;
  isProcessing: boolean;
  silenceCount: number;
  lastSentence: string;
}

export class LiveStreamService {
  private wss: WebSocketServer | null = null;
  private workerProcess: ChildProcess | null = null;
  private pendingRequests = new Map<string, (res: any) => void>();
  private reqCounter = 0;
  private isWorkerReady = false;

  constructor() {
    this.spawnWorker();
  }

  private spawnWorker() {
    try {
      const activeModel = transcriptionModelService.getActiveModel()?.id || 'turbo';
      const workerScript = path.join(SCRIPTS_DIR, 'stream_worker.py');

      if (!fs.existsSync(workerScript)) return;

      this.workerProcess = spawn('python3', [workerScript, activeModel, MODELS_DIR], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.workerProcess.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.status === 'ready') {
              this.isWorkerReady = true;
              console.log(`⚡ High-Accuracy Sentence Transcriber Ready (Device: ${parsed.device})`);
            } else if (parsed.id && this.pendingRequests.has(parsed.id)) {
              const cb = this.pendingRequests.get(parsed.id);
              this.pendingRequests.delete(parsed.id);
              if (cb) cb(parsed);
            }
          } catch {}
        }
      });

      this.workerProcess.stderr?.on('data', (err) => {
        const str = err.toString();
        if (str.includes('[StreamWorker]')) {
          console.log(str.trim());
        }
      });

      this.workerProcess.on('close', () => {
        this.isWorkerReady = false;
        this.workerProcess = null;
      });
    } catch (e) {
      console.warn('Persistent stream worker notice:', e);
    }
  }

  public async transcribePcmBuffer(
    pcmBuffer: Buffer,
    offsetSeconds: number = 0,
    language?: string
  ): Promise<any[]> {
    if (!pcmBuffer || pcmBuffer.length < 6400) return [];

    if (this.workerProcess && this.workerProcess.stdin?.writable) {
      const reqId = `req-${++this.reqCounter}-${Date.now()}`;
      const payload = JSON.stringify({
        action: 'transcribe_base64',
        id: reqId,
        pcm_base64: pcmBuffer.toString('base64'),
        offset_seconds: offsetSeconds,
        language
      }) + '\n';

      return new Promise<any[]>((resolve) => {
        const timer = setTimeout(() => {
          this.pendingRequests.delete(reqId);
          resolve([]);
        }, 4000);

        this.pendingRequests.set(reqId, (res) => {
          clearTimeout(timer);
          resolve(res.segments || []);
        });

        try {
          this.workerProcess?.stdin?.write(payload);
        } catch {
          this.pendingRequests.delete(reqId);
          resolve([]);
        }
      });
    }
    return [];
  }

  public initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/api/transcription/live-stream' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🎙️ Real-Time High-Accuracy Live Stream connected.');

      const session: ClientSession = {
        ws,
        buffer: [],
        bufferBytes: 0,
        offsetSeconds: 0,
        lastSpeaker: 'Speaker',
        isProcessing: false,
        silenceCount: 0,
        lastSentence: ''
      };

      ws.on('message', async (data: any, isBinary: boolean) => {
        if (isBinary) {
          const chunk = Buffer.from(data);
          session.buffer.push(chunk);
          session.bufferBytes += chunk.length;

          // 16kHz 16-bit mono = 32,000 bytes/sec
          // Accumulate ~3.0s to 4.0s of continuous natural sentence audio (96,000 to 128,000 bytes)
          if (session.bufferBytes >= 96000 && !session.isProcessing) {
            session.isProcessing = true;
            const fullPcm = Buffer.concat(session.buffer);
            const currentOffset = session.offsetSeconds;
            session.offsetSeconds += fullPcm.length / 32000;
            session.buffer = [];
            session.bufferBytes = 0;

            try {
              const segments = await this.transcribePcmBuffer(fullPcm, currentOffset);
              if (segments && segments.length > 0) {
                const seg = segments[0];
                const text = seg.text?.trim();

                // Ensure it's a complete sentence and not a duplicate
                if (text && text !== session.lastSentence && text.length > 3) {
                  session.lastSentence = text;
                  const enriched = {
                    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    time: seg.time || '00:00',
                    speaker: session.lastSpeaker || 'Speaker',
                    text
                  };

                  ws.send(JSON.stringify({
                    type: 'sentence',
                    sentence: enriched
                  }));
                }
              }
            } catch (err) {
              console.warn('Live sentence transcribe error:', err);
            } finally {
              session.isProcessing = false;
            }
          }
        } else {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'metadata') {
              if (msg.speaker) session.lastSpeaker = msg.speaker;
              if (msg.offset !== undefined) session.offsetSeconds = msg.offset;
            } else if (msg.type === 'flush') {
              if (session.bufferBytes > 8000 && !session.isProcessing) {
                session.isProcessing = true;
                const fullPcm = Buffer.concat(session.buffer);
                session.buffer = [];
                session.bufferBytes = 0;
                const segments = await this.transcribePcmBuffer(fullPcm, session.offsetSeconds);
                if (segments.length > 0 && segments[0].text !== session.lastSentence) {
                  ws.send(JSON.stringify({
                    type: 'sentence',
                    sentence: {
                      id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      time: segments[0].time || '00:00',
                      speaker: session.lastSpeaker || 'Speaker',
                      text: segments[0].text
                    }
                  }));
                }
                session.isProcessing = false;
              }
            }
          } catch {}
        }
      });

      ws.on('close', () => {
        session.buffer = [];
        session.bufferBytes = 0;
      });

      ws.send(JSON.stringify({
        type: 'ready',
        message: 'High-Accuracy Sentence-Level Engine Ready'
      }));
    });
  }
}

export const liveStreamService = new LiveStreamService();
