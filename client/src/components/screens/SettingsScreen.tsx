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
  Plus
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
    showToast
  } = useMeeting();

  const [customTemplateName, setCustomTemplateName] = useState('');
  const [customTemplateDesc, setCustomTemplateDesc] = useState('');

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
          <div className="space-y-4">
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">Transcription Engine</h4>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Runs fully on-device — speech recognition and acoustic features never leave this machine.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#dbeafe] text-[#1e3a8a] border border-[#bfdbfe] text-xs font-bold mt-3">
                <Zap className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>{settings.transcriptionEngine}</span>
              </div>
            </div>

            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Live Captions Stream</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Render speech-to-text words in real time while a recording is in progress.
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
            </div>

            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Speaker Diarization Labels</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Automatically distinguish and label distinct speaker voices in the live transcript.
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
              <h4 className="text-sm font-bold text-[#111827]">Default Language</h4>
              <p className="text-xs text-[#6b7280] mt-0.5 mb-3">
                Choose the primary language for MOM AI document generation.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {['English', 'Spanish', 'French', 'German', 'Hindi', 'Malayalam'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateSettings({ defaultLanguage: lang })}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                      settings.defaultLanguage === lang
                        ? 'bg-[#dbeafe] border-[#bfdbfe] text-[#1e3a8a]'
                        : 'border-[#d6dbe2] text-[#374151] hover:bg-[#f6f7f9]'
                    }`}
                  >
                    {lang} {settings.defaultLanguage === lang && '✓'}
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
          <div className="space-y-4">
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Notifications</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5 max-w-lg">
                    Enable system notifications for the start and completion of recorded meeting sessions.
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

            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-[#111827]">Data Storage Locations</h4>
              <p className="text-xs text-[#6b7280] mt-0.5">
                View and access where Minomeet stores your transcripts and audio — nothing ever leaves this device.
              </p>
              <div className="font-mono text-xs bg-[#f9fafb] border border-[#e5e7eb] px-3.5 py-2.5 rounded-xl my-3 text-[#374151]">
                {settings.storagePath}
              </div>
              <button
                onClick={() => showToast('Opening directory…', settings.storagePath, 'info')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d6dbe2] bg-white text-xs font-bold text-[#374151] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open Folder</span>
              </button>

              <div className="mt-4 p-3.5 rounded-xl bg-[#eff4ff] border border-[#c9dcff] flex items-start gap-2.5 text-xs text-[#1e3a8a]">
                <ShieldCheck className="w-4 h-4 flex-none mt-0.5 text-[#2563eb]" />
                <p>
                  <b>Privacy Guarantee:</b> Database files and AI embeddings are stored locally in your application directory for unified offline security.
                </p>
              </div>
            </div>

            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Auto-delete recordings</h4>
                  <p className="text-xs text-[#6b7280] mt-0.5 max-w-lg">
                    Automatically purge raw audio recordings {settings.autoDeleteRecordingsDays} days after a transcript + summary is verified.
                  </p>
                </div>
                <div
                  onClick={() => updateSettings({ autoDeleteRecordingsDays: settings.autoDeleteRecordingsDays > 0 ? 0 : 30 })}
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
          </div>
        )}

      </div>
    </div>
  );
};
