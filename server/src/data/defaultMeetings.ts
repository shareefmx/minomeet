import { Meeting, AppSettings } from '../types/index.js';

export const defaultSettings: AppSettings = {
  notifications: true,
  storagePath: '/Users/you/Minomeet/recordings',
  autoDeleteRecordingsDays: 50,
  saveAudio: true,
  audioFormat: 'MP4',
  audioBitrate: '256k',
  defaultAudioSource: 'mixed',
  selectedMicDeviceId: 'default',
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
  sampleRate: 16000,
  transcriptionEngine: 'Parakeet TDT · Local On-Device',
  liveCaptions: true,
  speakerLabels: true,
  autoSummary: true,
  defaultLanguage: 'English',
  defaultTemplate: 'Standard Meeting Notes & MOM',
  selectedModel: 'gemini-2.5-flash',
  activeAIProvider: 'google',
  aiProviders: {
    google: { apiKey: '', selectedModel: 'gemini-2.5-flash', status: 'not_configured', statusMessage: 'Not configured' },
    openai: { apiKey: '', selectedModel: 'gpt-4o', status: 'not_configured', statusMessage: 'Not configured' },
    anthropic: { apiKey: '', selectedModel: 'claude-3-7-sonnet', status: 'not_configured', statusMessage: 'Not configured' },
    groq: { apiKey: '', selectedModel: 'llama-3.3-70b-versatile', status: 'not_configured', statusMessage: 'Not configured' },
    openrouter: { apiKey: '', selectedModel: 'openai/gpt-4o', status: 'not_configured', statusMessage: 'Not configured' },
    ollama: { baseUrl: 'http://localhost:11434', selectedModel: 'llama3.3:70b', status: 'not_configured', statusMessage: 'Not configured' },
    custom: { baseUrl: 'http://localhost:8000/v1', apiKey: '', selectedModel: 'custom-model', customModelName: 'custom-model', status: 'not_configured', statusMessage: 'Not configured' }
  },
  betaDiarization: true,
  betaAskMeetings: true,
  betaAutoFollowUp: true,
};

export const defaultMeetings: Meeting[] = [];
