import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
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
  X
} from 'lucide-react';
import { SettingsTab, MOMTemplate } from '../../types/meeting.js';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    storageStats,
    settingsTab,
    setSettingsTab,
    setCurrentScreen,
    updateSettings,
    openModal,
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
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">Audio Capture Sources</h4>
              <p className="text-xs text-[#6b7280] mt-0.5 mb-3">
                Minomeet captures both physical input microphones and internal system/meeting sound (Zoom, Google Meet, Teams).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] text-xs">
                  <div className="font-bold text-[#1e3a8a] flex items-center gap-1.5 mb-1">
                    <Mic className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span>Microphone</span>
                  </div>
                  <p className="text-[#4b5563] text-[11px]">Primary physical input device</p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] text-xs">
                  <div className="font-bold text-[#111827] flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5 text-[#15803d]" />
                    <span>System Audio</span>
                  </div>
                  <p className="text-[#6b7280] text-[11px]">Remote attendees voice output</p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] text-xs">
                  <div className="font-bold text-[#111827] flex items-center gap-1.5 mb-1">
                    <Sliders className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span>Mixed Audio</span>
                  </div>
                  <p className="text-[#6b7280] text-[11px]">Combined localized mix stream</p>
                </div>
              </div>
            </div>

            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Save Audio Recordings</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Automatically persist media stream recordings to local disk when you end a meeting.
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

            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">Audio File Format &amp; Quality</h4>
              <p className="text-xs text-[#6b7280] mt-0.5 mb-3">
                Saved recordings are timestamped using: <code className="bg-[#f3f4f6] px-1 py-0.5 rounded font-mono">recording_YYYYMMDD_HHMMSS.{settings.audioFormat.toLowerCase()}</code>
              </p>
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
          <div className="space-y-4">
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">AI Inference Engine</h4>
              <p className="text-xs text-[#6b7280] mt-0.5 mb-3">
                Configure the model used for extracting Executive Summaries, Key Decisions, and Action Items.
              </p>
              <div className="p-3.5 rounded-xl bg-[#f8fafd] border border-[#bfdbfe] flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-xs text-[#1e3a8a]">Active Model: {settings.selectedModel}</div>
                  <div className="text-[11px] text-[#6b7280]">On-device &bull; Zero external API dependencies</div>
                </div>
                <button
                  onClick={() => openModal('model')}
                  className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] transition cursor-pointer"
                >
                  Change Model
                </button>
              </div>
            </div>

            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">External AI Providers (Optional)</h4>
              <p className="text-xs text-[#6b7280] mt-0.5 mb-3">
                You can optionally plug in your own API keys for cloud models (OpenAI GPT-4o, Google Gemini 1.5, Ollama Local).
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#e5e7eb]">
                  <span className="font-semibold text-[#374151]">OpenAI / GPT-4o API</span>
                  <span className="text-[#9aa2af] font-mono">sk-••••••••••••</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#e5e7eb]">
                  <span className="font-semibold text-[#374151]">Google Gemini API</span>
                  <span className="text-[#9aa2af] font-mono">AIza••••••••••••</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#e5e7eb]">
                  <span className="font-semibold text-[#374151]">Local Ollama Endpoint</span>
                  <span className="text-[#9aa2af] font-mono">http://localhost:11434</span>
                </div>
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
