import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import {
  Search,
  Home,
  FileText,
  Mic,
  Upload,
  Settings,
  Info,
  MessageSquare,
  MoreVertical,
  Edit3,
  Trash2,
  Compass
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    meetings,
    activeMeeting,
    currentScreen,
    searchQuery,
    isRecording,
    setSearchQuery,
    setCurrentScreen,
    selectMeeting,
    startRecording,
    stopRecording,
    openModal,
    openDeleteModal,
    openRenameModal,
    setSettingsTab
  } = useMeeting();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredMeetings = meetings.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.summary?.summary.toLowerCase().includes(q) ||
      m.transcript.some(t => t.text.toLowerCase().includes(q))
    );
  });

  return (
    <aside className="w-[286px] flex-none border-r border-[#e5e7eb] bg-white flex flex-col p-4 overflow-hidden select-none">
      {/* Search Bar */}
      <div className="relative flex items-center mb-3">
        <Search className="w-4 h-4 text-[#9aa2af] absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search meeting content…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#d6dbe2] rounded-lg text-[#111827] placeholder-[#9aa2af] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] bg-white transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 mb-2">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-bold transition text-left cursor-pointer ${
            currentScreen === 'home'
              ? 'bg-[#eaf1ff] text-[#1e3a8a]'
              : 'text-[#111827] hover:bg-[#f3f4f6]'
          }`}
        >
          <Home className="w-4 h-4 text-[#4b5563]" />
          <span>Home</span>
        </button>

        <button
          onClick={() => openModal('ask')}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-semibold transition text-left cursor-pointer text-[#4f46e5] hover:bg-[#eef2ff] group"
        >
          <MessageSquare className="w-4 h-4 text-[#4f46e5] group-hover:scale-110 transition" />
          <span>Ask Your Meetings</span>
          <span className="ml-auto text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#f2e9ff] text-[#7c3aed]">AI</span>
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('minomeet_replay_tour'))}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-semibold transition text-left cursor-pointer text-[#2563eb] hover:bg-[#eff6ff] group"
          title="Website Onboarding Tour &amp; Product Walkthrough (7 Steps)"
        >
          <Compass className="w-4 h-4 text-[#2563eb] group-hover:rotate-45 transition" />
          <span className="truncate">Website Onboarding Tour</span>
          <span className="ml-auto text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#dbeafe] text-[#1e40af] flex-none">7 Steps</span>
        </button>
      </nav>

      {/* Section Label */}
      <div className="flex items-center gap-2 text-[12.5px] font-extrabold text-[#111827] mt-2 mb-1.5 px-1">
        <FileText className="w-4 h-4 text-[#6b7280]" />
        <span>Meeting Notes</span>
        <span className="ml-auto text-xs text-[#9aa2af] font-normal">({filteredMeetings.length})</span>
      </div>

      {/* Meeting Notes List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 -mr-1">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9aa2af]">
            No meetings matching search.
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const isActive = currentScreen === 'notes' && activeMeeting?.id === meeting.id;
            const isMenuOpen = openMenuId === meeting.id;

            return (
              <div
                key={meeting.id}
                onClick={() => selectMeeting(meeting)}
                className={`relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-[13px] leading-snug transition group ${
                  isActive
                    ? 'bg-[#eaf1ff] text-[#1d4ed8] font-semibold border-l-2 border-[#2563eb]'
                    : 'text-[#374151] hover:bg-[#f6f7f9]'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <FileText className={`w-3.5 h-3.5 mt-0.5 flex-none transition ${isActive ? 'text-[#2563eb]' : 'text-[#9aa2af] group-hover:text-[#4b5563]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate pr-1">{meeting.title}</div>
                    <div className="text-[11px] text-[#9aa2af] font-normal flex items-center gap-1.5 mt-0.5">
                      <span>{meeting.duration}</span>
                      {meeting.summary ? (
                        <span className="text-[#15803d] font-medium">&bull; MOM Ready</span>
                      ) : (
                        <span className="text-[#92400e] font-medium">&bull; No Summary</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Three-dot Context Menu Trigger */}
                <div className="relative flex-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : meeting.id);
                    }}
                    className={`p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition ${
                      isMenuOpen ? 'opacity-100 bg-gray-200/80 text-gray-800' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title="Meeting options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu Popup */}
                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
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
                          setOpenMenuId(null);
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
            );
          })
        )}
      </div>

      {/* Sidebar Bottom Actions */}
      <div className="border-t border-[#e5e7eb] pt-3 mt-2 flex flex-col gap-2">
        {/* Record Button */}
        <button
          onClick={isRecording ? () => stopRecording() : () => startRecording()}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-[13.5px] text-white shadow-sm transition active:scale-[0.99] cursor-pointer ${
            isRecording
              ? 'bg-[#c2453c] animate-pulse ring-2 ring-[#e2564c]/40'
              : 'bg-[#e2564c] hover:bg-[#d4483e]'
          }`}
        >
          <Mic className={`w-4 h-4 ${isRecording ? 'animate-spin' : ''}`} />
          <span>{isRecording ? 'Recording in progress…' : 'Start Recording'}</span>
        </button>

        {/* Import Audio Button */}
        <button
          onClick={() => openModal('import')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-[13.5px] bg-[#dbeafe] text-[#1e3a8a] hover:bg-[#bfdbfe] transition cursor-pointer border border-[#bfdbfe]"
        >
          <Upload className="w-4 h-4" />
          <span>Import Audio</span>
        </button>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              setCurrentScreen('settings');
              setSettingsTab('recording');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold text-[12.5px] border border-[#e5e7eb] transition cursor-pointer ${
              currentScreen === 'settings' ? 'bg-[#eaf1ff] text-[#1e3a8a] border-[#bfdbfe]' : 'bg-[#eef0f2] text-[#374151] hover:bg-[#e4e7ea]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => openModal('about')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold text-[12.5px] bg-[#eef0f2] text-[#374151] hover:bg-[#e4e7ea] border border-[#e5e7eb] transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </div>
      </div>

      {/* Version Tag */}
      <div className="text-center text-[10.5px] text-[#9aa2af] mt-2 tracking-tight">
        v1.2.0 &bull; Minomeet On-Device AI
      </div>
    </aside>
  );
};
