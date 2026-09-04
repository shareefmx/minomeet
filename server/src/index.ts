import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import meetingsRouter from './routes/meetings.js';
import aiRouter from './routes/ai.js';
import settingsRouter from './routes/settings.js';
import transcriptionRouter from './routes/transcription.js';
import { templatesRouter } from './routes/templates.js';
import { liveStreamService } from './services/liveStreamService.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure essential local directories exist on startup
const DATA_DIR = path.join(__dirname, '../data');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const MODELS_DIR = path.join(__dirname, '../models');

for (const dir of [DATA_DIR, UPLOADS_DIR, MODELS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const app = express();
const PORT = process.env.PORT || 5001;

// Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads folder with security restrictions
app.use('/uploads', express.static(UPLOADS_DIR, {
  dotfiles: 'ignore',
  maxAge: '1d'
}));

// Resolve client production build directory if available
const CLIENT_DIST_DIR = path.resolve(__dirname, '../../client/dist');
const CLIENT_DIST_ALT = path.resolve(__dirname, '../client/dist');
const resolvedClientDist = fs.existsSync(CLIENT_DIST_DIR) 
  ? CLIENT_DIST_DIR 
  : (fs.existsSync(CLIENT_DIST_ALT) ? CLIENT_DIST_ALT : null);

if (resolvedClientDist) {
  app.use(express.static(resolvedClientDist));
}

// Routes
app.use('/api/meetings', meetingsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/transcription', transcriptionRouter);
app.use('/api/templates', templatesRouter);

// Root endpoint / SPA fallback
app.get('/', (req, res, next) => {
  if (resolvedClientDist && fs.existsSync(path.join(resolvedClientDist, 'index.html'))) {
    return res.sendFile(path.join(resolvedClientDist, 'index.html'));
  }
  if (req.accepts('html')) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minomeet AI — Backend API Server</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(22, 27, 34, 0.85);
      --border: #30363d;
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --text: #f0f6fc;
      --text-muted: #8b949e;
      --green: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 36px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      backdrop-filter: blur(12px);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 16px var(--accent-glow);
    }
    h1 { font-size: 22px; font-weight: 700; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
    p {
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .endpoints {
      background: rgba(13, 17, 23, 0.7);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .endpoint-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    .endpoint-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .endpoint-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .endpoint-item a {
      color: #818cf8;
      text-decoration: none;
      font-family: monospace;
      background: rgba(99, 102, 241, 0.1);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(99, 102, 241, 0.2);
      transition: all 0.2s;
    }
    .endpoint-item a:hover {
      background: rgba(99, 102, 241, 0.25);
      border-color: #818cf8;
    }
    .btn {
      display: block;
      width: 100%;
      text-align: center;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 16px var(--accent-glow);
      transition: transform 0.15s, opacity 0.15s;
    }
    .btn:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">⚡</div>
      <div>
        <h1>Minomeet Backend API</h1>
        <div style="color: var(--text-muted); font-size: 13px;">AI-Powered Minutes of Meeting Assistant</div>
      </div>
    </div>

    <div class="status-badge">
      <div class="dot"></div>
      Server Online & Healthy
    </div>

    <p>
      The Minomeet AI Backend Server is running successfully. You can access the web application or browse the API endpoints below.
    </p>

    <div class="endpoints">
      <div class="endpoint-title">Available API Routes</div>
      <ul class="endpoint-list">
        <li class="endpoint-item">
          <span>Health Check</span>
          <a href="/api/health" target="_blank">GET /api/health</a>
        </li>
        <li class="endpoint-item">
          <span>Meetings List & CRUD</span>
          <a href="/api/meetings" target="_blank">GET /api/meetings</a>
        </li>
        <li class="endpoint-item">
          <span>Application Settings</span>
          <a href="/api/settings" target="_blank">GET /api/settings</a>
        </li>
        <li class="endpoint-item">
          <span>AI Summarization</span>
          <span style="font-family: monospace; color: var(--text-muted); font-size: 12px;">POST /api/ai/summarize</span>
        </li>
        <li class="endpoint-item">
          <span>Ask Meetings (Q&A)</span>
          <span style="font-family: monospace; color: var(--text-muted); font-size: 12px;">POST /api/ai/ask</span>
        </li>
      </ul>
    </div>

    <a href="http://localhost:5173" class="btn">Open Minomeet Web App (Port 5173) &rarr;</a>
  </div>
</body>
</html>`);
    return;
  }

  res.json({
    status: 'online',
    app: 'Minomeet AI Backend',
    message: 'Minomeet AI Backend Server is running.',
    version: '1.2.0',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      meetings: '/api/meetings',
      settings: '/api/settings',
      aiSummarize: 'POST /api/ai/summarize',
      aiAsk: 'POST /api/ai/ask',
      aiFollowUpEmail: 'POST /api/ai/follow-up-email'
    }
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'Minomeet AI Backend',
    version: '1.2.2',
    timestamp: new Date().toISOString()
  });
});

// 404 / SPA Route fallback
app.use((req, res) => {
  if (req.method === 'GET' && resolvedClientDist && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    const indexPath = path.join(resolvedClientDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Minomeet AI Server running on http://localhost:${PORT}`);
  liveStreamService.initialize(server);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Free the port with 'lsof -ti :${PORT} | xargs kill -9' or 'npx kill-port ${PORT}'.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

export default app;

