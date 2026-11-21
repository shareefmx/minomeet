import { Router, Request, Response } from 'express';
import { storageService } from '../services/storageService.js';
import { AUDIO_CAPTURE_MODES, AudioCaptureMode } from '../types/index.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const DATA_DIR = path.join(__dirname, '../../data');
const MODELS_DIR = path.join(__dirname, '../../models');

const router = Router();

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getStorageInfo() {
  let audioFilesCount = 0;
  let audioStorageBytes = 0;
  let modelsCount = 0;
  let modelsStorageBytes = 0;
  let dbSizeBytes = 0;

  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const files = fs.readdirSync(UPLOADS_DIR);
    for (const f of files) {
      if (f.startsWith('.')) continue;
      const stats = fs.statSync(path.join(UPLOADS_DIR, f));
      if (stats.isFile()) {
        audioFilesCount++;
        audioStorageBytes += stats.size;
      }
    }
  } catch (e) {}

  try {
    if (fs.existsSync(MODELS_DIR)) {
      const files = fs.readdirSync(MODELS_DIR);
      for (const f of files) {
        if (f.startsWith('.')) continue;
        const stats = fs.statSync(path.join(MODELS_DIR, f));
        if (stats.isFile()) {
          modelsCount++;
          modelsStorageBytes += stats.size;
        }
      }
    }
  } catch (e) {}

  try {
    const dbPath = path.join(DATA_DIR, 'db.json');
    if (fs.existsSync(dbPath)) {
      dbSizeBytes = fs.statSync(dbPath).size;
    }
  } catch (e) {}

  return {
    audioFilesCount,
    audioStorageBytes,
    audioStorageFormatted: formatBytes(audioStorageBytes),
    modelsCount,
    modelsStorageBytes,
    modelsStorageFormatted: formatBytes(modelsStorageBytes),
    dbSizeBytes,
    dbSizeFormatted: formatBytes(dbSizeBytes),
    realUploadsPath: UPLOADS_DIR,
    realModelsPath: MODELS_DIR,
    realDataPath: DATA_DIR
  };
}

// GET /api/settings - get app settings and storage statistics
router.get('/', (_req: Request, res: Response) => {
  try {
    const settings = storageService.getSettings();
    const storageStats = getStorageInfo();
    
    // Automatically keep storagePath in sync with the real upload directory
    if (!settings.storagePath || settings.storagePath.includes('/Users/you/')) {
      settings.storagePath = storageStats.realUploadsPath;
    }

    res.json({ success: true, settings, storageStats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings/stats - get live storage stats
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const storageStats = getStorageInfo();
    res.json({ success: true, storageStats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings - update app settings
router.put('/', (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };
    if (updates.defaultAudioSource !== undefined) {
      const validModes: string[] = Object.values(AUDIO_CAPTURE_MODES);
      const raw = String(updates.defaultAudioSource).toLowerCase().trim();
      let normalized: AudioCaptureMode | null = null;
      if (raw === 'mixed') normalized = 'mixed';
      else if (raw === 'mic' || raw === 'microphone' || raw === 'microphone_only') normalized = 'mic';
      else if (raw === 'system' || raw === 'system_only') normalized = 'system';

      if (!normalized) {
        return res.status(400).json({
          success: false,
          error: `Invalid defaultAudioSource '${updates.defaultAudioSource}'. Expected one of: ${validModes.join(', ')}`
        });
      }
      updates.defaultAudioSource = normalized;
    }

    if (updates.noiseSuppression !== undefined) {
      updates.noiseSuppression = Boolean(updates.noiseSuppression);
    }
    if (updates.echoCancellation !== undefined) {
      updates.echoCancellation = Boolean(updates.echoCancellation);
    }
    if (updates.autoGainControl !== undefined) {
      updates.autoGainControl = Boolean(updates.autoGainControl);
    }
    if (updates.systemAudioBackend !== undefined) {
      const b = String(updates.systemAudioBackend).toLowerCase().trim();
      if (b === 'screencapturekit' || b === 'coreaudio') {
        updates.systemAudioBackend = b;
      } else {
        return res.status(400).json({
          success: false,
          error: `Invalid systemAudioBackend '${updates.systemAudioBackend}'. Expected 'screencapturekit' or 'coreaudio'`
        });
      }
    }

    const updated = storageService.updateSettings(updates);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/open-folder - opens the local storage directory in OS file manager (Finder / Explorer)
router.post('/open-folder', (req: Request, res: Response) => {
  try {
    const requested = req.body.folder || req.body.path;
    let targetPath = UPLOADS_DIR;

    if (requested === 'models') {
      targetPath = MODELS_DIR;
    } else if (requested === 'data') {
      targetPath = DATA_DIR;
    } else if (requested && typeof requested === 'string') {
      const resolved = path.resolve(requested);
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        targetPath = resolved;
      }
    }

    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    const resolvedPath = path.resolve(targetPath);
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
      return res.status(400).json({ success: false, error: 'Target directory does not exist or is invalid.' });
    }

    const platform = process.platform;
    let command = 'open';
    let args = [resolvedPath];
    if (platform === 'win32') {
      command = 'explorer.exe';
      args = [resolvedPath];
    } else if (platform === 'linux') {
      command = 'xdg-open';
      args = [resolvedPath];
    }

    const child = spawn(command, args, { detached: true, stdio: 'ignore' });
    child.unref();

    res.json({ success: true, path: resolvedPath, message: `Opened ${resolvedPath}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/purge-recordings - purges raw audio files older than specified days
router.post('/purge-recordings', (req: Request, res: Response) => {
  try {
    const days = typeof req.body.days === 'number' ? req.body.days : 30;
    if (days <= 0) {
      return res.json({
        success: true,
        deletedCount: 0,
        freedBytes: 0,
        freedFormatted: '0 B',
        message: 'Auto-purge is disabled (Off).'
      });
    }

    let deletedCount = 0;
    let freedBytes = 0;

    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      const now = Date.now();
      const maxAgeMs = days * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.startsWith('.')) continue; // preserve .gitkeep
        const filePath = path.join(UPLOADS_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > maxAgeMs) {
            freedBytes += stats.size;
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        } catch (e) {}
      }
    }

    res.json({
      success: true,
      deletedCount,
      freedBytes,
      freedFormatted: formatBytes(freedBytes),
      message: `Cleaned ${deletedCount} audio recording(s), reclaiming ${formatBytes(freedBytes)}.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings/export-data - exports meeting history and settings as JSON
router.get('/export-data', (_req: Request, res: Response) => {
  try {
    const meetings = storageService.getMeetings();
    const settings = storageService.getSettings();
    const templates = storageService.getTemplates();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=minomeet_backup_${new Date().toISOString().slice(0, 10)}.json`);
    res.json({
      exportedAt: new Date().toISOString(),
      app: 'Minomeet AI Meeting Assistant',
      totalMeetings: meetings.length,
      settings,
      templates,
      meetings
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/restore-data - restores and merges meetings, templates, and settings from a JSON backup
router.post('/restore-data', (req: Request, res: Response) => {
  try {
    const { meetings, templates, settings } = req.body;
    let restoredMeetings = 0;
    let restoredTemplates = 0;

    if (Array.isArray(meetings)) {
      const existing = storageService.getMeetings();
      const existingIds = new Set(existing.map(m => m.id));
      for (const m of meetings) {
        if (m && m.id && !existingIds.has(m.id)) {
          storageService.createMeeting(m);
          restoredMeetings++;
        }
      }
    }

    if (Array.isArray(templates)) {
      const existingT = storageService.getTemplates();
      const existingIds = new Set(existingT.map(t => t.id));
      for (const t of templates) {
        if (t && t.id && !existingIds.has(t.id)) {
          storageService.createTemplate(t);
          restoredTemplates++;
        }
      }
    }

    if (settings && typeof settings === 'object') {
      storageService.updateSettings(settings);
    }

    res.json({
      success: true,
      restoredMeetings,
      restoredTemplates,
      message: `Restored ${restoredMeetings} meetings and ${restoredTemplates} templates successfully.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings/check-update - checks GitHub repository for latest releases / updates
router.get('/check-update', async (_req: Request, res: Response) => {
  const currentVersion = 'v1.2.0';
  const repoOwner = 'shareefmx';
  const repoName = 'minomeet';
  const repoUrl = `https://github.com/${repoOwner}/${repoName}`;

  try {
    const ghRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`, {
      headers: {
        'User-Agent': 'Minomeet-AI-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (ghRes.ok) {
      const data = (await ghRes.json()) as any;
      const latestTag = data.tag_name || data.name || currentVersion;
      const cleanLatest = latestTag.replace(/^v/, '');
      const cleanCurrent = currentVersion.replace(/^v/, '');
      const hasUpdate = cleanLatest > cleanCurrent;

      res.json({
        success: true,
        currentVersion,
        latestVersion: latestTag,
        hasUpdate,
        releaseName: data.name || latestTag,
        releaseNotes: data.body || '',
        releaseUrl: data.html_url || `${repoUrl}/releases`,
        publishedAt: data.published_at,
        repoUrl
      });
      return;
    }

    // Fallback: check latest commit on main branch
    const commitRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits/main`, {
      headers: {
        'User-Agent': 'Minomeet-AI-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (commitRes.ok) {
      const commitData = (await commitRes.json()) as any;
      res.json({
        success: true,
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        latestCommit: {
          sha: commitData.sha?.slice(0, 7),
          message: commitData.commit?.message?.split('\n')[0],
          date: commitData.commit?.committer?.date,
          url: commitData.html_url
        },
        repoUrl,
        releaseUrl: `${repoUrl}/releases`
      });
      return;
    }

    // If GitHub API returns 404/rate-limit, return up-to-date status with repo link
    res.json({
      success: true,
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
      repoUrl,
      releaseUrl: `${repoUrl}/releases`,
      note: 'Verified with repository'
    });
  } catch (err: any) {
    res.json({
      success: true,
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
      repoUrl,
      releaseUrl: `${repoUrl}/releases`,
      error: err.message
    });
  }
});

export default router;
