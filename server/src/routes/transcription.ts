import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { transcriptionModelService } from '../services/transcriptionModelService.js';
import { audioService } from '../services/audioService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const upload = multer({ dest: UPLOADS_DIR });
const router = Router();

// GET /api/transcription/models - list all transcription models
router.get('/models', (_req: Request, res: Response) => {
  try {
    const models = transcriptionModelService.getModels();
    const activeModel = transcriptionModelService.getActiveModel();
    res.json({ success: true, models, activeModel });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/transcription/models/:id/download - download model weights
router.post('/models/:id/download', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const model = await transcriptionModelService.startDownload(id);
    res.json({ success: true, model });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/transcription/models/:id - delete/offload model weights
router.delete('/models/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = transcriptionModelService.deleteModel(id);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/transcription/models/:id/select - set model as active
router.post('/models/:id/select', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const activeModel = transcriptionModelService.setActiveModel(id);
    res.json({ success: true, activeModel });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/transcription/status - get python environment and engine status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await transcriptionModelService.getEngineStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/transcription/install-packages - install whisper & torch
router.post('/install-packages', async (_req: Request, res: Response) => {
  try {
    const result = await transcriptionModelService.installPackages();
    res.json({ ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, output: err.message });
  }
});

// POST /api/transcription/live-chunk - transcribes short live chunk from system audio / Google Meet / Zoom
router.post('/live-chunk', upload.single('audio'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    res.json({ success: true, segments: [] });
    return;
  }

  try {
    const offsetSeconds = req.body.offsetSeconds ? parseFloat(req.body.offsetSeconds) : 0;
    const model = req.body.model as string | undefined;
    const language = req.body.language as string | undefined;

    const segments = await audioService.transcribeLiveChunk(
      file.path,
      model,
      language,
      offsetSeconds
    );

    // Clean up temporary chunk file
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch {}

    res.json({ success: true, segments });
  } catch (err: any) {
    try {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch {}
    res.status(500).json({ success: false, error: err.message, segments: [] });
  }
});

export default router;

