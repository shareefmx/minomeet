import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import {
  Mic,
  Upload,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  MoreVertical,
  Edit3,
  Trash2
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    meetings,
    startRecording,
    openModal,
    openDeleteModal,
    openRenameModal,
    selectMeeting
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
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.summary?.actionItems.length || 0), 0);
  const pendingActionItems = meetings.reduce(
    (acc, m) => acc + (m.summary?.actionItems.filter(a => !a.completed).length || 0),
    0
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-white via-[#fcfdff] to-[#f8fafd]">
      <div className="max-w-5xl mx-auto space-y-8">

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
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#6b7280] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Meetings</span>
              <FileText className="w-4 h-4 text-[#4f46e5]" />
            </div>
            <div className="text-2xl font-black text-[#111827]">{totalMeetings}</div>
            <p className="text-xs text-[#9aa2af] mt-1">Transcribed and archived</p>
          </div>

          <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#6b7280] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Open Action Items</span>
              <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
            </div>
            <div className="text-2xl font-black text-[#111827]">{pendingActionItems}</div>
            <p className="text-xs text-[#9aa2af] mt-1">{totalActionItems} total tracked tasks</p>
          </div>

          <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#6b7280] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Privacy Engine</span>
              <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
            </div>
            <div className="text-lg font-extrabold text-[#111827] mt-1">Nimbus 4B Active</div>
            <p className="text-xs text-[#15803d] mt-1 flex items-center gap-1 font-semibold">
              <Zap className="w-3 h-3" /> On-Device &bull; 0 Cloud Leaks
            </p>
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
                          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
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
