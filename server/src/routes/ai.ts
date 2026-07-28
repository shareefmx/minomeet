import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
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

    const summary = await aiService.generateMOM(
      transcript,
      template || 'Standard Meeting Notes',
      language || 'English',
      model || 'Nimbus 4B (High Quality)',
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

export default router;

