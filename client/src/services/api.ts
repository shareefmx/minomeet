import { Meeting, AppSettings, MOMSummary, TranscriptLine } from '../types/meeting.js';

const API_BASE = '/api';

export const api = {
  // Meetings
  async getMeetings(search?: string): Promise<Meeting[]> {
    const url = search ? `${API_BASE}/meetings?search=${encodeURIComponent(search)}` : `${API_BASE}/meetings`;
    const res = await fetch(url);
    const data = await res.json();
    return data.meetings || [];
  },

  async getMeeting(id: string): Promise<Meeting> {
    const res = await fetch(`${API_BASE}/meetings/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load meeting');
    return data.meeting;
  },

  async createMeeting(payload: {
    title?: string;
    transcript: TranscriptLine[];
    duration?: string;
    tags?: string[];
    autoSummarize?: boolean;
    template?: string;
    language?: string;
    model?: string;
  }): Promise<Meeting> {
    const res = await fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create meeting');
    return data.meeting;
  },

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    const res = await fetch(`${API_BASE}/meetings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update meeting');
    return data.meeting;
  },

  async deleteMeeting(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/meetings/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  async importAudio(file: File, autoSummarize = true): Promise<Meeting> {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('autoSummarize', String(autoSummarize));

    const res = await fetch(`${API_BASE}/meetings/import`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to import audio');
    return data.meeting;
  },

  // AI
  async summarize(payload: {
    transcript: TranscriptLine[];
    title?: string;
    template?: string;
    language?: string;
    model?: string;
    customPrompt?: string;
  }): Promise<MOMSummary> {
    const res = await fetch(`${API_BASE}/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to generate summary');
    return data.summary;
  },

  async askMeetings(query: string, meetingId?: string): Promise<{ answer: string; sources: any[] }> {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, meetingId })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to ask question');
    return { answer: data.answer, sources: data.sources || [] };
  },

  async generateFollowUpEmail(meetingId: string, tone?: string): Promise<{ subject: string; body: string }> {
    const res = await fetch(`${API_BASE}/ai/follow-up-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, tone })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to generate follow-up email');
    return { subject: data.subject, body: data.body };
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    const data = await res.json();
    return data.settings;
  },

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.settings;
  }
};

