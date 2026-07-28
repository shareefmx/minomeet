import { Router, Request, Response } from 'express';
import { storageService } from '../services/storageService.js';

const router = Router();

// GET /api/settings - get app settings
router.get('/', (_req: Request, res: Response) => {
  try {
    const settings = storageService.getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings - update app settings
router.put('/', (req: Request, res: Response) => {
  try {
    const updated = storageService.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

