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
  keyPlaceholder?: string;
  defaultEndpoint?: string;
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
    id: 'openai',
    name: 'OpenAI',
    category: 'cloud',
    description: 'Industry-standard reasoning and intelligence with GPT-4o, GPT-4o-mini, and o1/o3 reasoning models.',
    keyPlaceholder: 'sk-proj-...',
    requiresKey: true,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Omni Flagship)', tag: 'Recommended', contextWindow: '128k' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Fast & Efficient', contextWindow: '128k' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', tag: 'High Precision', contextWindow: '128k' },
      { id: 'o1', name: 'OpenAI o1', tag: 'Deep Reasoning', contextWindow: '200k' },
      { id: 'o3-mini', name: 'OpenAI o3-mini', tag: 'High-Speed Reasoner', contextWindow: '200k' }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic / Claude',
    category: 'cloud',
    description: 'Nuanced synthesis, deep reasoning, and executive note drafting with Claude 3.7 & 3.5 Sonnet.',
    keyPlaceholder: 'sk-ant-...',
    requiresKey: true,
    models: [
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', tag: 'Hybrid Reasoning', contextWindow: '200k' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', tag: 'State-of-the-Art', contextWindow: '200k' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', tag: 'Ultra-Fast', contextWindow: '200k' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', tag: 'Exhaustive Detail', contextWindow: '200k' }
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    category: 'cloud',
    description: 'Ultra long-context multi-modal reasoning with Gemini 2.5 and 1.5 architectures.',
    keyPlaceholder: 'AIzaSy...',
    requiresKey: true,
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'High-Speed Multimodal', contextWindow: '1M' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tag: 'Frontier Reasoning', contextWindow: '2M' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: '2M Long Context', contextWindow: '2M' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'Lightweight & Quick', contextWindow: '1M' }
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    category: 'cloud',
    description: 'Ultra high-speed LPU inference engine powering open weight models with sub-second latency.',
    keyPlaceholder: 'gsk_...',
    requiresKey: true,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Versatile)', tag: 'Ultra-Fast LPUs', contextWindow: '128k' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Instant)', tag: 'Sub-second Speed', contextWindow: '128k' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', tag: 'MoE Architecture', contextWindow: '32k' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', tag: 'Google Open Weights', contextWindow: '8k' }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'cloud',
    description: 'Unified API routing across 200+ models with automatic failover, load balancing, and competitive rates.',
    keyPlaceholder: 'sk-or-v1-...',
    requiresKey: true,
    models: [
      { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o', tag: 'Unified Route', contextWindow: '128k' },
      { id: 'anthropic/claude-3.7-sonnet', name: 'Anthropic: Claude 3.7 Sonnet', tag: 'Unified Route', contextWindow: '200k' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek: R1 Reasoner', tag: 'Chain-of-Thought', contextWindow: '64k' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta: Llama 3.3 70B Instruct', tag: 'Open Weights', contextWindow: '128k' },
      { id: 'mistralai/mistral-large-2411', name: 'Mistral: Mistral Large 2', tag: 'Flagship', contextWindow: '128k' }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama',
    category: 'local',
    description: 'Connect to private self-hosted models running locally on your machine or private LAN.',
    defaultEndpoint: 'http://127.0.0.1:11434',
    requiresKey: false,
    supportsCustomEndpoint: true,
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
    models: []
  }
];

export const AI_AGENTS_CONFIG: AIAgentDef[] = [
  {
    id: 'mom_synthesis',
    name: 'MOM Synthesis Agent',
    role: 'Executive Summary & Minutes',
    description: 'Synthesizes meeting dialogue into structured executive summaries, decisions, and highlights.'
  },
  {
    id: 'action_items',
    name: 'Action Item Extraction Agent',
    role: 'Task Matrix & Deliverables',
    description: 'Detects task assignees, action deliverables, deadlines, and tracking notes.'
  },
  {
    id: 'ask_meetings',
    name: '"Ask Your Meetings" Q&A Agent',
    role: 'Semantic Search & Chat Assistant',
    description: 'Answers multi-meeting questions across archived transcripts and records.'
  },
  {
    id: 'follow_up_email',
    name: 'Follow-Up Email Agent',
    role: 'Professional Email Composer',
    description: 'Drafts concise, professional, and action-oriented follow-up emails for attendees.'
  },
  {
    id: 'title_tagging',
    name: 'Title & Tagging Agent',
    role: 'Contextual Tagging & Naming',
    description: 'Generates concise, informative meeting titles and topic classification tags.'
  }
];

/**
 * Helper to identify transcription, audio, embedding, or non-chat models that cannot be used for text LLM tasks.
 */
export function isNonChatOrTranscriptionModel(modelId?: string): boolean {
  if (!modelId) return false;
  const lower = modelId.toLowerCase();
  if (
    lower.includes('whisper') ||
    lower.includes('parakeet') ||
    lower.includes('nemo') ||
    lower.includes('tdt') ||
    lower.includes('transcription') ||
    lower.includes('tts')
  ) {
    return true;
  }
  if (
    lower.includes('embedding') ||
    lower.includes('embed') ||
    lower.includes('moderation') ||
    lower.includes('dall-e') ||
    lower.includes('flux') ||
    lower.includes('stable-diffusion') ||
    lower.includes('midjourney')
  ) {
    return true;
  }
  return false;
}

/**
 * Returns all available models for a provider, combining predefined defaults with dynamically fetched models.
 */
export function getAvailableModelsForProvider(
  settings: AppSettings | null | undefined,
  providerId: string
): AIModelOption[] {
  const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === providerId);
  const baseModels = provDef ? [...provDef.models] : [];
  const fetched = settings?.aiProviders?.[providerId]?.fetchedModels || [];

  const existingIds = new Set(baseModels.map(m => m.id));
  const dynamicOptions: AIModelOption[] = [];

  // If custom provider, ensure user-configured custom model is available in the options
  if (providerId === 'custom') {
    const customName = settings?.aiProviders?.custom?.customModelName || settings?.aiProviders?.custom?.selectedModel || 'custom-model';
    if (!existingIds.has(customName)) {
      dynamicOptions.push({
        id: customName,
        name: `${customName} (Configured Model)`,
        tag: 'Custom Model'
      });
      existingIds.add(customName);
    }
  }

  for (const mId of fetched) {
    if (!existingIds.has(mId) && !isNonChatOrTranscriptionModel(mId)) {
      dynamicOptions.push({
        id: mId,
        name: mId,
        tag: providerId === 'custom' ? 'Server Model' : 'Live Installed'
      });
      existingIds.add(mId);
    }
  }

  return [...baseModels, ...dynamicOptions];
}

/**
 * Resolves the AI model for any agent dynamically based on priority:
 * 1. Agent-specific override (if enabled)
 * 2. Global default configuration
 * 3. Strict error if not configured/usable
 */
export function resolveModel(settings: AppSettings | null | undefined, agentId: string): ResolvedAIModel {
  // 1. Check if agent-specific override is enabled and configured
  const override = settings?.agentOverrides?.[agentId];
  if (override && override.useGlobal === false && override.providerId && override.modelId) {
    const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === override.providerId) || AI_PROVIDERS_CONFIG[0];
    const cred = settings?.aiProviders?.[override.providerId];
    
    let resolvedModelId = override.modelId;
    if (isNonChatOrTranscriptionModel(resolvedModelId)) {
      resolvedModelId = provDef.models[0]?.id || 'gemini-2.5-flash';
    }

    let isUsable = true;
    let status: AIConnectionStatus = cred?.status || 'not_configured';
    let error: string | undefined = undefined;

    if (override.providerId === 'ollama') {
      const fetched = cred?.fetchedModels || [];
      if (status !== 'connected' && fetched.length === 0) {
        status = 'not_configured';
        isUsable = false;
        error = `Ollama model '${resolvedModelId}' has not been verified. Click 'Test Connection' or 'Fetch Models'.`;
      } else if (fetched.length > 0 && !fetched.includes(resolvedModelId)) {
        status = 'invalid';
        isUsable = false;
        error = `Selected Ollama model '${resolvedModelId}' is not installed. Fetch models or choose another model.`;
      }
    } else if (override.providerId === 'custom') {
      resolvedModelId = cred?.customModelName || cred?.selectedModel || override.modelId || 'custom-model';
      const customUrl = cred?.baseUrl || provDef.defaultEndpoint;
      if (customUrl && customUrl.trim().length > 0) {
        status = cred?.status || 'connected';
        isUsable = status !== 'invalid';
      } else {
        status = 'not_configured';
        isUsable = false;
        error = 'API Endpoint URL required for Custom OpenAI-Compatible Server.';
      }
    } else if (provDef.requiresKey && (!cred?.apiKey || !cred.apiKey.trim())) {
      status = 'not_configured';
      isUsable = false;
      error = `API Key required for ${provDef.name}. Please enter an API key in Settings.`;
    }

    return {
      agentId,
      providerId: override.providerId,
      providerName: provDef.name,
      modelId: resolvedModelId,
      apiKey: cred?.apiKey,
      baseUrl: cred?.baseUrl || provDef.defaultEndpoint,
      status,
      statusMessage: error || cred?.statusMessage,
      isOverride: true,
      isUsable,
      error
    };
  }

  // 2. Global Default Model Configuration
  const globalProviderId = (settings?.activeAIProvider && settings.activeAIProvider !== 'builtin') ? settings.activeAIProvider : 'google';
  const globalProvDef = AI_PROVIDERS_CONFIG.find(p => p.id === globalProviderId) || AI_PROVIDERS_CONFIG[2] || AI_PROVIDERS_CONFIG[0];
  let globalModelId = settings?.selectedModel || globalProvDef.models[0]?.id || 'gemini-2.5-flash';
  const globalCred = settings?.aiProviders?.[globalProviderId];

  // Migrate legacy model names or non-chat models
  if (!globalModelId || globalModelId.startsWith('Nimbus') || globalModelId.startsWith('Qwen') || isNonChatOrTranscriptionModel(globalModelId)) {
    globalModelId = globalProvDef.models[0]?.id || 'gemini-2.5-flash';
  }

  let isUsable = true;
  let status: AIConnectionStatus = globalCred?.status || (globalCred?.apiKey ? 'connected' : 'not_configured');
  let error: string | undefined = undefined;

  if (globalProviderId === 'ollama') {
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
    globalModelId = globalCred?.customModelName || globalCred?.selectedModel || (settings?.selectedModel && settings.selectedModel !== 'gemini-2.5-flash' ? settings.selectedModel : undefined) || 'custom-model';
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

/**
 * Resolves the active global default AI provider, model, and connection status for the entire project.
 */
export function getActiveAIModel(settings?: AppSettings | null): ResolvedAIModel {
  return resolveModel(settings, 'global');
}

export function getEffectiveModelForAgent(settings?: AppSettings | null, agentId?: string): ResolvedAIModel {
  return resolveModel(settings, agentId || 'general');
}
