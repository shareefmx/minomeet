import React from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { Sparkles, X, Shield, Cpu, PiggyBank, Globe, CheckCircle2 } from 'lucide-react';

export const AboutModal: React.FC = () => {
  const { modals, closeModal, showToast } = useMeeting();

  if (!modals.about) return null;

  return (
    <div className="fixed inset-0 bg-[#0f1117]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-xl p-8 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => closeModal('about')}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logo and Tagline */}
        <div className="text-center -mt-2">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 bg-gradient-to-br from-[#7c5cff] to-[#4f46e5] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#111827]">Minomeet AI</h2>
          <div className="text-xs font-bold text-[#9aa2af] mt-0.5">v1.0.0 &bull; On-Device &amp; Cloud Ready</div>
          <p className="text-xs text-[#4b5563] max-w-sm mx-auto mt-2 leading-relaxed">
            Real-time meeting minutes, transcripts, and task trackers that never leave your device.
          </p>

          <button
            onClick={() => showToast("You're up to date", 'Minomeet v1.0.0 is the latest stable release.', 'success')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#d6dbe2] bg-[#f9fafb] text-xs font-bold text-[#374151] hover:bg-white shadow-2xs transition mt-4 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>Check for Updates</span>
          </button>
        </div>

        {/* Feature Grid */}
        <h4 className="text-xs font-black uppercase tracking-wider text-[#111827] mt-6 mb-3">
          What makes Minomeet different
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#e5e7eb]">
            <div className="flex items-center gap-1.5 font-bold text-[#111827] mb-1">
              <Shield className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Privacy-First</span>
            </div>
            <p className="text-[11.5px] text-[#6b7280] leading-relaxed">
              Audio, transcripts and AI processing stay on this machine. No cloud, zero leaks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#e5e7eb]">
            <div className="flex items-center gap-1.5 font-bold text-[#111827] mb-1">
              <Cpu className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Multi-Model AI</span>
            </div>
            <p className="text-[11.5px] text-[#6b7280] leading-relaxed">
              Use Nimbus 1B/2B/4B locally or configure OpenAI, Gemini, and Ollama APIs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#e5e7eb]">
            <div className="flex items-center gap-1.5 font-bold text-[#111827] mb-1">
              <PiggyBank className="w-3.5 h-3.5 text-[#15803d]" />
              <span>Cost-Smart</span>
            </div>
            <p className="text-[11.5px] text-[#6b7280] leading-relaxed">
              Avoid per-minute transcription bills by running models locally at zero recurring cost.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#e5e7eb]">
            <div className="flex items-center gap-1.5 font-bold text-[#111827] mb-1">
              <Globe className="w-3.5 h-3.5 text-[#e2564c]" />
              <span>Works Everywhere</span>
            </div>
            <p className="text-[11.5px] text-[#6b7280] leading-relaxed">
              Google Meet, Zoom, Teams, Slack Huddles, in-person meetings — online or offline.
            </p>
          </div>
        </div>

        {/* Coming soon banner */}
        <div className="mt-4 p-3 rounded-xl bg-[#eff4ff] border border-[#c9dcff] text-xs text-[#1e3a8a] leading-relaxed">
          <b>Coming soon:</b> an ecosystem of autonomous on-device meeting agents tracking Jira tickets, Linear issues, and calendar reminders.
        </div>
      </div>
    </div>
  );
};

