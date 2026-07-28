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

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 } // 150MB
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
    if (autoSummarize && transcript && transcript.length > 0) {
      summary = await aiService.generateMOM(
        transcript,
        template || 'Standard Meeting Notes',
        language || 'English',
        model || 'Nimbus 4B (High Quality)',
        undefined,
        meetingTitle
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

    // Transcribe audio
    const transcript = await audioService.transcribeAudioFile(originalName);

    const title = originalName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Imported Meeting Recording';
    const meetingId = 'meeting-' + uuidv4().slice(0, 8);

    let summary = undefined;
    if (autoSummarize) {
      summary = await aiService.generateMOM(transcript, 'Standard Meeting Notes', 'English', 'Nimbus 4B (High Quality)', undefined, title);
    }

    const meeting: Meeting = {
      id: meetingId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: '01:05',
      transcript,
      summary,
      audioPath: file ? file.path : undefined,
      tags: ['Imported', 'Audio']
    };

    const saved = storageService.createMeeting(meeting);
    res.status(201).json({ success: true, meeting: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

