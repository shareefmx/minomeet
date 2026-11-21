import { AppSettings, AIConnectionStatus } from '../types/index.js';

export interface AIModelOption {
  id: string;
  name: string;
  tag?: string;
  contextWindow?: string;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  category: 'cloud' | 'local' | 'custom';
  description: string;
  defaultEndpoint?: string;
  keyPlaceholder?: string;
  requiresKey: boolean;
  supportsCustomEndpoint?: boolean;
  supportsFetchModels?: boolean;
  models: AIModelOption[];
}

export interface AIAgentDef {
  id: string;
  name: string;
  role: string;
  description: string;
  recommendedModelTag?: string;
}

export interface ResolvedAIModel {
  agentId: string;
  providerId: string;
  providerName: string;
  modelId: string;
  apiKey?: string;
  baseUrl?: string;
  status: AIConnectionStatus;
  statusMessage?: string;
  isOverride: boolean;
  isUsable: boolean;
  error?: string;
}

export const AI_PROVIDERS_CONFIG: AIProviderConfig[] = [
  {
    id: 'builtin-ai',
    name: 'Built-in Neural AI (Local)',
    category: 'local',
    description: '100% private, on-device AI running quantized GGUF neural models directly on your hardware. Zero cloud latency or telemetry.',
    requiresKey: false,
    models: [
      { id: 'qwen3.5:4b', name: 'Qwen 3.5 4B (High Quality)', tag: 'Recommended (On-Device)', contextWindow: '32k' }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    category: 'local',
    description: 'Connect to private self-hosted models running locally on your machine or private LAN.',
    defaultEndpoint: 'http://127.0.0.1:11434',
    requiresKey: false,
    supportsCustomEndpoint: true,
    supportsFetchModels: true,
    models: []
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'cloud',
    description: 'Industry-standard reasoning and intelligence with GPT-4o, GPT-4o-mini, and o1/o3 reasoning models.',
    keyPlaceholder: 'sk-proj-...',
    requiresKey: true,
    supportsFetchModels: true,
    models: []
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'cloud',
    description: 'Nuanced synthesis, deep reasoning, and executive note drafting with Claude 3.7 & 3.5 Sonnet.',
    keyPlaceholder: 'sk-ant-...',
    requiresKey: true,
    supportsFetchModels: true,
    models: []
  },
  {
    id: 'google',
    name: 'Google Gemini',
    category: 'cloud',
    description: 'Ultra long-context multi-modal reasoning with Gemini 2.5 and 1.5 architectures.',
    keyPlaceholder: 'AIzaSy...',
    requiresKey: true,
    supportsFetchModels: true,
    models: []
  },
  {
    id: 'groq',
    name: 'Groq',
    category: 'cloud',
    description: 'Ultra high-speed LPU inference engine powering open weight models with sub-second latency.',
    keyPlaceholder: 'gsk_...',
    requiresKey: true,
    supportsFetchModels: true,
    models: []
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'cloud',
    description: 'Unified API routing across 200+ models with automatic failover, load balancing, and competitive rates.',
    keyPlaceholder: 'sk-or-v1-...',
    requiresKey: true,
    supportsFetchModels: true,
    models: []
  },
  {
    id: 'custom',
    name: 'Custom OpenAI-Compatible Server',
    category: 'custom',
    description: 'Connect to any OpenAI-compatible API endpoint (vLLM, LM Studio, Together AI, DeepSeek, LocalAI).',
    defaultEndpoint: 'http://localhost:8000/v1',
    keyPlaceholder: 'Optional API Key (if required)',
    requiresKey: false,
    supportsCustomEndpoint: true,
    supportsFetchModels: true,
    models: []
  }
];

export const AI_AGENTS_CONFIG: AIAgentDef[] = [
  {
    id: 'mom_synthesis',
    name: 'MOM Synthesis Agent',
    role: 'Executive Summary & Minutes',
    description: 'Synthesizes meeting dialogue into structured executive summaries, decisions, and highlights.',
    recommendedModelTag: 'Requires High Coherence'
  },
  {
    id: 'action_items',
    name: 'Action Items Agent',
    role: 'Task Extraction & Ownership',
    description: 'Extracts action items, assignees, deadlines, and deliverables with high precision.',
    recommendedModelTag: 'Requires Structured Output'
  },
  {
    id: 'ask_ai',
    name: 'Ask AI Assistant',
    role: 'Meeting Q&A & Analysis',
    description: 'Interactively answers questions, searches topics, and analyzes context from recorded transcripts.',
    recommendedModelTag: 'Requires Fast Latency'
  }
];

export function isNonChatOrTranscriptionModel(modelId: string): boolean {
  const lower = modelId.toLowerCase();
  if (
    lower.includes('whisper') ||
    lower.includes('audio') ||
    lower.includes('tts') ||
    lower.includes('stt') ||
    lower.includes('speech') ||
    lower.includes('parakeet')
  ) {
    return true;
  }
  if (
    lower.includes('embed') ||
    lower.includes('similarity') ||
    lower.includes('bge-') ||
    lower.includes('e5-') ||
    lower.includes('instructor')
  ) {
    return true;
  }
  if (lower.includes('moderat') || lower.includes('guard')) {
    return true;
  }
  if (
    lower.includes('dall-e') ||
    lower.includes('imagen') ||
    lower.includes('midjourney') ||
    lower.includes('stable-diffusion') ||
    lower.includes('flux')
  ) {
    return true;
  }
  if (
    lower.includes('babbage') ||
    lower.includes('davinci') ||
    lower.includes('curie') ||
    lower.includes('ada')
  ) {
    return true;
  }
  return false;
}

export function getAvailableModelsForProvider(
  settings: AppSettings | null | undefined,
  providerId: string
): AIModelOption[] {
  const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === providerId);
  const baseModels = provDef ? [...provDef.models] : [];
  const fetched = settings?.aiProviders?.[providerId]?.fetchedModels || [];

  const existingIds = new Set(baseModels.map(m => m.id));
  const dynamicOptions: AIModelOption[] = [];

  for (const mId of fetched) {
    if (!existingIds.has(mId) && !isNonChatOrTranscriptionModel(mId)) {
      dynamicOptions.push({
        id: mId,
        name: mId,
        tag: providerId === 'custom' ? 'Server Model' : 'Live Available'
      });
      existingIds.add(mId);
    }
  }

  return [...baseModels, ...dynamicOptions];
}

export function resolveModel(settings: AppSettings | null | undefined, agentId: string): ResolvedAIModel {
  const globalProviderId = (settings?.activeAIProvider === 'builtin' || settings?.activeAIProvider === 'builtin-ai')
    ? 'builtin-ai'
    : (settings?.activeAIProvider || 'builtin-ai');
  const globalProvDef = AI_PROVIDERS_CONFIG.find(p => p.id === globalProviderId) || AI_PROVIDERS_CONFIG[0];
  let globalModelId = settings?.selectedModel || globalProvDef.models[0]?.id || 'qwen3.5:4b';
  const globalCred = settings?.aiProviders?.[globalProviderId];

  if (!globalModelId || isNonChatOrTranscriptionModel(globalModelId)) {
    globalModelId = globalProvDef.models[0]?.id || 'qwen3.5:4b';
  }

  let isUsable = true;
  let status: AIConnectionStatus = globalCred?.status || (globalCred?.apiKey ? 'connected' : 'not_configured');
  let error: string | undefined = undefined;

  if (globalProviderId === 'builtin-ai') {
    status = 'connected';
    isUsable = true;
    error = undefined;
  } else if (globalProviderId === 'ollama') {
    const fetched = globalCred?.fetchedModels || [];
    if (status !== 'connected' && fetched.length === 0) {
      status = 'not_configured';
      isUsable = false;
      error = `Ollama model '${globalModelId}' has not been verified. Click 'Test Connection' or 'Fetch Models'.`;
    } else if (fetched.length > 0 && !fetched.includes(globalModelId)) {
      status = 'invalid';
      isUsable = false;
      error = `Selected Ollama model '${globalModelId}' is not installed. Fetch models or choose another model.`;
    }
  } else if (globalProviderId === 'custom') {
    globalModelId = globalCred?.selectedModel || settings?.selectedModel || 'custom-model';
    const customUrl = globalCred?.baseUrl || globalProvDef.defaultEndpoint;
    if (customUrl && customUrl.trim().length > 0) {
      status = globalCred?.status || 'connected';
      isUsable = status !== 'invalid';
    } else {
      status = 'not_configured';
      isUsable = false;
      error = 'API Endpoint URL required for Custom OpenAI-Compatible Server.';
    }
  } else if (globalProvDef.requiresKey && (!globalCred?.apiKey || !globalCred.apiKey.trim())) {
    status = 'not_configured';
    isUsable = false;
    error = `API Key required for ${globalProvDef.name}. Please enter your API key in Settings.`;
  }

  return {
    agentId,
    providerId: globalProviderId,
    providerName: globalProvDef.name,
    modelId: globalModelId,
    apiKey: globalCred?.apiKey,
    baseUrl: globalCred?.baseUrl || globalProvDef.defaultEndpoint,
    status,
    statusMessage: error || globalCred?.statusMessage,
    isOverride: false,
    isUsable,
    error
  };
}

export function getActiveAIModel(settings?: AppSettings | null): ResolvedAIModel {
  return resolveModel(settings, 'global');
}

export function getEffectiveModelForAgent(settings?: AppSettings | null, agentId?: string): ResolvedAIModel {
  return resolveModel(settings, agentId || 'general');
}
