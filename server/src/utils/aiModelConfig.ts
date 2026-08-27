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
    defaultEndpoint: 'http://localhost:11434',
    requiresKey: false,
    supportsCustomEndpoint: true,
    supportsFetchModels: true,
    models: [
      { id: 'llama3.3:70b', name: 'Llama 3.3 70B', tag: 'Local High Precision', contextWindow: '128k' },
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B', tag: 'Local Standard', contextWindow: '128k' },
      { id: 'qwen2.5:14b', name: 'Qwen 2.5 14B', tag: 'Multilingual & Code', contextWindow: '128k' },
      { id: 'mistral:7b', name: 'Mistral 7B', tag: 'Compact Local', contextWindow: '32k' }
    ]
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
    models: [
      { id: 'custom-model', name: 'Custom Model Name', tag: 'User Specified', contextWindow: 'Dynamic' }
    ]
  },
  {
    id: 'builtin',
    name: 'Built-in / Local AI (Nimbus)',
    category: 'local',
    description: '100% offline neural synthesis embedded directly into Minomeet. Zero cloud network calls or keys needed.',
    requiresKey: false,
    models: [
      { id: 'Nimbus 4B (High Quality)', name: 'Nimbus 4B (High Quality)', tag: 'Recommended Local', contextWindow: '32k' },
      { id: 'Nimbus 2B (Balanced)', name: 'Nimbus 2B (Balanced)', tag: 'Modest Footprint', contextWindow: '32k' },
      { id: 'Nimbus 1B (Fast)', name: 'Nimbus 1B (Fast)', tag: 'Lightweight & Swift', contextWindow: '32k' }
    ]
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
 * Resolves the effective provider, model, and connection status for any agent.
 */
export function getEffectiveModelForAgent(settings?: AppSettings | null, agentId?: string): {
  providerId: string;
  providerName: string;
  modelId: string;
  status: AIConnectionStatus;
  statusMessage?: string;
  isOverride: boolean;
} {
  const globalProviderId = settings?.activeAIProvider || 'builtin';
  const globalModelId = settings?.selectedModel || 'Nimbus 4B (High Quality)';
  const globalProvider = AI_PROVIDERS_CONFIG.find(p => p.id === globalProviderId) || AI_PROVIDERS_CONFIG[7];
  const globalCred = settings?.aiProviders?.[globalProviderId];
  const globalStatus: AIConnectionStatus = globalCred?.status || (globalProviderId === 'builtin' ? 'connected' : 'not_configured');

  if (!agentId || !settings?.agentOverrides?.[agentId]) {
    return {
      providerId: globalProviderId,
      providerName: globalProvider.name,
      modelId: globalModelId,
      status: globalStatus,
      statusMessage: globalCred?.statusMessage,
      isOverride: false
    };
  }

  const override = settings.agentOverrides[agentId];
  if (override.modelId && override.modelId !== 'use_default') {
    const provId = override.providerId && override.providerId !== 'use_default' ? override.providerId : globalProviderId;
    const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === provId) || globalProvider;
    const provCred = settings.aiProviders?.[provId];
    return {
      providerId: provId,
      providerName: provDef.name,
      modelId: override.modelId,
      status: provCred?.status || (provId === 'builtin' ? 'connected' : 'not_configured'),
      statusMessage: provCred?.statusMessage,
      isOverride: true
    };
  }

  return {
    providerId: globalProviderId,
    providerName: globalProvider.name,
    modelId: globalModelId,
    status: globalStatus,
    statusMessage: globalCred?.statusMessage,
    isOverride: false
  };
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

  for (const mId of fetched) {
    if (!existingIds.has(mId)) {
      dynamicOptions.push({
        id: mId,
        name: mId,
        tag: 'Live Fetched'
      });
      existingIds.add(mId);
    }
  }

  return [...baseModels, ...dynamicOptions];
}
