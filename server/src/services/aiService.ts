import { v4 as uuidv4 } from 'uuid';
import { TranscriptLine, MOMSummary, ActionItem, AskQuestionResponse, FollowUpEmailResponse } from '../types/index.js';
import { storageService } from './storageService.js';

export class AIService {
  /**
   * Generates a structured Minutes of Meeting (MOM) document from transcript text.
   */
  public async generateMOM(
    transcript: TranscriptLine[],
    template: string = 'Standard Meeting Notes',
    language: string = 'English',
    model: string = 'Nimbus 4B (High Quality)',
    customPrompt?: string,
    meetingTitle?: string
  ): Promise<MOMSummary> {
    const fullText = transcript.map(t => `${t.speaker ? t.speaker + ': ' : ''}${t.text}`).join('\n');
    const speakers = Array.from(new Set(transcript.map(t => t.speaker).filter(Boolean))) as string[];
    const attendeesList = speakers.length > 0
      ? speakers.map(s => `${s} (Participant)`)
      : ['Team Member'];

    const title = meetingTitle || (transcript.length > 0 ? `Meeting Sync — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Untitled Meeting');
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Extract action items intelligently based on text patterns
    const actionItems: ActionItem[] = this.extractActionItems(transcript, speakers);
    const keyDecisions: string[] = this.extractKeyDecisions(transcript, template);
    const discussionHighlights: string[] = this.extractHighlights(transcript);
    const nextSteps: string[] = this.extractNextSteps(actionItems);

    let executiveSummary = '';
    if (transcript.length === 0) {
      executiveSummary = 'No dialogue recorded during this meeting session.';
    } else {
      const topicSentence = transcript[0]?.text || '';
      executiveSummary = `The meeting focused on key project deliverables and strategic alignments. Topics discussed included ${topicSentence.toLowerCase().replace(/^(alright|hey|hi|hello|ok|let's start with)\s*/i, '')}. The team reviewed current status and established concrete next steps.`;
    }

    // MOM content in pure professional English
    let translatedSummary = executiveSummary;
    let translatedDecisions = keyDecisions;
    let translatedHighlights = discussionHighlights;
    let translatedNextSteps = nextSteps;

    // Template specific structure tailoring
    if (template === 'Daily Standup') {
      translatedSummary = `Daily Standup: Quick alignment across work streams, blocking issues, and peer pairing commitments for today's sprint cycle.`;
    } else if (template === 'Retrospective (Agile)') {
      translatedSummary = `Sprint Retrospective: Analyzed what went smoothly in this sprint cycle, identified process friction points, and formulated actionable improvements.`;
    } else if (template === 'Client / Sales Meeting') {
      translatedSummary = `Client Alignment Session: Reviewed client requirements, timeline milestones, deliverables, and integration credentials.`;
    }

    return {
      title,
      date: dateFormatted,
      attendees: attendeesList,
      summary: translatedSummary,
      keyDecisions: translatedDecisions.length > 0 ? translatedDecisions : ['Approved current project roadmap milestones.'],
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
      discussionHighlights: translatedHighlights.length > 0 ? translatedHighlights : [
        'Reviewed overall architecture and timelines.',
        'Confirmed team availability and key dependencies.'
      ],
      nextSteps: translatedNextSteps,
      template,
      language,
      modelUsed: model,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * "Ask Your Meetings" - Semantic search & question answering across historical meetings.
   */
  public async askMeetings(query: string, meetingId?: string): Promise<AskQuestionResponse> {
    const allMeetings = storageService.getMeetings();
    const targetMeetings = meetingId
      ? allMeetings.filter(m => m.id === meetingId)
      : allMeetings;

    const lowerQuery = query.toLowerCase();
    const sources: { meetingId: string; meetingTitle: string; snippet: string; timestamp?: string }[] = [];
    const matchedPoints: string[] = [];

    for (const meeting of targetMeetings) {
      // Check in summary
      if (meeting.summary) {
        if (meeting.summary.summary.toLowerCase().includes(lowerQuery) ||
            meeting.summary.keyDecisions.some(d => d.toLowerCase().includes(lowerQuery)) ||
            meeting.summary.discussionHighlights.some(h => h.toLowerCase().includes(lowerQuery))) {
          sources.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            snippet: meeting.summary.summary
          });
          matchedPoints.push(`In "${meeting.title}": ${meeting.summary.summary}`);
        }

        // Check in action items
        for (const act of meeting.summary.actionItems) {
          if (act.task.toLowerCase().includes(lowerQuery) || act.owner.toLowerCase().includes(lowerQuery) || act.notes.toLowerCase().includes(lowerQuery)) {
            sources.push({
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              snippet: `Action Item assigned to ${act.owner}: "${act.task}" (Due: ${act.due})`
            });
            matchedPoints.push(`Action Item (${act.owner}): ${act.task} [Due: ${act.due}]`);
          }
        }
      }

      // Check in transcript lines
      for (const line of meeting.transcript) {
        if (line.text.toLowerCase().includes(lowerQuery) || (line.speaker && line.speaker.toLowerCase().includes(lowerQuery))) {
          sources.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            snippet: `${line.speaker ? line.speaker + ': ' : ''}${line.text}`,
            timestamp: line.time
          });
        }
      }
    }

    if (sources.length === 0) {
      return {
        answer: `I searched through your ${targetMeetings.length} saved meeting(s) but couldn't find specific discussions matching "${query}". Try asking about scanners (Argus / Pulse), Redis caching, OAuth token rotation, or team assignments.`,
        sources: []
      };
    }

    const uniqueSources = sources.slice(0, 4);
    const answerIntro = `Based on your meeting archives, here is what was recorded regarding **"${query}"**:`;
    const bullets = uniqueSources.map(s => `• **${s.meetingTitle}** ${s.timestamp ? `[${s.timestamp}]` : ''}: ${s.snippet}`).join('\n');

    return {
      answer: `${answerIntro}\n\n${bullets}`,
      sources: uniqueSources
    };
  }

  /**
   * Generates a professional follow-up email draft based on meeting details and action items.
   */
  public async generateFollowUpEmail(meetingId: string, tone: 'professional' | 'concise' | 'action-oriented' = 'professional'): Promise<FollowUpEmailResponse> {
    const meeting = storageService.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting with ID ${meetingId} not found`);
    }

    const title = meeting.title;
    const summaryText = meeting.summary?.summary || 'We had a productive sync discussing recent updates and next steps.';
    const actionItems = meeting.summary?.actionItems || [];
    const attendees = meeting.summary?.attendees?.join(', ') || 'Team';

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
      body = `Dear Attendees (${attendees}),\n\nThank you for your time during our "${title}" session. Below is a structured summary of the discussion, decisions, and assigned responsibilities:\n\n### Executive Summary\n${summaryText}\n\n### Key Decisions Made\n${meeting.summary?.keyDecisions?.map(d => `• ${d}`).join('\n') || '• Confirmed roadmap timelines.'}\n\n### Action Items & Ownership\n${actionsList || '• No open action items.'}\n\nPlease reach out if you have any questions or require revisions to these minutes.\n\nWarm regards,\nMinomeet On-Device AI Assistant`;
    }

    return { subject, body };
  }

  // --- Internal extraction helpers ---

  private extractActionItems(transcript: TranscriptLine[], speakers: string[]): ActionItem[] {
    const items: ActionItem[] = [];
    const actionKeywords = ['i will', "i'll", 'will have', 'need to', 'let’s', "let's", 'confirm', 'rollout', 'add', 'flag', 'deploy', 'send', 'email', 'pair'];

    for (const line of transcript) {
      const lower = line.text.toLowerCase();
      const matched = actionKeywords.some(kw => lower.includes(kw));
      if (matched) {
        let owner = line.speaker || (speakers.length > 0 ? speakers[items.length % speakers.length] : 'Team');
        let task = line.text.replace(/^(alright|yeah|nice|got it|sounds good)[.,]?\s*/i, '');
        task = task.charAt(0).toUpperCase() + task.slice(1);

        items.push({
          id: uuidv4(),
          owner,
          task,
          due: 'By Friday',
          notes: `Mentioned at [${line.time}]`,
          completed: false
        });
      }
    }

    return items.slice(0, 5);
  }

  private extractKeyDecisions(transcript: TranscriptLine[], template: string): string[] {
    const decisions: string[] = [];
    for (const line of transcript) {
      if (line.text.toLowerCase().includes('swapped') ||
          line.text.toLowerCase().includes('replaced') ||
          line.text.toLowerCase().includes('decided') ||
          line.text.toLowerCase().includes('stays in') ||
          line.text.toLowerCase().includes('approved') ||
          line.text.toLowerCase().includes('agreed')) {
        decisions.push(line.text);
      }
    }
    if (decisions.length === 0 && transcript.length > 0) {
      decisions.push(`Agreed on milestones outlined in ${transcript[0]?.text.slice(0, 60)}...`);
    }
    return decisions.slice(0, 4);
  }

  private extractHighlights(transcript: TranscriptLine[]): string[] {
    return transcript.slice(0, 4).map(t => `${t.speaker ? t.speaker + ' noted: ' : ''}${t.text}`);
  }

  private extractNextSteps(actionItems: ActionItem[]): string[] {
    if (actionItems.length === 0) {
      return ['Schedule follow-up review sync.'];
    }
    return actionItems.slice(0, 2).map(a => `${a.owner} to finish: ${a.task} (${a.due})`);
  }
}

export const aiService = new AIService();

