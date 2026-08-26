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
  theme?: 'system' | 'light' | 'dark';
  betaDiarization: boolean;
  betaAskMeetings: boolean;
  betaAutoFollowUp: boolean;
}

export type ScreenType = 'home' | 'recording' | 'notes' | 'settings';

export type SettingsTab = 'recording' | 'transcription' | 'model' | 'summary' | 'templates' | 'appearance' | 'general' | 'beta';

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  type: 'success' | 'info' | 'warning' | 'error';
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


