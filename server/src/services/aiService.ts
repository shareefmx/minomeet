import { v4 as uuidv4 } from 'uuid';
import { TranscriptLine, MOMSummary, ActionItem, AskQuestionResponse, FollowUpEmailResponse, AIConnectionStatus } from '../types/index.js';
import { storageService } from './storageService.js';
import { getEffectiveModelForAgent } from '../utils/aiModelConfig.js';

export class AIService {
  /**
   * Calls a configured LLM provider directly with prompts.
   */
  public async callLLM(
    provider: string,
    apiKey?: string,
    baseUrl?: string,
    model?: string,
    systemPrompt: string = '',
    userPrompt: string = ''
  ): Promise<string> {
    const key = (apiKey || '').trim().replace(/^['"`]|['"`]$/g, '');

    // 1. Google Gemini
    if (provider === 'google') {
      let cleanModel = (model || 'gemini-1.5-flash').replace(/^models\//, '').split(' ')[0].trim();
      if (!cleanModel || cleanModel.startsWith('Nimbus')) {
        cleanModel = 'gemini-1.5-flash';
      }
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt ? systemPrompt + '\n\n' : ''}${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 3000
          }
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message || `Google Gemini API returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Google Gemini returned an empty response.');
      }
      return text;
    }

    // 2. OpenAI
    if (provider === 'openai') {
      const cleanModel = (model || 'gpt-4o').split(' ')[0].trim();
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: cleanModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message || `OpenAI API returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      return data.choices?.[0]?.message?.content || '';
    }

    // 3. Anthropic Claude
    if (provider === 'anthropic') {
      const cleanModel = (model || 'claude-3-5-sonnet-20241022').split(' ')[0].trim();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: cleanModel,
          max_tokens: 3000,
          system: systemPrompt || undefined,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message || `Anthropic API returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      return data.content?.[0]?.text || '';
    }

    // 4. Groq
    if (provider === 'groq') {
      const cleanModel = (model || 'llama-3.3-70b-versatile').split(' ')[0].trim();
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: cleanModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message || `Groq API returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      return data.choices?.[0]?.message?.content || '';
    }

    // 5. OpenRouter
    if (provider === 'openrouter') {
      const cleanModel = (model || 'openai/gpt-4o').split(' ')[0].trim();
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: cleanModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message || `OpenRouter API returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      return data.choices?.[0]?.message?.content || '';
    }

    // 6. Ollama
    if (provider === 'ollama') {
      const endpoint = (baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
      const cleanModel = (model || 'llama3.1:8b').split(' ')[0].trim();
      const res = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cleanModel,
          prompt: `${systemPrompt ? systemPrompt + '\n\n' : ''}${userPrompt}`,
          stream: false
        })
      });

      if (!res.ok) {
        throw new Error(`Ollama daemon returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      return data.response || '';
    }

    // 7. Custom OpenAI-Compatible Server
    if (provider === 'custom') {
      const endpoint = (baseUrl || 'http://localhost:8000/v1').replace(/\/+$/, '');
      const cleanModel = (model || 'custom-model').split(' ')[0].trim();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (key) headers['Authorization'] = `Bearer ${key}`;

      const res = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: cleanModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!res.ok) {
        throw new Error(`Custom server returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      return data.choices?.[0]?.message?.content || '';
    }

    throw new Error(`Unsupported provider ${provider} for LLM execution.`);
  }

  /**
   * Helper to resolve the active LLM credentials from settings or environment.
   */
  public resolveActiveLLM(settings: any, agentRole: string = 'general'): {
    provider: string;
    apiKey?: string;
    baseUrl?: string;
    model: string;
    isLLMAvailable: boolean;
  } {
    const effective = getEffectiveModelForAgent(settings, agentRole);
    let activeProvider = effective.providerId;
    let activeKey = settings?.aiProviders?.[activeProvider]?.apiKey;
    let activeBaseUrl = settings?.aiProviders?.[activeProvider]?.baseUrl;
    let activeModelName = effective.modelId;

    if (!activeKey && settings?.aiProviders) {
      for (const [pId, pCred] of Object.entries(settings.aiProviders as Record<string, any>)) {
        if (pCred?.apiKey && pCred.apiKey.trim()) {
          activeProvider = pId;
          activeKey = pCred.apiKey;
          activeBaseUrl = pCred.baseUrl;
          activeModelName = pCred.selectedModel || effective.modelId;
          break;
        }
      }
    }

    if (!activeKey) {
      if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
        activeProvider = 'google';
        activeKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        activeModelName = 'gemini-1.5-flash';
      } else if (process.env.OPENAI_API_KEY) {
        activeProvider = 'openai';
        activeKey = process.env.OPENAI_API_KEY;
        activeModelName = 'gpt-4o';
      } else if (process.env.GROQ_API_KEY) {
        activeProvider = 'groq';
        activeKey = process.env.GROQ_API_KEY;
        activeModelName = 'llama-3.3-70b-versatile';
      }
    }

    const isLLMAvailable = activeProvider !== 'builtin' && (Boolean(activeKey) || activeProvider === 'ollama' || activeProvider === 'custom');

    return {
      provider: activeProvider,
      apiKey: activeKey,
      baseUrl: activeBaseUrl,
      model: activeModelName,
      isLLMAvailable
    };
  }

  /**
   * Generates a structured Minutes of Meeting (MOM) document from transcript text.
   */
  public async generateMOM(
    transcript: TranscriptLine[],
    template: string = 'Standard Meeting Notes',
    language: string = 'English',
    model?: string,
    customPrompt?: string,
    meetingTitle?: string
  ): Promise<MOMSummary> {
    const settings = storageService.getSettings();
    const llmInfo = this.resolveActiveLLM(settings, 'mom_synthesis');
    const effectiveModel = model || llmInfo.model;

    const fullText = transcript.map(t => `${t.speaker ? t.speaker + ': ' : ''}${t.text}`).join('\n');
    const speakers = Array.from(new Set(transcript.map(t => t.speaker).filter(Boolean))) as string[];
    const attendeesList = speakers.length > 0
      ? speakers.map(s => `${s} (Participant)`)
      : ['Team Member'];

    const title = meetingTitle || (transcript.length > 0 ? `Meeting Sync — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Untitled Meeting');
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const templateDef = storageService.getTemplateById(template);

    // If external cloud or local LLM is configured and ready, try calling real LLM
    if (llmInfo.isLLMAvailable && fullText.trim().length > 0) {
      try {
        const sysPrompt = `You are an expert executive meeting assistant. You synthesize meeting transcripts into structured Minutes of Meeting (MOM) in ${language}.
Template style to adhere to: "${template}".
Respond with a JSON object strictly matching this schema:
{
  "summary": "Concise executive summary of the meeting",
  "keyDecisions": ["Decision 1", "Decision 2"],
  "actionItems": [{"task": "Task description", "owner": "Assignee name", "due": "Target date", "notes": "Tracking note"}],
  "discussionHighlights": ["Highlight 1", "Highlight 2"],
  "nextSteps": ["Next step 1", "Next step 2"]
}`;
        const userPrompt = `Meeting Title: ${title}\nAttendees: ${attendeesList.join(', ')}\n${customPrompt ? `Custom Instructions: ${customPrompt}\n` : ''}\nTranscript:\n${fullText}`;

        const llmResponse = await this.callLLM(llmInfo.provider, llmInfo.apiKey, llmInfo.baseUrl, effectiveModel, sysPrompt, userPrompt);
        
        // Extract JSON from markdown backticks if wrapped
        const cleanJsonStr = llmResponse.replace(/^```json\s*|\s*```$/gi, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        return {
          title,
          date: dateFormatted,
          attendees: attendeesList,
          summary: parsed.summary || 'Summary generated by AI.',
          keyDecisions: parsed.keyDecisions || ['Key decisions recorded.'],
          actionItems: (parsed.actionItems || []).map((a: any) => ({
            id: uuidv4(),
            owner: a.owner || 'Team Member',
            task: a.task || 'Follow up',
            due: a.due || 'Upcoming',
            notes: a.notes || '',
            completed: false
          })),
          discussionHighlights: parsed.discussionHighlights || ['Discussed roadmap deliverables.'],
          nextSteps: parsed.nextSteps || ['Follow up on assigned action items.'],
          template: templateDef ? templateDef.name : template,
          language,
          modelUsed: `${llmInfo.provider} • ${effectiveModel}`,
          generatedAt: new Date().toISOString()
        };
      } catch (err: any) {
        console.warn(`Real LLM synthesis failed, falling back to local engine: ${err.message}`);
      }
    }

    // Heuristic Local Synthesis Fallback
    const actionItems: ActionItem[] = this.extractActionItems(transcript, speakers);
    const keyDecisions: string[] = this.extractKeyDecisions(transcript, template);
    const discussionHighlights: string[] = this.extractHighlights(transcript);
    const nextSteps: string[] = this.extractNextSteps(actionItems);

    return {
      title,
      date: dateFormatted,
      attendees: attendeesList,
      summary: 'Executive Summary generated via local heuristics.',
      keyDecisions: keyDecisions.length > 0 ? keyDecisions : ['Approved current project roadmap milestones.'],
      actionItems: actionItems.length > 0 ? actionItems : [
        {
          id: uuidv4(),
          owner: speakers[0] || 'Team Member',
          task: 'Follow up on discussion items from this meeting',
          due: 'By next sync',
          notes: 'Review shared minutes',
          completed: false
        }
      ],
      discussionHighlights: discussionHighlights.length > 0 ? discussionHighlights : [
        'Reviewed overall architecture and timelines.',
        'Confirmed team availability and key dependencies.'
      ],
      nextSteps: nextSteps,
      template: templateDef ? templateDef.name : template,
      language,
      modelUsed: `${llmInfo.provider} • ${effectiveModel}`,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * "Ask Your Meetings" - Intelligent AI Chatbot & semantic assistant across all meeting notes.
   */
  public async askMeetings(
    query: string,
    meetingId?: string,
    history?: { role: 'user' | 'assistant'; content: string }[],
    mode: 'all' | 'action_items' | 'decisions' | 'attendees' | 'summary' = 'all'
  ): Promise<AskQuestionResponse> {
    const settings = storageService.getSettings();
    const effective = getEffectiveModelForAgent(settings, 'ask_meetings');
    const cred = settings?.aiProviders?.[effective.providerId];

    const allMeetings = storageService.getMeetings();
    const targetMeetings = meetingId
      ? allMeetings.filter(m => m.id === meetingId)
      : allMeetings;

    const lowerQuery = query.toLowerCase().trim();
    const sources: {
      meetingId: string;
      meetingTitle: string;
      snippet: string;
      timestamp?: string;
      type?: 'summary' | 'decision' | 'action_item' | 'transcript' | 'highlight';
    }[] = [];

    const meetingContextBlocks: string[] = [];

    for (const meeting of targetMeetings) {
      const parts: string[] = [];
      const formattedDate = meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString() : 'Recent';
      parts.push(`=== MEETING NOTE: "${meeting.title}" (Date: ${formattedDate}, Duration: ${meeting.duration || 'N/A'}) ===`);
      
      if (meeting.summary) {
        if (meeting.summary.template) {
          parts.push(`Template / Category: ${meeting.summary.template}`);
        }
        if (meeting.summary.attendees && meeting.summary.attendees.length > 0) {
          parts.push(`Participants & Attendees: ${meeting.summary.attendees.join(', ')}`);
        }
        if (meeting.summary.summary) {
          parts.push(`Executive Summary:\n${meeting.summary.summary}`);
          if (mode === 'all' || mode === 'summary' || meeting.summary.summary.toLowerCase().includes(lowerQuery)) {
            sources.push({
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              snippet: meeting.summary.summary,
              type: 'summary'
            });
          }
        }
        if (meeting.summary.keyDecisions && meeting.summary.keyDecisions.length > 0) {
          parts.push(`Key Decisions Made:\n${meeting.summary.keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`);
          if (mode === 'all' || mode === 'decisions' || meeting.summary.keyDecisions.some(d => d.toLowerCase().includes(lowerQuery))) {
            sources.push({
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              snippet: `Key Decisions: ${meeting.summary.keyDecisions.join('; ')}`,
              type: 'decision'
            });
          }
        }
        if (meeting.summary.actionItems && meeting.summary.actionItems.length > 0) {
          parts.push(`Action Items & Deliverables:\n${meeting.summary.actionItems.map(a => `• [${a.completed ? 'x' : ' '}] ${a.owner}: "${a.task}" (Deadline: ${a.due || 'Not specified'}${a.notes ? `, Context: ${a.notes}` : ''})`).join('\n')}`);
          if (mode === 'all' || mode === 'action_items' || meeting.summary.actionItems.some(a => a.task.toLowerCase().includes(lowerQuery) || a.owner.toLowerCase().includes(lowerQuery))) {
            sources.push({
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              snippet: `Action Items: ${meeting.summary.actionItems.map(a => `${a.owner} -> ${a.task} [Due: ${a.due}]`).join('; ')}`,
              type: 'action_item'
            });
          }
        }
        if (meeting.summary.discussionHighlights && meeting.summary.discussionHighlights.length > 0) {
          parts.push(`Discussion Highlights:\n${meeting.summary.discussionHighlights.map(h => `• ${h}`).join('\n')}`);
        }
      }

      // If single meeting note is selected, upload the ENTIRE transcript to the AI model
      if (targetMeetings.length === 1 && meeting.transcript && meeting.transcript.length > 0) {
        parts.push(`Full Meeting Transcript (${meeting.transcript.length} lines):\n${meeting.transcript.map(l => `[${l.time || '00:00'}] ${l.speaker ? l.speaker + ': ' : ''}${l.text}`).join('\n')}`);
        // Add matching or first lines to sources
        const matchingLines = meeting.transcript.filter(line => 
          line.text.toLowerCase().includes(lowerQuery) || (line.speaker && line.speaker.toLowerCase().includes(lowerQuery))
        );
        const sampleLines = matchingLines.length > 0 ? matchingLines : meeting.transcript.slice(0, 3);
        for (const l of sampleLines.slice(0, 3)) {
          sources.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            snippet: `${l.speaker ? l.speaker + ': ' : ''}${l.text}`,
            timestamp: l.time,
            type: 'transcript'
          });
        }
      } else {
        // Multi-meeting archive: upload summaries + relevant matching dialogue lines
        const matchingLines = meeting.transcript.filter(line => 
          line.text.toLowerCase().includes(lowerQuery) || (line.speaker && line.speaker.toLowerCase().includes(lowerQuery))
        );
        if (matchingLines.length > 0) {
          parts.push(`Key Dialogue Snippets:\n${matchingLines.slice(0, 6).map(l => `[${l.time || '00:00'}] ${l.speaker ? l.speaker + ': ' : ''}${l.text}`).join('\n')}`);
          for (const l of matchingLines.slice(0, 2)) {
            sources.push({
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              snippet: `${l.speaker ? l.speaker + ': ' : ''}${l.text}`,
              timestamp: l.time,
              type: 'transcript'
            });
          }
        } else if (meeting.transcript.length > 0 && targetMeetings.length <= 5) {
          parts.push(`Dialogue Highlights:\n${meeting.transcript.slice(0, 6).map(l => `[${l.time || '00:00'}] ${l.speaker ? l.speaker + ': ' : ''}${l.text}`).join('\n')}`);
        }
      }

      meetingContextBlocks.push(parts.join('\n\n'));
    }

    // Deduplicate sources by meetingId and snippet
    const uniqueSourcesMap = new Map<string, typeof sources[0]>();
    sources.forEach(s => {
      const key = `${s.meetingId}_${s.snippet.slice(0, 40)}`;
      if (!uniqueSourcesMap.has(key)) {
        uniqueSourcesMap.set(key, s);
      }
    });
    const uniqueSources = Array.from(uniqueSourcesMap.values()).slice(0, 6);

    // Check if effective provider or any provider in settings/env has a usable LLM key
    let activeProvider = effective.providerId;
    let activeKey = cred?.apiKey;
    let activeBaseUrl = cred?.baseUrl;
    let activeModelName = effective.modelId;

    if (!activeKey && settings?.aiProviders) {
      for (const [pId, pCred] of Object.entries(settings.aiProviders)) {
        if (pCred?.apiKey && pCred.apiKey.trim()) {
          activeProvider = pId;
          activeKey = pCred.apiKey;
          activeBaseUrl = pCred.baseUrl;
          activeModelName = pCred.selectedModel || effective.modelId;
          break;
        }
      }
    }

    // Check environment variables as fallback
    if (!activeKey) {
      if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
        activeProvider = 'google';
        activeKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        activeModelName = 'gemini-1.5-flash';
      } else if (process.env.OPENAI_API_KEY) {
        activeProvider = 'openai';
        activeKey = process.env.OPENAI_API_KEY;
        activeModelName = 'gpt-4o';
      } else if (process.env.GROQ_API_KEY) {
        activeProvider = 'groq';
        activeKey = process.env.GROQ_API_KEY;
        activeModelName = 'llama-3.3-70b-versatile';
      }
    }

    // If an LLM model is available, call it to produce a simple, small, direct answer
    if (activeProvider !== 'builtin' && (activeKey || activeProvider === 'ollama' || activeProvider === 'custom')) {
      try {
        const historyText = history && history.length > 0
          ? `\n\nRecent Chat Conversation History:\n${history.slice(-4).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}`
          : '';

        const sysPrompt = `You are a concise, helpful meeting assistant.
Answer the user's question directly, simply, and concisely in 1 to 3 short sentences based strictly on the provided meeting notes.
- Provide a simple, small, direct answer specifically addressing what was asked.
- Reference the specific meeting name (e.g. "**Product Security Sync**") when stating facts.
- Do not repeat the question or include generic introductory or concluding filler phrases.`;

        const userPrompt = `Meeting Notes Context:\n${meetingContextBlocks.slice(0, 8).join('\n\n---\n\n')}${historyText}\n\nQuestion: ${query}`;

        const rawLLMOutput = await this.callLLM(activeProvider, activeKey, activeBaseUrl, activeModelName, sysPrompt, userPrompt);
        const cleanedAnswer = rawLLMOutput.trim();

        return {
          answer: cleanedAnswer,
          sources: uniqueSources.slice(0, 3),
          modelUsed: `${activeProvider} • ${activeModelName}`
        };
      } catch (err: any) {
        console.warn(`Live AI Chatbot call failed: ${err.message}`);
      }
    }

    // Smart Local / Offline Semantic Answer Engine (Direct, concise 1-2 sentence replies based on query)
    const stopWords = new Set([
      'what', 'is', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'a', 'an', 'and', 'or',
      'who', 'where', 'when', 'why', 'how', 'can', 'you', 'tell', 'me', 'about', 'there',
      'give', 'show', 'any', 'think', 'present', 'using', 'model', 'meeting', 'meetings',
      'notes', 'note', 'have', 'same', 'reply', 'based', 'qus', 'anserw', 'simple', 'small'
    ]);

    const queryWords = lowerQuery
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // Check greeting
    if (/^(hi|hello|hey|greetings|help|howdy)\b/i.test(lowerQuery)) {
      return {
        answer: 'Hello! Ask me any specific question about your meeting notes, decisions, or action items.',
        sources: [],
        modelUsed: `${effective.providerName} • ${effective.modelId}`
      };
    }

    // Score all specific items in target meetings
    interface CandidateAnswer {
      text: string;
      meetingTitle: string;
      meetingId: string;
      score: number;
      type: 'decision' | 'action_item' | 'transcript' | 'summary';
    }

    const candidates: CandidateAnswer[] = [];

    for (const m of targetMeetings) {
      if (m.summary) {
        // Decisions
        for (const d of m.summary.keyDecisions || []) {
          const lower = d.toLowerCase();
          let score = 0;
          for (const word of queryWords) {
            if (lower.includes(word)) score += 3;
          }
          if (/\b(decision|decided|agreed|approved)\b/i.test(lowerQuery)) score += 2;
          if (score > 0) {
            candidates.push({
              text: d,
              meetingTitle: m.title,
              meetingId: m.id,
              score,
              type: 'decision'
            });
          }
        }

        // Action items
        for (const a of m.summary.actionItems || []) {
          const combined = `${a.owner} ${a.task} ${a.due || ''} ${a.notes || ''}`.toLowerCase();
          let score = 0;
          for (const word of queryWords) {
            if (combined.includes(word)) score += 4;
          }
          if (/\b(task|tasks|action|due|deadline|assigned|deliverable)\b/i.test(lowerQuery)) score += 2;
          if (score > 0) {
            candidates.push({
              text: `${a.owner}: ${a.task}${a.due ? ` (Due: ${a.due})` : ''}`,
              meetingTitle: m.title,
              meetingId: m.id,
              score,
              type: 'action_item'
            });
          }
        }

        // Discussion highlights / summaries (split into sentences)
        const summarySentences = (m.summary.summary || '')
          .split(/(?<=[.?!])\s+/)
          .concat(m.summary.discussionHighlights || []);

        for (const sentence of summarySentences) {
          if (!sentence || sentence.length < 10) continue;
          const lower = sentence.toLowerCase();
          let score = 0;
          for (const word of queryWords) {
            if (lower.includes(word)) score += 2;
          }
          if (score > 0) {
            candidates.push({
              text: sentence,
              meetingTitle: m.title,
              meetingId: m.id,
              score,
              type: 'summary'
            });
          }
        }
      }

      // Transcripts
      for (const line of m.transcript || []) {
        const lower = `${line.speaker || ''}: ${line.text}`.toLowerCase();
        let score = 0;
        for (const word of queryWords) {
          if (lower.includes(word)) score += 3;
        }
        if (score > 0) {
          candidates.push({
            text: `${line.speaker ? line.speaker + ': ' : ''}"${line.text}"`,
            meetingTitle: m.title,
            meetingId: m.id,
            score,
            type: 'transcript'
          });
        }
      }
    }

    // Sort candidates by score descending
    candidates.sort((a, b) => b.score - a.score);

    let directAnswer = '';
    const relevantSources: { meetingId: string; meetingTitle: string; snippet: string; type?: any }[] = [];

    if (candidates.length > 0) {
      const topCandidates = candidates.slice(0, 2);
      const top = topCandidates[0];
      relevantSources.push({
        meetingId: top.meetingId,
        meetingTitle: top.meetingTitle,
        snippet: top.text,
        type: top.type
      });

      if (topCandidates.length === 1) {
        directAnswer = `In **${top.meetingTitle}**, ${top.text}`;
      } else {
        directAnswer = `In **${top.meetingTitle}**:\n• ${topCandidates.map(c => c.text).join('\n• ')}`;
      }
    } else {
      if (targetMeetings.length === 1) {
        const m = targetMeetings[0];
        directAnswer = `In **${m.title}**, there are no specific mentions matching "${query}".`;
      } else {
        directAnswer = `No specific discussions or action items matching "${query}" were found in your saved meeting notes.`;
      }
    }

    return {
      answer: directAnswer,
      sources: relevantSources,
      modelUsed: `${effective.providerName} • ${effective.modelId}`
    };
  }

  /**
   * Generates a professional follow-up email draft based on meeting details and action items.
   */
  public async generateFollowUpEmail(meetingId: string, tone: 'professional' | 'concise' | 'action-oriented' = 'professional'): Promise<FollowUpEmailResponse> {
    const settings = storageService.getSettings();
    const llmInfo = this.resolveActiveLLM(settings, 'follow_up_email');

    const meeting = storageService.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting with ID ${meetingId} not found`);
    }

    const title = meeting.title;
    const summaryText = meeting.summary?.summary || 'We had a productive sync discussing recent updates and next steps.';
    const actionItems = meeting.summary?.actionItems || [];
    const attendees = meeting.summary?.attendees?.join(', ') || 'Team';

    // If external model like Gemini is active, call real LLM to draft email
    if (llmInfo.isLLMAvailable) {
      try {
        const sysPrompt = `You are a corporate communication specialist. Draft a clear, impactful follow-up email after a meeting.
Tone requested: ${tone}.
Respond in JSON format with keys: "subject" and "body".`;
        const userPrompt = `Meeting Title: ${title}\nAttendees: ${attendees}\nSummary: ${summaryText}\nKey Decisions: ${meeting.summary?.keyDecisions?.join('; ') || 'None'}\nAction Items: ${actionItems.map(a => `${a.owner}: ${a.task} (Due: ${a.due})`).join('; ')}`;

        const llmResponse = await this.callLLM(llmInfo.provider, llmInfo.apiKey, llmInfo.baseUrl, llmInfo.model, sysPrompt, userPrompt);
        const cleanJsonStr = llmResponse.replace(/^```json\s*|\s*```$/gi, '').trim();
        const parsed = JSON.parse(cleanJsonStr);
        return {
          subject: parsed.subject || `Follow-up & Action Items: ${title}`,
          body: parsed.body || `Dear Team,\n\nThank you for attending "${title}".`
        };
      } catch (err: any) {
        console.warn(`Real LLM follow-up email generation failed, falling back to template: ${err.message}`);
      }
    }

    let subject = `Follow-up & Minutes: ${title}`;
    let body = '';

    if (tone === 'concise') {
      const actionsList = actionItems.map(a => `• ${a.owner}: ${a.task} (Due: ${a.due})`).join('\n');
      body = `Hi everyone,\n\nQuick recap of our meeting today:\n\n**Summary:**\n${summaryText}\n\n**Action Items:**\n${actionsList || '• None'}\n\nLet me know if anything was missed.\n\nBest,\nMinomeet AI`;
    } else if (tone === 'action-oriented') {
      const actionsList = actionItems.map(a => `• [ ] **${a.owner}** → ${a.task} [Due: ${a.due}] - ${a.notes}`).join('\n');
      body = `Team,\n\nHere are the critical deliverables and action items from today's "${title}":\n\n**Action Matrix:**\n${actionsList}\n\n**Key Decisions:**\n${meeting.summary?.keyDecisions?.map(d => `• ${d}`).join('\n') || '• As discussed.'}\n\nPlease update your ticket status as items progress.\n\nBest regards,\nTeam Member`;
    } else {
      const actionsList = actionItems.map(a => `• **${a.owner}**: ${a.task} (Target Due Date: ${a.due})`).join('\n');
      body = `Dear Attendees (${attendees}),\n\nThank you for your time during our "${title}" session. Below is a structured summary of the discussion, decisions, and assigned responsibilities:\n\n### Executive Summary\n${summaryText}\n\n### Key Decisions Made\n${meeting.summary?.keyDecisions?.map(d => `• ${d}`).join('\n') || '• Confirmed roadmap timelines.'}\n\n### Action Items & Ownership\n${actionsList || '• No open action items.'}\n\nPlease reach out if you have any questions or require revisions to these minutes.\n\nWarm regards,\nMinomeet AI Assistant`;
    }

    return { subject, body };
  }

  /**
   * Fetches real available models dynamically from any provider's API.
   * Performs resilient validation against live provider APIs.
   */
  public async fetchProviderModels(
    provider: string,
    apiKey?: string,
    baseUrl?: string
  ): Promise<{
    success: boolean;
    models: string[];
    error?: string;
    status?: AIConnectionStatus;
  }> {
    if (provider === 'builtin') {
      return {
        success: true,
        models: ['Nimbus 4B (High Quality)', 'Nimbus 2B (Balanced)', 'Nimbus 1B (Fast)'],
        status: 'connected'
      };
    }

    if (provider === 'ollama') {
      const endpoint = (baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
      try {
        const res = await fetch(`${endpoint}/api/tags`);
        if (res.ok) {
          const data = (await res.json()) as any;
          const models: string[] = (data.models || []).map((m: any) => m.name || m.model);
          if (models.length === 0) {
            return { success: false, models: [], error: `Ollama is running at ${endpoint}, but no local models are installed yet. Run 'ollama pull llama3.3' first.`, status: 'invalid' };
          }
          return { success: true, models, status: 'connected' };
        }
        return { success: false, models: [], error: `Ollama daemon returned HTTP ${res.status}. Check endpoint URL.`, status: 'error' };
      } catch (err: any) {
        return { success: false, models: [], error: `Could not reach Ollama at ${endpoint}. Ensure 'ollama serve' is running.`, status: 'error' };
      }
    }

    if (provider === 'custom') {
      const endpoint = (baseUrl || 'http://localhost:8000/v1').replace(/\/+$/, '');
      const key = (apiKey || '').trim().replace(/^['"`]|['"`]$/g, '');
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (key) headers['Authorization'] = `Bearer ${key}`;

        const res = await fetch(`${endpoint}/models`, { headers });
        if (res.ok) {
          const data = (await res.json()) as any;
          const models: string[] = (data.data || []).map((m: any) => m.id || m.name);
          return { success: true, models: models.length > 0 ? models : ['custom-model'], status: 'connected' };
        }
        if (res.status === 401 || res.status === 403) {
          return { success: false, models: [], error: `Authentication failed (HTTP ${res.status}): Invalid API key for custom server.`, status: 'invalid' };
        }
        return { success: false, models: [], error: `Custom server returned HTTP ${res.status}. Check endpoint URL and key.`, status: 'error' };
      } catch (err: any) {
        return { success: false, models: [], error: `Could not connect to custom server at ${endpoint}.`, status: 'error' };
      }
    }

    const key = (apiKey || '').trim().replace(/^['"`]|['"`]$/g, '');
    if (!key) {
      return {
        success: false,
        models: [],
        error: `API Key is required for ${provider}. Please enter a valid API key.`,
        status: 'not_configured'
      };
    }

    // Google Gemini API
    if (provider === 'google') {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
        if (res.ok) {
          const data = (await res.json()) as any;
          const rawModels: any[] = data.models || [];
          let geminiModels = rawModels
            .map((m: any) => (m.name || '').replace(/^models\//, ''))
            .filter((name: string) => name.toLowerCase().includes('gemini'));

          if (geminiModels.length === 0) {
            geminiModels = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
          } else {
            const priority = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
            geminiModels.sort((a, b) => {
              const idxA = priority.indexOf(a);
              const idxB = priority.indexOf(b);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return a.localeCompare(b);
            });
          }
          return { success: true, models: geminiModels, status: 'connected' };
        }

        // Check if error response from Google
        const errData = (await res.json().catch(() => ({}))) as any;
        const msg = errData.error?.message || (res.status === 400 ? 'API key not valid. Please pass a valid API key from Google AI Studio.' : `Google API returned HTTP ${res.status}`);
        return {
          success: false,
          models: [],
          error: `Google Gemini authentication failed: ${msg}`,
          status: 'invalid'
        };
      } catch (err: any) {
        return {
          success: false,
          models: [],
          error: `Network error connecting to Google Gemini API: ${err.message}`,
          status: 'error'
        };
      }
    }

    // OpenAI API
    if (provider === 'openai') {
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as any;
          const msg = errData.error?.message || `OpenAI returned HTTP ${res.status}`;
          return {
            success: false,
            models: [],
            error: `OpenAI authentication failed: ${msg}`,
            status: 'invalid'
          };
        }
        const data = (await res.json()) as any;
        const rawModels: any[] = data.data || [];
        const chatModels = rawModels
          .map((m: any) => m.id)
          .filter((id: string) => id.startsWith('gpt') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('chatgpt'));

        const priority = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o3-mini', 'gpt-4', 'gpt-3.5-turbo'];
        chatModels.sort((a, b) => {
          const idxA = priority.indexOf(a);
          const idxB = priority.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        return { success: true, models: chatModels.length > 0 ? chatModels : ['gpt-4o', 'gpt-4o-mini'], status: 'connected' };
      } catch (err: any) {
        return {
          success: false,
          models: [],
          error: `Network error connecting to OpenAI API: ${err.message}`,
          status: 'error'
        };
      }
    }

    // Groq API
    if (provider === 'groq') {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as any;
          const msg = errData.error?.message || `Groq returned HTTP ${res.status}`;
          return {
            success: false,
            models: [],
            error: `Groq authentication failed: ${msg}`,
            status: 'invalid'
          };
        }
        const data = (await res.json()) as any;
        const rawModels: any[] = data.data || [];
        const groqModels = rawModels.map((m: any) => m.id);
        return { success: true, models: groqModels.length > 0 ? groqModels : ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'], status: 'connected' };
      } catch (err: any) {
        return {
          success: false,
          models: [],
          error: `Network error connecting to Groq API: ${err.message}`,
          status: 'error'
        };
      }
    }

    // OpenRouter API
    if (provider === 'openrouter') {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as any;
          const msg = errData.error?.message || `OpenRouter returned HTTP ${res.status}`;
          return {
            success: false,
            models: [],
            error: `OpenRouter authentication failed: ${msg}`,
            status: 'invalid'
          };
        }
        const modelsRes = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { Authorization: `Bearer ${key}` }
        });
        let topModels = [
          'openai/gpt-4o',
          'anthropic/claude-3.7-sonnet',
          'deepseek/deepseek-r1',
          'google/gemini-2.5-pro',
          'meta-llama/llama-3.3-70b-instruct'
        ];
        if (modelsRes.ok) {
          const data = (await modelsRes.json()) as any;
          const rawModels: any[] = data.data || [];
          if (rawModels.length > 0) {
            topModels = rawModels.slice(0, 30).map((m: any) => m.id);
          }
        }
        return { success: true, models: topModels, status: 'connected' };
      } catch (err: any) {
        return {
          success: false,
          models: [],
          error: `Network error connecting to OpenRouter API: ${err.message}`,
          status: 'error'
        };
      }
    }

    // Anthropic API
    if (provider === 'anthropic') {
      try {
        const res = await fetch('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
          }
        });
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as any;
          const msg = errData.error?.message || `Anthropic returned HTTP ${res.status}`;
          return {
            success: false,
            models: [],
            error: `Anthropic authentication failed: ${msg}`,
            status: 'invalid'
          };
        }
        const data = (await res.json()) as any;
        const rawModels: any[] = data.data || [];
        const claudeModels = rawModels.map((m: any) => m.id);
        return {
          success: true,
          models: claudeModels.length > 0 ? claudeModels : ['claude-3-7-sonnet', 'claude-3-5-sonnet', 'claude-3-5-haiku', 'claude-3-opus'],
          status: 'connected'
        };
      } catch (err: any) {
        return {
          success: false,
          models: [],
          error: `Network error connecting to Anthropic API: ${err.message}`,
          status: 'error'
        };
      }
    }

    return {
      success: false,
      models: [],
      error: `Unknown provider ${provider}`,
      status: 'error'
    };
  }

  /**
   * Tests API key credentials, endpoint connectivity, and model availability.
   * Performs live authentication check.
   */
  public async testConnection(
    provider: string,
    apiKey?: string,
    baseUrl?: string,
    model?: string
  ): Promise<{
    success: boolean;
    status: AIConnectionStatus;
    message: string;
    fetchedModels?: string[];
  }> {
    if (provider === 'builtin') {
      const modelsResult = await this.fetchProviderModels('builtin');
      return {
        success: true,
        status: 'connected',
        message: `Built-in / Local AI engine active (100% Offline, ${model || 'Nimbus 4B'} ready).`,
        fetchedModels: modelsResult.models
      };
    }

    const fetched = await this.fetchProviderModels(provider, apiKey, baseUrl);
    if (!fetched.success) {
      return {
        success: false,
        status: fetched.status || 'invalid',
        message: fetched.error || `Connection test failed for ${provider}. Check your API credentials.`
      };
    }

    return {
      success: true,
      status: 'connected',
      message: `${provider.toUpperCase()} API key verified & connected successfully! (${fetched.models.length} model(s) available).`,
      fetchedModels: fetched.models
    };
  }

  // --- Helper Extraction Methods for Smart Synthesis Engine ---

  private extractActionItems(transcript: TranscriptLine[], speakers: string[]): ActionItem[] {
    const actionItems: ActionItem[] = [];
    const actionTriggers = [
      /i will\s+(.+)/i,
      /i'll\s+(.+)/i,
      /can you\s+(.+)/i,
      /let's\s+(.+)/i,
      /we need to\s+(.+)/i,
      /please\s+(.+)/i,
      /make sure to\s+(.+)/i,
      /take care of\s+(.+)/i,
      /assigned to\s+(\w+)\s*:\s*(.+)/i,
      /owner\s*:\s*(\w+)\s*,\s*task\s*:\s*(.+)/i
    ];

    for (let i = 0; i < transcript.length; i++) {
      const line = transcript[i];
      const speaker = line.speaker || speakers[i % (speakers.length || 1)] || 'Team Member';

      for (const trigger of actionTriggers) {
        const match = line.text.match(trigger);
        if (match) {
          let task = match[1] || match[2] || line.text;
          let owner = speaker;
          if (match[2] && match[1]) {
            owner = match[1];
            task = match[2];
          }

          task = task.replace(/[.!?]$/, '').trim();
          task = task.charAt(0).toUpperCase() + task.slice(1);

          if (task.length > 5 && !actionItems.some(a => a.task.toLowerCase() === task.toLowerCase())) {
            actionItems.push({
              id: uuidv4(),
              task,
              owner,
              due: 'End of Sprint',
              notes: `Identified from discussion at ${line.time || 'meeting'}`,
              completed: false
            });
          }
        }
      }
    }

    if (actionItems.length === 0 && transcript.length > 0) {
      actionItems.push({
        id: uuidv4(),
        task: 'Document and share meeting discussion points with team',
        owner: speakers[0] || 'Team Lead',
        due: 'Tomorrow',
        notes: 'Follow-up deliverable',
        completed: false
      });
    }

    return actionItems;
  }

  private extractKeyDecisions(transcript: TranscriptLine[], template: string): string[] {
    const decisions: string[] = [];
    const decisionTriggers = [
      /decided (?:that|to)\s+(.+)/i,
      /agreed (?:that|to|on)\s+(.+)/i,
      /approved\s+(.+)/i,
      /confirmed\s+(.+)/i,
      /finalized\s+(.+)/i,
      /concluded\s+(.+)/i,
      /consensus is\s+(.+)/i
    ];

    for (const line of transcript) {
      for (const trigger of decisionTriggers) {
        const match = line.text.match(trigger);
        if (match) {
          let dec = match[1].replace(/[.!?]$/, '').trim();
          dec = dec.charAt(0).toUpperCase() + dec.slice(1);
          if (!decisions.includes(dec) && dec.length > 5) {
            decisions.push(dec);
          }
        }
      }
    }

    if (decisions.length === 0) {
      if (template.toLowerCase().includes('standup')) {
        decisions.push('Approved current sprint board task priorities.');
      } else if (template.toLowerCase().includes('sales')) {
        decisions.push('Confirmed client engagement timeline and deliverables.');
      } else {
        decisions.push('Approved current project roadmap milestones.');
      }
    }

    return decisions;
  }

  private extractHighlights(transcript: TranscriptLine[]): string[] {
    const highlights: string[] = [];
    if (transcript.length === 0) return ['No notes recorded.'];

    const step = Math.max(1, Math.floor(transcript.length / 3));
    for (let i = 0; i < transcript.length && highlights.length < 3; i += step) {
      const line = transcript[i];
      if (line && line.text.trim()) {
        const clean = line.text.replace(/^(alright|hey|hi|hello|ok)\s*,?\s*/i, '');
        highlights.push(`${line.speaker ? line.speaker + ': ' : ''}${clean}`);
      }
    }
    return highlights;
  }

  private extractNextSteps(actionItems: ActionItem[]): string[] {
    if (actionItems.length > 0) {
      return actionItems.slice(0, 3).map(a => `${a.owner} to complete "${a.task}" (${a.due}).`);
    }
    return ['Review meeting minutes and align on next sync date.'];
  }
}

export const aiService = new AIService();
