import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storageService.js';
import { audioService } from '../services/audioService.js';
import { aiService } from '../services/aiService.js';
import { Meeting } from '../types/index.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac', '.aac', '.m4p', '.wma', '.opus']);
const ALLOWED_VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.mkv', '.avi', '.flv', '.wmv', '.m4v', '.3gp', '.ts', '.mpeg', '.mpg']);
const ALL_MEDIA_EXTENSIONS = new Set([...ALLOWED_AUDIO_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALL_MEDIA_EXTENSIONS.has(ext) ? ext : '.mp3';
    const safeFilename = `${Date.now()}-${uuidv4().slice(0, 12)}${safeExt}`;
    cb(null, safeFilename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ALL_MEDIA_EXTENSIONS.has(ext) ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: Please upload supported audio (${Array.from(ALLOWED_AUDIO_EXTENSIONS).join(', ')}) or video (${Array.from(ALLOWED_VIDEO_EXTENSIONS).join(', ')}) files.`));
    }
  }
});

// GET /api/meetings - list all meetings
router.get('/', (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string || '').toLowerCase().trim();
    let meetings = storageService.getMeetings();

    if (search) {
      meetings = meetings.filter(m => {
        const titleMatch = m.title.toLowerCase().includes(search);
        const summaryMatch = m.summary?.summary.toLowerCase().includes(search);
        const transcriptMatch = m.transcript.some(t => t.text.toLowerCase().includes(search) || t.speaker?.toLowerCase().includes(search));
        const tagsMatch = m.tags?.some(tag => tag.toLowerCase().includes(search));
        return titleMatch || summaryMatch || transcriptMatch || tagsMatch;
      });
    }

    res.json({ success: true, meetings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/meetings/:id - get single meeting
router.get('/:id', (req: Request, res: Response) => {
  try {
    const meeting = storageService.getMeetingById(req.params.id as string);
    if (!meeting) {
      res.status(404).json({ success: false, error: 'Meeting not found' });
      return;
    }
    res.json({ success: true, meeting });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/meetings - create a new meeting
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, transcript, duration, tags, autoSummarize, template, language, model } = req.body;

    const meetingId = 'meeting-' + uuidv4().slice(0, 8);
    const meetingTitle = title || `Meeting ${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 5).replace(':', '-')}`;

    let summary = undefined;
    const settings = storageService.getSettings();
    if (autoSummarize && transcript && transcript.length > 0) {
      summary = await aiService.generateMOM(
        transcript,
        template || settings.defaultTemplate || 'Standard Meeting Notes & MOM',
        language || settings.defaultLanguage || 'English',
        undefined,
        undefined,
        meetingTitle,
        'mom_synthesis'
      );
    }

    const newMeeting: Meeting = {
      id: meetingId,
      title: meetingTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: duration || '00:00',
      transcript: transcript || [],
      summary,
      tags: tags || ['General']
    };

    const saved = storageService.createMeeting(newMeeting);
    res.status(201).json({ success: true, meeting: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/meetings/:id - update meeting
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = storageService.updateMeeting(req.params.id as string, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Meeting not found' });
      return;
    }
    res.json({ success: true, meeting: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/meetings/:id - delete meeting
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = storageService.deleteMeeting(req.params.id as string);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Meeting not found' });
      return;
    }
    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/meetings/import - import audio file & auto-transcribe
router.post('/import', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const originalName = file ? file.originalname : (req.body.fileName || 'imported_audio.mp3');
    const autoSummarize = req.body.autoSummarize === 'true' || req.body.autoSummarize === true;
    const transcriptionModel = (req.body.transcriptionModel || req.body.model) as string | undefined;
    const language = req.body.language as string | undefined;
    const template = req.body.template as string | undefined;
    const clientDuration = req.body.duration as string | undefined;

    const isVideo = file ? (ALLOWED_VIDEO_EXTENSIONS.has(path.extname(file.originalname).toLowerCase()) || file.mimetype.startsWith('video/')) : false;

    // Transcribe audio using local Whisper / Parakeet model (extracts audio track from video if needed)
    const transcribeResult = await audioService.transcribeAudioFile(
      file ? file.path : undefined,
      originalName,
      transcriptionModel,
      language,
      clientDuration
    );

    const transcript = transcribeResult.segments;
    const realDuration = clientDuration && clientDuration !== '00:00'
      ? clientDuration
      : (transcribeResult.duration || '00:45');

    const title = originalName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Imported Meeting Recording';
    const meetingId = 'meeting-' + uuidv4().slice(0, 8);

    let summary = undefined;
    const importSettings = storageService.getSettings();
    if (autoSummarize) {
      summary = await aiService.generateMOM(
        transcript,
        template || importSettings.defaultTemplate || 'Standard Meeting Notes & MOM',
        language || importSettings.defaultLanguage || 'English',
        undefined, // Explicitly undefined so resolveModel resolves the proper LLM for mom_synthesis
        undefined,
        title,
        'mom_synthesis'
      );
    }

    const meeting: Meeting = {
      id: meetingId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: realDuration,
      transcript,
      summary,
      audioPath: file ? file.path : undefined,
      tags: isVideo ? ['Imported', 'Video'] : ['Imported', 'Audio']
    };

    const saved = storageService.createMeeting(meeting);
    res.status(201).json({ success: true, meeting: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

