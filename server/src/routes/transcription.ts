import { Router, Request, Response } from 'express';
import { transcriptionModelService } from '../services/transcriptionModelService.js';

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

export default router;
