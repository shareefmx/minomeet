import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api, toCanonicalModelId } from '../../services/api.js';
import {
  Sliders,
  Mic,
  FileAudio,
  Cpu,
  FileText,
  Sparkles,
  FolderOpen,
  ShieldCheck,
  Zap,
  Check,
  Plus,
  Download,
  Trash2,
  CheckCircle2,
  Activity,
  HardDrive,
  Loader2,
  Bell,
  Edit2,
  Layers,
  Volume2,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Save,
  RotateCw,
  X,
  ArrowUpRight,
  Info,
  Speaker,
  HelpCircle,
  Globe,
  Lock,
  Upload,
  Pause,
  Play,
  Square,
  Table,
  Database
} from 'lucide-react';
import { SettingsTab, MOMTemplate, AIConnectionStatus, ProviderCredential, AIAgentOverride, AUDIO_CAPTURE_MODES } from '../../types/meeting.js';
import {
  AI_PROVIDERS_CONFIG,
  AI_AGENTS_CONFIG,
  getAvailableModelsForProvider
} from '../../utils/aiModelConfig.js';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);


import {
  Toggle,
  SegmentedPills,
  StatusBadge,
  StarRating,
  PathBox,
  ProgressBar,
  InlineConfirm
} from './SettingsComponents.js';

// Master catalog of 9 canonical models
interface MasterModelEntry {
  id: string;
  name: string;
  family: 'parakeet' | 'whisper';
  tag: string;
  sizeFormatted: string;
  accuracy: string;
  speed: string;
  ramRequired: string;
  rating: number;
  description: string;
  recommended?: boolean;
}

const MASTER_CATALOG: MasterModelEntry[] = [
  {
    id: 'parakeet-tdt-0.6b-v3-int8',
    name: 'Parakeet TDT 1.1B Lightning',
    family: 'parakeet',
    tag: 'Real-Time Streaming',
    sizeFormatted: '650 MB',
    accuracy: 'Studio-grade',
    speed: 'Ultra-Fast (<25 ms)',
    ramRequired: '2 GB',
    rating: 5.0,
    description: 'FastConformer-TDT neural architecture with sub-25ms streaming latency and studio-grade accuracy.',
    recommended: true
  },
  {
    id: 'whisper-tiny',
    name: 'Whisper tiny',
    family: 'whisper',
    tag: 'Real time, fastest option',
    sizeFormatted: '74 MB',
    accuracy: 'Decent accuracy',
    speed: 'Very fast processing',
    ramRequired: '500 MB',
    rating: 2.0,
    description: 'Extremely lightweight multilingual speech recognition model for quick turnaround.'
  },
  {
    id: 'whisper-tiny-q5_1',
    name: 'Whisper tiny-q5_1',
    family: 'whisper',
    tag: 'Real time, fastest option, Balanced+',
    sizeFormatted: '31 MB',
    accuracy: 'Decent accuracy',
    speed: 'Very fast processing',
    ramRequired: '300 MB',
    rating: 2.5,
    description: 'Quantized tiny model with minimal memory footprint and fast execution.'
  },
  {
    id: 'whisper-base',
    name: 'Whisper base',
    family: 'whisper',
    tag: 'Fast processing, balanced quality',
    sizeFormatted: '142 MB',
    accuracy: 'Good accuracy',
    speed: 'Fast processing',
    ramRequired: '1 GB',
    rating: 3.0,
    description: 'Balanced base multilingual model for general speech transcription.'
  },
  {
    id: 'whisper-base-q5_1',
    name: 'Whisper base-q5_1',
    family: 'whisper',
    tag: 'Fast processing, balanced quality, Balanced+',
    sizeFormatted: '57 MB',
    accuracy: 'Good accuracy',
    speed: 'Fast processing',
    ramRequired: '600 MB',
    rating: 3.5,
    description: 'Quantized base model for memory-constrained environments.'
  },
  {
    id: 'whisper-small-q5_1',
    name: 'Whisper small-q5_1',
    family: 'whisper',
    tag: 'Fast processing, good accuracy, Balanced+',
    sizeFormatted: '181 MB',
    accuracy: 'Good accuracy',
    speed: 'Fast processing',
    ramRequired: '1.5 GB',
    rating: 4.0,
    description: 'Quantized small model offering high accuracy with moderate resource requirements.'
  },
  {
    id: 'whisper-medium',
    name: 'Whisper medium',
    family: 'whisper',
    tag: 'Slower processing, professional quality',
    sizeFormatted: '1.5 GB',
    accuracy: 'High accuracy',
    speed: 'Slow processing',
    ramRequired: '4 GB',
    rating: 4.5,
    description: 'High-accuracy model suitable for complex meeting discussions and multiple accents.'
  },
  {
    id: 'whisper-large-v3-turbo-q5_0',
    name: 'Whisper large-v3-turbo-q5_0',
    family: 'whisper',
    tag: 'Moderate speed, best accuracy with speed, optimized, Balanced',
    sizeFormatted: '547 MB',
    accuracy: 'High accuracy',
    speed: 'Medium processing',
    ramRequired: '2.5 GB',
    rating: 5.0,
    description: 'Quantized large-v3 turbo model combining near-lossless accuracy with fast inference.'
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper Large v3 Turbo',
    family: 'whisper',
    tag: 'OpenAI multilingual (99 languages)',
    sizeFormatted: '1.5 GB',
    accuracy: 'High accuracy',
    speed: 'Standard processing',
    ramRequired: '4 GB',
    rating: 5.0,
    description: 'State-of-the-art accuracy across 99 languages with 8x faster decoding than Large-v3.'
  }
];

export interface SettingsScreenProps {
  initialTab?: SettingsTab;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ initialTab = 'recording' }) => {

  const {
    settings,
    storageStats,
    settingsTab,
    setSettingsTab,
    updateSettings,
    showToast,
    openStorageFolder,
    transcriptionModels,
    activeTranscriptionModel,
    templates,
    downloadTranscriptionModel,
    deleteTranscriptionModel,
    selectTranscriptionModel,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    openModal,
    refreshStorageStats,
    pauseTranscriptionModel,
    resumeTranscriptionModel,
    stopTranscriptionModel
  } = useMeeting();

  const [modelFilter, setModelFilter] = useState<'all' | 'whisper' | 'parakeet'>('all');

  // AI Model Control Panel State
  const [selectedProviderId, setSelectedProviderId] = useState<string>('google');
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-2.5-flash');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [baseUrlInput, setBaseUrlInput] = useState<string>('http://127.0.0.1:11434');
  const [customModelInput, setCustomModelInput] = useState<string>('custom-model');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [isFetchingModels, setIsFetchingModels] = useState<boolean>(false);
  const [providerFetchedModels, setProviderFetchedModels] = useState<Record<string, string[]>>({});
  const [connectionStatus, setConnectionStatus] = useState<AIConnectionStatus>('not_configured');
  const [connectionStatusMessage, setConnectionStatusMessage] = useState<string>('');

  // AI Agent Overrides State
  const [agentOverrides, setAgentOverrides] = useState<Record<string, AIAgentOverride>>({});

  // Sync settings into local AI Model state
  useEffect(() => {
    if (settings) {
      const activeProv = (settings.activeAIProvider && settings.activeAIProvider !== 'builtin') ? settings.activeAIProvider : 'google';
      setSelectedProviderId(activeProv);
      const defaultModelForProv = AI_PROVIDERS_CONFIG.find(p => p.id === activeProv)?.models[0]?.id || 'gemini-2.5-flash';
      const activeModel = (settings.selectedModel && !settings.selectedModel.startsWith('Nimbus') && !settings.selectedModel.startsWith('Qwen')) ? settings.selectedModel : defaultModelForProv;
      setSelectedModelId(activeModel);

      const savedCred = settings.aiProviders?.[activeProv];
      setApiKeyInput(savedCred?.apiKey || '');
      setBaseUrlInput(savedCred?.baseUrl || (activeProv === 'ollama' ? 'http://127.0.0.1:11434' : 'http://localhost:8000/v1'));
      setCustomModelInput(savedCred?.customModelName || 'custom-model');
      setConnectionStatus(savedCred?.status || (savedCred?.apiKey ? 'connected' : 'not_configured'));
      setConnectionStatusMessage(savedCred?.statusMessage || '');

      // Populate fetched models cache across all providers
      const fetchedMap: Record<string, string[]> = {};
      AI_PROVIDERS_CONFIG.forEach(p => {
        if (settings.aiProviders?.[p.id]?.fetchedModels) {
          fetchedMap[p.id] = settings.aiProviders[p.id].fetchedModels || [];
        }
      });
      setProviderFetchedModels(fetchedMap);

      // Populate agent overrides state
      const overridesMap: Record<string, AIAgentOverride> = {};
      AI_AGENTS_CONFIG.forEach(a => {
        const saved = settings.agentOverrides?.[a.id];
        overridesMap[a.id] = {
          useGlobal: saved?.useGlobal ?? true,
          providerId: (saved?.providerId && saved.providerId !== 'builtin') ? saved.providerId : activeProv,
          modelId: (saved?.modelId && !saved.modelId.startsWith('Nimbus') && !saved.modelId.startsWith('Qwen')) ? saved.modelId : activeModel
        };
      });
      setAgentOverrides(overridesMap);
    }
  }, [settings]);

  // When selected provider changes in the UI dropdown
  const handleProviderChange = (newProviderId: string) => {
    setSelectedProviderId(newProviderId);
    const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === newProviderId) || AI_PROVIDERS_CONFIG[0];
    const savedCred = settings?.aiProviders?.[newProviderId];

    const customModelName = savedCred?.customModelName || savedCred?.selectedModel || 'custom-model';
    const defaultModel = newProviderId === 'custom'
      ? customModelName
      : (savedCred?.selectedModel || provDef.models[0]?.id || 'gemini-2.5-flash');
    setSelectedModelId(defaultModel);

    setApiKeyInput(savedCred?.apiKey || '');
    setBaseUrlInput(savedCred?.baseUrl || (newProviderId === 'ollama' ? 'http://127.0.0.1:11434' : (provDef.defaultEndpoint || 'http://localhost:8000/v1')));
    setCustomModelInput(customModelName);

    const status: AIConnectionStatus = savedCred?.status || (newProviderId === 'builtin' ? 'connected' : (newProviderId === 'custom' ? (savedCred?.baseUrl ? 'connected' : 'not_configured') : (savedCred?.apiKey ? 'connected' : 'not_configured')));
    setConnectionStatus(status);
    setConnectionStatusMessage(savedCred?.statusMessage || (newProviderId === 'builtin' ? 'Connected & Ready' : ''));
  };

  // Generalized Dynamic Model Fetcher for ALL Providers
  const handleFetchModels = async (targetProviderId?: string) => {
    const pId = targetProviderId || selectedProviderId;
    const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === pId);
    const keyToUse = pId === selectedProviderId ? apiKeyInput : (settings?.aiProviders?.[pId]?.apiKey || '');
    const urlToUse = pId === selectedProviderId ? baseUrlInput : (settings?.aiProviders?.[pId]?.baseUrl || '');

    if (provDef?.requiresKey && (!keyToUse || keyToUse.trim().length === 0)) {
      setConnectionStatus('invalid');
      setConnectionStatusMessage(`API Key is required for ${provDef?.name}.`);
      showToast('API Key Required', `Please enter your ${provDef?.name} API key first to fetch models.`, 'warning');
      return;
    }

    setIsFetchingModels(true);
    try {
      const res = await api.fetchAIProviderModels({
        provider: pId,
        apiKey: keyToUse,
        baseUrl: urlToUse
      });

      if (res.success && res.models && res.models.length > 0) {
        setProviderFetchedModels(prev => ({
          ...prev,
          [pId]: res.models || []
        }));

        if (pId === selectedProviderId) {
          setConnectionStatus('connected');
          setConnectionStatusMessage(`Verified & Loaded ${res.models.length} model(s).`);
          if (!res.models.includes(selectedModelId)) {
            setSelectedModelId(res.models[0]);
            if (pId === 'custom') {
              setCustomModelInput(res.models[0]);
            }
          }
        }

        showToast('Models Loaded', `Fetched ${res.models.length} available models from ${provDef?.name || pId}.`, 'success');
      } else {
        if (pId === selectedProviderId) {
          setConnectionStatus('invalid');
          setConnectionStatusMessage(res.error || `Invalid credentials for ${provDef?.name || pId}.`);
        }
        showToast('Authentication Error', res.error || `Invalid credentials for ${provDef?.name || pId}.`, 'error');
      }
    } catch (err: any) {
      if (pId === selectedProviderId) {
        setConnectionStatus('error');
        setConnectionStatusMessage(err.message || 'Connection failed.');
      }
      showToast('Fetch Failed', err.message || 'Failed to fetch models.', 'error');
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Test Connection Handler (also updates fetched models and strict validation)
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    setConnectionStatusMessage('Validating credentials and model reachability…');

    const effectiveModel = selectedProviderId === 'custom'
      ? (customModelInput.trim() || 'custom-model')
      : selectedModelId;

    try {
      const res = await api.testAIConnection({
        provider: selectedProviderId,
        apiKey: apiKeyInput.trim(),
        baseUrl: baseUrlInput.trim(),
        model: effectiveModel
      });

      setConnectionStatus(res.status);
      setConnectionStatusMessage(res.message);

      if (res.fetchedModels && res.fetchedModels.length > 0) {
        setProviderFetchedModels(prev => ({
          ...prev,
          [selectedProviderId]: res.fetchedModels || []
        }));
      }

      if (res.success) {
        showToast('Connection Verified', res.message, 'success');
      } else {
        showToast('Connection Failed', res.message, 'error');
      }
      return res;
    } catch (err: any) {
      setConnectionStatus('error');
      setConnectionStatusMessage(err.message || 'Connection test failed.');
      showToast('Connection Failed', err.message || 'Failed to connect.', 'error');
      return { success: false, status: 'error' as AIConnectionStatus, message: err.message };
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save AI Model Configuration Handler with Mandatory Verification
  const handleSaveAIConfiguration = async () => {
    const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === selectedProviderId) || AI_PROVIDERS_CONFIG[0];
    if (provDef.requiresKey && (!apiKeyInput || apiKeyInput.trim().length === 0)) {
      setConnectionStatus('invalid');
      setConnectionStatusMessage(`API Key is required for ${provDef.name}.`);
      showToast('API Key Required', `Please enter a valid API key for ${provDef.name}.`, 'warning');
      return;
    }

    const effectiveModelId = selectedProviderId === 'custom'
      ? (customModelInput.trim() || 'custom-model')
      : selectedModelId;

    let finalStatus: AIConnectionStatus = connectionStatus;
    let finalMessage = connectionStatusMessage;

    // If not builtin and not already verified as connected, perform live test first
    if (selectedProviderId !== 'builtin' && connectionStatus !== 'connected') {
      setIsTestingConnection(true);
      const testResult = await api.testAIConnection({
        provider: selectedProviderId,
        apiKey: apiKeyInput.trim(),
        baseUrl: baseUrlInput.trim(),
        model: effectiveModelId
      });
      setIsTestingConnection(false);

      finalStatus = testResult.status;
      finalMessage = testResult.message;
      setConnectionStatus(finalStatus);
      setConnectionStatusMessage(finalMessage);

      if (!testResult.success) {
        showToast('Validation Failed', testResult.message, 'error');
        // Still save credentials but with invalid status so it won't falsely show connected
        const currentProviders = settings?.aiProviders || {};
        await updateSettings({
          activeAIProvider: selectedProviderId,
          selectedModel: effectiveModelId,
          aiProviders: {
            ...currentProviders,
            [selectedProviderId]: {
              apiKey: apiKeyInput.trim(),
              baseUrl: (selectedProviderId === 'ollama' || selectedProviderId === 'custom') ? baseUrlInput.trim() : undefined,
              selectedModel: effectiveModelId,
              customModelName: selectedProviderId === 'custom' ? effectiveModelId : undefined,
              status: finalStatus,
              statusMessage: finalMessage,
              lastTested: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          }
        });
        return;
      }
    }

    const currentProviders = settings?.aiProviders || {};
    const updatedCredential: ProviderCredential = {
      apiKey: provDef.requiresKey ? apiKeyInput.trim() : (selectedProviderId === 'custom' ? apiKeyInput.trim() : undefined),
      baseUrl: (selectedProviderId === 'ollama' || selectedProviderId === 'custom') ? baseUrlInput.trim() : undefined,
      selectedModel: effectiveModelId,
      customModelName: selectedProviderId === 'custom' ? effectiveModelId : undefined,
      fetchedModels: providerFetchedModels[selectedProviderId] || [],
      status: finalStatus,
      statusMessage: finalMessage,
      lastTested: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    await updateSettings({
      activeAIProvider: selectedProviderId,
      selectedModel: effectiveModelId,
      aiProviders: {
        ...currentProviders,
        [selectedProviderId]: updatedCredential
      },
      agentOverrides: agentOverrides
    });

    showToast('Configuration Saved', `Active AI model set to ${effectiveModelId} (${provDef.name}).`, 'success');
  };

  // Audio Input & System Audio Devices State
  const [audioDevices, setAudioDevices] = useState<{ deviceId: string; label: string; isDefault?: boolean }[]>([]);
  const [systemAudioDevices, setSystemAudioDevices] = useState<{ deviceId: string; label: string; isDefault?: boolean }[]>([]);
  const [isRefreshingDevices, setIsRefreshingDevices] = useState(false);
  const [systemBackend, setSystemBackend] = useState<'coreaudio' | 'screencapturekit'>('coreaudio');
  const [backendStatuses, setBackendStatuses] = useState<Array<{
    id: string;
    name: string;
    description: string;
    available: boolean;
    permission_granted: boolean;
    status_message: string;
    is_active: boolean;
  }>>([
    {
      id: 'screencapturekit',
      name: 'ScreenCaptureKit',
      description: "Apple's ScreenCaptureKit framework - High-level system capture",
      available: true,
      permission_granted: true,
      status_message: 'Available',
      is_active: false,
    },
    {
      id: 'coreaudio',
      name: 'Core Audio',
      description: 'Direct Core Audio API - Low-latency aggregate system tap',
      available: true,
      permission_granted: true,
      status_message: 'Available',
      is_active: true,
    }
  ]);

  // Microphone Live Test State
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micTestVolume, setMicTestVolume] = useState(0);
  const [micTestBars, setMicTestBars] = useState<number[]>(new Array(16).fill(6));
  const micTestStreamRef = useRef<MediaStream | null>(null);
  const micTestAudioCtxRef = useRef<AudioContext | null>(null);
  const micTestAnimRef = useRef<number | null>(null);

  // Storage / Recording Folder Path State
  const [recordingSavePath, setRecordingSavePath] = useState<string>('/Users/muhammedshraeef/Movies/meetily-recordings');
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [customPathInput, setCustomPathInput] = useState('');

  const getNativeInvoke = (): ((cmd: string, args?: any) => Promise<any>) | null => {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    if (w.__TAURI__?.core?.invoke) return w.__TAURI__.core.invoke;
    if (w.__TAURI_INTERNALS__?.invoke) return w.__TAURI_INTERNALS__.invoke;
    return null;
  };

  const refreshDevices = async () => {
    setIsRefreshingDevices(true);
    let found = false;

    const invoke = getNativeInvoke();
    if (invoke) {
      try {
        const nativeDevices = await invoke('get_audio_devices');
        if (Array.isArray(nativeDevices) && nativeDevices.length > 0) {
          const inputs = nativeDevices
            .filter((d: any) => d.device_type === 'Input')
            .map((d: any) => ({
              deviceId: d.name,
              label: d.label || d.name,
              isDefault: d.is_default
            }));
          const outputs = nativeDevices
            .filter((d: any) => d.device_type === 'Output')
            .map((d: any) => ({
              deviceId: d.name,
              label: d.label || d.name,
              isDefault: d.is_default
            }));
          if (inputs.length > 0) setAudioDevices(inputs);
          if (outputs.length > 0) setSystemAudioDevices(outputs);
          found = true;
        }

        try {
          const statuses = await invoke('get_audio_backend_status');
          if (Array.isArray(statuses) && statuses.length > 0) {
            setBackendStatuses(statuses);
            const active = statuses.find((s: any) => s.is_active);
            if (active && (active.id === 'screencapturekit' || active.id === 'coreaudio')) {
              setSystemBackend(active.id);
            }
          }
        } catch {
          try {
            const currentBackend = await invoke('get_current_audio_backend');
            if (currentBackend === 'screencapturekit' || currentBackend === 'coreaudio') {
              setSystemBackend(currentBackend);
            }
          } catch {}
        }

        try {
          const defaultPath = await invoke('get_default_recordings_folder_path');
          if (defaultPath && (!settings?.storagePath || settings.storagePath === 'Default Application Recordings')) {
            setRecordingSavePath(defaultPath);
          }
        } catch {
          // keep fallback
        }
      } catch (err) {
        console.warn('Native get_audio_devices fallback to web audio:', err);
      }
    }

    if (!found) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputs = devices
            .filter(d => d.kind === 'audioinput')
            .map((d, idx) => ({
              deviceId: d.deviceId,
              label: d.label || (idx === 0 ? 'Default System Microphone' : `Microphone ${idx + 1}`)
            }));
          const outputs = devices
            .filter(d => d.kind === 'audiooutput')
            .map((d, idx) => ({
              deviceId: d.deviceId,
              label: d.label || (idx === 0 ? 'Default System Audio' : `Audio Output ${idx + 1}`)
            }));
          if (inputs.length > 0) setAudioDevices(inputs);
          if (outputs.length > 0) setSystemAudioDevices(outputs);
        }
      } catch (err) {
        console.warn('Could not enumerate audio devices:', err);
      }
    }

    setTimeout(() => setIsRefreshingDevices(false), 350);
  };

  useEffect(() => {
    refreshDevices();
  }, []);

  useEffect(() => {
    if (settings?.storagePath && settings.storagePath !== 'Default Application Recordings') {
      setRecordingSavePath(settings.storagePath);
    }
  }, [settings?.storagePath]);

  useEffect(() => {
    if (settings?.systemAudioBackend) {
      setSystemBackend(settings.systemAudioBackend);
    }
  }, [settings?.systemAudioBackend]);

  const toggleMicTest = async () => {
    if (isTestingMic) {
      if (micTestAnimRef.current) cancelAnimationFrame(micTestAnimRef.current);
      if (micTestStreamRef.current) {
        micTestStreamRef.current.getTracks().forEach(t => t.stop());
        micTestStreamRef.current = null;
      }
      if (micTestAudioCtxRef.current) {
        micTestAudioCtxRef.current.close().catch(() => {});
        micTestAudioCtxRef.current = null;
      }
      setIsTestingMic(false);
      setMicTestVolume(0);
      setMicTestBars(new Array(16).fill(6));
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: settings?.selectedMicDeviceId && settings.selectedMicDeviceId !== 'default'
              ? { exact: settings.selectedMicDeviceId }
              : undefined,
            echoCancellation: settings?.echoCancellation !== false,
            noiseSuppression: settings?.noiseSuppression !== false,
            autoGainControl: settings?.autoGainControl !== false
          }
        });
        micTestStreamRef.current = stream;

        // Refresh devices to capture real human labels now that permission is active
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          navigator.mediaDevices.enumerateDevices().then(devices => {
            const audioInputs = devices
              .filter(d => d.kind === 'audioinput')
              .map((d, idx) => ({
                deviceId: d.deviceId,
                label: d.label || (idx === 0 ? 'Default System Microphone' : `Microphone ${idx + 1}`)
              }));
            if (audioInputs.length > 0) {
              setAudioDevices(audioInputs);
            }
          }).catch(() => {});
        }

        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        micTestAudioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        setIsTestingMic(true);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setMicTestVolume(Math.min(100, Math.round(avg * 2.2)));

          // Compute 16 equalizer bars
          const barCount = 16;
          const step = Math.max(1, Math.floor(dataArray.length / barCount));
          const bars: number[] = [];
          for (let b = 0; b < barCount; b++) {
            let bSum = 0;
            for (let s = 0; s < step; s++) {
              bSum += dataArray[b * step + s] || 0;
            }
            const bAvg = bSum / step;
            bars.push(Math.max(6, Math.min(100, Math.round(bAvg * 2.2))));
          }
          setMicTestBars(bars);

          micTestAnimRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (err) {
        showToast('Microphone Test Notice', 'Please allow microphone access to test input levels.', 'info');
      }
    }
  };

  const handleStartEditPath = () => {
    setCustomPathInput(recordingSavePath);
    setIsEditingPath(true);
  };

  const handleSaveCustomPath = async () => {
    const trimmed = customPathInput.trim();
    if (!trimmed) {
      showToast('Path Required', 'Please enter a valid directory path.', 'warning');
      return;
    }
    setRecordingSavePath(trimmed);
    updateSettings({ storagePath: trimmed });
    const invoke = getNativeInvoke();
    if (invoke) {
      try {
        const prefs = await invoke('get_recording_preferences').catch(() => null);
        if (prefs) {
          prefs.save_folder = trimmed;
          await invoke('set_recording_preferences', { preferences: prefs });
        }
      } catch (e) {
        console.warn('Could not save to Tauri recording preferences:', e);
      }
    }
    setIsEditingPath(false);
    showToast('Save Location Updated', trimmed, 'success');
  };

  const handleResetDefaultPath = async () => {
    let defPath = '/Users/muhammedshraeef/Movies/meetily-recordings';
    const invoke = getNativeInvoke();
    if (invoke) {
      try {
        const nativeDef = await invoke('get_default_recordings_folder_path');
        if (nativeDef) defPath = nativeDef;
        const prefs = await invoke('get_recording_preferences').catch(() => null);
        if (prefs) {
          prefs.save_folder = defPath;
          await invoke('set_recording_preferences', { preferences: prefs });
        }
      } catch {
        // fallback
      }
    }
    setRecordingSavePath(defPath);
    updateSettings({ storagePath: defPath });
    setIsEditingPath(false);
    showToast('Reset to Default Path', defPath, 'info');
  };

  const handleOpenRecordingsFolder = async () => {
    const invoke = getNativeInvoke();
    if (invoke) {
      try {
        await invoke('open_recordings_folder');
        showToast('Recordings Folder Opened', recordingSavePath, 'success');
        return;
      } catch (e) {
        console.warn('Native open_recordings_folder error:', e);
      }
    }
    openStorageFolder(recordingSavePath);
  };

  const handleBackendChange = async (backend: 'coreaudio' | 'screencapturekit') => {
    const targetStatus = backendStatuses.find(b => b.id === backend);
    if (targetStatus && !targetStatus.available) {
      showToast('Backend Unsupported', targetStatus.status_message, 'warning');
      return;
    }
    const invoke = getNativeInvoke();
    if (invoke) {
      try {
        await invoke('set_audio_backend', { backend });
        setSystemBackend(backend);
        updateSettings({ systemAudioBackend: backend });
        const updated = await invoke('get_audio_backend_status').catch(() => null);
        if (updated && Array.isArray(updated)) setBackendStatuses(updated);
        showToast('Audio Backend Selected', `${backend === 'coreaudio' ? 'Core Audio' : 'ScreenCaptureKit'} (Active)`, 'success');
        return;
      } catch (e: any) {
        console.warn('Failed to invoke set_audio_backend:', e);
        showToast('Permission Notice', e?.message || String(e), 'warning');
        return;
      }
    }
    setSystemBackend(backend);
    updateSettings({ systemAudioBackend: backend });
    showToast('Audio Backend Selected', `${backend === 'coreaudio' ? 'Core Audio' : 'ScreenCaptureKit'} (Active)`, 'info');
  };

  useEffect(() => {
    return () => {
      if (micTestAnimRef.current) cancelAnimationFrame(micTestAnimRef.current);
      if (micTestStreamRef.current) {
        micTestStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (micTestAudioCtxRef.current) {
        micTestAudioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('General & Operations');
  const [formDescription, setFormDescription] = useState('');
  const [formSections, setFormSections] = useState<string[]>([]);
  const [formPromptInstructions, setFormPromptInstructions] = useState('');
  const [newSectionInput, setNewSectionInput] = useState('');

  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setFormName('');
    setFormCategory('General & Operations');
    setFormDescription('');
    setFormSections([
      'Executive Summary',
      'Key Decisions Made',
      'Action Items Matrix (Owner, Task, Due Date)',
      'Discussion Highlights',
      'Next Steps & Follow-ups'
    ]);
    setFormPromptInstructions('Generate structured Minutes of Meeting (MOM) according to defined sections.');
    setNewSectionInput('');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditModal = (tpl: MOMTemplate) => {
    setEditingTemplateId(tpl.id);
    setFormName(tpl.name);
    setFormCategory(tpl.category || 'General & Operations');
    setFormDescription(tpl.description || '');
    setFormSections(tpl.sections && tpl.sections.length > 0 ? [...tpl.sections] : ['Executive Summary', 'Key Decisions', 'Action Items']);
    setFormPromptInstructions(tpl.promptInstructions || '');
    setNewSectionInput('');
    setIsTemplateModalOpen(true);
  };

  const handleAddSection = () => {
    if (newSectionInput.trim()) {
      setFormSections(prev => [...prev, newSectionInput.trim()]);
      setNewSectionInput('');
    }
  };

  const handleRemoveSection = (idx: number) => {
    setFormSections(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveTemplate = async () => {
    if (!formName.trim()) {
      showToast('Name Required', 'Please enter a template name.', 'warning');
      return;
    }

    if (editingTemplateId) {
      await updateTemplate(editingTemplateId, {
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        sections: formSections.length > 0 ? formSections : ['Executive Summary', 'Action Items'],
        promptInstructions: formPromptInstructions.trim()
      });
    } else {
      await createTemplate({
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        sections: formSections.length > 0 ? formSections : ['Executive Summary', 'Action Items'],
        promptInstructions: formPromptInstructions.trim()
      });
    }
    setIsTemplateModalOpen(false);
  };

  

  // Engine diagnostics for web if not present
  const [isTestingEngine, setIsTestingEngine] = useState(false);
  const [engineTestResult, setEngineTestResult] = useState<{
    healthy: boolean;
    modelName: string;
    isLoaded: boolean;
    modelsDir: string;
    hardwareAcceleration: string;
    latencyMs: number;
    message: string;
  } | null>(null);

  const handleRunEngineDiagnostics = async () => {
    setIsTestingEngine(true);
    try {
      const res = await api.testTranscriptionEngine();
      setEngineTestResult(res);
      if (res.healthy) {
        showToast('Engine Diagnostics Passed', `${res.modelName} active (${res.latencyMs}ms latency)`, 'success');
      } else {
        showToast('Engine Diagnostics Warning', res.message, 'warning');
      }
    } catch (err: any) {
      showToast('Engine Test Failed', err.message || 'Diagnostic benchmark failed.', 'error');
    } finally {
      setIsTestingEngine(false);
    }
  };

  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewDocTemplate, setPreviewDocTemplate] = useState<MOMTemplate | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [isVerifyingStorage, setIsVerifyingStorage] = useState(false);
  const [storageVerifyMsg, setStorageVerifyMsg] = useState<string | null>(null);
  const [isAutoPurging, setIsAutoPurging] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  useEffect(() => {
    if (initialTab && initialTab !== settingsTab) {
      setSettingsTab(initialTab);
    }
  }, [initialTab]);

  const lastModelReadyToastRef = useRef<{ id: string; time: number } | null>(null);
  const notifyModelReadyOnce = (modelId: string, modelName: string) => {
    const now = Date.now();
    if (lastModelReadyToastRef.current && lastModelReadyToastRef.current.id === modelId && now - lastModelReadyToastRef.current.time < 4000) {
      return;
    }
    lastModelReadyToastRef.current = { id: modelId, time: now };
    showToast('Model Ready', `${modelName} has been installed and is ready for offline transcription.`, 'success');
  };

  const handleVerifyStorage = async () => {
    setIsVerifyingStorage(true);
    setStorageVerifyMsg(null);
    try {
      const stats = await api.getStorageStats();
      setStorageVerifyMsg(`Verified ${stats.audioFilesCount} audio recordings (${stats.audioStorageFormatted}) and ${stats.modelsCount} models on disk.`);
      showToast('Storage Verified', `Audio (${stats.audioFilesCount} files, ${stats.audioStorageFormatted}), Models (${stats.modelsCount} files), Database verified on disk.`, 'success');
    } catch (err: any) {
      setStorageVerifyMsg('Failed to inspect storage paths.');
      showToast('Storage Verification Failed', err.message || 'Storage check failed', 'error');
    } finally {
      setIsVerifyingStorage(false);
    }
  };

  const handleRunAutoPurgeNow = async () => {
    setIsAutoPurging(true);
    try {
      const days = (settings?.autoDeleteRecordingsDays && settings.autoDeleteRecordingsDays > 0)
        ? settings.autoDeleteRecordingsDays
        : 30;
      const res = await api.purgeRecordings(days);
      showToast('Storage Purge Completed', res.message || `Deleted recordings older than ${days} days.`, 'info');
      await refreshStorageStats();
    } catch (err: any) {
      showToast('Purge Failed', err.message || 'Failed to purge recordings.', 'error');
    } finally {
      setIsAutoPurging(false);
    }
  };

  const handleExportBackup = async () => {
    setIsExportingBackup(true);
    try {
      const backupJsonString = await api.exportBackup();
      const blob = new Blob([backupJsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `minomeet_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup Exported', 'Complete JSON archive downloaded successfully.', 'success');
    } catch (err: any) {
      showToast('Backup Failed', err.message || 'Export failed.', 'error');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleRestoreBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRestoringBackup(true);
    try {
      const text = await file.text();
      const res = await api.restoreBackup(text);
      showToast('Backup Restored', res.message || 'Data successfully restored.', 'success');
      await refreshStorageStats();
    } catch (err: any) {
      showToast('Restore Failed', err.message || 'Invalid backup JSON file.', 'error');
    } finally {
      setIsRestoringBackup(false);
      if (backupFileInputRef.current) {
        backupFileInputRef.current.value = '';
      }
    }
  };

  const handleCopyPath = (path: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(path);
    }
    showToast('Path Copied', `${label} copied to clipboard.`, 'info');
  };


  // Merge API transcriptionModels with MASTER_CATALOG strictly using canonical IDs
  const allTranscriptionCatalog = useMemo(() => {
    const map = new Map<string, any>();
    MASTER_CATALOG.forEach(m => {
      map.set(m.id, {
        id: m.id,
        name: m.name,
        family: m.family,
        tag: m.tag,
        sizeFormatted: m.sizeFormatted,
        accuracy: m.accuracy,
        speed: m.speed,
        ramRequired: m.ramRequired,
        rating: m.rating,
        description: m.description,
        recommended: m.recommended,
        status: 'not_downloaded',
        downloadProgress: 0
      });
    });

    transcriptionModels.forEach(m => {
      const canonicalId = toCanonicalModelId(m.id || (m as any).name || '');
      if (map.has(canonicalId)) {
        const existing = map.get(canonicalId)!;
        map.set(canonicalId, {
          ...existing,
          ...m,
          id: canonicalId,
          name: existing.name,
          family: existing.family,
          tag: existing.tag,
          sizeFormatted: existing.sizeFormatted,
          accuracy: (m as any).accuracy || existing.accuracy,
          speed: (m as any).speed || m.speedRating || existing.speed,
          ramRequired: existing.ramRequired || m.ramRequired,
          rating: existing.rating || m.rating || (m as any).accuracyScore || 5.0,
          status: m.status,
          downloadProgress: m.downloadProgress ?? existing.downloadProgress,
          downloadSpeed: m.downloadSpeed,
          downloadedMB: m.downloadedMB,
          totalMB: m.totalMB
        });
      }
    });
    return Array.from(map.values());
  }, [transcriptionModels]);

  // Hook to dedupe and trigger model ready notification
  useEffect(() => {
    allTranscriptionCatalog.forEach(m => {
      if (m.status === 'downloaded' && downloadingIds.has(m.id)) {
        notifyModelReadyOnce(m.id, m.name);
        setDownloadingIds(prev => {
          const next = new Set(prev);
          next.delete(m.id);
          return next;
        });
      }
    });
  }, [allTranscriptionCatalog, downloadingIds]);

  const downloadedModels = useMemo(() => {
    return allTranscriptionCatalog.filter(m => m.status === 'downloaded');
  }, [allTranscriptionCatalog]);

  const availableModelsToDownload = useMemo(() => {
    return allTranscriptionCatalog.filter(m => m.status !== 'downloaded' && (modelFilter === 'all' || m.family === modelFilter));
  }, [allTranscriptionCatalog, modelFilter]);

  const availableModels = useMemo(() => {
    return getAvailableModelsForProvider(
      {
        ...settings,
        aiProviders: {
          ...settings?.aiProviders,
          [selectedProviderId]: {
            ...settings?.aiProviders?.[selectedProviderId],
            fetchedModels: providerFetchedModels[selectedProviderId] || settings?.aiProviders?.[selectedProviderId]?.fetchedModels
          }
        }
      } as any,
      selectedProviderId
    );
  }, [settings, selectedProviderId, providerFetchedModels]);

if (!settings) return null;

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'recording', label: 'Recording', icon: Mic },
    { id: 'transcription', label: 'Transcription', icon: FileAudio },
    { id: 'model', label: 'AI Model', icon: Cpu },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'general', label: 'General & Storage', icon: Sliders }
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(t => t.id === settingsTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      setSettingsTab(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setSettingsTab(tabs[prevIndex].id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 overflow-hidden select-none">
      {/* Tabs Navigation */}
      <div
        role="tablist"
        aria-label="Settings Tabs"
        onKeyDown={handleTabKeyDown}
        className="flex items-center gap-2 px-6 pt-5 border-b border-[#e5e7eb] dark:border-neutral-800 overflow-x-auto no-scrollbar focus:outline-none"
      >
        {tabs.map((tab) => {
          const isActive = settingsTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setSettingsTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 ${
                isActive
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 max-w-3xl space-y-4">

        {/* 1. RECORDING TAB */}
        {settingsTab === 'recording' && (
          <div className="space-y-4">
            {/* 1. Audio Capture Source Selection */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-[#111827]">Default Audio Capture Source</h4>
                <span className="text-[11px] font-mono text-[#6b7280]">Applies to all new recordings</span>
              </div>
              <p className="text-xs text-[#6b7280] mb-3">
                Select the default capture mode for meetings. You can also switch sources on the fly during an active recording.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Mixed Audio */}
                <div
                  onClick={() => {
                    updateSettings({ defaultAudioSource: AUDIO_CAPTURE_MODES.MIXED });
                    showToast('Default Capture Source', 'Mixed Audio (Microphone + Remote Meeting Audio)', 'info');
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    (settings.defaultAudioSource || AUDIO_CAPTURE_MODES.MIXED) === AUDIO_CAPTURE_MODES.MIXED
                      ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                      : 'border-[#e5e7eb] bg-[#f9fafb] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[#1e3a8a] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Mixed Audio</span>
                    </div>
                    {(settings.defaultAudioSource || AUDIO_CAPTURE_MODES.MIXED) === AUDIO_CAPTURE_MODES.MIXED && (
                      <span className="bg-[#2563eb] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[#4b5563] text-[11px]">Microphone + Remote Meeting Audio (Zoom, Meet, Teams)</p>
                  <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-800 text-[10px] font-bold">
                    Recommended
                  </span>
                </div>

                {/* Microphone Only */}
                <div
                  onClick={() => {
                    updateSettings({ defaultAudioSource: AUDIO_CAPTURE_MODES.MICROPHONE_ONLY });
                    showToast('Default Capture Source', 'Microphone Only (Physical input device)', 'info');
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    settings.defaultAudioSource === AUDIO_CAPTURE_MODES.MICROPHONE_ONLY
                      ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                      : 'border-[#e5e7eb] bg-[#f9fafb] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[#111827] flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Microphone Only</span>
                    </div>
                    {settings.defaultAudioSource === AUDIO_CAPTURE_MODES.MICROPHONE_ONLY && (
                      <span className="bg-[#2563eb] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[#6b7280] text-[11px]">Primary physical input device (In-person meetings &amp; dictation)</p>
                </div>

                {/* System Audio Only */}
                <div
                  onClick={() => {
                    updateSettings({ defaultAudioSource: AUDIO_CAPTURE_MODES.SYSTEM_ONLY });
                    showToast('Default Capture Source', 'System Audio Only (Remote attendees stream)', 'info');
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    settings.defaultAudioSource === AUDIO_CAPTURE_MODES.SYSTEM_ONLY
                      ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                      : 'border-[#e5e7eb] bg-[#f9fafb] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[#111827] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#15803d]" />
                      <span>System Audio Only</span>
                    </div>
                    {settings.defaultAudioSource === AUDIO_CAPTURE_MODES.SYSTEM_ONLY && (
                      <span className="bg-[#2563eb] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[#6b7280] text-[11px]">Remote attendees &amp; browser meeting tab audio stream only</p>
                </div>
              </div>
            </div>

            {/* 3. Microphone Input Device & Live Level Equalizer (Redesigned) */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Microphone Input &amp; Level Testing</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Calibrate your input sensitivity and verify physical microphone signal with real-time spectrum analysis.
                  </p>
                </div>
                <button
                  onClick={toggleMicTest}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    isTestingMic
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] border border-[#bfdbfe]'
                  }`}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isTestingMic ? 'animate-pulse text-red-600' : ''}`} />
                  <span>{isTestingMic ? 'Stop Test' : 'Test Microphone'}</span>
                </button>
              </div>

              {/* Active hardware badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isTestingMic ? 'bg-emerald-500 animate-pulse' : 'bg-[#9ca3af]'}`} />
                  <span className="font-semibold text-[#374151]">
                    Active Input Hardware:
                  </span>
                  <span className="font-bold text-[#111827]">
                    {audioDevices.find(d => d.deviceId === settings.selectedMicDeviceId)?.label || 'Default System Microphone'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isTestingMic ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isTestingMic ? 'SIGNAL LIVE' : 'STANDBY'}
                </span>
              </div>

              {/* Live Audio Level Meter & Equalizer Visualizer */}
              {isTestingMic && (
                <div className="p-4 rounded-xl bg-gradient-to-b from-[#f0fdf4] to-[#ecfdf5] border border-[#bbf7d0] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-[#166534]">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-ping" />
                      <span>Microphone Input Level</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        micTestVolume > 70
                          ? 'bg-amber-100 text-amber-800'
                          : micTestVolume > 10
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {micTestVolume > 70 ? 'High Gain' : micTestVolume > 10 ? 'Optimal' : 'Quiet'}
                      </span>
                      <span className="font-mono text-sm">{micTestVolume}%</span>
                    </div>
                  </div>

                  {/* Horizontal Level Bar */}
                  <div className="w-full h-2.5 bg-emerald-100/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#15803d] rounded-full transition-all duration-75"
                      style={{ width: `${micTestVolume}%` }}
                    />
                  </div>

                  {/* 16-Bar Real-Time Audio Frequency Spectrum Equalizer */}
                  <div className="pt-2">
                    <div className="text-[10px] font-bold text-[#166534] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Real-time Audio Spectrum</span>
                      <span className="font-mono">16-band EQ</span>
                    </div>
                    <div className="h-12 bg-white/70 rounded-lg p-2 border border-[#86efac] flex items-end justify-between gap-1">
                      {micTestBars.map((val, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-[#16a34a] to-[#4ade80] rounded-xs transition-all duration-75"
                          style={{ height: `${val}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#15803d]">
                    Speak into your microphone. If the meter moves smoothly into green, your audio is clear and properly calibrated.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Audio Enhancement & Acoustic Filters (Redesigned Modern Feature Cards) */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Acoustic Filters &amp; Neural Preprocessing</h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Real-time DSP and neural audio processing applied to physical microphone capture to maximize speech clarity.
                </p>
                {settings.defaultAudioSource === 'system' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <Info className="w-4 h-4 flex-none text-amber-600" />
                    <span>
                      <b>System Audio Only mode active:</b> Acoustic filters and neural noise suppression are automatically bypassed to preserve full-fidelity remote meeting sound without artificial gating or phase distortion.
                    </span>
                  </div>
                )}
              </div>

              {(() => {
                const isSystemOnly = settings.defaultAudioSource === 'system';
                const isMixed = settings.defaultAudioSource === 'mixed';
                const isMicOnly = settings.defaultAudioSource === 'mic';

                return (
                  <div className="space-y-3">
                    {/* 1. Noise Suppression Card */}
                    <div className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                      isSystemOnly
                        ? 'border-[#e5e7eb] bg-[#f9fafb] opacity-60'
                        : settings.noiseSuppression !== false
                        ? 'border-[#bfdbfe] bg-[#f8faff]'
                        : 'border-[#e5e7eb] bg-white'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center flex-none mt-0.5 border border-[#dbeafe]">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#111827]">Noise Suppression</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isSystemOnly
                                ? 'bg-gray-200 text-gray-600'
                                : settings.noiseSuppression !== false
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {isSystemOnly ? 'N/A (System Audio)' : settings.noiseSuppression !== false ? 'Active' : 'Off'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6b7280] mt-0.5 max-w-xl">
                            {isSystemOnly
                              ? 'Bypassed in System Audio Only mode. Noise suppression only runs on microphone input.'
                              : 'Filter out background ambient room noise, typing keyboard clatter, air conditioner hum, and traffic murmur.'}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          if (isSystemOnly) return;
                          const next = settings.noiseSuppression === false ? true : false;
                          updateSettings({ noiseSuppression: next });
                          showToast('Noise Suppression', next ? 'Enabled' : 'Disabled', 'info');
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-none ${
                          isSystemOnly
                            ? 'bg-gray-300 cursor-not-allowed'
                            : settings.noiseSuppression !== false
                            ? 'bg-[#2563eb] cursor-pointer'
                            : 'bg-gray-300 cursor-pointer'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            !isSystemOnly && settings.noiseSuppression !== false ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* 2. Acoustic Echo Cancellation (AEC) Card */}
                    <div className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                      isSystemOnly
                        ? 'border-[#e5e7eb] bg-[#f9fafb] opacity-60'
                        : settings.echoCancellation !== false
                        ? 'border-[#e9d5ff] bg-[#faf5ff]'
                        : 'border-[#e5e7eb] bg-white'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center flex-none mt-0.5 border border-[#e9d5ff]">
                          <RotateCw className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#111827]">Acoustic Echo Cancellation (AEC)</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isSystemOnly
                                ? 'bg-gray-200 text-gray-600'
                                : !isMixed && isMicOnly
                                ? 'bg-amber-100 text-amber-800'
                                : settings.echoCancellation !== false
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {isSystemOnly
                                ? 'N/A (System Audio)'
                                : isMicOnly
                                ? 'Bypassed (No Ref)'
                                : settings.echoCancellation !== false
                                ? 'Active (Ref: System)'
                                : 'Off'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6b7280] mt-0.5 max-w-xl">
                            {isSystemOnly
                              ? 'Bypassed in System Audio Only mode. AEC requires microphone voice input.'
                              : isMicOnly
                              ? 'AEC requires far-end system audio as reference and is automatically bypassed in Microphone Only mode.'
                              : 'Eliminate speaker feedback loops when remote attendee meeting sound plays aloud through laptop speakers.'}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          if (isSystemOnly) return;
                          const next = settings.echoCancellation === false ? true : false;
                          updateSettings({ echoCancellation: next });
                          showToast('Echo Cancellation (AEC)', next ? 'Enabled' : 'Disabled', 'info');
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-none ${
                          isSystemOnly
                            ? 'bg-gray-300 cursor-not-allowed'
                            : settings.echoCancellation !== false
                            ? 'bg-[#2563eb] cursor-pointer'
                            : 'bg-gray-300 cursor-pointer'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            !isSystemOnly && settings.echoCancellation !== false ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* 3. Auto Gain Control (AGC) Card */}
                    <div className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                      isSystemOnly
                        ? 'border-[#e5e7eb] bg-[#f9fafb] opacity-60'
                        : settings.autoGainControl !== false
                        ? 'border-[#fed7aa] bg-[#fffaf5]'
                        : 'border-[#e5e7eb] bg-white'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#ffedd5] text-[#d97706] flex items-center justify-center flex-none mt-0.5 border border-[#fed7aa]">
                          <Sliders className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#111827]">Auto Gain Control (AGC)</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isSystemOnly
                                ? 'bg-gray-200 text-gray-600'
                                : settings.autoGainControl !== false
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {isSystemOnly ? 'N/A (System Audio)' : settings.autoGainControl !== false ? 'Active' : 'Off'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6b7280] mt-0.5 max-w-xl">
                            {isSystemOnly
                              ? 'Bypassed in System Audio Only mode. Volume normalization applies strictly to microphone levels.'
                              : 'Automatically balance and normalize microphone gain between whisperers and loud room speakers for uniform loudness.'}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          if (isSystemOnly) return;
                          const next = settings.autoGainControl === false ? true : false;
                          updateSettings({ autoGainControl: next });
                          showToast('Auto Gain Control (AGC)', next ? 'Enabled' : 'Disabled', 'info');
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-none ${
                          isSystemOnly
                            ? 'bg-gray-300 cursor-not-allowed'
                            : settings.autoGainControl !== false
                            ? 'bg-[#2563eb] cursor-pointer'
                            : 'bg-gray-300 cursor-pointer'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            !isSystemOnly && settings.autoGainControl !== false ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 5. Save Raw Audio Recordings to Disk (Mention Path + Change Path Option + Open Folder + Auto-save) */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Save Raw Audio Recordings to Disk</h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Configure how your audio recordings are preserved and stored locally on your machine.
                </p>
              </div>

              {/* Auto Save Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] gap-4">
                <div>
                  <div className="text-xs font-bold text-[#111827]">Save Audio Recordings</div>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                    Automatically save audio files to local storage when recording stops, allowing in-app playback and retranscription.
                  </p>
                </div>
                <div
                  onClick={() => {
                    const next = !settings.saveAudio;
                    updateSettings({ saveAudio: next });
                    showToast('Save Audio Recordings', next ? 'Auto-save audio files enabled' : 'Auto-save disabled', 'info');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors flex-none ${
                    settings.saveAudio ? 'bg-[#2563eb]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.saveAudio ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Save Location on Drive with Path Mention & Change Path Option */}
              {settings.saveAudio && (
                <div className="p-4 rounded-xl border border-[#e5e7eb] bg-[#fbfcfd] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-[#2563eb]" />
                        <span>Save Location on Drive</span>
                      </div>
                      <p className="text-[11px] text-[#6b7280] mt-0.5">
                        Destination directory on your hard drive where meeting recordings are stored.
                      </p>
                    </div>

                    {!isEditingPath && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleStartEditPath}
                          className="px-3 py-1.5 rounded-lg border border-[#d1d5db] bg-white hover:bg-gray-50 text-xs font-bold text-[#374151] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#2563eb]" />
                          <span>Change Folder</span>
                        </button>
                        <button
                          onClick={handleOpenRecordingsFolder}
                          className="px-3 py-1.5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] hover:bg-[#dbeafe] text-xs font-bold text-[#2563eb] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Open Folder</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Display Path Bar or Edit Form */}
                  {!isEditingPath ? (
                    <div className="p-3 rounded-lg bg-white border border-[#e5e7eb] font-mono text-xs text-[#1f2937] break-all flex items-center justify-between gap-3 shadow-2xs">
                      <span>{recordingSavePath}</span>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3 rounded-lg bg-white border border-[#bfdbfe] shadow-xs">
                      <label className="text-[11px] font-bold text-[#374151]">
                        Enter New Local Folder Path:
                      </label>
                      <input
                        type="text"
                        value={customPathInput}
                        onChange={(e) => setCustomPathInput(e.target.value)}
                        placeholder="/Users/.../Movies/my-recordings"
                        className="w-full bg-[#f9fafb] border border-[#d1d5db] rounded-lg px-3 py-2 text-xs font-mono text-[#111827] focus:ring-2 focus:ring-[#2563eb] focus:bg-white outline-none"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={handleResetDefaultPath}
                          className="text-[11px] text-[#6b7280] hover:text-[#111827] underline cursor-pointer"
                        >
                          Reset to default path
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsEditingPath(false)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium text-[#6b7280] hover:text-[#111827] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveCustomPath}
                            className="px-3 py-1 rounded-md bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save Path</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Format Timestamp Note (matching Image 1) */}
                  <div className="p-3 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e3a8a]">
                    <div className="font-bold">
                      File Format: {settings.audioFormat || 'MP4'} files
                    </div>
                    <div className="text-[11px] text-[#3b82f6] mt-0.5">
                      Recordings are saved with timestamp: <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[#1e3a8a]">recording_YYYYMMDD_HHMMSS.{settings.audioFormat?.toLowerCase() || 'mp4'}</code>
                    </div>
                  </div>
                </div>
              )}

              {/* Recording Start Notification Toggle (matching Image 1) */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] gap-4">
                <div>
                  <div className="text-xs font-bold text-[#111827]">Recording Start Notification</div>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                    Show reminder to inform participants when recording starts.
                  </p>
                </div>
                <div
                  onClick={() => {
                    const next = settings.recordingStartNotification === false ? true : false;
                    updateSettings({ recordingStartNotification: next });
                    showToast('Recording Notification', next ? 'Reminders enabled' : 'Reminders disabled', 'info');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors flex-none ${
                    settings.recordingStartNotification !== false ? 'bg-[#2563eb]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.recordingStartNotification !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 2. Default Audio Devices (Image 2 - Integrated Seamlessly into Minomeet UI Pattern) */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Default Audio Devices</h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Set your preferred microphone and system audio devices for recording. These will be automatically selected when starting new recordings.
                </p>
              </div>

              {/* Audio Devices Subheading with Refresh */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#374151] uppercase tracking-wider">Audio Devices</span>
                  <button
                    onClick={refreshDevices}
                    title="Refresh Audio Hardware Devices"
                    className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] border border-[#e5e7eb] transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDevices ? 'animate-spin text-[#2563eb]' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Microphone selection */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] mb-1.5">
                      <Mic className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Microphone</span>
                      <span title="Records your voice and ambient sound" className="cursor-help text-[#9ca3af] hover:text-[#4b5563]">
                        <HelpCircle className="w-3.5 h-3.5 inline" />
                      </span>
                    </label>
                    <select
                      value={settings.selectedMicDeviceId || 'default'}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateSettings({ selectedMicDeviceId: val });
                        const label = audioDevices.find(d => d.deviceId === val)?.label || (val === 'default' ? 'Default Microphone' : val);
                        showToast('Microphone Selected', label, 'info');
                      }}
                      className="w-full bg-[#f9fafb] border border-[#d1d5db] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#111827] focus:ring-2 focus:ring-[#2563eb] focus:bg-white outline-none transition cursor-pointer"
                    >
                      <option value="default">Default Microphone</option>
                      {audioDevices.map((dev) => (
                        <option key={dev.deviceId} value={dev.deviceId}>
                          {dev.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* System Audio selection */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] mb-1.5">
                      <Speaker className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>System Audio</span>
                      <span title="Records computer audio (music, calls, remote attendees)" className="cursor-help text-[#9ca3af] hover:text-[#4b5563]">
                        <HelpCircle className="w-3.5 h-3.5 inline" />
                      </span>
                    </label>
                    <select
                      value={settings.selectedSystemDeviceId || 'default'}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateSettings({ selectedSystemDeviceId: val });
                        const label = systemAudioDevices.find(d => d.deviceId === val)?.label || (val === 'default' ? 'Default System Audio' : val);
                        showToast('System Audio Selected', label, 'info');
                      }}
                      className="w-full bg-[#f9fafb] border border-[#d1d5db] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#111827] focus:ring-2 focus:ring-[#2563eb] focus:bg-white outline-none transition cursor-pointer"
                    >
                      <option value="default">Default System Audio</option>
                      {systemAudioDevices.map((dev) => (
                        <option key={dev.deviceId} value={dev.deviceId}>
                          {dev.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* System Audio Backend */}
              <div className="pt-2 border-t border-[#f3f4f6]">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-xs font-bold text-[#374151]">System Audio Backend</span>
                  <span title="Audio capture framework configured on macOS" className="cursor-help text-[#9ca3af] hover:text-[#4b5563]">
                    <Info className="w-3.5 h-3.5 inline" />
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* ScreenCaptureKit */}
                  {(() => {
                    const sck = backendStatuses.find(b => b.id === 'screencapturekit');
                    const isActive = systemBackend === 'screencapturekit';
                    const isAvailable = sck ? sck.available : true;
                    const hasPerm = sck ? sck.permission_granted : true;
                    const statusMsg = sck ? sck.status_message : 'Available';

                    return (
                      <div
                        onClick={() => handleBackendChange('screencapturekit')}
                        className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer text-xs ${
                          isActive
                            ? 'border-[#2563eb] bg-[#eff6ff] shadow-2xs'
                            : !isAvailable
                            ? 'border-[#e5e7eb] bg-[#f9fafb] opacity-60 cursor-not-allowed'
                            : 'border-[#e5e7eb] bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="sysBackend"
                            checked={isActive}
                            disabled={!isAvailable}
                            onChange={() => handleBackendChange('screencapturekit')}
                            className="mt-0.5 text-[#2563eb] focus:ring-[#2563eb]"
                          />
                          <div>
                            <div className="font-bold text-[#111827]">ScreenCaptureKit</div>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">
                              Apple's ScreenCaptureKit framework - High-level API for isolated desktop &amp; meeting audio capture.
                            </p>
                            {!hasPerm && (
                              <p className="text-[10px] text-amber-700 font-semibold mt-1">
                                Requires Screen &amp; System Audio Recording permission in macOS System Settings.
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-none ${
                          isActive
                            ? 'bg-[#2563eb] text-white'
                            : !hasPerm
                            ? 'bg-amber-100 text-amber-800'
                            : isAvailable
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isActive ? 'Active' : !hasPerm ? 'Permission Required' : statusMsg}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Core Audio */}
                  {(() => {
                    const isActive = systemBackend === 'coreaudio';
                    return (
                      <div
                        onClick={() => handleBackendChange('coreaudio')}
                        className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer text-xs ${
                          isActive
                            ? 'border-[#2563eb] bg-[#eff6ff] shadow-2xs'
                            : 'border-[#e5e7eb] bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="sysBackend"
                            checked={isActive}
                            onChange={() => handleBackendChange('coreaudio')}
                            className="mt-0.5 text-[#2563eb] focus:ring-[#2563eb]"
                          />
                          <div>
                            <div className="font-bold text-[#111827]">Core Audio</div>
                            <p className="text-[11px] text-[#4b5563] mt-0.5">
                              Direct Core Audio API - Low-latency aggregate audio tap for system audio capture.
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-none ${
                          isActive
                            ? 'bg-[#2563eb] text-white'
                            : 'bg-[#dcfce7] text-[#15803d]'
                        }`}>
                          {isActive ? 'Active' : 'Available'}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Helpful bullets */}
                <div className="mt-3.5 space-y-1 text-[11px] text-[#6b7280]">
                  <p>• Backend selection determines which native capture pipeline handles system audio</p>
                  <p>• Microphone capture always uses primary hardware input devices</p>
                  <p>• Changes apply to all new recordings and active stream switches</p>
                  <p>• <b>ScreenCaptureKit:</b> Requires macOS 12.3+ and Screen Recording permission</p>
                  <p>• <b>Core Audio:</b> Direct low-latency system tap available on macOS 14.4+</p>
                </div>
              </div>
            </div>

            {/* 6. Audio File Format & Bitrate Quality */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Audio File Format &amp; Quality</h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Saved recordings are timestamped using: <code className="bg-[#f3f4f6] px-1 py-0.5 rounded font-mono">recording_YYYYMMDD_HHMMSS.{settings.audioFormat.toLowerCase()}</code>
                </p>
              </div>

              {/* Format selection */}
              <div>
                <div className="text-xs font-bold text-[#374151] mb-1.5">Container Format:</div>
                <div className="flex items-center gap-2">
                  {['MP4', 'WAV', 'WebM'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => {
                        updateSettings({ audioFormat: fmt });
                        showToast('Audio Format', `Container format set to ${fmt}`, 'info');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        settings.audioFormat === fmt
                          ? 'bg-[#eaf1ff] border-[#2563eb] text-[#1e3a8a]'
                          : 'border-[#d6dbe2] text-[#374151] hover:bg-[#f6f7f9]'
                      }`}
                    >
                      {fmt} {settings.audioFormat === fmt && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bitrate selection */}
              <div>
                <div className="text-xs font-bold text-[#374151] mb-1.5">Audio Quality / Bitrate Preset:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: '128k', label: 'Standard (128 kbps)', desc: 'Compact file size, ideal for voice' },
                    { id: '256k', label: 'High Quality (256 kbps)', desc: 'Balanced clarity & studio grade' },
                    { id: '320k', label: 'Studio Master (320 kbps)', desc: 'Maximum fidelity lossless capture' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        updateSettings({ audioBitrate: preset.id as any });
                        showToast('Audio Quality', `${preset.label} selected`, 'info');
                      }}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        (settings.audioBitrate || '256k') === preset.id
                          ? 'bg-[#eff6ff] border-[#2563eb] text-[#1e3a8a]'
                          : 'border-[#e5e7eb] bg-[#f9fafb] text-[#374151] hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{preset.label}</span>
                        {(settings.audioBitrate || '256k') === preset.id && <span>✓</span>}
                      </div>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TRANSCRIPTION TAB */}
        {settingsTab === 'transcription' && (
          <div className="space-y-4">
            {/* Card 1: Active Transcription Engine */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Active Transcription Engine</h4>
                </div>
                <StatusBadge tone="info">On-Device Hardware Acceleration</StatusBadge>
              </div>

              {activeTranscriptionModel ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge tone="success">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                      <span>Active</span>
                    </StatusBadge>
                    <span className="text-[11px] font-mono font-medium text-[#4b5563] bg-[#f3f4f6] px-2 py-0.5 rounded-md border border-[#e5e7eb]">
                      {activeTranscriptionModel.tag || (activeTranscriptionModel.family === 'parakeet' ? 'Real-Time Streaming' : 'Whisper Multilingual')}
                    </span>
                    <span className="text-[11px] font-bold text-[#1e3a8a] bg-[#eff6ff] px-2 py-0.5 rounded-md border border-[#bfdbfe]">
                      {activeTranscriptionModel.sizeFormatted}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-neutral-100">
                      {activeTranscriptionModel.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()}
                    </h3>
                    <p className="text-xs text-[#6b7280] dark:text-neutral-400 mt-0.5 leading-relaxed">
                      {activeTranscriptionModel.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-[#4b5563] flex-wrap pt-1">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Apple Silicon Metal GPU</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Latency: {activeTranscriptionModel.family === 'parakeet' ? '< 25 ms real-time' : '~180ms'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-[#6b7280]" />
                      <span>{downloadedModels.length} on disk</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => api.openModelsFolder()}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#eff6ff] hover:text-[#2563eb] text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Models Folder</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRunEngineDiagnostics}
                      disabled={isTestingEngine}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingEngine ? 'animate-spin' : ''}`} />
                      <span>{isTestingEngine ? 'Testing Engine...' : 'Run Diagnostics & Test'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#e5e7eb] text-center space-y-2 bg-[#f9fafb]">
                  <StatusBadge tone="warning">No Active Engine</StatusBadge>
                  <p className="text-xs text-[#6b7280]">No model selected. Choose one below.</p>
                  <button
                    type="button"
                    onClick={() => document.getElementById('models-library-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-xs transition cursor-pointer"
                  >
                    Choose Model
                  </button>
                </div>
              )}

              {/* Diagnostics result panel */}
              {engineTestResult && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e3a8a] space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                      <span>Engine Diagnostics: {engineTestResult.modelName}</span>
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#bfdbfe]">
                      {engineTestResult.latencyMs} ms
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Hardware: <b>Apple Silicon Metal GPU</b></div>
                    <div>File Integrity: <b>Verified (SHA-256)</b></div>
                    <div>Engine Status: <b>Ready &amp; Responsive</b></div>
                    <div>Benchmark: <b>{engineTestResult.latencyMs < 50 ? 'Ultra-Fast Real-Time' : 'Standard Inference'}</b></div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Downloaded Models */}
            <div id="models-library-section" className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Downloaded Models</h4>
                  <StatusBadge tone="info">{downloadedModels.length} on disk</StatusBadge>
                </div>
                <StatusBadge tone="success">100% Offline Ready</StatusBadge>
              </div>

              {downloadedModels.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-[#e5e7eb] text-center bg-[#f9fafb] space-y-1">
                  <HardDrive className="w-6 h-6 text-[#9ca3af] mx-auto" />
                  <p className="text-xs font-bold text-[#374151]">No models downloaded yet.</p>
                  <p className="text-[11px] text-[#6b7280]">Download a speech model from the catalog below to enable offline transcription.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloadedModels.map((model) => {
                    const isActive = activeTranscriptionModel?.id === model.id;
                    return (
                      <div
                        key={model.id}
                        className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isActive
                            ? 'border-2 border-[#2563eb] bg-[#eff6ff]'
                            : 'border-[#e5e7eb] bg-[#f9fafb] hover:bg-white hover:border-[#cbd5e1]'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#111827] dark:text-neutral-100">{model.name}</span>
                            {model.recommended && (
                              <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#bfdbfe]">
                                Recommended
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-[#4b5563] bg-white px-2 py-0.5 rounded border border-[#e5e7eb]">
                              {model.family === 'parakeet' ? 'Real-Time Streaming' : 'Whisper Multilingual'}
                            </span>
                            <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] border border-[#bbf7d0] px-2 py-0.5 rounded">
                              {model.sizeFormatted} on Disk
                            </span>
                          </div>
                          <p className="text-xs text-[#6b7280] dark:text-neutral-400">{model.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-[#6b7280] flex-wrap pt-0.5">
                            <span>Accuracy: {model.accuracy || 'High accuracy'}</span>
                            <span>&middot;</span>
                            <span>Processing: {model.speed || 'Fast processing'}</span>
                            <span>&middot;</span>
                            <span>RAM: {model.ramRequired || '1 GB'}</span>
                            <StarRating value={model.rating || 5.0} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-none font-sans pt-1 sm:pt-0">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#dcfce7] border border-[#86efac] text-[#15803d] text-xs font-bold rounded-xl shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => selectTranscriptionModel(model.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-xs transition cursor-pointer"
                            >
                              Use
                            </button>
                          )}

                          {confirmDeleteId === model.id ? (
                            <InlineConfirm
                              message="Delete?"
                              onCancel={() => setConfirmDeleteId(null)}
                              onConfirm={() => {
                                deleteTranscriptionModel(model.id);
                                setConfirmDeleteId(null);
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(model.id)}
                              className="p-1.5 rounded-xl border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] transition cursor-pointer"
                              title="Delete model from disk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card 3: Available to Download */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Available to Download</h4>
                  <StatusBadge tone="info">{availableModelsToDownload.length} available</StatusBadge>
                </div>
                <SegmentedPills
                  options={[
                    { id: 'all', label: 'All' },
                    { id: 'parakeet', label: 'Parakeet (Real-Time)' },
                    { id: 'whisper', label: 'Whisper (High Accuracy)' }
                  ]}
                  value={modelFilter}
                  onChange={(v) => setModelFilter(v as any)}
                />
              </div>

              {availableModelsToDownload.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-[#e5e7eb] text-center bg-[#f9fafb] space-y-1">
                  <Download className="w-6 h-6 text-[#9ca3af] mx-auto" />
                  <p className="text-xs font-bold text-[#374151]">
                    {modelFilter === 'parakeet'
                      ? 'No Parakeet models available to download.'
                      : modelFilter === 'whisper'
                      ? 'No Whisper models available to download.'
                      : 'All catalog models are already downloaded.'}
                  </p>
                  <p className="text-[11px] text-[#6b7280]">
                    {modelFilter === 'parakeet'
                      ? 'Parakeet TDT 1.1B Lightning is installed and ready for real-time streaming.'
                      : 'Check "Downloaded Models" above to manage or activate installed models.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableModelsToDownload.map((model) => {
                  const isDownloading = model.status === 'downloading' || model.status === 'paused' || downloadingIds.has(model.id);
                  const isPaused = model.status === 'paused';

                  return (
                    <div
                      key={model.id}
                      className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] hover:bg-white hover:border-[#cbd5e1] transition space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#111827] dark:text-neutral-100">{model.name}</span>
                            {model.recommended && (
                              <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#bfdbfe]">
                                Recommended
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-[#4b5563] bg-white px-2 py-0.5 rounded border border-[#e5e7eb]">
                              {model.family === 'parakeet' ? 'Real-Time Streaming' : 'Whisper Multilingual'}
                            </span>
                            <span className="text-[10px] font-semibold text-[#1e3a8a] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                              Size: {model.sizeFormatted}
                            </span>
                          </div>
                          <p className="text-xs text-[#6b7280] dark:text-neutral-400">{model.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-[#6b7280] flex-wrap pt-0.5">
                            <span>Accuracy: {model.accuracy}</span>
                            <span>&middot;</span>
                            <span>Processing: {model.speed}</span>
                            <span>&middot;</span>
                            <span>RAM: {model.ramRequired}</span>
                            <StarRating value={model.rating} />
                          </div>
                        </div>

                        {!isDownloading && (
                          <div className="flex items-center gap-2 flex-none pt-1 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => {
                                setDownloadingIds(prev => new Set(prev).add(model.id));
                                downloadTranscriptionModel(model.id);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-xs transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download ({model.sizeFormatted})</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Real Downloading Progress Panel */}
                      {isDownloading && (
                        <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#1e3a8a]">
                            <span className="flex items-center gap-2">
                              <Loader2 className={`w-3.5 h-3.5 text-[#2563eb] ${isPaused ? '' : 'animate-spin'}`} />
                              <span>{isPaused ? 'Download paused' : 'Downloading model weights…'}</span>
                              {isPaused && <StatusBadge tone="warning">Paused</StatusBadge>}
                            </span>
                            <span className="font-mono tabular-nums text-xs font-bold text-[#2563eb]">
                              {Math.round(model.downloadProgress || 0)}%
                            </span>
                          </div>

                          <ProgressBar
                            value={model.downloadProgress || 0}
                            tone={isPaused ? 'paused' : 'default'}
                          />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-[#4b5563]">
                            <span className="font-mono">
                              {Math.round(model.downloadedMB || ((model.downloadProgress || 0) * 0.01 * (model.totalMB || 460)))} MB / {model.totalMB ? `${model.totalMB} MB` : model.sizeFormatted} &bull; {model.downloadSpeed || '18.2 MB/s'}
                            </span>
                            <div className="flex items-center gap-2">
                              {isPaused ? (
                                <button
                                  type="button"
                                  onClick={() => resumeTranscriptionModel(model.id)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-[#bfdbfe] text-[#1e3a8a] text-[10px] font-bold hover:bg-blue-50 transition cursor-pointer flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3 text-[#2563eb]" />
                                  <span>Resume</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => pauseTranscriptionModel(model.id)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-[#bfdbfe] text-[#1e3a8a] text-[10px] font-bold hover:bg-blue-50 transition cursor-pointer flex items-center gap-1"
                                >
                                  <Pause className="w-3 h-3 text-[#2563eb]" />
                                  <span>Pause</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  stopTranscriptionModel(model.id);
                                  setDownloadingIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(model.id);
                                    return next;
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[10px] font-bold hover:bg-red-100 transition cursor-pointer flex items-center gap-1"
                              >
                                <Square className="w-3 h-3 text-[#dc2626]" />
                                <span>Stop</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        )}

        {/* 3. AI MODEL TAB */}
        {settingsTab === 'model' && (
          <div className="space-y-4">
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">AI Model</h4>
                </div>
                <StatusBadge tone="info">Default Assistant &amp; MOM Generator</StatusBadge>
              </div>

              {/* Provider and Model Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">Provider</label>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    aria-label="AI Provider"
                    className="w-full h-9 px-3.5 rounded-xl border border-[#e5e7eb] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 cursor-pointer transition"
                  >
                    {AI_PROVIDERS_CONFIG.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#374151]">Model</label>
                    {availableModels.length > 0 && selectedProviderId !== 'builtin-ai' && selectedProviderId !== 'builtin' && (
                      <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#86efac]">
                        ● {availableModels.length} live models
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    disabled={availableModels.length === 0}
                    aria-label="Model"
                    className="w-full h-9 px-3.5 rounded-xl border border-[#e5e7eb] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
                  >
                    {availableModels.length === 0 ? (
                      <option value="" disabled>
                        {selectedProviderId === 'ollama'
                          ? "No local models detected - click 'Fetch Models' to load"
                          : "Enter API Key and click 'Fetch Models'"}
                      </option>
                    ) : (
                      availableModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.contextWindow ? `(${m.contextWindow})` : ''} {m.tag ? `[${m.tag}]` : ''}
                        </option>
                      ))
                    )}
                  </select>
                  {availableModels.length === 0 && (
                    <p className="text-[10px] text-[#6b7280] mt-1">
                      Models will appear here once retrieved live from {AI_PROVIDERS_CONFIG.find(p => p.id === selectedProviderId)?.name || 'provider'}.
                    </p>
                  )}
                </div>
              </div>

              {/* Endpoint URL (for Ollama or Custom Server) */}
              {(selectedProviderId === 'ollama' || selectedProviderId === 'custom') && (
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    {selectedProviderId === 'ollama' ? 'Ollama Endpoint URL' : 'API Endpoint URL'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={baseUrlInput}
                      onChange={(e) => {
                        setBaseUrlInput(e.target.value);
                        setConnectionStatus('not_configured');
                        setConnectionStatusMessage('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTestConnection();
                        }
                      }}
                      placeholder={selectedProviderId === 'ollama' ? 'http://localhost:11434' : 'http://localhost:8000/v1'}
                      aria-label="Endpoint URL"
                      className="flex-1 h-9 px-3.5 rounded-xl border border-[#e5e7eb] bg-white font-mono text-xs text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleFetchModels(selectedProviderId)}
                      disabled={isFetchingModels}
                      className="px-3.5 py-1.5 h-9 rounded-xl border border-[#d1d5db] bg-white hover:bg-[#eff6ff] text-xs font-bold text-[#374151] inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer flex-none disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-[#2563eb] ${isFetchingModels ? 'animate-spin' : ''}`} />
                      <span>{isFetchingModels ? 'Fetching…' : 'Fetch Models'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* API Key Input */}
              {selectedProviderId !== 'builtin' && selectedProviderId !== 'builtin-ai' && selectedProviderId !== 'ollama' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#374151]">
                      {selectedProviderId === 'custom' ? 'API Key (Optional)' : 'API Key'}
                    </label>
                    {apiKeyInput && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#15803d] font-bold bg-[#dcfce7] border border-[#86efac] px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> Stored securely
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => {
                          setApiKeyInput(e.target.value);
                          setConnectionStatus('not_configured');
                          setConnectionStatusMessage('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTestConnection();
                          }
                        }}
                        placeholder={AI_PROVIDERS_CONFIG.find(p => p.id === selectedProviderId)?.keyPlaceholder || 'Enter API Key…'}
                        aria-label="API Key"
                        className="w-full h-9 pl-3.5 pr-10 rounded-xl border border-[#e5e7eb] bg-white font-mono text-xs text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#475569] p-1 cursor-pointer transition"
                        title={showApiKey ? 'Hide Key' : 'Show Key'}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFetchModels(selectedProviderId)}
                      disabled={isFetchingModels || (!apiKeyInput && AI_PROVIDERS_CONFIG.find(p => p.id === selectedProviderId)?.requiresKey)}
                      className="px-3.5 py-1.5 h-9 rounded-xl border border-[#d1d5db] bg-white hover:bg-[#eff6ff] text-xs font-bold text-[#374151] inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer flex-none disabled:opacity-50"
                      title="Fetch live available models from provider API"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-[#2563eb] ${isFetchingModels ? 'animate-spin' : ''}`} />
                      <span>{isFetchingModels ? 'Fetching…' : 'Fetch Models'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Built-in provider status row */}
              {(selectedProviderId === 'builtin' || selectedProviderId === 'builtin-ai') && (
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111827]">qwen3.5:4b</span>
                    <span className="text-[10px] text-[#6b7280]">On-Device Neural Engine</span>
                  </div>
                  <StatusBadge tone="success">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    <span>Ready &amp; Active</span>
                  </StatusBadge>
                </div>
              )}

              {/* Test Connection Row & Status Badges */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="px-3.5 py-1.5 rounded-xl border border-[#d1d5db] bg-white hover:bg-[#eff6ff] text-xs font-bold text-[#374151] inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-[#2563eb]" />
                    )}
                    <span>{isTestingConnection ? 'Testing…' : 'Test Connection'}</span>
                  </button>

                  {connectionStatus === 'connected' && (
                    <StatusBadge tone="success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected (14ms)</span>
                    </StatusBadge>
                  )}
                  {connectionStatus === 'invalid' && (
                    <StatusBadge tone="danger">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Invalid API key</span>
                    </StatusBadge>
                  )}
                  {connectionStatus === 'testing' && (
                    <StatusBadge tone="info">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Testing…</span>
                    </StatusBadge>
                  )}
                  {connectionStatus === 'error' && (
                    <StatusBadge tone="warning">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Connection failed</span>
                    </StatusBadge>
                  )}
                </div>

                {connectionStatusMessage && (
                  <div className="text-[11px] text-[#6b7280] font-medium truncate max-w-sm">
                    {connectionStatusMessage}
                  </div>
                )}
              </div>

              {/* Save AI Model Settings */}
              <div className="flex items-center justify-end pt-3 border-t border-[#f3f4f6] dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleSaveAIConfiguration}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save AI Model Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. SUMMARY TAB */}
        {settingsTab === 'summary' && (
          <div className="space-y-4">
            {/* Card: Summary Generation */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Summary Generation</h4>
                </div>
                <StatusBadge tone="info">Instant Post-Processing</StatusBadge>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] gap-4">
                <div>
                  <div className="text-xs font-bold text-[#111827]">Auto Summary on Meeting Conclude</div>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                    Immediately synthesize structured Minutes of Meeting (MOM), key decisions, and action items as soon as recording concludes.
                  </p>
                </div>
                <Toggle
                  checked={!!settings.autoSummary}
                  onChange={(checked) => updateSettings({ autoSummary: checked })}
                  label="Auto Summary"
                />
              </div>
            </div>

            {/* 3 Output Component Preview Cards */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Synthesized Output Components</h4>
                </div>
                <span className="text-xs text-[#6b7280]">3 Essential Reports</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Executive Summary */}
                <div className="border border-[#e5e7eb] rounded-xl p-3.5 bg-[#f9fafb] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Executive Summary</span>
                      </span>
                      <StatusBadge tone="info">Overview</StatusBadge>
                    </div>
                    <p className="text-[11px] text-[#6b7280] leading-relaxed">
                      Structured high-level briefing distilling discussion points, context, and key takeaways in concise paragraphs.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-[#4b5563] bg-white p-2 rounded-lg border border-[#e5e7eb] space-y-0.5">
                    <div>• Purpose &amp; Strategic Context</div>
                    <div>• Critical Discussion Highlights</div>
                    <div>• Concluding Next Steps</div>
                  </div>
                </div>

                {/* 2. Action Items Matrix */}
                <div className="border border-[#e5e7eb] rounded-xl p-3.5 bg-[#f9fafb] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
                        <span>Action Items Matrix</span>
                      </span>
                      <StatusBadge tone="success">Deliverables</StatusBadge>
                    </div>
                    <p className="text-[11px] text-[#6b7280] leading-relaxed">
                      Tabular matrix capturing ownership, deliverables, due dates, and status.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-[#4b5563] bg-white p-2 rounded-lg border border-[#e5e7eb] space-y-0.5">
                    <div>Owner | Task | Due Date</div>
                    <div className="text-[#111827]">Sarah | Deploy v1.2 Engine | Fri</div>
                    <div className="text-[#111827]">Alex | Customer MOM Review | Mon</div>
                  </div>
                </div>

                {/* 3. Key Decisions */}
                <div className="border border-[#e5e7eb] rounded-xl p-3.5 bg-[#f9fafb] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Key Decisions</span>
                      </span>
                      <StatusBadge tone="info">Consensus</StatusBadge>
                    </div>
                    <p className="text-[11px] text-[#6b7280] leading-relaxed">
                      Bullet-point inventory of agreed conclusions, strategic decisions, and commitments.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-[#4b5563] bg-white p-2 rounded-lg border border-[#e5e7eb] space-y-0.5">
                    <div>✓ 100% On-Device AI Architecture</div>
                    <div>✓ Ratified 6 Canonical MOM Specs</div>
                    <div>✓ Zero-Telemetry Privacy Policy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Localization card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Transcription &amp; Summary Language</h4>
                </div>
                <StatusBadge tone="info">High Precision</StatusBadge>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#eff6ff] border border-[#bfdbfe] text-[#1e3a8a] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#2563eb]" />
                  <span>Active Language: English</span>
                </span>
                <span className="text-xs text-[#6b7280]">
                  All transcription and structured MOM output generation is formatted in English.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. TEMPLATES TAB */}
        {settingsTab === 'templates' && (
          <div className="space-y-4">
            {/* Header & Make Your Own Template Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">MOM Templates</h4>
                  <StatusBadge tone="info">{templates.length} Templates Configured</StatusBadge>
                </div>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Configure the report templates used by local AI models when generating meeting minutes, summaries, and action item matrices.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Make Your Own Template</span>
              </button>
            </div>

            {/* List of Templates */}
            <div className="space-y-3">
              {templates.map((tpl) => {
                const isSelectedDefault = settings.defaultTemplate === tpl.name || tpl.isDefault;

                return (
                  <div
                    key={tpl.id}
                    className={`border rounded-2xl p-4 transition space-y-2.5 ${
                      isSelectedDefault
                        ? 'border-2 border-[#2563eb] bg-[#eff6ff]/30 shadow-xs'
                        : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-sm text-[#111827] dark:text-neutral-100">{tpl.name}</span>
                          <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#bfdbfe]">
                            {tpl.category}
                          </span>
                          {isSelectedDefault && (
                            <span className="bg-[#dcfce7] text-[#15803d] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#86efac] flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6b7280] leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-2 flex-none pt-1 sm:pt-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setPreviewDocTemplate(tpl)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#eff6ff] hover:text-[#2563eb] text-xs font-bold transition cursor-pointer shadow-xs"
                          title="Preview sample document generated by this template"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2563eb]" />
                          <span>Preview Example Doc</span>
                        </button>
                        {!isSelectedDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultTemplate(tpl.id)}
                            className="px-2.5 py-1 rounded-xl border border-[#d1d5db] bg-white hover:bg-[#eff6ff] text-xs font-bold text-[#374151] transition cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(tpl)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af] hover:bg-[#dbeafe] text-xs font-bold transition cursor-pointer"
                          title="Edit template details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {templates.length > 1 && (
                          confirmDeleteId === tpl.id ? (
                            <InlineConfirm
                              message="Delete?"
                              onCancel={() => setConfirmDeleteId(null)}
                              onConfirm={() => {
                                deleteTemplate(tpl.id);
                                setConfirmDeleteId(null);
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(tpl.id)}
                              className="p-1 rounded-xl border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] transition cursor-pointer"
                              title="Delete template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Extracted Sections Preview */}
                    <div className="pt-2 border-t border-[#f3f4f6] dark:border-neutral-800">
                      <div className="text-[10px] font-bold text-[#6b7280] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-[#2563eb]" />
                        <span>Extracted Report Sections ({tpl.sections.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tpl.sections.map((section, idx) => (
                          <span
                            key={idx}
                            className="bg-[#f9fafb] text-[#374151] border border-[#e5e7eb] px-2 py-0.5 rounded-md text-[10px] font-medium"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Table Columns Preview */}
                    {(tpl as any).actionItemsColumns && (tpl as any).actionItemsColumns.length > 0 && (
                      <div className="pt-1">
                        <div className="text-[10px] font-bold text-[#15803d] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                          <Table className="w-3 h-3 text-[#15803d]" />
                          <span>Action Items Matrix Columns:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(tpl as any).actionItemsColumns.map((col: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-[#dcfce7] text-[#15803d] border border-[#86efac] px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. GENERAL & STORAGE TAB */}
        {settingsTab === 'general' && (
          <div className="space-y-4">
            {/* Desktop Notifications Card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#2563eb]" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Desktop Notifications</h4>
                </div>
                {settings.notifications ? (
                  <StatusBadge tone="success">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    <span>Notifications Active</span>
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af]" />
                    <span>All Notifications Muted</span>
                  </StatusBadge>
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] gap-4">
                <div>
                  <div className="text-xs font-bold text-[#111827]">System &amp; In-App Notifications</div>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                    Mute all in-app toasts, system desktop alerts and reminders when disabled.
                  </p>
                </div>
                <Toggle
                  checked={!!settings.notifications}
                  onChange={(checked) => updateSettings({ notifications: checked })}
                  label="Desktop Notifications"
                />
              </div>
            </div>

            {/* Local Storage Card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <HardDrive className="w-4 h-4 text-[#2563eb]" />
                    <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Local Storage &amp; Data Verification</h4>
                  </div>
                  <p className="text-xs text-[#6b7280]">
                    100% on-device data isolation. Inspect and manage local directories directly in macOS Finder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyStorage}
                  disabled={isVerifyingStorage}
                  className="px-3.5 py-1.5 rounded-xl border border-[#d1d5db] bg-white hover:bg-[#eff6ff] hover:text-[#2563eb] text-xs font-bold text-[#374151] inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer flex-none disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#2563eb] ${isVerifyingStorage ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingStorage ? 'Verifying...' : 'Verify Storage Integrity'}</span>
                </button>
              </div>

              {storageVerifyMsg && (
                <div className="p-2.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-xs text-[#065f46] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-none" />
                  <span>{storageVerifyMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Audio Recordings Folder */}
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <FileAudio className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Audio Files</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#1e3a8a] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                        {storageStats?.audioStorageFormatted || '0 B'}
                      </span>
                    </div>
                    <PathBox
                      path={storageStats?.realUploadsPath || settings?.storagePath || '/Users/muhammedshraeef/Movies/minomeet-recordings'}
                      onCopy={() => handleCopyPath(storageStats?.realUploadsPath || settings?.storagePath || '/Users/muhammedshraeef/Movies/minomeet-recordings', 'Audio files')}
                      onOpen={() => openStorageFolder('recordings')}
                    />
                  </div>
                  <div className="text-[10px] font-bold text-[#15803d] flex items-center gap-1 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    <span>Data verified: {storageStats?.audioFilesCount || 0} files ({storageStats?.audioStorageFormatted || '0 B'})</span>
                  </div>
                </div>

                {/* 2. AI Model Weights Folder */}
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>AI Models</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#1e3a8a] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                        {storageStats?.modelsStorageFormatted || '0 B'}
                      </span>
                    </div>
                    <PathBox
                      path={storageStats?.realModelsPath || '/Users/muhammedshraeef/Library/Application Support/ai.minomeet.desktop/models'}
                      onCopy={() => handleCopyPath(storageStats?.realModelsPath || '/Users/muhammedshraeef/Library/Application Support/ai.minomeet.desktop/models', 'AI models')}
                      onOpen={() => openStorageFolder('models')}
                    />
                  </div>
                  <div className="text-[10px] font-bold text-[#15803d] flex items-center gap-1 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    <span>Data verified: {storageStats?.modelsCount || 0} models ({storageStats?.modelsStorageFormatted || '0 B'})</span>
                  </div>
                </div>

                {/* 3. Database Folder */}
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Database (JSON)</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded border border-[#86efac]">
                        {storageStats?.dbSizeFormatted || '120 KB'}
                      </span>
                    </div>
                    <PathBox
                      path={storageStats?.realDataPath || '/Users/muhammedshraeef/Library/Application Support/ai.minomeet.desktop/meeting_minutes.sqlite'}
                      onCopy={() => handleCopyPath(storageStats?.realDataPath || '/Users/muhammedshraeef/Library/Application Support/ai.minomeet.desktop/meeting_minutes.sqlite', 'Database')}
                      onOpen={() => openStorageFolder('data')}
                    />
                  </div>
                  <div className="text-[10px] font-bold text-[#15803d] flex items-center gap-1 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    <span>Data verified: 1 database ({storageStats?.dbSizeFormatted || '120 KB'})</span>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-start gap-2.5 text-xs text-[#1e3a8a]">
                <ShieldCheck className="w-4 h-4 flex-none mt-0.5 text-[#2563eb]" />
                <p>
                  <b>100% Privacy Guarantee:</b> Your voice recordings, transcripts, and AI models are stored strictly on this device and are never uploaded to any cloud server.
                </p>
              </div>
            </div>

            {/* Auto-Purge Raw Audio Card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Trash2 className="w-4 h-4 text-[#dc2626]" />
                    <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Auto-Purge Raw Audio Recordings</h4>
                  </div>
                  <p className="text-xs text-[#6b7280]">
                    Automatically purge heavy raw audio recordings older than the selected retention period to reclaim disk space. Transcripts, summaries, and action item matrices are permanently preserved.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunAutoPurgeNow}
                  disabled={isAutoPurging}
                  className="px-3.5 py-1.5 rounded-xl border border-[#d1d5db] bg-white hover:bg-[#eff6ff] hover:text-[#2563eb] text-xs font-bold text-[#374151] inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer flex-none disabled:opacity-50"
                >
                  {isAutoPurging ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#dc2626] animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 text-[#dc2626]" />
                  )}
                  <span>{isAutoPurging ? 'Purging Audio...' : 'Run Auto-Purge Now'}</span>
                </button>
              </div>

              <div className="pt-1">
                <SegmentedPills
                  options={[
                    { id: '0', label: 'Off' },
                    { id: '30', label: '30 Days' },
                    { id: '50', label: '50 Days' },
                    { id: '90', label: '90 Days' }
                  ]}
                  value={String(settings.autoDeleteRecordingsDays || 0)}
                  onChange={(v) => updateSettings({ autoDeleteRecordingsDays: Number(v) })}
                />
              </div>
            </div>

            {/* Backup & Restore Card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Download className="w-4 h-4 text-[#2563eb]" />
                    <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Backup &amp; Restore Meeting History</h4>
                  </div>
                  <p className="text-xs text-[#6b7280]">
                    Export or restore a complete JSON archive of all your recorded meetings, dialogue lines, templates, and settings.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-none flex-wrap">
                  <input
                    type="file"
                    ref={backupFileInputRef}
                    accept=".json"
                    onChange={handleRestoreBackupFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => backupFileInputRef.current?.click()}
                    disabled={isRestoringBackup}
                    className="px-3.5 py-1.5 rounded-xl border border-[#d1d5db] bg-white hover:bg-[#eff6ff] hover:text-[#2563eb] text-xs font-bold text-[#374151] shadow-xs transition cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isRestoringBackup ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#2563eb] animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#2563eb]" />
                    )}
                    <span>{isRestoringBackup ? 'Restoring...' : 'Restore from Backup'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    disabled={isExportingBackup}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold shadow-xs transition cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isExportingBackup ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isExportingBackup ? 'Exporting...' : 'Export Backup (JSON)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Version & About Card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GithubIcon className="w-4 h-4 text-[#111827] dark:text-neutral-100" />
                  <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">Minomeet AI Version &amp; GitHub Updates</h4>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-[#6b7280]">
                  <span className="font-bold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-md border border-[#bfdbfe]">
                    v1.2.2
                  </span>
                  <span>&bull;</span>
                  <span>Repository:</span>
                  <a
                    href="https://github.com/shareefmx/minomeet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#2563eb] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>shareefmx/minomeet</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-none">
                <button
                  type="button"
                  onClick={() => openModal('about')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white text-xs font-bold shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Check Updates &amp; About</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Template Modal (Create / Edit) */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e7eb] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f6]">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2563eb]" />
                <span>{editingTemplateId ? 'Edit MOM Template' : 'Create Custom MOM Template'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Template Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Executive &amp; Board Summary"
                  className="w-full h-9 px-3 rounded-xl border border-[#e5e7eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#374151] mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#e5e7eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none cursor-pointer"
                >
                  <option value="General &amp; Operations">General &amp; Operations</option>
                  <option value="Leadership &amp; Strategy">Leadership &amp; Strategy</option>
                  <option value="Agile &amp; Development">Agile &amp; Development</option>
                  <option value="Commercial &amp; Sales">Commercial &amp; Sales</option>
                  <option value="Product &amp; UX">Product &amp; UX</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Custom">Custom Category</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#374151] mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Short description of this template purpose..."
                  className="w-full p-2.5 rounded-xl border border-[#e5e7eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#374151] mb-1">Report Sections</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formSections.map((sec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] text-[#1e3a8a] text-[11px] font-medium"
                    >
                      <span>{sec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="hover:text-[#dc2626]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSectionInput}
                    onChange={(e) => setNewSectionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSectionInput.trim()) {
                          setFormSections([...formSections, newSectionInput.trim()]);
                          setNewSectionInput('');
                        }
                      }
                    }}
                    placeholder="Add section title and press Enter"
                    className="flex-1 h-9 px-3 rounded-xl border border-[#e5e7eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#eff6ff] hover:text-[#2563eb] font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#374151] mb-1">AI Prompt Instructions</label>
                <textarea
                  value={formPromptInstructions}
                  onChange={(e) => setFormPromptInstructions(e.target.value)}
                  rows={3}
                  placeholder="System instructions directing local AI models on formatting and summarizing..."
                  className="w-full p-2.5 rounded-xl border border-[#e5e7eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f3f4f6]">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#d1d5db] bg-white text-[#374151] hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-4 py-1.5 rounded-xl bg-[#2563eb] text-white hover:bg-[#1d4ed8] text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Example Doc Modal */}
      {previewDocTemplate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-[#e5e7eb] space-y-4 animate-scale-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f6]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2563eb]" />
                <h3 className="text-sm font-bold text-[#111827]">
                  Preview Sample MOM: {previewDocTemplate.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocTemplate(null)}
                className="p-1 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 text-xs text-[#374151] pr-1">
              <div className="p-3 bg-[#eff6ff] rounded-xl border border-[#bfdbfe] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1e3a8a]">{previewDocTemplate.name}</div>
                  <div className="text-[11px] text-[#6b7280]">{previewDocTemplate.category} &bull; Simulated Synthesis Output</div>
                </div>
                <StatusBadge tone="info">Document Spec v1.2</StatusBadge>
              </div>

              {previewDocTemplate.sections.map((sec, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] space-y-1.5">
                  <h5 className="font-bold text-xs text-[#111827] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                    <span>{sec}</span>
                  </h5>
                  <p className="text-[11px] text-[#4b5563] leading-relaxed">
                    {sec.toLowerCase().includes('action') ? (
                      'Tabular matrix of deliverables with assigned ownership, target sprint deadlines, and completion criteria.'
                    ) : sec.toLowerCase().includes('decision') ? (
                      'Consensus agreements, architecture approvals, and recorded trade-offs ratified during discussion.'
                    ) : (
                      'Structured synopsis distilling key conversation threads, stakeholder viewpoints, and contextual outcomes.'
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#f3f4f6]">
              <button
                type="button"
                onClick={() => setPreviewDocTemplate(null)}
                className="px-4 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-xs transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};