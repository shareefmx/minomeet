import { v4 as uuidv4 } from 'uuid';
import { TranscriptLine, MOMSummary, ActionItem, AskQuestionResponse, FollowUpEmailResponse, AIConnectionStatus } from '../types/index.js';
import { storageService } from './storageService.js';
import {
  resolveModel,
  ResolvedAIModel,
  getAvailableModelsForProvider,
  AI_PROVIDERS_CONFIG,
  isNonChatOrTranscriptionModel
} from '../utils/aiModelConfig.js';

/**
 * Strips internal thinking tokens (<think>...</think>) from reasoning models (e.g., DeepSeek-R1, QwQ).
 */
export function cleanModelOutput(rawText: string): string {
  if (!rawText) return '';
  return rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Resiliently extracts and parses JSON from diverse LLM response formats.
 * Handles Markdown code fences (```json, ``` json, ```), surrounding conversational text,
 * trailing commas, unescaped newlines in string literals, and custom fallback extraction.
 */
export function parseAIJsonResponse<T extends Record<string, any>>(
  rawText: string,
  fallbackExtractor?: (text: string) => T
): T {
  const cleaned = cleanModelOutput(rawText);

  // Strategy 1: Extract from markdown code blocks (```json ... ``` or ``` json ... ``` or ``` ... ```)
  const codeBlockMatches = [...cleaned.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi)];
  const candidates: string[] = [];

  for (const match of codeBlockMatches) {
    if (match[1]?.trim()) {
      candidates.push(match[1].trim());
    }
  }

  // Strategy 2: Extract between outermost JSON braces { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(cleaned.substring(firstBrace, lastBrace + 1).trim());
  }

  // Strategy 3: Cleaned raw text without markdown backtick tokens
  const strippedFences = cleaned.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  if (strippedFences) {
    candidates.push(strippedFences);
  }

  // Add the cleaned string itself
  candidates.push(cleaned);

  // Try parsing candidate strings
  for (const candidate of candidates) {
    if (!candidate) continue;

    // Direct JSON.parse
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_) {}

    // Comprehensive sanitization: fix trailing commas before closing brackets AND unescaped newlines/tabs
    try {
      let sanitized = candidate.replace(/,\s*([\}\]])/g, '$1');

      // Replace literal unescaped newlines/control characters inside strings
      sanitized = sanitized.replace(/"((?:[^"\\]|\\.)*)"/gs, (_, inner) => {
        const escaped = inner
          .split('\r\n').join('\\n')
          .split('\n').join('\\n')
          .split('\r').join('\\r')
          .split('\t').join('\\t');
        return '"' + escaped + '"';
      });

      const parsed = JSON.parse(sanitized);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_) {}
  }

  // Strategy 4: Fallback extractor if provided
  if (fallbackExtractor) {
    try {
      const extracted = fallbackExtractor(cleaned);
      if (extracted && typeof extracted === 'object') return extracted;
    } catch (fallbackErr) {
      console.warn('[AI] Fallback JSON extractor failed:', fallbackErr);
    }
  }

  throw new Error(`Failed to parse AI response into valid JSON. Raw output: "${cleaned.slice(0, 120)}..."`);
}

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
      if (!cleanModel || cleanModel.startsWith('Nimbus') || isNonChatOrTranscriptionModel(cleanModel)) {
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
      let cleanModel = (model || 'gpt-4o').split(' ')[0].trim();
      if (isNonChatOrTranscriptionModel(cleanModel)) {
        cleanModel = 'gpt-4o';
      }
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
      let cleanModel = (model || 'claude-3-5-sonnet-20241022').split(' ')[0].trim();
      if (isNonChatOrTranscriptionModel(cleanModel)) {
        cleanModel = 'claude-3-5-sonnet-20241022';
      }
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
      let cleanModel = (model || 'llama-3.3-70b-versatile').split(' ')[0].trim();
      if (isNonChatOrTranscriptionModel(cleanModel)) {
        cleanModel = 'llama-3.3-70b-versatile';
      }
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
      let cleanModel = (model || 'openai/gpt-4o').split(' ')[0].trim();
      if (isNonChatOrTranscriptionModel(cleanModel)) {
        cleanModel = 'openai/gpt-4o';
      }
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
      const endpoint = (baseUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '');
      const cleanModel = (model || '').trim();
      if (!cleanModel) {
        throw new Error('No Ollama model specified. Please select an installed model.');
      }

      // Check if installed models exist
      try {
        const tagsRes = await fetch(`${endpoint}/api/tags`);
        if (tagsRes.ok) {
          const tagsData = (await tagsRes.json()) as any;
          const installed: string[] = (tagsData.models || []).map((m: any) => m.name || m.model);
          if (installed.length > 0 && !installed.includes(cleanModel)) {
            const match = installed.find(m => m === cleanModel || m.split(':')[0] === cleanModel.split(':')[0] || m.startsWith(cleanModel));
            if (!match) {
              throw new Error(`Selected Ollama model '${cleanModel}' is not installed. Fetch models or choose another model.`);
            }
          }
        }
      } catch (tagErr: any) {
        if (tagErr.message.includes('not installed')) throw tagErr;
      }

      // Try /api/chat first
      try {
        const res = await fetch(`${endpoint}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: cleanModel,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: userPrompt }
            ],
            stream: false
          })
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          return data.message?.content || data.response || '';
        }
      } catch {
        // Fallback to /api/generate
      }

      const fallbackRes = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cleanModel,
          prompt: `${systemPrompt ? systemPrompt + '\n\n' : ''}${userPrompt}`,
          stream: false
        })
      });

      if (!fallbackRes.ok) {
        const errText = await fallbackRes.text().catch(() => '');
        throw new Error(`Ollama daemon returned HTTP ${fallbackRes.status}${errText ? `: ${errText}` : ''}`);
      }

      const data = (await fallbackRes.json()) as any;
      return data.response || '';
    }

    // 7. Custom OpenAI-Compatible Server
    if (provider === 'custom') {
      const rawBase = (baseUrl || 'http://localhost:8000/v1').trim().replace(/\/+$/, '');
      // Strip trailing /chat/completions or /models if user accidentally pasted full path
      const cleanBase = rawBase.replace(/\/(chat\/completions|models)$/i, '').replace(/\/+$/, '');
      
      const candidateChatUrls = cleanBase.endsWith('/v1') || cleanBase.includes('/api/')
        ? [`${cleanBase}/chat/completions`, `${cleanBase.replace(/\/v1$/, '')}/chat/completions`]
        : [`${cleanBase}/v1/chat/completions`, `${cleanBase}/chat/completions`];

      const cleanModel = (model || 'custom-model').split(' ')[0].trim();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (key) headers['Authorization'] = `Bearer ${key}`;

      let lastError: any = null;
      for (const chatUrl of candidateChatUrls) {
        try {
          const res = await fetch(chatUrl, {
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

          if (res.ok) {
            const data = (await res.json()) as any;
            const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.response || data.content || '';
            if (content) return content;
          } else {
            let errorMsg = '';
            try {
              const errJson = (await res.json()) as any;
              errorMsg = errJson.error?.message || errJson.message || errJson.detail || JSON.stringify(errJson);
            } catch {
              errorMsg = await res.text().catch(() => '');
            }
            lastError = new Error(`Custom server (${chatUrl}) returned HTTP ${res.status}: ${errorMsg || res.statusText}`);
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      throw lastError || new Error(`Could not execute prompt on custom OpenAI-compatible server at ${cleanBase}`);
    }

    throw new Error(`Unsupported provider ${provider} for LLM execution.`);
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
    meetingTitle?: string,
    agentId: string = 'mom_synthesis'
  ): Promise<MOMSummary> {
    const settings = storageService.getSettings();
    const resolved = resolveModel(settings, agentId);
    let effectiveModel = (model && !isNonChatOrTranscriptionModel(model)) ? model : resolved.modelId;
    if (isNonChatOrTranscriptionModel(effectiveModel)) {
      effectiveModel = resolved.modelId;
    }

    console.log(`[AI] Agent: ${agentId}`);
    console.log(`[AI] Provider: ${resolved.providerName}`);
    console.log(`[AI] Model: ${effectiveModel}`);
    console.log(`[AI] Endpoint: ${resolved.baseUrl || 'Cloud API'}`);
    console.log(`[AI] Sending request...`);

    if (!resolved.isUsable) {
      throw new Error(resolved.error || `AI Model (${resolved.providerName} - ${effectiveModel}) is not configured. Please open Settings ➔ AI Model to configure your API key.`);
    }

    const fullText = transcript.map(t => `${t.speaker ? t.speaker + ': ' : ''}${t.text}`).join('\n');
    const speakers = Array.from(new Set(transcript.map(t => t.speaker).filter(Boolean))) as string[];
    const attendeesList = speakers.length > 0
      ? speakers.map(s => `${s} (Participant)`)
      : ['Team Member'];

    const title = meetingTitle || (transcript.length > 0 ? `Meeting Sync — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Untitled Meeting');
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const templateDef = storageService.getTemplateById(template);

    // Call configured AI provider
    if (fullText.trim().length > 0) {
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

        const llmResponse = await this.callLLM(resolved.providerId, resolved.apiKey, resolved.baseUrl, effectiveModel, sysPrompt, userPrompt);
        
        const fallbackMOMExtractor = (text: string): any => {
          const cleanText = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
          return {
            summary: cleanText || 'Summary generated by AI.',
            keyDecisions: ['Key decisions discussed and agreed.'],
            actionItems: [],
            discussionHighlights: ['Key meeting points reviewed.'],
            nextSteps: ['Follow up on discussed action items.']
          };
        };

        const parsed = parseAIJsonResponse<any>(llmResponse, fallbackMOMExtractor);

        return {
          title,
          date: dateFormatted,
          attendees: attendeesList,
          summary: parsed.summary || 'Summary generated by AI.',
          keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : ['Key decisions recorded.'],
          actionItems: (Array.isArray(parsed.actionItems) ? parsed.actionItems : []).map((a: any) => ({
            id: uuidv4(),
            owner: typeof a === 'string' ? 'Team Member' : (a?.owner || 'Team Member'),
            task: typeof a === 'string' ? a : (a?.task || 'Follow up'),
            due: typeof a === 'object' ? (a?.due || 'Upcoming') : 'Upcoming',
            notes: typeof a === 'object' ? (a?.notes || '') : '',
            completed: false
          })),
          discussionHighlights: Array.isArray(parsed.discussionHighlights) ? parsed.discussionHighlights : ['Discussed agenda items.'],
          nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : ['Follow up on assigned items.'],
          template: templateDef ? templateDef.name : template,
          language,
          modelUsed: `${resolved.providerName} • ${effectiveModel}`,
          generatedAt: new Date().toISOString()
        };
      } catch (err: any) {
        throw new Error(`AI Synthesis error (${resolved.providerName} • ${effectiveModel}): ${err.message}`);
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
      modelUsed: `${resolved.providerName} • ${effectiveModel}`,
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
    mode: 'all' | 'action_items' | 'decisions' | 'attendees' | 'summary' = 'all',
    agentId: string = 'ask_meetings'
  ): Promise<AskQuestionResponse> {
    const settings = storageService.getSettings();
    const resolved = resolveModel(settings, agentId);

    console.log(`[AI] Agent: ${agentId}`);
    console.log(`[AI] Provider: ${resolved.providerName}`);
    console.log(`[AI] Model: ${resolved.modelId}`);
    console.log(`[AI] Endpoint: ${resolved.baseUrl || 'Cloud API'}`);
    console.log(`[AI] Sending request...`);

    if (!resolved.isUsable) {
      throw new Error(resolved.error || `AI Model (${resolved.providerName} - ${resolved.modelId}) is not configured. Please open Settings ➔ AI Model to configure your API key.`);
    }

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

    // Call configured AI Model
    if (uniqueSources.length > 0 || query.trim().length > 0) {
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

        const rawLLMOutput = await this.callLLM(resolved.providerId, resolved.apiKey, resolved.baseUrl, resolved.modelId, sysPrompt, userPrompt);
        const cleanedAnswer = cleanModelOutput(rawLLMOutput);

        return {
          answer: cleanedAnswer,
          sources: uniqueSources.slice(0, 3),
          modelUsed: `${resolved.providerName} • ${resolved.modelId}`
        };
      } catch (err: any) {
        throw new Error(`AI Chatbot error (${resolved.providerName} • ${resolved.modelId}): ${err.message}`);
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
        modelUsed: `${resolved.providerName} • ${resolved.modelId}`
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
      modelUsed: `${resolved.providerName} • ${resolved.modelId}`
    };
  }

  /**
   * Generates a professional follow-up email draft based on meeting details and action items.
   */
  public async generateFollowUpEmail(
    meetingId: string,
    tone: 'professional' | 'concise' | 'action-oriented' = 'professional',
    agentId: string = 'follow_up_email'
  ): Promise<FollowUpEmailResponse> {
    const settings = storageService.getSettings();
    const resolved = resolveModel(settings, agentId);

    console.log(`[AI] Agent: ${agentId}`);
    console.log(`[AI] Provider: ${resolved.providerName}`);
    console.log(`[AI] Model: ${resolved.modelId}`);
    console.log(`[AI] Endpoint: ${resolved.baseUrl || 'Cloud API'}`);
    console.log(`[AI] Sending request...`);

    if (!resolved.isUsable) {
      throw new Error(resolved.error || `AI Model (${resolved.providerName} - ${resolved.modelId}) is not configured. Please open Settings ➔ AI Model to configure your API key.`);
    }

    const meeting = storageService.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting with ID ${meetingId} not found`);
    }

    const title = meeting.title;
    const summaryText = meeting.summary?.summary || 'We had a productive sync discussing recent updates and next steps.';
    const actionItems = meeting.summary?.actionItems || [];
    const attendees = meeting.summary?.attendees?.join(', ') || 'Team';

    // Call configured AI model to draft email
    if (summaryText) {
      try {
        const sysPrompt = `You are a corporate communication specialist. Draft a clear, impactful follow-up email after a meeting.
Tone requested: ${tone}.
Respond strictly in JSON format with keys: "subject" and "body". Example:
{"subject": "Follow-up: Meeting Title", "body": "Dear Team,\\n\\nThank you for attending..."}`;
        const userPrompt = `Meeting Title: ${title}\nAttendees: ${attendees}\nSummary: ${summaryText}\nKey Decisions: ${meeting.summary?.keyDecisions?.join('; ') || 'None'}\nAction Items: ${actionItems.map(a => `${a.owner}: ${a.task} (Due: ${a.due})`).join('; ')}`;

        const llmResponse = await this.callLLM(resolved.providerId, resolved.apiKey, resolved.baseUrl, resolved.modelId, sysPrompt, userPrompt);
        
        const fallbackEmailExtractor = (text: string): { subject: string; body: string } => {
          const subjectMatch = text.match(/(?:Subject|Title)\s*:\s*(.+?)(?:\n|$)/i);
          const emailSubject = subjectMatch ? subjectMatch[1].trim().replace(/^['"`]|['"`]$/g, '') : `Follow-up & Action Items: ${title}`;
          let emailBody = text
            .replace(/```(?:json)?/gi, '')
            .replace(/```/g, '')
            .replace(/(?:Subject|Title)\s*:\s*.+?(?:\n|$)/i, '')
            .trim();
          if (!emailBody) {
            emailBody = `Dear Attendees (${attendees}),\n\nThank you for participating in "${title}".\n\n### Summary\n${summaryText}`;
          }
          return { subject: emailSubject, body: emailBody };
        };

        const parsed = parseAIJsonResponse<{ subject?: string; body?: string }>(llmResponse, fallbackEmailExtractor);

        return {
          subject: parsed.subject || `Follow-up & Action Items: ${title}`,
          body: parsed.body || `Dear Team,\n\nThank you for attending "${title}".`
        };
      } catch (err: any) {
        throw new Error(`AI Email generation error (${resolved.providerName} • ${resolved.modelId}): ${err.message}`);
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
    if (provider === 'ollama') {
      const endpoint = (baseUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '');
      try {
        const res = await fetch(`${endpoint}/api/tags`);
        if (res.ok) {
          const data = (await res.json()) as any;
          const models: string[] = (data.models || []).map((m: any) => m.name || m.model);
          if (models.length === 0) {
            return { success: false, models: [], error: `Ollama is running at ${endpoint}, but no local models are installed yet. Run 'ollama pull <model>' first.`, status: 'invalid' };
          }
          return { success: true, models, status: 'connected' };
        }
        return { success: false, models: [], error: `Ollama daemon returned HTTP ${res.status}. Check endpoint URL.`, status: 'error' };
      } catch (err: any) {
        return { success: false, models: [], error: `Could not reach Ollama at ${endpoint}. Ensure 'ollama serve' is running.`, status: 'error' };
      }
    }

    if (provider === 'custom') {
      const rawBase = (baseUrl || 'http://localhost:8000/v1').trim().replace(/\/+$/, '');
      const cleanBase = rawBase.replace(/\/(chat\/completions|models)$/i, '').replace(/\/+$/, '');
      const key = (apiKey || '').trim().replace(/^['"`]|['"`]$/g, '');

      const candidateModelsUrls = cleanBase.endsWith('/v1') || cleanBase.includes('/api/')
        ? [`${cleanBase}/models`, `${cleanBase.replace(/\/v1$/, '')}/models`]
        : [`${cleanBase}/v1/models`, `${cleanBase}/models`];

      const candidateChatUrls = cleanBase.endsWith('/v1') || cleanBase.includes('/api/')
        ? [`${cleanBase}/chat/completions`, `${cleanBase.replace(/\/v1$/, '')}/chat/completions`]
        : [`${cleanBase}/v1/chat/completions`, `${cleanBase}/chat/completions`];

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (key) headers['Authorization'] = `Bearer ${key}`;

      // 1. Try candidate GET /models endpoints
      for (const modelsUrl of candidateModelsUrls) {
        try {
          const res = await fetch(modelsUrl, { headers });
          if (res.ok) {
            const data = (await res.json()) as any;
            const models: string[] = (data.data || data.models || []).map((m: any) => m.id || m.name || m);
            if (models.length > 0) {
              return { success: true, models, status: 'connected' };
            }
          }
          if (res.status === 401 || res.status === 403) {
            return { success: false, models: [], error: `Authentication failed (HTTP ${res.status}): Invalid API key for custom server.`, status: 'invalid' };
          }
        } catch {
          // Continue to next check
        }
      }

      // 2. Fallback: Test connectivity via lightweight ping to /chat/completions
      for (const chatUrl of candidateChatUrls) {
        try {
          const res = await fetch(chatUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: 'custom-model',
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 1
            })
          });

          if (res.ok) {
            return { success: true, models: ['custom-model'], status: 'connected' };
          }
          if (res.status === 401 || res.status === 403) {
            return { success: false, models: [], error: `Authentication failed (HTTP ${res.status}): Invalid API key for custom server.`, status: 'invalid' };
          }
          // Some servers return 400 or 404 specifically because 'custom-model' is not their model name, which confirms the server is reachable and active!
          if (res.status === 400 || res.status === 404 || res.status === 422) {
            let errorMsg = '';
            try {
              const errJson = (await res.json()) as any;
              errorMsg = errJson.error?.message || errJson.message || errJson.detail || '';
            } catch {
              // ignore
            }
            if (errorMsg.toLowerCase().includes('model') || res.status === 400 || res.status === 422) {
              return { success: true, models: ['custom-model'], status: 'connected' };
            }
          }
        } catch {
          // Continue
        }
      }

      return { success: false, models: [], error: `Could not connect to custom OpenAI-compatible server at ${cleanBase}. Please verify the URL and ensure the server is running.`, status: 'error' };
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
          headers: { 'Authorization': `Bearer ${key}` }
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
        const gptModels = rawModels
          .map((m: any) => m.id)
          .filter((id: string) => id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('chatgpt'))
          .sort();
        return {
          success: true,
          models: gptModels.length > 0 ? gptModels : ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o3-mini'],
          status: 'connected'
        };
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
          headers: { 'Authorization': `Bearer ${key}` }
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
        return {
          success: true,
          models: groqModels.length > 0 ? groqModels : ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
          status: 'connected'
        };
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
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
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
        const data = (await res.json()) as any;
        const rawModels: any[] = data.data || [];
        const orModels = rawModels
          .map((m: any) => m.id)
          .filter((id: string) => !isNonChatOrTranscriptionModel(id));
        return {
          success: true,
          models: orModels.length > 0 ? orModels : ['openai/gpt-4o', 'anthropic/claude-3.7-sonnet', 'deepseek/deepseek-r1', 'meta-llama/llama-3.3-70b-instruct', 'mistralai/mistral-large-2411'],
          status: 'connected'
        };
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
   * Performs live authentication check and model verification.
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
    const fetched = await this.fetchProviderModels(provider, apiKey, baseUrl);
    if (!fetched.success) {
      return {
        success: false,
        status: fetched.status || 'invalid',
        message: fetched.error || `Connection test failed for ${provider}. Check your API credentials.`
      };
    }

    // If model specified, verify model existence
    if (model && model.trim()) {
      const cleanModel = model.trim();
      const exists = (fetched.models || []).some(m => m === cleanModel || m.split(':')[0] === cleanModel.split(':')[0] || m.startsWith(cleanModel) || cleanModel.startsWith(m));
      if (!exists && provider === 'ollama') {
        return {
          success: false,
          status: 'invalid',
          message: `Selected Ollama model '${cleanModel}' is not installed. Fetch models or choose another model.`,
          fetchedModels: fetched.models
        };
      }
    }

    return {
      success: true,
      status: 'connected',
      message: `${provider.toUpperCase()} verified & connected successfully! (${(fetched.models || []).length} model(s) available).`,
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
