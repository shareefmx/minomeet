import { Router, Request, Response } from 'express';
import { storageService } from '../services/storageService.js';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

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

// POST /api/settings/open-folder - opens the local storage directory in OS file manager (Finder / Explorer)
router.post('/open-folder', (req: Request, res: Response) => {
  try {
    const customPath = req.body.path;
    let targetPath = UPLOADS_DIR;

    if (customPath && typeof customPath === 'string' && fs.existsSync(customPath)) {
      targetPath = customPath;
    } else {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      targetPath = UPLOADS_DIR;
    }

    const platform = process.platform;
    let cmd = `open "${targetPath}"`;
    if (platform === 'win32') {
      cmd = `explorer.exe "${targetPath}"`;
    } else if (platform === 'linux') {
      cmd = `xdg-open "${targetPath}"`;
    }

    exec(cmd, (err) => {
      if (err) {
        console.warn('System folder open command warning:', err.message);
      }
    });

    res.json({ success: true, path: targetPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/purge-recordings - purges audio files older than specified days
router.post('/purge-recordings', (req: Request, res: Response) => {
  try {
    const days = typeof req.body.days === 'number' ? req.body.days : 30;
    let deletedCount = 0;

    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      const now = Date.now();
      const maxAgeMs = days * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.startsWith('.')) continue; // protect .gitkeep
        const filePath = path.join(UPLOADS_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          if (days === 0 || (now - stats.mtimeMs > maxAgeMs)) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        } catch (e) {}
      }
    }

    res.json({ success: true, deletedCount, message: `Purged ${deletedCount} recording(s) older than ${days} days.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

