import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import {
  Sliders,
  Mic,
  FileAudio,
  Cpu,
  FileText,
  Sparkles,
  FolderOpen,
  Folder,
  Speaker,
  ChevronDown,
  HelpCircle,
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
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Save,
  RotateCw,
  X,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { SettingsTab, MOMTemplate, AIConnectionStatus, ProviderCredential, AIAgentOverride } from '../../types/meeting.js';
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

export const SettingsScreen: React.FC = () => {
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
    engineStatus,
    templates,
    downloadTranscriptionModel,
    deleteTranscriptionModel,
    selectTranscriptionModel,
    installPythonPackages,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    openModal
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

  // Recording Section State (Matching Reference UI)
  const [autoSaveAudio, setAutoSaveAudio] = useState<boolean>(true);
  const [saveLocation, setSaveLocation] = useState<string>('/Users/muhammedshraeef/Movies/meetily-recordings');
  const [recordingStartNotification, setRecordingStartNotification] = useState<boolean>(true);
  const [micDevices, setMicDevices] = useState<{ name: string; label?: string }[]>([]);
  const [systemDevices, setSystemDevices] = useState<{ name: string; label?: string }[]>([]);
  const [selectedMicDevice, setSelectedMicDevice] = useState<string>('');
  const [selectedSystemDevice, setSelectedSystemDevice] = useState<string>('');
  const [audioBackend, setAudioBackend] = useState<string>('coreaudio');
  const [isRefreshingDevices, setIsRefreshingDevices] = useState<boolean>(false);

  // Sync settings into Recording state
  useEffect(() => {
    if (settings) {
      if (settings.saveAudio !== undefined) setAutoSaveAudio(settings.saveAudio);
      if (settings.storagePath) setSaveLocation(settings.storagePath);
      if (settings.recordingStartNotification !== undefined) setRecordingStartNotification(settings.recordingStartNotification);
      if (settings.selectedMicDeviceId && settings.selectedMicDeviceId !== 'default') {
        setSelectedMicDevice(settings.selectedMicDeviceId);
      }
      if (settings.selectedSystemDeviceId && settings.selectedSystemDeviceId !== 'default') {
        setSelectedSystemDevice(settings.selectedSystemDeviceId);
      }
      if (settings.audioBackend) setAudioBackend(settings.audioBackend);
    }
  }, [settings]);

  const loadAudioDevices = async () => {
    setIsRefreshingDevices(true);
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const inputs = devs
          .filter(d => d.kind === 'audioinput')
          .map((d, i) => ({
            name: d.deviceId || `mic-${i}`,
            label: d.label || (i === 0 ? 'Default Microphone' : `Microphone ${i + 1}`)
          }));
        const outputs = devs
          .filter(d => d.kind === 'audiooutput')
          .map((d, i) => ({
            name: d.deviceId || `output-${i}`,
            label: d.label || (i === 0 ? 'Default System Audio' : `System Audio ${i + 1}`)
          }));
        if (inputs.length > 0) setMicDevices(inputs);
        if (outputs.length > 0) setSystemDevices(outputs);
      }
    } catch (err) {
      console.warn('Could not enumerate media devices:', err);
    } finally {
      setIsRefreshingDevices(false);
    }
  };

  useEffect(() => {
    loadAudioDevices();
    if (typeof window !== 'undefined') {
      const savedNotif = localStorage.getItem('minomeet_recording_start_notification');
      if (savedNotif !== null) {
        setRecordingStartNotification(savedNotif === 'true');
      }
    }
  }, []);

  const handleAutoSaveToggle = async (enabled: boolean) => {
    setAutoSaveAudio(enabled);
    await updateSettings({ saveAudio: enabled });
    showToast('Auto-Save', enabled ? 'Recordings will automatically save to disk' : 'Automatic recording saving disabled', 'info');
  };

  const handleOpenFolder = async () => {
    await openStorageFolder('recordings');
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setRecordingStartNotification(enabled);
    await updateSettings({ recordingStartNotification: enabled });
    if (typeof window !== 'undefined') {
      localStorage.setItem('minomeet_recording_start_notification', String(enabled));
    }
    showToast('Recording Reminder', enabled ? 'Reminder will show when recording starts' : 'Reminder disabled', 'info');
  };

  const handleMicDeviceChange = async (deviceName: string) => {
    setSelectedMicDevice(deviceName);
    await updateSettings({ selectedMicDeviceId: deviceName || 'default' });
    const label = deviceName ? (micDevices.find(d => d.name === deviceName)?.label || deviceName) : 'Default Microphone';
    showToast('Microphone Selected', label, 'info');
  };

  const handleSystemDeviceChange = async (deviceName: string) => {
    setSelectedSystemDevice(deviceName);
    await updateSettings({ selectedSystemDeviceId: deviceName || 'default' });
    const label = deviceName ? (systemDevices.find(d => d.name === deviceName)?.label || deviceName) : 'Default System Audio';
    showToast('System Audio Selected', label, 'info');
  };

  const handleSelectBackend = async (backendId: string) => {
    setAudioBackend(backendId);
    await updateSettings({ audioBackend: backendId });
    showToast('Audio Backend', 'Core Audio is active', 'info');
  };

  const handleRefreshAudioDevices = async () => {
    await loadAudioDevices();
    showToast('Audio Devices Refreshed', 'Refreshed connected microphones and audio outputs', 'info');
  };

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
    { id: 'recording', label: 'Recording', icon: Mic },
    { id: 'transcription', label: 'Transcription', icon: FileAudio },
    { id: 'model', label: 'AI Model', icon: Cpu },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'general', label: 'General & Storage', icon: Sliders }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none">
      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 px-8 pt-5 border-b border-[#e5e7eb] overflow-x-auto">
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

        {/* RECORDING TAB */}
        {settingsTab === 'recording' && (
          <div className="space-y-6">
            {/* Header: Recording Settings */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Recording Settings</h3>
              <p className="text-sm text-gray-500">
                Configure how your audio recordings are saved during meetings.
              </p>
            </div>

            {/* Card 1: Save Audio Recordings */}
            <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-white shadow-xs">
              <div className="flex-1 pr-4">
                <div className="text-sm font-semibold text-gray-900">Save Audio Recordings</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Automatically save audio files when recording stops
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoSaveAudio}
                onClick={() => handleAutoSaveToggle(!autoSaveAudio)}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                  autoSaveAudio ? 'bg-[#111827]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    autoSaveAudio ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Card 2: Save Location (Only shown when auto_save is enabled) */}
            {autoSaveAudio && (
              <>
                <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-xs space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Save Location</div>
                  <div className="text-sm text-gray-500 font-normal break-all">
                    {saveLocation || '/Users/muhammedshraeef/Movies/meetily-recordings'}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleOpenFolder}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Folder className="w-4 h-4 text-gray-500" />
                      <span>Open Folder</span>
                    </button>
                  </div>
                </div>

                {/* Card 3: File Format Banner */}
                <div className="border border-blue-100 rounded-xl p-4 bg-[#eff6ff]/70 text-blue-900">
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-[#1d4ed8]">File Format: </span>
                    <span className="text-[#1e40af] font-medium">MP4 files</span>
                  </div>
                  <p className="text-xs text-[#2563eb] mt-0.5">
                    Recordings are saved with timestamp: recording_YYYYMMDD_HHMMSS.mp4
                  </p>
                </div>
              </>
            )}

            {/* Card 4: Recording Start Notification */}
            <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-white shadow-xs">
              <div className="flex-1 pr-4">
                <div className="text-sm font-semibold text-gray-900">Recording Start Notification</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Show reminder to inform participants when recording starts
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={recordingStartNotification}
                onClick={() => handleNotificationToggle(!recordingStartNotification)}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                  recordingStartNotification ? 'bg-[#111827]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    recordingStartNotification ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Section 2: Default Audio Devices */}
            <div className="pt-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Default Audio Devices</h3>
              <p className="text-sm text-gray-500">
                Set your preferred microphone and system audio devices for recording. These will be automatically selected when starting new recordings.
              </p>
            </div>

            {/* Audio Devices Card Container */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-6 shadow-xs">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">Audio Devices</h4>
                <button
                  type="button"
                  onClick={handleRefreshAudioDevices}
                  disabled={isRefreshingDevices}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh Audio Devices"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingDevices ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Microphone Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700">
                  <Mic className="w-4 h-4 text-gray-500" />
                  <span>Microphone</span>
                  <div className="relative group cursor-pointer">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[11px] rounded shadow-lg z-20 pointer-events-none">
                      Choose a mic to record. Default follows your system&apos;s selected microphone.
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={selectedMicDevice}
                    onChange={(e) => handleMicDeviceChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                  >
                    <option value="">Default Microphone</option>
                    {micDevices.map((dev) => (
                      <option key={dev.name} value={dev.name}>
                        {dev.label || dev.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* System Audio Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700">
                  <Speaker className="w-4 h-4 text-gray-500" />
                  <span>System Audio</span>
                  <div className="relative group cursor-pointer">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[11px] rounded shadow-lg z-20 pointer-events-none">
                      Choose audio to record. Default follows your system&apos;s selected output.
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={selectedSystemDevice}
                    onChange={(e) => handleSystemDeviceChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                  >
                    <option value="">Default System Audio</option>
                    {systemDevices.map((dev) => (
                      <option key={dev.name} value={dev.name}>
                        {dev.label || dev.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* System Audio Backend */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700">
                  <span>System Audio Backend</span>
                  <div className="relative group cursor-pointer">
                    <Info className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-64 p-2.5 bg-gray-900 text-white text-[11px] rounded shadow-lg z-20 pointer-events-none">
                      Audio capture method for computer sounds. Core Audio provides direct low-latency capture.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* ScreenCaptureKit option (Disabled) */}
                  <div className="flex items-start justify-between p-3.5 border border-gray-200 rounded-lg bg-white opacity-70 cursor-not-allowed">
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border border-gray-300 mt-0.5 flex-none" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">ScreenCaptureKit</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Apple&apos;s ScreenCaptureKit framework - Higher level API with good compatibility
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex-none ml-2">
                      Disabled
                    </span>
                  </div>

                  {/* Core Audio option (Active) */}
                  <div
                    onClick={() => handleSelectBackend('coreaudio')}
                    className={`flex items-start justify-between p-3.5 border-2 rounded-lg cursor-pointer transition-colors ${
                      audioBackend === 'coreaudio' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-none ${
                        audioBackend === 'coreaudio' ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                        {audioBackend === 'coreaudio' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Core Audio</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Direct Core Audio API - Lower latency, more control over audio pipeline
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-none ml-2 ${
                      audioBackend === 'coreaudio' ? 'text-blue-600 bg-blue-50 border border-blue-200' : 'text-gray-500 bg-gray-100'
                    }`}>
                      {audioBackend === 'coreaudio' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Bullet notes */}
                <div className="text-xs text-gray-500 space-y-1 pt-1">
                  <p>• Backend selection only affects system audio capture</p>
                  <p>• Microphone always uses the default method</p>
                  <p>• Changes apply to new recording sessions</p>
                  <div className="h-1" />
                  <p>• Microphone: Records your voice and ambient sound</p>
                  <p>• System Audio: Records computer audio (music, calls, etc.)</p>
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
                    <div className="space-y-2">
                      {(providerFetchedModels['custom'] || []).length > 0 ? (
                        <div className="space-y-1.5">
                          <select
                            value={(providerFetchedModels['custom'] || []).includes(selectedModelId) ? selectedModelId : '__custom__'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== '__custom__') {
                                setSelectedModelId(val);
                                setCustomModelInput(val);
                              } else {
                                setSelectedModelId(customModelInput || 'custom-model');
                              }
                            }}
                            aria-label="Available Models on Server"
                            className="w-full h-10 px-3.5 rounded-xl border border-[#d6dbe2] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] cursor-pointer shadow-2xs transition"
                          >
                            <optgroup label={`Available Models on Your Server (${(providerFetchedModels['custom'] || []).length})`}>
                              {(providerFetchedModels['custom'] || []).map((m) => (
                                <option key={m} value={m}>
                                  {m} &bull; [Detected on Server]
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Manual Entry">
                              <option value="__custom__">+ Enter Custom Model Name Manually…</option>
                            </optgroup>
                          </select>

                          {(!((providerFetchedModels['custom'] || []).includes(selectedModelId)) || customModelInput !== selectedModelId) && (
                            <input
                              type="text"
                              value={customModelInput}
                              onChange={(e) => {
                                setCustomModelInput(e.target.value);
                                setSelectedModelId(e.target.value);
                              }}
                              placeholder="Type custom model name (e.g. deepseek-chat, llama-3.3-70b)"
                              aria-label="Custom Model Name"
                              className="w-full h-9 px-3.5 rounded-xl border border-[#cbd5e1] bg-[#fafbfc] text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={customModelInput}
                            onChange={(e) => {
                              setCustomModelInput(e.target.value);
                              setSelectedModelId(e.target.value);
                            }}
                            placeholder="e.g., deepseek-chat, llama-3.3-70b, qwen2.5-7b"
                            aria-label="Custom Model Name"
                            className="w-full h-10 px-3.5 rounded-xl border border-[#d6dbe2] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] shadow-2xs transition"
                          />
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] text-[#6b7280]">Presets:</span>
                            {['deepseek-chat', 'llama-3.3-70b', 'qwen2.5-7b', 'gpt-4o', 'mistral-large'].map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  setCustomModelInput(m);
                                  setSelectedModelId(m);
                                }}
                                className="text-[10px] bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] px-1.5 py-0.5 rounded-md hover:bg-[#dbeafe] cursor-pointer transition font-medium"
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#374151]">
                      {selectedProviderId === 'ollama' ? 'Ollama Endpoint URL' : 'API Endpoint URL'}
                    </label>
                    {selectedProviderId === 'custom' && (
                      <span className="text-[10px] text-[#6b7280]">
                        e.g., http://localhost:1234/v1, https://api.deepseek.com/v1
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={baseUrlInput}
                      onChange={(e) => {
                        setBaseUrlInput(e.target.value);
                        setConnectionStatus('not_configured');
                        setConnectionStatusMessage('');
                      }}
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
                  {selectedProviderId === 'custom' && (
                    <p className="text-[11px] text-[#6b7280] mt-1.5">
                      Supports any OpenAI-compatible endpoint (LM Studio, vLLM, DeepSeek, Together AI, LiteLLM, or LocalAI). Auto-resolves <code className="bg-[#f1f5f9] px-1 rounded text-[#1e293b]">/chat/completions</code> and <code className="bg-[#f1f5f9] px-1 rounded text-[#1e293b]">/models</code>.
                    </p>
                  )}
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
                        onChange={(e) => {
                          setApiKeyInput(e.target.value);
                          setConnectionStatus('not_configured');
                          setConnectionStatusMessage('');
                        }}
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
                  <span>Save Global Configuration</span>
                </button>
              </div>
            </div>

            {/* AI Agents & Model Overrides Card */}
            <div className="border border-[#e5e7eb] rounded-2xl p-6 bg-white shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f5f9] pb-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7c3aed]" />
                    <span>AI Agents &amp; Model Overrides</span>
                  </h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Configure specialized AI models for individual agent workflows or inherit the global default AI model.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {AI_AGENTS_CONFIG.map((agent) => {
                  const override = agentOverrides[agent.id] || { useGlobal: true, providerId: selectedProviderId, modelId: selectedModelId };
                  const isUsingGlobal = override.useGlobal !== false;
                  
                  // Compute resolved status for display
                  const currentAgentProvId = isUsingGlobal ? selectedProviderId : (override.providerId || selectedProviderId);
                  const currentAgentModelId = isUsingGlobal ? selectedModelId : (override.modelId || selectedModelId);
                  const provDef = AI_PROVIDERS_CONFIG.find(p => p.id === currentAgentProvId) || AI_PROVIDERS_CONFIG[7];
                  const agentCred = settings?.aiProviders?.[currentAgentProvId];
                  const isConnected = currentAgentProvId === 'builtin' || agentCred?.status === 'connected';

                  return (
                    <div
                      key={agent.id}
                      className="border border-[#e5e7eb] rounded-xl p-4 bg-[#fafbfc] hover:bg-[#f8fafc] transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-[#111827]">{agent.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]">
                              {agent.role}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isConnected
                                  ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
                                  : 'bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]'
                              }`}
                            >
                              {isConnected ? '● Ready' : '● Not Configured'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6b7280] mt-0.5">{agent.description}</p>
                        </div>

                        {/* Toggle Use Global Default */}
                        <div className="flex items-center gap-2 flex-none">
                          <span className="text-xs font-semibold text-[#374151]">Use Global Default</span>
                          <div
                            onClick={() => {
                              setAgentOverrides(prev => ({
                                ...prev,
                                [agent.id]: {
                                  ...prev[agent.id],
                                  useGlobal: !isUsingGlobal,
                                  providerId: prev[agent.id]?.providerId || selectedProviderId,
                                  modelId: prev[agent.id]?.modelId || selectedModelId
                                }
                              }));
                            }}
                            className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                              isUsingGlobal ? 'bg-[#2563eb]' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                                isUsingGlobal ? 'translate-x-4.5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Overridden settings inputs or Global banner */}
                      {isUsingGlobal ? (
                        <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0] text-xs font-medium text-[#475569] flex items-center justify-between">
                          <span>Inheriting Global Default: <strong className="text-[#1e293b]">{provDef.name} &bull; {currentAgentModelId}</strong></span>
                          <span className="text-[11px] text-[#64748b]">Auto-synced with Settings</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#e2e8f0]">
                          <div>
                            <label className="block text-[11px] font-bold text-[#475569] mb-1">
                              Agent Provider
                            </label>
                            <select
                              value={override.providerId || selectedProviderId}
                              onChange={(e) => {
                                const newPId = e.target.value;
                                const pDef = AI_PROVIDERS_CONFIG.find(p => p.id === newPId) || AI_PROVIDERS_CONFIG[7];
                                const defModel = settings?.aiProviders?.[newPId]?.selectedModel || pDef.models[0]?.id || 'default';
                                setAgentOverrides(prev => ({
                                  ...prev,
                                  [agent.id]: {
                                    ...prev[agent.id],
                                    providerId: newPId,
                                    modelId: defModel
                                  }
                                }));
                              }}
                              className="w-full h-8 px-2.5 rounded-lg border border-[#cbd5e1] bg-white text-xs font-semibold text-[#1e293b] focus:outline-none focus:border-[#2563eb] cursor-pointer"
                            >
                              {AI_PROVIDERS_CONFIG.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#475569] mb-1">
                              Agent Model
                            </label>
                            <select
                              value={override.modelId || selectedModelId}
                              onChange={(e) => {
                                const newMId = e.target.value;
                                setAgentOverrides(prev => ({
                                  ...prev,
                                  [agent.id]: {
                                    ...prev[agent.id],
                                    modelId: newMId
                                  }
                                }));
                              }}
                              className="w-full h-8 px-2.5 rounded-lg border border-[#cbd5e1] bg-white text-xs font-semibold text-[#1e293b] focus:outline-none focus:border-[#2563eb] cursor-pointer"
                            >
                              {getAvailableModelsForProvider(
                                { ...settings, aiProviders: { ...settings?.aiProviders, [override.providerId || selectedProviderId]: { ...settings?.aiProviders?.[override.providerId || selectedProviderId], fetchedModels: providerFetchedModels[override.providerId || selectedProviderId] } } } as any,
                                override.providerId || selectedProviderId
                              ).map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} {m.contextWindow ? `(${m.contextWindow})` : ''} {m.tag ? `[${m.tag}]` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Save Button for Agents */}
              <div className="flex items-center justify-end pt-4 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={handleSaveAIConfiguration}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Model Settings &amp; Overrides</span>
                </button>
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

            {/* App Version & GitHub Repository */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <GithubIcon className="w-4 h-4 text-[#111827]" />
                  <span>Minomeet AI Version &amp; GitHub Updates</span>
                </h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[#6b7280]">
                  <span className="font-extrabold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-md border border-[#bfdbfe]">
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
                  onClick={() => openModal('about')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Check Updates &amp; About</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
