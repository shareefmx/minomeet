import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { storageService } from '../services/storageService.js';
import { SummarizeRequest, AskQuestionRequest, FollowUpEmailRequest } from '../types/index.js';

const router = Router();

// POST /api/ai/summarize - generate or regenerate MOM summary
router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { transcript, title, template, language, model, customPrompt, agentId }: SummarizeRequest = req.body;

    if (!transcript || !Array.isArray(transcript)) {
      res.status(400).json({ success: false, error: 'Transcript lines array is required' });
      return;
    }

    const settings = storageService.getSettings();

    const summary = await aiService.generateMOM(
      transcript,
      template || settings.defaultTemplate || 'Standard Meeting Notes & MOM',
      language || settings.defaultLanguage || 'English',
      model,
      customPrompt,
      title,
      agentId || 'mom_synthesis'
    );

    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/ask - "Ask Your Meetings" (Semantic Chatbot & Multi-meeting Q&A)
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { query, meetingId, history, mode, agentId }: AskQuestionRequest = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ success: false, error: 'Query string is required' });
      return;
    }

    const result = await aiService.askMeetings(query, meetingId, history, mode, agentId || 'ask_meetings');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/follow-up-email - generate professional follow up email
router.post('/follow-up-email', async (req: Request, res: Response) => {
  try {
    const { meetingId, tone, recipientGroup, agentId } = req.body;

    if (!meetingId) {
      res.status(400).json({ success: false, error: 'Meeting ID is required' });
      return;
    }

    const email = await aiService.generateFollowUpEmail(meetingId, tone, agentId || 'follow_up_email');
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

// POST /api/ai/fetch-models - dynamically fetch models from any provider using API key / endpoint
router.post('/fetch-models', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, baseUrl } = req.body;
    if (!provider) {
      res.status(400).json({ success: false, error: 'Provider is required' });
      return;
    }
    const result = await aiService.fetchProviderModels(provider, apiKey, baseUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

import { localLLMService } from '../services/localLLMService.js';

// GET /api/ai/local-llm/status - check Qwen 3.5 on-device LLM download status and weights info
router.get('/local-llm/status', (_req: Request, res: Response) => {
  try {
    const status = localLLMService.getStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/local-llm/download - trigger background download of Qwen 3.5 4B model weights
router.post('/local-llm/download', async (_req: Request, res: Response) => {
  try {
    const status = await localLLMService.startDownload();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/local-llm/verify - run live on-device verification diagnostic
router.post('/local-llm/verify', async (_req: Request, res: Response) => {
  try {
    const result = await localLLMService.verifyModel();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/ai/local-llm - offload Qwen 3.5 4B model weights
router.delete('/local-llm', (_req: Request, res: Response) => {
  try {
    const deleted = localLLMService.deleteModel();
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

