import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { getActiveAIModel } from '../../utils/aiModelConfig.js';
import { api } from '../../services/api.js';
import { LocalLLMStatus } from '../../types/meeting.js';
import {
  Mic,
  Upload,
  MessageSquare,
  FileText,
  Clock,
  FileCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Cpu,
  MoreVertical,
  Edit3,
  Trash2,
  Download
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    meetings,
    settings,
    startRecording,
    openModal,
    openDeleteModal,
    openRenameModal,
    selectMeeting,
    setCurrentScreen,
    setSettingsTab
  } = useMeeting();

  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenCardMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Compute metrics
  const totalMeetings = meetings.length;
  const momConvertedMeetings = meetings.filter(
    m => !!(m.summary && (m.summary.summary || (m.summary.actionItems && m.summary.actionItems.length > 0) || (m.summary.keyDecisions && m.summary.keyDecisions.length > 0)))
  ).length;
  const momConversionRate = totalMeetings > 0 ? Math.round((momConvertedMeetings / totalMeetings) * 100) : 0;

  // Active Default AI Model Resolution
  const activeAI = getActiveAIModel(settings);

  // First-Time Local LLM Setup State
  const [localLLMStatus, setLocalLLMStatus] = useState<LocalLLMStatus | null>(null);
  const [isDownloadingLLM, setIsDownloadingLLM] = useState<boolean>(false);

  useEffect(() => {
    api.getLocalLLMStatus().then(status => {
      setLocalLLMStatus(status);
    }).catch(() => {});
  }, []);

  const handleDownloadLLM = async () => {
    setIsDownloadingLLM(true);
    try {
      await api.downloadLocalLLM();
      const interval = setInterval(async () => {
        try {
          const status = await api.getLocalLLMStatus();
          setLocalLLMStatus(status);
          if (status.status === 'downloaded') {
            clearInterval(interval);
            setIsDownloadingLLM(false);
          }
        } catch {}
      }, 500);
    } catch {
      setIsDownloadingLLM(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-white via-[#fcfdff] to-[#f8fafd]">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* First-Time Local AI Setup Banner */}
        {localLLMStatus && localLLMStatus.status !== 'downloaded' && (
          <div className="bg-gradient-to-r from-[#eff6ff] via-[#f0f9ff] to-[#f8fafc] border border-[#bfdbfe] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-[#2563eb] text-white rounded-xl shadow-xs flex-none mt-0.5">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1e3a8a]">First-Time Setup: Download Qwen 3.5 4B (2.6 GB)</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#86efac]">
                    ● 100% Offline &amp; Private
                  </span>
                </div>
                <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                  Minomeet uses the on-device <b>Qwen 3.5 4B</b> neural model for local executive summaries, key decisions, and Q&amp;A. Download the model weights once to enable zero-cloud offline synthesis.
                </p>
              </div>
            </div>

            <div className="flex-none">
              {localLLMStatus.status === 'downloading' || isDownloadingLLM ? (
                <div className="w-44 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#2563eb]">
                    <span>Downloading…</span>
                    <span>{localLLMStatus.downloadProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563eb] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${localLLMStatus.downloadProgress || 5}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDownloadLLM}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download &amp; Install Model</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#3730a3] p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-4 border border-white/20 text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Next-Gen On-Device &amp; Cloud Meeting Intelligence</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Welcome to Minomeet
            </h1>
            <p className="text-sm text-indigo-100 leading-relaxed mb-6">
              Record system and microphone audio, capture live transcripts, and generate structured Minutes of Meeting (MOM) with actionable tasks, key decisions, and multi-model AI synthesis that stays private.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => startRecording()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#312e81] font-bold text-sm shadow-md hover:bg-indigo-50 transition active:scale-95 cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#e2564c]" />
                <span>Start Live Recording</span>
              </button>
              <button
                onClick={() => openModal('import')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition cursor-pointer backdrop-blur-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Import Audio</span>
              </button>
              <button
                onClick={() => openModal('ask')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/80 text-white font-semibold text-sm border border-indigo-400/30 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-indigo-200" />
                <span>Ask Your Meetings</span>
              </button>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
            <Sparkles className="w-72 h-72 text-white transform rotate-12" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Meetings Card */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#6b7280] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Meetings</span>
                <FileText className="w-4 h-4 text-[#4f46e5]" />
              </div>
              <div className="text-2xl font-black text-[#111827]">{totalMeetings}</div>
              <p className="text-xs text-[#9aa2af] mt-1">Transcribed and archived</p>
            </div>
            <div className="mt-3 text-[11.5px] font-medium text-[#6b7280]">
              {totalMeetings === 0 ? 'No recorded meetings yet' : `${totalMeetings} stored on device`}
            </div>
          </div>

          {/* MOM Docs Converted Card */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#6b7280] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">MOM Docs Converted</span>
                <FileCheck className="w-4 h-4 text-[#15803d]" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-black text-[#111827]">{momConvertedMeetings}</div>
                <span className="text-xs font-extrabold text-[#15803d] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                  {momConversionRate}% converted
                </span>
              </div>
              <p className="text-xs text-[#9aa2af] mt-1">
                {momConvertedMeetings} of {totalMeetings} {totalMeetings === 1 ? 'meeting' : 'meetings'} converted to MOM
              </p>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#22c55e] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${momConversionRate}%` }}
              />
            </div>
          </div>

          {/* Default AI LLM Model Card */}
          <div
            onClick={() => {
              setCurrentScreen('settings');
              setSettingsTab('model');
            }}
            className="bg-white rounded-xl border border-[#e5e7eb] hover:border-[#bfdbfe] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between text-[#6b7280] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Default AI Model</span>
                <Cpu className="w-4 h-4 text-[#7c3aed] group-hover:scale-110 transition-transform" />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                  {activeAI.providerName}
                </span>
              </div>

              <div className="text-sm font-extrabold text-[#111827] mt-1.5 truncate" title={activeAI.modelId}>
                {activeAI.modelId}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#f3f4f6] text-[11px]">
              <div className="flex items-center gap-1.5 font-semibold">
                <span className={`w-2 h-2 rounded-full ${
                  activeAI.status === 'connected' ? 'bg-[#22c55e] animate-pulse' :
                  activeAI.status === 'testing' ? 'bg-[#eab308] animate-pulse' :
                  'bg-[#ef4444]'
                }`} />
                <span className={
                  activeAI.status === 'connected' ? 'text-[#15803d]' :
                  activeAI.status === 'testing' ? 'text-[#b45309]' :
                  'text-[#dc2626]'
                }>
                  {activeAI.status === 'connected' ? 'Ready & Active' :
                   activeAI.status === 'testing' ? 'Testing…' :
                   'Configure in Settings'}
                </span>
              </div>

              <span className="text-[#2563eb] group-hover:underline flex items-center gap-0.5 font-bold">
                Change <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>

        {/* Recent Meetings Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4f46e5]" />
              <span>Recent Meeting Minutes</span>
            </h2>
            <span className="text-xs text-[#6b7280]">Showing {meetings.slice(0, 4).length} of {meetings.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.slice(0, 4).map((meeting) => {
              const isMenuOpen = openCardMenuId === meeting.id;

              return (
                <div
                  key={meeting.id}
                  onClick={() => selectMeeting(meeting)}
                  className="relative bg-white border border-[#e5e7eb] hover:border-[#bfdbfe] rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#2563eb] transition line-clamp-1 pr-6">
                        {meeting.title}
                      </h3>

                      {/* Top Right Duration & 3-Dot Menu */}
                      <div className="flex items-center gap-1.5 flex-none relative">
                        <span className="text-xs text-[#9aa2af] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {meeting.duration}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenCardMenuId(isMenuOpen ? null : meeting.id);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Card Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              onClick={() => {
                                setOpenCardMenuId(null);
                                openRenameModal(meeting);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition font-medium cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Rename</span>
                            </button>
                            <div className="h-px bg-gray-100 my-0.5" />
                            <button
                              onClick={() => {
                                setOpenCardMenuId(null);
                                openDeleteModal(meeting);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition font-medium cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#4b5563] line-clamp-2 leading-relaxed mb-4">
                      {meeting.summary?.summary || 'No summary generated yet. Click to view transcript and synthesize meeting minutes.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f6] text-xs">
                    <div className="flex items-center gap-2">
                      {meeting.tags?.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-[#f3f4f6] text-[#4b5563] font-medium text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[#2563eb] font-semibold group-hover:translate-x-0.5 transition">
                      <span>Open MOM</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
