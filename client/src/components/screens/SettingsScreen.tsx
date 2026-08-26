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
  Sun,
  Moon,
  Monitor,
  Bell
} from 'lucide-react';
import { SettingsTab } from '../../types/meeting.js';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    settingsTab,
    setSettingsTab,
    setCurrentScreen,
    updateSettings,
    openModal,
    showToast,
    openStorageFolder,
    purgeOldRecordings,
    transcriptionModels,
    activeTranscriptionModel,
    engineStatus,
    downloadTranscriptionModel,
    deleteTranscriptionModel,
    selectTranscriptionModel,
    installPythonPackages
  } = useMeeting();

  const [customTemplateName, setCustomTemplateName] = useState('');
  const [customTemplateDesc, setCustomTemplateDesc] = useState('');
  const [modelFilter, setModelFilter] = useState<'all' | 'whisper' | 'parakeet'>('all');

  if (!settings) return null;

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'recording', label: '1. Recording', icon: Mic },
    { id: 'transcription', label: '2. Transcription', icon: FileAudio },
    { id: 'model', label: '3. AI Model', icon: Cpu },
    { id: 'summary', label: '4. Summary', icon: Sparkles },
    { id: 'templates', label: '5. Templates', icon: FileText },
    { id: 'general', label: 'General & Storage', icon: Sliders }
  ];

  const presetTemplates = [
    { name: 'Standard Meeting Notes', desc: 'Summary, Key Decisions, Action Items table, Discussion Highlights, Next Steps.' },
    { name: 'Daily Standup', desc: 'Yesterday accomplishments, Today plan, Blockers / Impediments, Peer pairing.' },
    { name: 'Project Sync / Status Update', desc: 'Project Health, Milestone Progress, Decisions & Tradeoffs, Action Matrix, Risks.' },
    { name: 'Retrospective (Agile)', desc: 'What Went Well, What Could Be Improved, Action Items & Process Adjustments.' },
    { name: 'Client / Sales Meeting', desc: 'Client Objectives, Agreed Deliverables, Commercial Terms, Action Matrix.' },
    { name: '1-on-1 Sync', desc: 'Career Goals, Project Feedback, Discussion Points, Personal Action Items.' },
    { name: 'Board Meeting / Executive Summary', desc: 'Strategic Decisions, Financial & Metric Updates, Board Approvals, Executive Directives.' }
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
          <div className="space-y-4">
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">Built-in MOM Prompt Templates</h4>
              <p className="text-xs text-[#6b7280] mt-0.5 mb-3">
                Select your default template format for new meeting summaries.
              </p>
              <div className="space-y-2">
                {presetTemplates.map((t, idx) => {
                  const isSelected = settings.defaultTemplate === t.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => updateSettings({ defaultTemplate: t.name })}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-[#2563eb] bg-[#f5f8ff]'
                          : 'border-[#e5e7eb] hover:bg-[#f9fafb]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-[#111827]">
                        <span>{t.name}</span>
                        {isSelected && <span className="text-[#2563eb] font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Default</span>}
                      </div>
                      <p className="text-[11px] text-[#6b7280] mt-1">{t.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Template Builder */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">Add Custom Template</h4>
              <p className="text-xs text-[#6b7280] mt-0.5 mb-3">
                Define specialized MOM structures tailored to your company workflows.
              </p>
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="Template Name (e.g., Sprint Planning Sync)"
                  value={customTemplateName}
                  onChange={(e) => setCustomTemplateName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                />
                <textarea
                  rows={3}
                  placeholder="Sections to include (e.g. Scope, Story Points, Velocity, Action Matrix)..."
                  value={customTemplateDesc}
                  onChange={(e) => setCustomTemplateDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563eb] resize-none"
                />
                <button
                  onClick={() => {
                    if (customTemplateName) {
                      showToast('Custom Template created', customTemplateName, 'success');
                      setCustomTemplateName('');
                      setCustomTemplateDesc('');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-[#1d4ed8] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Custom Template</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. GENERAL & STORAGE TAB */}
        {settingsTab === 'general' && (
          <div className="space-y-5">
            {/* Appearance & Themes */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="mb-3">
                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Sun className="w-4 h-4 text-[#2563eb]" />
                  <span>Appearance &amp; Theme</span>
                </h4>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Select your interface appearance preference across the Minomeet workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Device / System Auto */}
                <button
                  onClick={() => updateSettings({ theme: 'system' })}
                  className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    (settings.theme || 'system') === 'system'
                      ? 'border-[#2563eb] bg-[#eff6ff]'
                      : 'border-[#e5e7eb] hover:border-[#cbd5e1] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-[#2563eb] flex items-center justify-center">
                        <Monitor className="w-4 h-4" />
                      </div>
                      {(settings.theme || 'system') === 'system' && (
                        <span className="text-[#2563eb] text-xs font-black flex items-center gap-1">
                          <Check className="w-4 h-4" /> Active
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-xs text-[#111827]">Device Theme</div>
                    <div className="text-[11px] text-[#6b7280] mt-0.5">
                      Automatically syncs with macOS / OS system dark &amp; light mode.
                    </div>
                  </div>
                </button>

                {/* 2. Light Theme */}
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    settings.theme === 'light'
                      ? 'border-[#2563eb] bg-[#eff6ff]'
                      : 'border-[#e5e7eb] hover:border-[#cbd5e1] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Sun className="w-4 h-4" />
                      </div>
                      {settings.theme === 'light' && (
                        <span className="text-[#2563eb] text-xs font-black flex items-center gap-1">
                          <Check className="w-4 h-4" /> Active
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-xs text-[#111827]">Light Theme</div>
                    <div className="text-[11px] text-[#6b7280] mt-0.5">
                      High-contrast clean white canvases and clear typography.
                    </div>
                  </div>
                </button>

                {/* 3. Dark Theme */}
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    settings.theme === 'dark'
                      ? 'border-[#2563eb] bg-[#eff6ff]'
                      : 'border-[#e5e7eb] hover:border-[#cbd5e1] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      {settings.theme === 'dark' && (
                        <span className="text-[#2563eb] text-xs font-black flex items-center gap-1">
                          <Check className="w-4 h-4" /> Active
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-xs text-[#111827]">Dark Theme</div>
                    <div className="text-[11px] text-[#6b7280] mt-0.5">
                      Obsidian dark interface engineered for reduced eye strain.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Desktop Notifications */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#2563eb]" />
                    <span>Desktop Notifications</span>
                  </h4>
                  <p className="text-xs text-[#6b7280] mt-0.5 max-w-lg">
                    Receive on-device system notifications when recording starts, meetings are saved, or AI MOM summaries complete.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {settings.notifications && (
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined' && 'Notification' in window) {
                          Notification.requestPermission().then(p => {
                            if (p === 'granted') {
                              new Notification('Minomeet AI Notifications Active', {
                                body: 'You will receive status updates when meetings and summaries finish.',
                                icon: '/favicon.ico'
                              });
                              showToast('Test Notification Sent', 'Check your system notification center', 'success');
                            } else {
                              showToast('Permission needed', 'Please allow notifications in your browser settings.', 'warning');
                            }
                          });
                        } else {
                          showToast('Notifications Active', 'Native browser notification supported', 'info');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] text-[11px] font-bold text-[#1e3a8a] hover:bg-[#dbeafe] transition cursor-pointer"
                    >
                      Send Test
                    </button>
                  )}
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
            </div>

            {/* Data Storage Locations & Folder Launcher */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#2563eb]" />
                <span>Data Storage Locations</span>
              </h4>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Local directory where Minomeet stores your transcripts, audio recordings, and AI indices.
              </p>
              
              <div className="flex items-center gap-2 my-3">
                <div className="font-mono text-xs bg-[#f9fafb] border border-[#e5e7eb] px-3.5 py-2 rounded-xl text-[#374151] flex-1 truncate">
                  {settings.storagePath || '/Users/you/Minomeet/recordings'}
                </div>
                <button
                  onClick={openStorageFolder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-xs transition cursor-pointer flex-none"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open Folder in Finder</span>
                </button>
              </div>

              <div className="mt-3 p-3.5 rounded-xl bg-[#eff4ff] border border-[#c9dcff] flex items-start gap-2.5 text-xs text-[#1e3a8a]">
                <ShieldCheck className="w-4 h-4 flex-none mt-0.5 text-[#2563eb]" />
                <p>
                  <b>100% Privacy &bull; Local Storage Only:</b> Database files, models, and audio never leave this machine.
                </p>
              </div>
            </div>

            {/* Auto-delete Recordings & Purge Cleaner */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-[#ef4444]" />
                    <span>Auto-Delete Raw Audio Recordings</span>
                  </h4>
                  <p className="text-xs text-[#6b7280] mt-0.5 max-w-lg">
                    Automatically reclaim disk space by purging raw audio files after transcripts and summaries have been processed.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={settings.autoDeleteRecordingsDays}
                    onChange={(e) => updateSettings({ autoDeleteRecordingsDays: Number(e.target.value) })}
                    className="text-xs font-bold px-3 py-1.5 border border-[#d6dbe2] rounded-xl bg-white text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  >
                    <option value={0}>Never (Keep all audio recordings)</option>
                    <option value={7}>After 7 Days</option>
                    <option value={14}>After 14 Days</option>
                    <option value={30}>After 30 Days</option>
                    <option value={60}>After 60 Days</option>
                  </select>

                  <button
                    onClick={() => purgeOldRecordings(settings.autoDeleteRecordingsDays)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#fee2e2] bg-[#fef2f2] text-[#ef4444] hover:bg-[#fee2e2] text-xs font-bold transition cursor-pointer flex-none"
                  >
                    Purge Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
