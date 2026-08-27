import React, { useState, useEffect, useRef } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import {
  ArrowLeft,
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
  Terminal,
  Star,
  Activity,
  HardDrive,
  Loader2,
  Cloud,
  Bell,
  Edit2,
  Layers,
  Volume2,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Bot,
  Save,
  RotateCw,
  X
} from 'lucide-react';
import { SettingsTab, MOMTemplate, AIConnectionStatus, ProviderCredential, AIAgentOverride } from '../../types/meeting.js';
import {
  AI_PROVIDERS_CONFIG,
  AI_AGENTS_CONFIG,
  getEffectiveModelForAgent,
  getAvailableModelsForProvider
} from '../../utils/aiModelConfig.js';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    storageStats,
    settingsTab,
    setSettingsTab,
    setCurrentScreen,
    updateSettings,
    showToast,
    openStorageFolder,
    transcriptionModels,
    activeTranscriptionModel,
    engineStatus,
    templates,
    downloadTranscriptionModel,
    deleteTranscriptionModel,
    selectTranscriptionModel,
    installPythonPackages,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate
  } = useMeeting();

  const [modelFilter, setModelFilter] = useState<'all' | 'whisper' | 'parakeet'>('all');

  // AI Model Control Panel State
  const [selectedProviderId, setSelectedProviderId] = useState<string>('builtin');
  const [selectedModelId, setSelectedModelId] = useState<string>('Nimbus 4B (High Quality)');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [baseUrlInput, setBaseUrlInput] = useState<string>('http://localhost:11434');
  const [customModelInput, setCustomModelInput] = useState<string>('custom-model');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [isFetchingModels, setIsFetchingModels] = useState<boolean>(false);
  const [providerFetchedModels, setProviderFetchedModels] = useState<Record<string, string[]>>({});
  const [connectionStatus, setConnectionStatus] = useState<AIConnectionStatus>('not_configured');
  const [connectionStatusMessage, setConnectionStatusMessage] = useState<string>('');
  const [agentOverridesState, setAgentOverridesState] = useState<Record<string, AIAgentOverride>>({});

  // Sync settings into local AI Model state
  useEffect(() => {
    if (settings) {
      const activeProv = settings.activeAIProvider || 'builtin';
      setSelectedProviderId(activeProv);
      setSelectedModelId(settings.selectedModel || 'Nimbus 4B (High Quality)');

      const savedCred = settings.aiProviders?.[activeProv];
      setApiKeyInput(savedCred?.apiKey || '');
      setBaseUrlInput(savedCred?.baseUrl || (activeProv === 'ollama' ? 'http://localhost:11434' : 'http://localhost:8000/v1'));
      setCustomModelInput(savedCred?.customModelName || 'custom-model');
      setConnectionStatus(savedCred?.status || (activeProv === 'builtin' ? 'connected' : (savedCred?.apiKey ? 'connected' : 'not_configured')));
      setConnectionStatusMessage(savedCred?.statusMessage || (activeProv === 'builtin' ? 'Connected & Ready' : ''));

      // Populate fetched models cache across all providers
      const fetchedMap: Record<string, string[]> = {};
      AI_PROVIDERS_CONFIG.forEach(p => {
        if (settings.aiProviders?.[p.id]?.fetchedModels) {
          fetchedMap[p.id] = settings.aiProviders[p.id].fetchedModels || [];
        }
      });
      setProviderFetchedModels(fetchedMap);

      const overrides: Record<string, AIAgentOverride> = {};
      AI_AGENTS_CONFIG.forEach((a) => {
        const saved = settings.agentOverrides?.[a.id];
        overrides[a.id] = {
          agentId: a.id,
          providerId: saved?.providerId || 'use_default',
          modelId: saved?.modelId || 'use_default'
        };
      });
      setAgentOverridesState(overrides);
    }
  }, [settings]);

  // When selected provider changes in the UI dropdown
  const handleProviderChange = (newProviderId: string) => {
    setSelectedProviderId(newProviderId);
    const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === newProviderId) || AI_PROVIDERS_CONFIG[7];
    const savedCred = settings?.aiProviders?.[newProviderId];

    const defaultModel = savedCred?.selectedModel || provDef.models[0]?.id || 'default';
    setSelectedModelId(defaultModel);

    setApiKeyInput(savedCred?.apiKey || '');
    setBaseUrlInput(savedCred?.baseUrl || (newProviderId === 'ollama' ? 'http://localhost:11434' : (provDef.defaultEndpoint || 'http://localhost:8000/v1')));
    setCustomModelInput(savedCred?.customModelName || 'custom-model');

    const status: AIConnectionStatus = savedCred?.status || (newProviderId === 'builtin' ? 'connected' : (savedCred?.apiKey ? 'connected' : 'not_configured'));
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
      showToast('API Key Required', `Please enter your ${provDef.name} API key first to fetch models.`, 'warning');
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

        if (pId === selectedProviderId && !res.models.includes(selectedModelId)) {
          setSelectedModelId(res.models[0]);
        }

        showToast('Models Loaded', `Fetched ${res.models.length} available models from ${provDef?.name || pId}.`, 'success');
      } else {
        showToast('Fetch Notice', res.error || `No models returned from ${provDef?.name || pId}.`, 'warning');
      }
    } catch (err: any) {
      showToast('Fetch Failed', err.message || 'Failed to fetch models.', 'error');
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Test Connection Handler (also updates fetched models)
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    setConnectionStatusMessage('Validating credentials and model reachability…');

    try {
      const res = await api.testAIConnection({
        provider: selectedProviderId,
        apiKey: apiKeyInput,
        baseUrl: baseUrlInput,
        model: selectedModelId
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
        showToast('Connection Check', res.message, 'warning');
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setConnectionStatusMessage(err.message || 'Connection test failed.');
      showToast('Connection Failed', err.message || 'Failed to connect.', 'error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save AI Model Configuration Handler
  const handleSaveAIConfiguration = async () => {
    const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === selectedProviderId) || AI_PROVIDERS_CONFIG[7];
    if (provDef.requiresKey && (!apiKeyInput || apiKeyInput.trim().length === 0)) {
      showToast('API Key Required', `Please enter a valid API key for ${provDef.name}.`, 'warning');
      return;
    }

    const currentProviders = settings?.aiProviders || {};
    const updatedCredential: ProviderCredential = {
      apiKey: provDef.requiresKey ? apiKeyInput.trim() : (selectedProviderId === 'custom' ? apiKeyInput.trim() : undefined),
      baseUrl: (selectedProviderId === 'ollama' || selectedProviderId === 'custom') ? baseUrlInput.trim() : undefined,
      selectedModel: selectedModelId,
      customModelName: selectedProviderId === 'custom' ? customModelInput.trim() : undefined,
      fetchedModels: providerFetchedModels[selectedProviderId] || [],
      status: connectionStatus,
      statusMessage: connectionStatusMessage,
      lastTested: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    await updateSettings({
      activeAIProvider: selectedProviderId,
      selectedModel: selectedModelId,
      aiProviders: {
        ...currentProviders,
        [selectedProviderId]: updatedCredential
      },
      agentOverrides: agentOverridesState
    });

    showToast('Configuration Saved', `Active AI model set to ${selectedModelId} (${provDef.name}).`, 'success');
  };

  // Handler for Agent Provider Change
  const handleAgentProviderChange = (agentId: string, provId: string) => {
    if (provId === 'use_default') {
      setAgentOverridesState(prev => ({
        ...prev,
        [agentId]: { agentId, providerId: 'use_default', modelId: 'use_default' }
      }));
      return;
    }

    const modelsForProv = getAvailableModelsForProvider(
      { ...settings, aiProviders: { ...settings?.aiProviders, [provId]: { ...settings?.aiProviders?.[provId], fetchedModels: providerFetchedModels[provId] } } } as any,
      provId
    );
    const defaultModel = modelsForProv[0]?.id || 'default';
    setAgentOverridesState(prev => ({
      ...prev,
      [agentId]: { agentId, providerId: provId, modelId: defaultModel }
    }));
  };

  // Handler for Agent Model Change
  const handleAgentModelChange = (agentId: string, modelId: string) => {
    setAgentOverridesState(prev => ({
      ...prev,
      [agentId]: {
        agentId,
        providerId: prev[agentId]?.providerId || selectedProviderId,
        modelId
      }
    }));
  };

  // Audio Input Devices & Mic Test State
  const [audioDevices, setAudioDevices] = useState<{ deviceId: string; label: string }[]>([]);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micTestVolume, setMicTestVolume] = useState(0);
  const micTestStreamRef = useRef<MediaStream | null>(null);
  const micTestAudioCtxRef = useRef<AudioContext | null>(null);
  const micTestAnimRef = useRef<number | null>(null);

  useEffect(() => {
    // Enumerate audio input devices
    const getDevices = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices
            .filter(d => d.kind === 'audioinput')
            .map((d, idx) => ({
              deviceId: d.deviceId,
              label: d.label || `Microphone ${idx + 1}`
            }));
          if (audioInputs.length > 0) {
            setAudioDevices(audioInputs);
          }
        }
      } catch (err) {
        console.warn('Could not enumerate audio devices:', err);
      }
    };
    getDevices();
  }, []);

  const toggleMicTest = async () => {
    if (isTestingMic) {
      if (micTestAnimRef.current) cancelAnimationFrame(micTestAnimRef.current);
      if (micTestStreamRef.current) {
        micTestStreamRef.current.getTracks().forEach(t => t.stop());
        micTestStreamRef.current = null;
      }
      if (micTestAudioCtxRef.current) {
        micTestAudioCtxRef.current.close();
        micTestAudioCtxRef.current = null;
      }
      setIsTestingMic(false);
      setMicTestVolume(0);
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

        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        micTestAudioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        setIsTestingMic(true);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setMicTestVolume(Math.min(100, Math.round(avg * 2.2)));
          micTestAnimRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (err) {
        showToast('Microphone Test Notice', 'Please allow microphone access to test input levels.', 'info');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (micTestAnimRef.current) cancelAnimationFrame(micTestAnimRef.current);
      if (micTestStreamRef.current) {
        micTestStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (micTestAudioCtxRef.current) {
        micTestAudioCtxRef.current.close();
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

  if (!settings) return null;

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'recording', label: '1. Recording', icon: Mic },
    { id: 'transcription', label: '2. Transcription', icon: FileAudio },
    { id: 'model', label: '3. AI Model', icon: Cpu },
    { id: 'summary', label: '4. Summary', icon: Sparkles },
    { id: 'templates', label: '5. Templates', icon: FileText },
    { id: 'general', label: 'General & Storage', icon: Sliders }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none">
      {/* Settings Header */}
      <div className="flex items-center gap-3 px-8 pt-5 pb-2">
        <button
          onClick={() => setCurrentScreen('home')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#111827] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-xl font-black text-[#111827]">Minomeet Settings</h2>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 px-8 border-b border-[#e5e7eb] mt-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = settingsTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels Body */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl space-y-5">

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
                  onClick={() => updateSettings({ defaultAudioSource: 'mixed' })}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    (settings.defaultAudioSource || 'mixed') === 'mixed'
                      ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                      : 'border-[#e5e7eb] bg-[#f9fafb] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[#1e3a8a] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Mixed Audio</span>
                    </div>
                    {(settings.defaultAudioSource || 'mixed') === 'mixed' && (
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
                  onClick={() => updateSettings({ defaultAudioSource: 'mic' })}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    settings.defaultAudioSource === 'mic'
                      ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                      : 'border-[#e5e7eb] bg-[#f9fafb] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[#111827] flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Microphone Only</span>
                    </div>
                    {settings.defaultAudioSource === 'mic' && (
                      <span className="bg-[#2563eb] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[#6b7280] text-[11px]">Primary physical input device (In-person meetings &amp; dictation)</p>
                </div>

                {/* System Audio Only */}
                <div
                  onClick={() => updateSettings({ defaultAudioSource: 'system' })}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    settings.defaultAudioSource === 'system'
                      ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                      : 'border-[#e5e7eb] bg-[#f9fafb] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[#111827] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#15803d]" />
                      <span>System Audio Only</span>
                    </div>
                    {settings.defaultAudioSource === 'system' && (
                      <span className="bg-[#2563eb] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[#6b7280] text-[11px]">Remote attendees &amp; browser meeting tab audio stream only</p>
                </div>
              </div>
            </div>

            {/* 2. Microphone Input Device & Live Test Meter */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Microphone Input Device</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Select your preferred physical audio input hardware (built-in mic, external USB, or Bluetooth headset).
                  </p>
                </div>
                <button
                  onClick={toggleMicTest}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isTestingMic
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] border border-[#bfdbfe]'
                  }`}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isTestingMic ? 'animate-pulse text-red-600' : ''}`} />
                  <span>{isTestingMic ? 'Stop Test' : 'Test Microphone'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <select
                  value={settings.selectedMicDeviceId || 'default'}
                  onChange={(e) => updateSettings({ selectedMicDeviceId: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-[#d1d5db] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#111827] focus:ring-2 focus:ring-[#2563eb] focus:bg-white outline-none transition"
                >
                  <option value="default">Default System Microphone</option>
                  {audioDevices.map((dev) => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label}
                    </option>
                  ))}
                </select>

                {/* Live Mic Volume Level Meter */}
                {isTestingMic && (
                  <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs font-bold text-[#166534]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                        Microphone Input Level
                      </span>
                      <span className="font-mono">{micTestVolume}%</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full transition-all duration-75"
                        style={{ width: `${micTestVolume}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#15803d]">Speak into your microphone to test volume normalization.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Audio Enhancement & Acoustic Filters */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Acoustic Filters &amp; Neural Preprocessing</h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Real-time Web Audio constraints applied during live voice capture.
                </p>
              </div>

              <div className="space-y-3 divide-y divide-gray-100">
                {/* Noise Suppression */}
                <div className="flex items-center justify-between pt-1 gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Noise Suppression</div>
                    <p className="text-[11px] text-[#6b7280]">
                      Filter out background ambient room noise, typing clatter, and HVAC hum.
                    </p>
                  </div>
                  <div
                    onClick={() => updateSettings({ noiseSuppression: settings.noiseSuppression === false ? true : false })}
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.noiseSuppression !== false ? 'bg-[#2563eb]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                        settings.noiseSuppression !== false ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Acoustic Echo Cancellation */}
                <div className="flex items-center justify-between pt-3 gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Acoustic Echo Cancellation (AEC)</div>
                    <p className="text-[11px] text-[#6b7280]">
                      Eliminate speaker feedback loops when remote meeting sound plays through laptop speakers.
                    </p>
                  </div>
                  <div
                    onClick={() => updateSettings({ echoCancellation: settings.echoCancellation === false ? true : false })}
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.echoCancellation !== false ? 'bg-[#2563eb]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                        settings.echoCancellation !== false ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Auto Gain Control */}
                <div className="flex items-center justify-between pt-3 gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Auto Gain Control (AGC)</div>
                    <p className="text-[11px] text-[#6b7280]">
                      Automatically adjust microphone sensitivity between quiet and loud speakers.
                    </p>
                  </div>
                  <div
                    onClick={() => updateSettings({ autoGainControl: settings.autoGainControl === false ? true : false })}
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.autoGainControl !== false ? 'bg-[#2563eb]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                        settings.autoGainControl !== false ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Save Audio Recordings to Disk */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Save Raw Audio Recordings to Disk</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Automatically persist media stream recordings to local disk when you end a meeting, allowing in-app playback.
                  </p>
                </div>
                <div
                  onClick={() => updateSettings({ saveAudio: !settings.saveAudio })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
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
            </div>

            {/* 5. Audio File Format & Bitrate Quality */}
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
                      onClick={() => updateSettings({ audioFormat: fmt })}
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
                      onClick={() => updateSettings({ audioBitrate: preset.id as any })}
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
          <div className="space-y-5">
            {/* Active Model Hero Banner */}
            <div className="border border-[#bfdbfe] bg-[#f0f7ff] rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
                      <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                      Active Local Engine
                    </span>
                    <span className="text-xs font-mono text-[#6b7280]">
                      {activeTranscriptionModel?.family === 'parakeet' ? '⚡ Real-Time Streaming' : '🧠 Transformer Multilingual'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#1e3a8a]">
                    {activeTranscriptionModel?.name || settings.transcriptionEngine}
                  </h3>
                  <p className="text-xs text-[#4b5563] mt-1 max-w-xl">
                    {activeTranscriptionModel?.description || 'Runs fully on-device — speech recognition and acoustic features never leave this machine.'}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-xs text-[#1e3a8a] font-medium">
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-[#bfdbfe]">
                    ⚡ Speed: <b>{activeTranscriptionModel?.speedRating || '8x Real-Time'}</b>
                  </span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-[#bfdbfe]">
                    💾 Memory: <b>{activeTranscriptionModel?.ramRequired || '~2 GB RAM'}</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Python & AI Runtime Status Card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-4 bg-[#fafbfc] text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center flex-none">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#111827]">Local AI Runtime &amp; Dependencies</h5>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#6b7280] flex-wrap">
                      <span>Python: <b className="text-[#111827]">{engineStatus?.pythonVersion || '3.12.x'}</b></span>
                      <span>&bull;</span>
                      <span>Whisper: <b className={engineStatus?.whisperInstalled ? 'text-green-600' : 'text-amber-600'}>{engineStatus?.whisperInstalled ? 'Installed' : 'Ready (Fallback Active)'}</b></span>
                      <span>&bull;</span>
                      <span>FFmpeg: <b className={engineStatus?.ffmpegInstalled ? 'text-green-600' : 'text-gray-500'}>{engineStatus?.ffmpegInstalled ? 'Available' : 'Checking'}</b></span>
                      <span>&bull;</span>
                      <span>Models on Disk: <b className="text-[#2563eb]">{engineStatus?.totalModelsDownloaded || transcriptionModels.filter(m => m.status === 'downloaded').length} ready</b></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => installPythonPackages()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#d6dbe2] hover:bg-[#f3f4f6] text-[#374151] font-bold text-xs shadow-2xs transition cursor-pointer flex-none"
                >
                  <Download className="w-3.5 h-3.5 text-[#2563eb]" />
                  <span>Verify / Install AI Packages (pip)</span>
                </button>
              </div>
            </div>

            {/* Models Filter Tabs */}
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Transcription Engine Library</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Locally installed engines are ready offline. Download additional models to expand your library.
                  </p>
                </div>

                <div className="flex items-center bg-[#f3f4f6] p-1 rounded-xl border border-[#e5e7eb] text-xs">
                  <button
                    onClick={() => setModelFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      modelFilter === 'all' ? 'bg-white text-[#2563eb] shadow-xs' : 'text-[#6b7280] hover:text-[#111827]'
                    }`}
                  >
                    All ({transcriptionModels.length})
                  </button>
                  <button
                    onClick={() => setModelFilter('parakeet')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      modelFilter === 'parakeet' ? 'bg-white text-[#2563eb] shadow-xs' : 'text-[#6b7280] hover:text-[#111827]'
                    }`}
                  >
                    Parakeet (Real-Time)
                  </button>
                  <button
                    onClick={() => setModelFilter('whisper')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      modelFilter === 'whisper' ? 'bg-white text-[#2563eb] shadow-xs' : 'text-[#6b7280] hover:text-[#111827]'
                    }`}
                  >
                    Whisper (High Accuracy)
                  </button>
                </div>
              </div>

              {/* 1. LOCALLY INSTALLED MODELS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#1e3a8a] flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span>Locally Installed Models ({transcriptionModels.filter(m => m.status === 'downloaded' && (modelFilter === 'all' || m.family === modelFilter)).length})</span>
                  </h5>
                  <span className="text-[11px] text-[#15803d] font-semibold bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                    ● Ready for 100% Offline Use
                  </span>
                </div>

                {transcriptionModels.filter(m => m.status === 'downloaded' && (modelFilter === 'all' || m.family === modelFilter)).length === 0 ? (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-[#e5e7eb] text-center bg-[#fafbfc]">
                    <p className="text-xs font-semibold text-[#6b7280]">No models downloaded to local disk yet.</p>
                    <p className="text-[11px] text-[#9aa2af] mt-1">Download any model from the list below to enable offline transcription.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcriptionModels
                      .filter(m => m.status === 'downloaded' && (modelFilter === 'all' || m.family === modelFilter))
                      .map((model) => {
                        const isActive = activeTranscriptionModel?.id === model.id;

                        return (
                          <div
                            key={model.id}
                            className={`border-2 rounded-2xl p-4 transition ${
                              isActive
                                ? 'border-[#2563eb] bg-[#f8faff] shadow-xs'
                                : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-extrabold text-sm text-[#111827]">{model.name}</span>
                                  {model.recommended && (
                                    <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#fde68a]">
                                      ★ Recommended
                                    </span>
                                  )}
                                  {model.family === 'parakeet' && (
                                    <span className="bg-[#e0e7ff] text-[#4338ca] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      ⚡ Streaming
                                    </span>
                                  )}
                                  <span className="text-[11px] text-[#15803d] font-bold bg-[#dcfce7] border border-[#bbf7d0] px-2 py-0.5 rounded-md">
                                    {model.sizeFormatted} on Disk
                                  </span>
                                </div>

                                <p className="text-xs text-[#4b5563] leading-relaxed mb-3">
                                  {model.description}
                                </p>

                                <div className="flex items-center gap-4 text-[11px] text-[#6b7280] flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5 text-[#2563eb]" />
                                    <span>Speed: <b>{model.speedRating}</b></span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <HardDrive className="w-3.5 h-3.5 text-[#6b7280]" />
                                    <span>RAM: <b>{model.ramRequired}</b></span>
                                  </span>
                                  <span className="flex items-center gap-0.5 text-amber-500">
                                    {Array.from({ length: model.accuracyScore }).map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                    <span className="text-[#6b7280] ml-1 text-[10px]">Accuracy ({model.accuracyScore}/5)</span>
                                  </span>
                                </div>
                              </div>

                              {/* Actions for installed model */}
                              <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-none pt-1">
                                {isActive ? (
                                  <button
                                    disabled
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#dcfce7] border border-[#86efac] text-[#15803d] text-xs font-extrabold rounded-xl"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Active Engine</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => selectTranscriptionModel(model.id)}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>Set as Active</span>
                                    </button>
                                    <button
                                      onClick={() => deleteTranscriptionModel(model.id)}
                                      className="p-1.5 rounded-xl border border-[#fee2e2] bg-[#fef2f2] text-[#ef4444] hover:bg-[#fee2e2] transition cursor-pointer"
                                      title="Delete model from disk"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* 2. AVAILABLE FOR DOWNLOAD */}
              <div className="space-y-3 pt-3 border-t border-[#e5e7eb]">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>Available for Download ({transcriptionModels.filter(m => m.status !== 'downloaded' && (modelFilter === 'all' || m.family === modelFilter)).length})</span>
                  </h5>
                  <span className="text-[11px] text-[#6b7280]">Download once to local disk for offline recognition</span>
                </div>

                {transcriptionModels.filter(m => m.status !== 'downloaded' && (modelFilter === 'all' || m.family === modelFilter)).length === 0 ? (
                  <div className="p-4 rounded-xl border border-[#e5e7eb] text-center bg-[#fafbfc] text-xs text-[#6b7280]">
                    All models in this category are already downloaded to your disk.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcriptionModels
                      .filter(m => m.status !== 'downloaded' && (modelFilter === 'all' || m.family === modelFilter))
                      .map((model) => {
                        const isDownloading = model.status === 'downloading';

                        return (
                          <div
                            key={model.id}
                            className="border border-[#e5e7eb] rounded-2xl p-4 bg-white hover:border-[#cbd5e1] transition"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-extrabold text-sm text-[#111827]">{model.name}</span>
                                  {model.recommended && (
                                    <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#fde68a]">
                                      ★ Recommended
                                    </span>
                                  )}
                                  {model.family === 'parakeet' && (
                                    <span className="bg-[#e0e7ff] text-[#4338ca] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      ⚡ Streaming
                                    </span>
                                  )}
                                  <span className="text-[11px] text-[#6b7280] font-medium bg-[#f3f4f6] px-2 py-0.5 rounded-md">
                                    {model.sizeFormatted}
                                  </span>
                                </div>

                                <p className="text-xs text-[#4b5563] leading-relaxed mb-3">
                                  {model.description}
                                </p>

                                <div className="flex items-center gap-4 text-[11px] text-[#6b7280] flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5 text-[#2563eb]" />
                                    <span>Speed: <b>{model.speedRating}</b></span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <HardDrive className="w-3.5 h-3.5 text-[#6b7280]" />
                                    <span>RAM: <b>{model.ramRequired}</b></span>
                                  </span>
                                  <span className="flex items-center gap-0.5 text-amber-500">
                                    {Array.from({ length: model.accuracyScore }).map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                    <span className="text-[#6b7280] ml-1 text-[10px]">Accuracy ({model.accuracyScore}/5)</span>
                                  </span>
                                </div>

                                {/* Live Downloading Progress Bar */}
                                {isDownloading && (
                                  <div className="mt-3 space-y-1.5 p-3 rounded-xl bg-[#eff6ff] border border-[#bfdbfe]">
                                    <div className="flex justify-between text-xs font-bold text-[#1e3a8a]">
                                      <span className="flex items-center gap-1.5">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
                                        Downloading model weights to local storage…
                                      </span>
                                      <span className="font-mono text-[#2563eb] tabular-nums font-black">{model.downloadProgress || 20}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-[#dbeafe] rounded-full overflow-hidden relative">
                                      <div
                                        className="h-full bg-[#2563eb] transition-all duration-300 rounded-full"
                                        style={{ width: `${model.downloadProgress || 20}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Download Action Button */}
                              <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-none pt-1">
                                {isDownloading ? (
                                  <button
                                    disabled
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#dbeafe] text-[#1e40af] text-xs font-bold rounded-xl"
                                  >
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Downloading ({model.downloadProgress || 20}%)</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => downloadTranscriptionModel(model.id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download ({model.sizeFormatted})</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Audio Stream & Live Captions Controls */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-[#111827]">Live Capture Preferences</h4>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-[#111827]">Live Captions Stream</h5>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                    Render speech-to-text words in real time while recording is active.
                  </p>
                </div>
                <div
                  onClick={() => updateSettings({ liveCaptions: !settings.liveCaptions })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    settings.liveCaptions ? 'bg-[#2563eb]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.liveCaptions ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <div className="border-t border-[#f3f4f6] pt-3 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-[#111827]">Speaker Diarization Labels</h5>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                    Automatically distinguish and label distinct speaker voices in the transcript.
                  </p>
                </div>
                <div
                  onClick={() => updateSettings({ speakerLabels: !settings.speakerLabels })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    settings.speakerLabels ? 'bg-[#2563eb]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.speakerLabels ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. AI MODEL TAB */}
        {settingsTab === 'model' && (
          <div className="space-y-6">
            {/* Header / Intro */}
            <div>
              <h3 className="text-lg font-bold text-[#111827]">AI Model Configuration</h3>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Configure the AI models used across the entire application.
              </p>
            </div>

            {/* Model Settings Card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-6 bg-white shadow-xs space-y-5">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Model Settings</h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Select the primary AI provider and model used for meeting summaries, action item extraction, and Q&amp;A.
                </p>
              </div>

              {/* Provider and Model Dropdowns Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Provider Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Provider
                  </label>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    aria-label="Provider"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#d6dbe2] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] cursor-pointer shadow-2xs transition"
                  >
                    {AI_PROVIDERS_CONFIG.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#374151]">
                      Model
                    </label>
                    {(providerFetchedModels[selectedProviderId] || []).length > 0 && (
                      <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.2 rounded-full border border-[#86efac]">
                        ● {(providerFetchedModels[selectedProviderId] || []).length} dynamic models
                      </span>
                    )}
                  </div>
                  {selectedProviderId === 'custom' ? (
                    <input
                      type="text"
                      value={customModelInput}
                      onChange={(e) => {
                        setCustomModelInput(e.target.value);
                        setSelectedModelId(e.target.value);
                      }}
                      placeholder="e.g., deepseek-r1, llama-3.3-70b"
                      aria-label="Custom Model Name"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#d6dbe2] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] shadow-2xs transition"
                    />
                  ) : (
                    <select
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      aria-label="Model"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#d6dbe2] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] cursor-pointer shadow-2xs transition"
                    >
                      {/* Dynamic models combined with provider presets */}
                      {getAvailableModelsForProvider(
                        { ...settings, aiProviders: { ...settings?.aiProviders, [selectedProviderId]: { ...settings?.aiProviders?.[selectedProviderId], fetchedModels: providerFetchedModels[selectedProviderId] } } } as any,
                        selectedProviderId
                      ).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.contextWindow ? `(${m.contextWindow})` : ''} {m.tag ? `[${m.tag}]` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Endpoint URL (for Ollama or Custom Server) with Fetch Models */}
              {(selectedProviderId === 'ollama' || selectedProviderId === 'custom') && (
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    {selectedProviderId === 'ollama' ? 'Ollama Endpoint URL' : 'API Endpoint URL'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={baseUrlInput}
                      onChange={(e) => setBaseUrlInput(e.target.value)}
                      placeholder={selectedProviderId === 'ollama' ? 'http://localhost:11434' : 'http://localhost:8000/v1'}
                      aria-label="Endpoint URL"
                      className="flex-1 h-10 px-3.5 rounded-xl border border-[#d6dbe2] bg-white font-mono text-xs text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] shadow-2xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleFetchModels(selectedProviderId)}
                      disabled={isFetchingModels}
                      className="px-4 h-10 rounded-xl border border-[#d6dbe2] bg-[#f8fafc] hover:bg-[#f1f5f9] text-xs font-bold text-[#1e293b] inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer flex-none disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-[#2563eb] ${isFetchingModels ? 'animate-spin' : ''}`} />
                      <span>{isFetchingModels ? 'Fetching…' : 'Fetch Models'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* API Key Input with Show/Hide Eye and Fetch Models Button for Cloud Providers */}
              {selectedProviderId !== 'builtin' && selectedProviderId !== 'ollama' && (
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    {selectedProviderId === 'custom' ? 'API Key (Optional)' : 'API Key'}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={AI_PROVIDERS_CONFIG.find(p => p.id === selectedProviderId)?.keyPlaceholder || 'Enter API Key…'}
                        aria-label="API Key"
                        className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-[#d6dbe2] bg-white font-mono text-xs text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] shadow-2xs transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] p-1 cursor-pointer transition"
                        title={showApiKey ? 'Hide Key' : 'Show Key'}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFetchModels(selectedProviderId)}
                      disabled={isFetchingModels || (!apiKeyInput && AI_PROVIDERS_CONFIG.find(p => p.id === selectedProviderId)?.requiresKey)}
                      className="px-4 h-10 rounded-xl border border-[#d6dbe2] bg-[#f8fafc] hover:bg-[#f1f5f9] text-xs font-bold text-[#1e293b] inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer flex-none disabled:opacity-50"
                      title="Fetch live available models from provider API"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-[#2563eb] ${isFetchingModels ? 'animate-spin' : ''}`} />
                      <span>{isFetchingModels ? 'Fetching…' : 'Fetch Models'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Built-in AI Info Box */}
              {selectedProviderId === 'builtin' && (
                <div className="p-4 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#7c3aed] flex-none" />
                    <div>
                      <div className="text-xs font-bold text-[#5b21b6]">Built-in On-Device Engine Active</div>
                      <div className="text-[11px] text-[#6d28d9]">100% offline neural synthesis &bull; Zero external API dependencies &bull; Zero network calls</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-[#ede9fe] text-[#6d28d9] rounded-full flex-none">
                    Privacy First
                  </span>
                </div>
              )}

              {/* Test Connection Row & Connection States */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="px-4 py-2 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-bold text-[#1e293b] inline-flex items-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-[#2563eb]" />
                    )}
                    <span>{isTestingConnection ? 'Testing…' : 'Test Connection'}</span>
                  </button>

                  {/* 5 Clear Connection States */}
                  {connectionStatus === 'connected' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#dcfce7] text-[#15803d] border border-[#86efac] px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                    </span>
                  )}
                  {connectionStatus === 'invalid' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5] px-3 py-1 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" /> Invalid API key
                    </span>
                  )}
                  {connectionStatus === 'testing' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe] px-3 py-1 rounded-full">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing…
                    </span>
                  )}
                  {connectionStatus === 'error' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-3 py-1 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" /> Connection failed
                    </span>
                  )}
                  {connectionStatus === 'not_configured' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] px-3 py-1 rounded-full border border-[#e2e8f0]">
                      Not configured
                    </span>
                  )}
                </div>

                {/* Status Message Text */}
                {connectionStatusMessage && (
                  <div className="text-[11px] text-[#6b7280] font-medium truncate max-w-sm">
                    {connectionStatusMessage}
                  </div>
                )}
              </div>

              {/* Bottom-right Save Button */}
              <div className="flex items-center justify-end pt-4 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={handleSaveAIConfiguration}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Model Configuration</span>
                </button>
              </div>
            </div>

            {/* AI AGENT MODEL OVERRIDE SECTION */}
            <div className="border border-[#e5e7eb] rounded-2xl p-6 bg-white shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#7c3aed]" />
                  <span>AI Agent Overrides</span>
                </h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Optionally assign specific providers and models to individual AI capabilities. When &quot;Use Global Default&quot; is selected, the agent automatically follows the centralized Model Settings above.
                </p>
              </div>

              <div className="space-y-3">
                {AI_AGENTS_CONFIG.map((agent) => {
                  const effective = getEffectiveModelForAgent(settings, agent.id);
                  const currentOverride = agentOverridesState[agent.id] || { agentId: agent.id, providerId: 'use_default', modelId: 'use_default' };
                  const isUsingDefault = currentOverride.providerId === 'use_default' || currentOverride.modelId === 'use_default';
                  const agentProvId: string = (isUsingDefault ? (settings?.activeAIProvider || 'builtin') : (currentOverride.providerId || 'builtin')) as string;

                  const mergedSettings = {
                    ...settings,
                    aiProviders: {
                      ...settings?.aiProviders,
                      [agentProvId]: {
                        ...settings?.aiProviders?.[agentProvId],
                        fetchedModels: providerFetchedModels[agentProvId] || []
                      }
                    }
                  } as any;

                  const agentModels = getAvailableModelsForProvider(mergedSettings, agentProvId);

                  return (
                    <div
                      key={agent.id}
                      className="p-4 rounded-xl border border-[#e5e7eb] bg-[#fafbfc] hover:border-[#cbd5e1] transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-[#111827] flex items-center gap-2">
                            <span>{agent.name}</span>
                            <span className="text-[10px] font-semibold text-[#2563eb] bg-[#eff6ff] px-2 py-0.2 rounded-full border border-[#bfdbfe]">
                              {agent.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6b7280] mt-0.5">{agent.description}</p>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex-none ${
                            effective.isOverride
                              ? 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'
                              : 'bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]'
                          }`}
                        >
                          {effective.isOverride ? 'Custom Override' : 'Global Default'}
                        </span>
                      </div>

                      {/* Agent Provider and Model Selection Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Agent Provider Selector */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#475569] mb-1">
                            Provider
                          </label>
                          <select
                            value={currentOverride.providerId}
                            onChange={(e) => handleAgentProviderChange(agent.id, e.target.value)}
                            aria-label={`Provider for ${agent.name}`}
                            className="w-full h-8.5 px-3 rounded-lg border border-[#cbd5e1] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#2563eb] cursor-pointer"
                          >
                            <option value="use_default">
                              ⚡ Use Global Default ({AI_PROVIDERS_CONFIG.find(p => p.id === (settings.activeAIProvider || 'builtin'))?.name || 'Built-in AI'})
                            </option>
                            {AI_PROVIDERS_CONFIG.map((prov) => (
                              <option key={prov.id} value={prov.id}>
                                {prov.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Agent Model Selector */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#475569] mb-1">
                            Model
                          </label>
                          <select
                            value={isUsingDefault ? 'use_default' : currentOverride.modelId}
                            onChange={(e) => handleAgentModelChange(agent.id, e.target.value)}
                            disabled={isUsingDefault}
                            aria-label={`Model for ${agent.name}`}
                            className="w-full h-8.5 px-3 rounded-lg border border-[#cbd5e1] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#2563eb] cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            {isUsingDefault ? (
                              <option value="use_default">
                                {settings.selectedModel || 'Nimbus 4B (High Quality)'} (Global Default)
                              </option>
                            ) : (
                              agentModels.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} {m.tag ? `[${m.tag}]` : ''}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. SUMMARY TAB */}
        {settingsTab === 'summary' && (
          <div className="space-y-4">
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Auto Summary on Meeting Conclude</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Immediately trigger on-device AI MOM synthesis as soon as recording stops.
                  </p>
                </div>
                <div
                  onClick={() => updateSettings({ autoSummary: !settings.autoSummary })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    settings.autoSummary ? 'bg-[#2563eb]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.autoSummary ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">Transcription &amp; Summary Language</h4>
              <p className="text-xs text-[#6b7280] mt-0.5 mb-3">
                Minomeet is specialized for high-precision English transcription and MOM generation.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {['English'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateSettings({ defaultLanguage: lang })}
                    className="px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer bg-[#dbeafe] border-[#bfdbfe] text-[#1e3a8a] flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{lang} (Global / US / UK)</span>
                    <Check className="w-3.5 h-3.5 text-[#2563eb]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. TEMPLATES TAB */}
        {settingsTab === 'templates' && (
          <div className="space-y-6">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
              <div>
                <h4 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2563eb]" />
                  <span>Minutes of Meeting (MOM) Templates</span>
                </h4>
                <p className="text-xs text-[#6b7280] mt-0.5 max-w-xl">
                  Configure the report templates used by local AI models when generating meeting minutes, summaries, and action item matrices.
                </p>
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Template</span>
              </button>
            </div>

            {/* List of Templates */}
            <div className="space-y-4">
              {templates.map((tpl) => {
                const isSelectedDefault = settings.defaultTemplate === tpl.name || tpl.isDefault;

                return (
                  <div
                    key={tpl.id}
                    className={`border-2 rounded-2xl p-5 bg-white transition ${
                      isSelectedDefault
                        ? 'border-[#2563eb] shadow-xs'
                        : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-extrabold text-sm text-[#111827]">{tpl.name}</span>
                          <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
                            {tpl.category}
                          </span>
                          {isSelectedDefault && (
                            <span className="bg-[#dcfce7] text-[#15803d] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#86efac] flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#4b5563] leading-relaxed mt-1">
                          {tpl.description}
                        </p>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-2 flex-none pt-1">
                        {!isSelectedDefault && (
                          <button
                            onClick={() => setDefaultTemplate(tpl.id)}
                            className="px-3 py-1.5 rounded-xl border border-[#d6dbe2] bg-[#fafbfc] hover:bg-[#f3f4f6] text-xs font-bold text-[#374151] transition cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(tpl)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af] hover:bg-[#dbeafe] text-xs font-bold transition cursor-pointer"
                          title="Edit template details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {templates.length > 1 && (
                          <button
                            onClick={() => deleteTemplate(tpl.id)}
                            className="p-1.5 rounded-xl border border-[#fee2e2] bg-[#fef2f2] text-[#ef4444] hover:bg-[#fee2e2] transition cursor-pointer"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Extracted Sections Preview */}
                    <div className="mt-3 pt-3 border-t border-[#f3f4f6]">
                      <div className="text-[11px] font-bold text-[#6b7280] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-[#2563eb]" />
                        <span>Extracted Report Sections ({tpl.sections.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tpl.sections.map((section, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#f3f4f6] text-[#374151] text-[11px] font-medium border border-[#e5e7eb]"
                          >
                            {idx + 1}. {section}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Prompt Instructions preview */}
                    {tpl.promptInstructions && (
                      <div className="mt-3 bg-[#fafbfc] rounded-xl p-3 border border-[#f0f2f5] text-[11px] text-[#6b7280]">
                        <span className="font-bold text-[#374151]">AI Synthesis Directives: </span>
                        <span>{tpl.promptInstructions}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive Template Modal (Create / Edit) */}
            {isTemplateModalOpen && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 w-full max-w-xl shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
                    <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#2563eb]" />
                      <span>{editingTemplateId ? 'Edit MOM Template' : 'Create New MOM Template'}</span>
                    </h3>
                    <button
                      onClick={() => setIsTemplateModalOpen(false)}
                      className="p-1.5 text-[#6b7280] hover:text-[#111827] rounded-lg transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Template Name */}
                    <div>
                      <label className="block font-bold text-[#374151] mb-1">Template Name</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g., Executive Strategy & Board Sync"
                        className="w-full px-3.5 py-2 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block font-bold text-[#374151] mb-1">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2 border border-[#d6dbe2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      >
                        <option value="General & Operations">General &amp; Operations</option>
                        <option value="Leadership & Strategy">Leadership &amp; Strategy</option>
                        <option value="Agile & Development">Agile &amp; Development</option>
                        <option value="Commercial & Sales">Commercial &amp; Sales</option>
                        <option value="Project Management">Project Management</option>
                        <option value="Custom Workflows">Custom Workflows</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-bold text-[#374151] mb-1">Description &amp; Purpose</label>
                      <textarea
                        rows={2}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Explain what kind of meetings this template is tailored for..."
                        className="w-full px-3.5 py-2 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
                      />
                    </div>

                    {/* Sections Manager */}
                    <div>
                      <label className="block font-bold text-[#374151] mb-1">
                        Report Sections (Ordered AI Output Keys)
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {formSections.map((sec, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] font-medium"
                          >
                            <span>{sec}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(idx)}
                              className="text-blue-400 hover:text-red-500 transition cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add new section input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSectionInput}
                          onChange={(e) => setNewSectionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSection();
                            }
                          }}
                          placeholder="Add new section (e.g. Risk Assessment)..."
                          className="flex-1 px-3.5 py-1.5 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        />
                        <button
                          type="button"
                          onClick={handleAddSection}
                          className="px-3 py-1.5 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#374151] font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Prompt Instructions */}
                    <div>
                      <label className="block font-bold text-[#374151] mb-1">AI Synthesis Instructions</label>
                      <textarea
                        rows={3}
                        value={formPromptInstructions}
                        onChange={(e) => setFormPromptInstructions(e.target.value)}
                        placeholder="Specific instructions for how the AI should extract, format, and structure the meeting minutes..."
                        className="w-full px-3.5 py-2 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e7eb]">
                    <button
                      type="button"
                      onClick={() => setIsTemplateModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#d6dbe2] text-[#374151] hover:bg-[#f3f4f6] font-bold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTemplate}
                      className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingTemplateId ? 'Save Changes' : 'Create Template'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. GENERAL & STORAGE TAB */}
        {settingsTab === 'general' && (
          <div className="space-y-5">
            {/* Desktop Notifications */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#2563eb]" />
                    <span>Desktop Notifications</span>
                  </h4>
                  <p className="text-xs text-[#6b7280] mt-0.5 max-w-lg">
                    Receive native system notifications when recording starts, meetings are saved, or AI MOM summaries finish.
                  </p>
                </div>
                <div
                  onClick={() => updateSettings({ notifications: !settings.notifications })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    settings.notifications ? 'bg-[#2563eb]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.notifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Data Storage & Disk Usage Breakdown */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#2563eb]" />
                  <span>Local Storage &amp; Disk Usage</span>
                </h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  100% on-device data isolation. Inspect and manage local directories directly in macOS Finder.
                </p>
              </div>

              {/* Three Local Directory Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Audio Recordings Folder */}
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#fafbfc] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <FileAudio className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Audio Files</span>
                      </span>
                      <span className="text-[11px] font-bold text-[#1e3a8a] bg-[#dbeafe] px-2 py-0.5 rounded-md">
                        {storageStats?.audioStorageFormatted || '0 B'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      {storageStats?.audioFilesCount || 0} recording(s) on disk
                    </div>
                  </div>
                  <button
                    onClick={() => openStorageFolder('recordings')}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-[#d6dbe2] hover:bg-[#f3f4f6] text-xs font-bold text-[#374151] transition cursor-pointer shadow-2xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span>Open Audio Folder</span>
                  </button>
                </div>

                {/* 2. AI Model Weights Folder */}
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#fafbfc] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#7c3aed]" />
                        <span>AI Models</span>
                      </span>
                      <span className="text-[11px] font-bold text-[#7c3aed] bg-[#f3e8ff] px-2 py-0.5 rounded-md">
                        {storageStats?.modelsStorageFormatted || '0 B'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      {storageStats?.modelsCount || 0} model weight(s) cached
                    </div>
                  </div>
                  <button
                    onClick={() => openStorageFolder('models')}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-[#d6dbe2] hover:bg-[#f3f4f6] text-xs font-bold text-[#374151] transition cursor-pointer shadow-2xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span>Open Models Folder</span>
                  </button>
                </div>

                {/* 3. Database & Transcripts Folder */}
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#fafbfc] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#10b981]" />
                        <span>Database</span>
                      </span>
                      <span className="text-[11px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-md">
                        {storageStats?.dbSizeFormatted || '120 KB'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      Encrypted local JSON database
                    </div>
                  </div>
                  <button
                    onClick={() => openStorageFolder('data')}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-[#d6dbe2] hover:bg-[#f3f4f6] text-xs font-bold text-[#374151] transition cursor-pointer shadow-2xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Open Data Folder</span>
                  </button>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#c9dcff] flex items-start gap-2.5 text-xs text-[#1e3a8a]">
                <ShieldCheck className="w-4 h-4 flex-none mt-0.5 text-[#2563eb]" />
                <p>
                  <b>100% Privacy Guarantee:</b> Your voice recordings, transcripts, and AI models are stored strictly on this device and are never uploaded to any cloud server.
                </p>
              </div>
            </div>

            {/* Auto-delete Recordings (50 Days Toggle) */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-[#ef4444]" />
                    <span>Auto-Delete Raw Audio Recordings (50 Days)</span>
                  </h4>
                  <p className="text-xs text-[#6b7280] mt-0.5 max-w-lg">
                    Automatically purge raw audio recordings 50 days after a transcript + summary is verified to reclaim disk space.
                  </p>
                </div>

                <div
                  onClick={() => updateSettings({ autoDeleteRecordingsDays: settings.autoDeleteRecordingsDays > 0 ? 0 : 50 })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    settings.autoDeleteRecordingsDays > 0 ? 'bg-[#2563eb]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.autoDeleteRecordingsDays > 0 ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Data Backup & Export Section */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#2563eb]" />
                  <span>Backup &amp; Export Meeting History</span>
                </h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Download a complete JSON archive of all your recorded meetings, dialogue lines, and AI summaries.
                </p>
              </div>

              <a
                href="/api/settings/export-data"
                download={`minomeet_backup_${new Date().toISOString().slice(0, 10)}.json`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#d6dbe2] hover:bg-[#f9fafb] text-xs font-bold text-[#374151] shadow-2xs transition cursor-pointer flex-none"
              >
                <Download className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Export JSON Backup</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
