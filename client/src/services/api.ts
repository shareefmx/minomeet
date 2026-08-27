import { Meeting, AppSettings, MOMSummary, TranscriptLine, TranscriptionModel, TranscriptionEngineStatus, StorageStats, MOMTemplate, AskQuestionResponse } from '../types/meeting.js';

const API_BASE = '/api';

export const api = {
  // Templates
  async getTemplates(): Promise<MOMTemplate[]> {
    const res = await fetch(`${API_BASE}/templates`);
    const data = await res.json();
    return data.templates || [];
  },

  async createTemplate(payload: Partial<MOMTemplate>): Promise<MOMTemplate> {
    const res = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create template');
    return data.template;
  },

  async updateTemplate(id: string, updates: Partial<MOMTemplate>): Promise<MOMTemplate> {
    const res = await fetch(`${API_BASE}/templates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update template');
    return data.template;
  },

  async deleteTemplate(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete template');
    return data.success;
  },

  async setDefaultTemplate(id: string): Promise<MOMTemplate> {
    const res = await fetch(`${API_BASE}/templates/${encodeURIComponent(id)}/default`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to set default template');
    return data.template;
  },

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
    audioPath?: string;
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

  async uploadAudio(file: File): Promise<{ success: boolean; filePath: string }> {
    const formData = new FormData();
    formData.append('audio', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to upload audio');
    return data;
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

  async importAudio(payload: {
    file: File;
    autoSummarize?: boolean;
    model?: string;
    language?: string;
    template?: string;
    duration?: string;
  }): Promise<Meeting> {
    const formData = new FormData();
    formData.append('audio', payload.file);
    formData.append('autoSummarize', String(payload.autoSummarize ?? true));
    if (payload.model) formData.append('model', payload.model);
    if (payload.language) formData.append('language', payload.language);
    if (payload.template) formData.append('template', payload.template);
    if (payload.duration) formData.append('duration', payload.duration);

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
    agentId?: string;
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

  async askMeetings(
    query: string,
    meetingId?: string,
    history?: { role: 'user' | 'assistant'; content: string }[],
    mode?: 'all' | 'action_items' | 'decisions' | 'attendees' | 'summary',
    agentId?: string
  ): Promise<AskQuestionResponse> {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, meetingId, history, mode, agentId: agentId || 'ask_meetings' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to query meeting assistant');
    return {
      answer: data.answer,
      sources: data.sources || [],
      suggestedFollowUps: data.suggestedFollowUps || [],
      modelUsed: data.modelUsed
    };
  },

  async generateFollowUpEmail(meetingId: string, tone?: string, agentId?: string): Promise<{ subject: string; body: string }> {
    const res = await fetch(`${API_BASE}/ai/follow-up-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, tone, agentId: agentId || 'follow_up_email' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to generate follow-up email');
    return { subject: data.subject, body: data.body };
  },

  async testAIConnection(payload: {
    provider: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  }): Promise<{
    success: boolean;
    status: 'not_configured' | 'testing' | 'connected' | 'invalid' | 'error';
    message: string;
    fetchedModels?: string[];
  }> {
    const res = await fetch(`${API_BASE}/ai/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async fetchAIProviderModels(payload: {
    provider: string;
    apiKey?: string;
    baseUrl?: string;
  }): Promise<{ success: boolean; models?: string[]; error?: string }> {
    const res = await fetch(`${API_BASE}/ai/fetch-models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Settings
  async getSettings(): Promise<{ settings: AppSettings; storageStats?: StorageStats }> {
    const res = await fetch(`${API_BASE}/settings`);
    const data = await res.json();
    return { settings: data.settings, storageStats: data.storageStats };
  },

  async getStorageStats(): Promise<StorageStats> {
    const res = await fetch(`${API_BASE}/settings/stats`);
    const data = await res.json();
    return data.storageStats;
  },

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.settings;
  },

  async openFolder(targetFolder?: string): Promise<{ success: boolean; path: string }> {
    const res = await fetch(`${API_BASE}/settings/open-folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: targetFolder, path: targetFolder })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to open directory');
    return data;
  },

  async purgeRecordings(days: number): Promise<{ success: boolean; deletedCount: number; freedFormatted: string; message: string }> {
    const res = await fetch(`${API_BASE}/settings/purge-recordings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to purge recordings');
    return data;
  },

  // Transcription Models & Engine
  async getTranscriptionModels(): Promise<{ models: TranscriptionModel[]; activeModel: TranscriptionModel }> {
    const res = await fetch(`${API_BASE}/transcription/models`);
    const data = await res.json();
    return { models: data.models || [], activeModel: data.activeModel };
  },

  async downloadTranscriptionModel(id: string): Promise<TranscriptionModel> {
    const res = await fetch(`${API_BASE}/transcription/models/${encodeURIComponent(id)}/download`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to download model');
    return data.model;
  },

  async deleteTranscriptionModel(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/transcription/models/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  },

  async selectTranscriptionModel(id: string): Promise<TranscriptionModel> {
    const res = await fetch(`${API_BASE}/transcription/models/${encodeURIComponent(id)}/select`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to select model');
    return data.activeModel;
  },

  async getTranscriptionEngineStatus(): Promise<TranscriptionEngineStatus> {
    const res = await fetch(`${API_BASE}/transcription/status`);
    const data = await res.json();
    return data.status;
  },

  async installPythonPackages(): Promise<{ success: boolean; output: string }> {
    const res = await fetch(`${API_BASE}/transcription/install-packages`, {
      method: 'POST'
    });
    const data = await res.json();
    return data;
  },

  async transcribeLiveChunk(payload: {
    blob: Blob;
    offsetSeconds?: number;
    model?: string;
    language?: string;
  }): Promise<TranscriptLine[]> {
    try {
      const formData = new FormData();
      formData.append('audio', payload.blob, 'chunk.webm');
      if (payload.offsetSeconds !== undefined) formData.append('offsetSeconds', String(payload.offsetSeconds));
      if (payload.model) formData.append('model', payload.model);
      if (payload.language) formData.append('language', payload.language);

      const res = await fetch(`${API_BASE}/transcription/live-chunk`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.segments || [];
    } catch {
      return [];
    }
  },

  async checkUpdate(): Promise<{
    currentVersion: string;
    latestVersion: string;
    hasUpdate: boolean;
    releaseName?: string;
    releaseNotes?: string;
    releaseUrl: string;
    repoUrl: string;
    publishedAt?: string;
    latestCommit?: { sha: string; message: string; date: string; url: string };
  }> {
    try {
      const res = await fetch(`${API_BASE}/settings/check-update`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {}

    // Fallback: direct browser fetch to GitHub
    try {
      const ghRes = await fetch('https://api.github.com/repos/shareefmx/minomeet/releases/latest');
      if (ghRes.ok) {
        const data = await ghRes.json();
        return {
          currentVersion: 'v1.2.0',
          latestVersion: data.tag_name || 'v1.2.0',
          hasUpdate: (data.tag_name || 'v1.2.0').replace(/^v/, '') > '1.2.0',
          releaseName: data.name,
          releaseNotes: data.body,
          releaseUrl: data.html_url || 'https://github.com/shareefmx/minomeet/releases',
          repoUrl: 'https://github.com/shareefmx/minomeet',
          publishedAt: data.published_at
        };
      }
    } catch {}

    return {
      currentVersion: 'v1.2.0',
      latestVersion: 'v1.2.0',
      hasUpdate: false,
      releaseUrl: 'https://github.com/shareefmx/minomeet/releases',
      repoUrl: 'https://github.com/shareefmx/minomeet'
    };
  }
};


