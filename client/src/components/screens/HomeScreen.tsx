import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { getActiveAIModel } from '../../utils/aiModelConfig.js';
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
  Key,
  ChevronRight
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

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-white via-[#fcfdff] to-[#f8fafd]">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* AI API Setup Alert Banner if not configured */}
        {!activeAI.isUsable && (
          <div className="bg-gradient-to-r from-[#eff6ff] via-[#f5f3ff] to-[#fffbeb] border-2 border-[#93c5fd] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-[#2563eb] to-[#4f46e5] text-white rounded-xl shadow-xs flex-none mt-0.5 ring-4 ring-indigo-50">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-[#1e3a8a]">
                    AI Model Not Configured — First-Time Setup Required
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-[#334155] leading-relaxed max-w-2xl">
                  Minomeet requires an AI model API key to generate automated <b>Minutes of Meeting (MOM)</b>, executive summaries, extract key decisions, assign action items, and power semantic Q&amp;A.
                </p>
                <div className="flex items-center gap-2 flex-wrap pt-0.5 text-[11px] text-[#475569]">
                  <span className="font-semibold text-[#1e293b]">Supported Providers:</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] font-medium text-[#1e3a8a]">Google Gemini</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] font-medium text-[#1e3a8a]">OpenAI GPT-4o</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] font-medium text-[#1e3a8a]">Claude 3.7</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] font-medium text-[#1e3a8a]">Groq</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] font-medium text-[#1e3a8a]">Ollama (Local)</span>
                </div>
              </div>
            </div>

            <div className="flex-none pt-2 md:pt-0">
              <button
                onClick={() => {
                  setCurrentScreen('settings');
                  setSettingsTab('model');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#2563eb] to-[#4f46e5] hover:from-[#1d4ed8] hover:to-[#4338ca] text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2 active:scale-95 whitespace-nowrap"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configure AI Model &amp; API Key</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
                <span>Import Recording</span>
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
            {meetings.length > 0 && (
              <span className="text-xs text-[#6b7280]">Showing {meetings.slice(0, 4).length} of {meetings.length}</span>
            )}
          </div>

          {meetings.length === 0 ? (
            <div className="border-2 border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center bg-[#fafbfc] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#dbeafe] flex items-center justify-center text-[#2563eb] mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#111827] mb-1">No Recorded Meetings Yet</h3>
              <p className="text-xs text-[#6b7280] max-w-md mx-auto mb-4 leading-relaxed">
                Start a live recording to capture your microphone and video conference audio, or import an existing audio file to generate executive meeting minutes.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startRecording()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Live Recording</span>
                </button>
                <button
                  onClick={() => openModal('import')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#d6dbe2] hover:bg-[#f8fafc] text-[#374151] text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#4f46e5]" />
                  <span>Import Recording (Audio/Video)</span>
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </div>

      </div>
    </div>
  );
};
