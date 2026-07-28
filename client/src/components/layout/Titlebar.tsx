import React from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import {
  Network,
  Sparkles,
  Mic,
  FileText,
  Settings,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const Titlebar: React.FC = () => {
  const {
    currentScreen,
    activeMeeting,
    isRecording,
    openModal,
    setCurrentScreen,
    setSettingsTab,
    startRecording
  } = useMeeting();

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'home':
        return 'Home Dashboard';
      case 'recording':
        return 'Live Recording Stream';
      case 'notes':
        return activeMeeting ? activeMeeting.title : 'Meeting Notes';
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'Minomeet AI';
    }
  };

  return (
    <header className="h-16 flex-none flex items-center justify-between px-6 bg-white border-b border-[#e5e7eb] shadow-xs select-none z-20">
      {/* Left: Brand Identity & Active Screen Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Minomeet Logo & Name */}
        <button
          onClick={() => setCurrentScreen('home')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#312e81] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg tracking-tight text-[#1e3a8a]">
              Minomeet
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
              AI
            </span>
          </div>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Breadcrumb / Current View Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f8fafd] border border-[#e5e7eb] text-xs font-semibold text-[#374151]">
          <FileText className="w-3.5 h-3.5 text-[#6b7280] flex-none" />
          <span className="text-gray-400 font-normal">/</span>
          <span className="text-[#111827] font-bold max-w-[280px] md:max-w-[420px] truncate">
            {getScreenTitle()}
          </span>
        </div>
      </div>

      {/* Center status tag (Visible on larger screens) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] font-bold text-[#15803d]">
        <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#15803d]" />
          <span>On-Device Privacy Engine</span>
        </span>
      </div>

      {/* Right: Quick Action Controls & Flow Map Button */}
      <div className="flex items-center gap-3">
        {/* Flow Map Inside Header */}
        <button
          onClick={() => openModal('flowmap')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#374151] bg-[#f8f9fb] border border-[#d6dbe2] hover:border-[#bfdbfe] hover:bg-[#eff6ff] hover:text-[#2563eb] px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          title="Open complete architecture & execution flow map"
        >
          <Network className="w-4 h-4 text-[#4f46e5]" />
          <span>Flow map</span>
        </button>

        {/* Ask Your Meetings AI Quick Button */}
        <button
          onClick={() => openModal('ask')}
          className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-[#4f46e5] bg-[#eff4ff] border border-[#c9dcff] hover:bg-[#dbeafe] px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          title="Search & query past meetings with AI"
        >
          <MessageSquare className="w-4 h-4 text-[#4f46e5]" />
          <span>Ask AI</span>
        </button>

        {/* Start / In-Progress Recording Indicator */}
        {isRecording ? (
          <button
            onClick={() => setCurrentScreen('recording')}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#e2564c] hover:bg-[#c2453c] px-4 py-2 rounded-xl shadow-sm animate-pulse cursor-pointer ring-2 ring-[#e2564c]/30"
          >
            <Mic className="w-4 h-4 animate-spin" />
            <span>Recording Active</span>
          </button>
        ) : (
          <button
            onClick={() => startRecording()}
            className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-white bg-[#e2564c] hover:bg-[#d4483e] px-4 py-2 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>Start Recording</span>
          </button>
        )}

        {/* Settings Shortcut */}
        <button
          onClick={() => {
            setCurrentScreen('settings');
            setSettingsTab('recording');
          }}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            currentScreen === 'settings'
              ? 'bg-[#eaf1ff] text-[#2563eb] border-[#bfdbfe]'
              : 'border-[#e5e7eb] text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] bg-[#f9fafb]'
          }`}
          title="Settings & Preferences"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
