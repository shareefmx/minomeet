import React from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import {
  Network,
  X,
  ArrowDown,
  ArrowRight,
  Mic,
  Square,
  FileText,
  Sparkles,
  Save,
  Copy,
  Download,
  Upload,
  Settings
} from 'lucide-react';

export const FlowMapModal: React.FC = () => {
  const {
    modals,
    closeModal,
    closeAllModals,
    setCurrentScreen,
    setSettingsTab,
    startRecording,
    openModal
  } = useMeeting();

  if (!modals.flowmap) return null;

  const jumpTo = (screen: 'home' | 'recording' | 'notes' | 'settings', tab?: any) => {
    closeAllModals();
    setCurrentScreen(screen);
    if (tab) setSettingsTab(tab);
  };

  return (
    <div className="fixed inset-0 bg-[#0f1117]/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-5xl max-h-[90vh] flex flex-col p-6 sm:p-8 animate-in fade-in zoom-in duration-150 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb] flex-none">
          <div>
            <div className="flex items-center gap-2 font-black text-lg sm:text-xl text-[#111827]">
              <Network className="w-5 h-5 text-[#4f46e5]" />
              <span>Minomeet Architecture &amp; Execution Pipeline</span>
            </div>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Click any node in the architecture diagram below to instantly launch or jump into that step.
            </p>
          </div>
          <button
            onClick={() => closeModal('flowmap')}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Architecture Flow Tree */}
        <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-6 text-xs select-none">

          {/* 1. HOME NODE */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => jumpTo('home')}
              className="bg-gradient-to-r from-[#4f46e5] to-[#3730a3] text-white px-6 py-2.5 rounded-xl font-extrabold shadow-md hover:scale-105 transition cursor-pointer text-sm"
            >
              HOME (Dashboard Hub)
            </button>
          </div>

          <div className="flex justify-center text-gray-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* 2. FOUR MAIN BRANCHES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* BRANCH A: START RECORDING */}
            <div className="bg-[#fcfdff] border-2 border-[#bfdbfe] rounded-2xl p-4 flex flex-col space-y-3 shadow-xs">
              <div className="font-black text-[#1e3a8a] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#dbeafe] pb-2">
                <Mic className="w-4 h-4 text-[#e2564c]" />
                <span>1. Start Recording</span>
              </div>

              <div className="space-y-1.5 pl-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4b5563]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                  <span>Microphone Audio</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4b5563]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                  <span>System / Speaker Audio</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4b5563]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                  <span>Live Transcription Stream</span>
                </div>
              </div>

              <div className="flex justify-center text-[#9aa2af]">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <button
                onClick={() => {
                  closeAllModals();
                  startRecording();
                }}
                className="w-full py-2 bg-[#e2564c] hover:bg-[#c2453c] text-white font-bold rounded-xl text-center shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP RECORDING</span>
              </button>

              <div className="flex justify-center text-[#9aa2af]">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#e5e7eb] text-center font-bold text-[#111827]">
                SAVED MEETING
              </div>

              <div className="flex justify-center text-[#9aa2af]">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <button
                onClick={() => jumpTo('notes')}
                className="p-2.5 rounded-xl bg-white border border-[#2563eb] text-[#2563eb] font-bold text-center hover:bg-[#eff6ff] transition cursor-pointer"
              >
                TRANSCRIPT
              </button>

              <div className="flex justify-center text-[#9aa2af]">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff] border border-[#bfdbfe] text-center font-black text-[#1e3a8a]">
                <Sparkles className="w-3.5 h-3.5 inline mr-1 text-[#4f46e5]" />
                AI MOM ENGINE
              </div>

              {/* 3 Pillars: Summary, Decisions, Actions */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <div className="p-1.5 rounded bg-white border border-[#e5e7eb] text-[10px] font-bold text-center text-[#1f2937]">
                  Summary
                </div>
                <div className="p-1.5 rounded bg-white border border-[#e5e7eb] text-[10px] font-bold text-center text-[#1f2937]">
                  Decisions
                </div>
                <div className="p-1.5 rounded bg-white border border-[#e5e7eb] text-[10px] font-bold text-center text-[#1f2937]">
                  Actions
                </div>
              </div>

              <div className="flex justify-center text-[#9aa2af]">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <button
                onClick={() => jumpTo('notes')}
                className="w-full p-2 bg-[#111827] text-white font-bold rounded-xl text-center shadow-xs hover:bg-[#1f2937] transition cursor-pointer"
              >
                EDITABLE MOM
              </button>

              {/* Actions: Save, Copy, Export */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <div className="p-1 rounded bg-[#f3f4f6] text-[9.5px] font-semibold text-center text-[#4b5563] flex items-center justify-center gap-0.5">
                  <Save className="w-2.5 h-2.5" /> Save
                </div>
                <div className="p-1 rounded bg-[#f3f4f6] text-[9.5px] font-semibold text-center text-[#4b5563] flex items-center justify-center gap-0.5">
                  <Copy className="w-2.5 h-2.5" /> Copy
                </div>
                <div className="p-1 rounded bg-[#f3f4f6] text-[9.5px] font-semibold text-center text-[#4b5563] flex items-center justify-center gap-0.5">
                  <Download className="w-2.5 h-2.5" /> Export
                </div>
              </div>
            </div>

            {/* BRANCH B: IMPORT AUDIO */}
            <div className="bg-[#fcfdff] border-2 border-[#e5e7eb] rounded-2xl p-4 flex flex-col space-y-3 shadow-xs">
              <div className="font-black text-[#111827] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e7eb] pb-2">
                <Upload className="w-4 h-4 text-[#2563eb]" />
                <span>2. Import Audio</span>
              </div>
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                Upload local audio recordings (MP3, WAV, MP4, WebM, M4A) for on-device speech processing.
              </p>

              <button
                onClick={() => {
                  closeAllModals();
                  openModal('import');
                }}
                className="w-full py-2 bg-[#dbeafe] text-[#1e3a8a] border border-[#bfdbfe] font-bold rounded-xl text-center hover:bg-[#bfdbfe] transition cursor-pointer"
              >
                Open Import Modal
              </button>

              <div className="flex justify-center text-[#9aa2af]">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#e5e7eb] text-center text-[11.5px] font-bold text-[#1f2937]">
                Transcript &rarr; MOM Synthesis
              </div>
            </div>

            {/* BRANCH C: MEETING NOTES */}
            <div className="bg-[#fcfdff] border-2 border-[#e5e7eb] rounded-2xl p-4 flex flex-col space-y-3 shadow-xs">
              <div className="font-black text-[#111827] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e7eb] pb-2">
                <FileText className="w-4 h-4 text-[#15803d]" />
                <span>3. Meeting Notes</span>
              </div>
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                Persistent historical storage of past meetings with instant full-text filtering and quick MOM retrieval.
              </p>

              <button
                onClick={() => jumpTo('notes')}
                className="w-full py-2 bg-[#dcfce7] text-[#15803d] border border-[#86efac] font-bold rounded-xl text-center hover:bg-[#bbf7d0] transition cursor-pointer"
              >
                Open Previous MOM
              </button>
            </div>

            {/* BRANCH D: SETTINGS */}
            <div className="bg-[#fcfdff] border-2 border-[#e5e7eb] rounded-2xl p-4 flex flex-col space-y-3 shadow-xs">
              <div className="font-black text-[#111827] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e7eb] pb-2">
                <Settings className="w-4 h-4 text-[#7c3aed]" />
                <span>4. Settings</span>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => jumpTo('settings', 'recording')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-[#e5e7eb] hover:border-[#2563eb] text-[11px] font-semibold text-[#374151] transition flex items-center justify-between"
                >
                  <span>1. Recording</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => jumpTo('settings', 'transcription')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-[#e5e7eb] hover:border-[#2563eb] text-[11px] font-semibold text-[#374151] transition flex items-center justify-between"
                >
                  <span>2. Transcription</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => jumpTo('settings', 'model')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-[#e5e7eb] hover:border-[#2563eb] text-[11px] font-semibold text-[#374151] transition flex items-center justify-between"
                >
                  <span>3. AI Model</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => jumpTo('settings', 'summary')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-[#e5e7eb] hover:border-[#2563eb] text-[11px] font-semibold text-[#374151] transition flex items-center justify-between"
                >
                  <span>4. Summary</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => jumpTo('settings', 'templates')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-[#e5e7eb] hover:border-[#2563eb] text-[11px] font-semibold text-[#374151] transition flex items-center justify-between"
                >
                  <span>5. Templates</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-between flex-none">
          <div className="text-[11px] text-[#9aa2af]">
            Minomeet Architecture v1.0 &bull; Complete End-to-End Pipeline
          </div>
          <button
            onClick={() => closeModal('flowmap')}
            className="px-5 py-2 rounded-xl bg-[#111827] text-white text-xs font-bold hover:bg-[#1f2937] transition cursor-pointer"
          >
            Close Flow Map
          </button>
        </div>
      </div>
    </div>
  );
};
