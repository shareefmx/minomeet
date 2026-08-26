export interface TranscriptLine {
  id: string;
  time: string;
  speaker?: string;
  text: string;
}

export interface ActionItem {
  id: string;
  owner: string;
  task: string;
  due: string;
  notes: string;
  completed?: boolean;
}

export interface MOMSummary {
  title: string;
  date: string;
  attendees: string[];
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  discussionHighlights: string[];
  nextSteps?: string[];
  template: string;
  language: string;
  modelUsed: string;
  generatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  duration: string;
  transcript: TranscriptLine[];
  summary?: MOMSummary;
  audioPath?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface AppSettings {
  theme?: 'system' | 'light' | 'dark';
  notifications: boolean;
  storagePath: string;
  autoDeleteRecordingsDays: number;
  saveAudio: boolean;
  audioFormat: string;
  transcriptionEngine: string;
  liveCaptions: boolean;
  speakerLabels: boolean;
  autoSummary: boolean;
  defaultLanguage: string;
  defaultTemplate: string;
  selectedModel: string;
  betaDiarization: boolean;
  betaAskMeetings: boolean;
  betaAutoFollowUp: boolean;
}

export interface SummarizeRequest {
  transcript: TranscriptLine[];
  title?: string;
  template?: string;
  language?: string;
  model?: string;
  customPrompt?: string;
}

export interface AskQuestionRequest {
  query: string;
  meetingId?: string; // If omitted, queries across all meetings
}

export interface AskQuestionResponse {
  answer: string;
  sources: {
    meetingId: string;
    meetingTitle: string;
    snippet: string;
    timestamp?: string;
  }[];
}

export interface FollowUpEmailRequest {
  meetingId: string;
  tone?: 'professional' | 'concise' | 'action-oriented';
  recipientGroup?: string;
}

export interface FollowUpEmailResponse {
  subject: string;
  body: string;
}

export type ModelFamily = 'whisper' | 'parakeet';

export interface TranscriptionModel {
  id: string;
  name: string;
  family: ModelFamily;
  description: string;
  sizeBytes: number;
  sizeFormatted: string;
  ramRequired: string;
  speedRating: string;
  accuracyScore: number;
  recommended?: boolean;
  status: 'not_downloaded' | 'downloading' | 'downloaded';
  downloadProgress?: number;
  downloadedAt?: string;
  localPath?: string;
}

export interface TranscriptionEngineStatus {
  pythonInstalled: boolean;
  pythonVersion?: string;
  whisperInstalled: boolean;
  torchInstalled: boolean;
  ffmpegInstalled: boolean;
  activeModelId: string;
  modelsDir: string;
  totalModelsDownloaded: number;
}

export interface MOMTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  sections: string[];
  promptInstructions: string;
  isDefault?: boolean;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

