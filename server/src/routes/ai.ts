import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { storageService } from '../services/storageService.js';
import { SummarizeRequest, AskQuestionRequest, FollowUpEmailRequest } from '../types/index.js';

const router = Router();

// POST /api/ai/summarize - generate or regenerate MOM summary
router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { transcript, title, template, language, model, customPrompt }: SummarizeRequest = req.body;

    if (!transcript || !Array.isArray(transcript)) {
      res.status(400).json({ success: false, error: 'Transcript lines array is required' });
      return;
    }

    const settings = storageService.getSettings();

    const summary = await aiService.generateMOM(
      transcript,
      template || settings.defaultTemplate || 'Standard Meeting Notes & MOM',
      language || settings.defaultLanguage || 'English',
      model || settings.selectedModel || 'Nimbus 4B (High Quality)',
      customPrompt,
      title
    );

    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/ask - "Ask Your Meetings" (Semantic Q&A)
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { query, meetingId }: AskQuestionRequest = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ success: false, error: 'Query string is required' });
      return;
    }

    const result = await aiService.askMeetings(query, meetingId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/follow-up-email - generate professional follow up email
router.post('/follow-up-email', async (req: Request, res: Response) => {
  try {
    const { meetingId, tone, recipientGroup }: FollowUpEmailRequest = req.body;

    if (!meetingId) {
      res.status(400).json({ success: false, error: 'Meeting ID is required' });
      return;
    }

    const email = await aiService.generateFollowUpEmail(meetingId, tone);
    res.json({ success: true, ...email });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/test-connection - test API key credentials, endpoint, and model access
router.post('/test-connection', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, baseUrl, model } = req.body;
    if (!provider) {
      res.status(400).json({ success: false, error: 'Provider is required' });
      return;
    }
    const result = await aiService.testConnection(provider, apiKey, baseUrl, model);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, status: 'error', message: err.message });
  }
});

// POST /api/ai/fetch-ollama-models - fetch locally installed models from Ollama daemon
router.post('/fetch-ollama-models', async (req: Request, res: Response) => {
  try {
    const { baseUrl } = req.body;
    const endpoint = (baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
    const fetchRes = await fetch(`${endpoint}/api/tags`);
    if (fetchRes.ok) {
      const data = (await fetchRes.json()) as any;
      const models: string[] = (data.models || []).map((m: any) => m.name || m.model);
      res.json({ success: true, models });
    } else {
      res.status(fetchRes.status).json({ success: false, error: `Ollama returned status ${fetchRes.status}` });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: `Could not connect to Ollama: ${err.message}` });
  }
});

export default router;

