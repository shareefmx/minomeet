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

export type AIConnectionStatus = 'not_configured' | 'testing' | 'connected' | 'invalid' | 'error';

export interface ProviderCredential {
  apiKey?: string;
  baseUrl?: string;
  selectedModel?: string;
  customModelName?: string;
  fetchedModels?: string[];
  status: AIConnectionStatus;
  statusMessage?: string;
  lastTested?: string;
}

export interface AIAgentOverride {
  agentId: string;
  providerId?: string;
  modelId?: string;
}

export interface AppSettings {
  theme?: 'system' | 'light' | 'dark';
  notifications: boolean;
  storagePath: string;
  autoDeleteRecordingsDays: number;
  saveAudio: boolean;
  audioFormat: string;
  audioBitrate?: '128k' | '256k' | '320k';
  defaultAudioSource?: 'mic' | 'system' | 'mixed';
  selectedMicDeviceId?: string;
  noiseSuppression?: boolean;
  echoCancellation?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
  transcriptionEngine: string;
  liveCaptions: boolean;
  speakerLabels: boolean;
  autoSummary: boolean;
  defaultLanguage: string;
  defaultTemplate: string;
  selectedModel: string;
  activeAIProvider?: string;
  aiProviders?: Record<string, ProviderCredential>;
  agentOverrides?: Record<string, AIAgentOverride>;
  betaDiarization: boolean;
  betaAskMeetings: boolean;
  betaAutoFollowUp: boolean;
}

export type ScreenType = 'home' | 'recording' | 'notes' | 'settings';

export type SettingsTab = 'recording' | 'transcription' | 'model' | 'summary' | 'templates' | 'general' | 'beta';

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

export interface StorageStats {
  audioFilesCount: number;
  audioStorageBytes: number;
  audioStorageFormatted: string;
  modelsCount: number;
  modelsStorageBytes: number;
  modelsStorageFormatted: string;
  dbSizeBytes: number;
  dbSizeFormatted: string;
  realUploadsPath: string;
  realModelsPath: string;
  realDataPath: string;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  sources?: {
    meetingId: string;
    meetingTitle: string;
    snippet: string;
    timestamp?: string;
    type?: 'summary' | 'decision' | 'action_item' | 'transcript' | 'highlight';
  }[];
  suggestedFollowUps?: string[];
}

export interface AskQuestionRequest {
  query: string;
  meetingId?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  mode?: 'all' | 'action_items' | 'decisions' | 'attendees' | 'summary';
}

export interface AskQuestionResponse {
  answer: string;
  sources: {
    meetingId: string;
    meetingTitle: string;
    snippet: string;
    timestamp?: string;
    type?: 'summary' | 'decision' | 'action_item' | 'transcript' | 'highlight';
  }[];
  suggestedFollowUps?: string[];
  modelUsed?: string;
}


