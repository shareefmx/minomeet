import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import {
  Sparkles,
  X,
  Shield,
  Cpu,
  Globe,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  GitBranch,
  Terminal,
  Zap,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseName?: string;
  releaseNotes?: string;
  releaseUrl: string;
  repoUrl: string;
  publishedAt?: string;
  latestCommit?: { sha: string; message: string; date: string; url: string };
  note?: string;
  error?: string;
}

export const AboutModal: React.FC = () => {
  const { modals, closeModal, showToast } = useMeeting();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  if (!modals.about) return null;

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateInfo(null);
    try {
      const data = await api.checkUpdate();
      setUpdateInfo(data);
      setHasChecked(true);

      if (data.hasUpdate) {
        showToast('New Update Available!', `Minomeet ${data.latestVersion} is now available on GitHub.`, 'info');
      } else {
        showToast('Up to Date!', `Minomeet ${data.currentVersion} is the latest release.`, 'success');
      }
    } catch (err: any) {
      setUpdateInfo({
        currentVersion: 'v1.2.0',
        latestVersion: 'v1.2.0',
        hasUpdate: false,
        releaseUrl: 'https://github.com/shareefmx/minomeet/releases',
        repoUrl: 'https://github.com/shareefmx/minomeet',
        error: err.message
      });
      setHasChecked(true);
      showToast('Update Check', 'Could not query GitHub releases. Check your network or visit GitHub directly.', 'warning');
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1117]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e5e7eb] w-full max-w-xl max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-end px-5 pt-4 pb-0">
          <button
            onClick={() => closeModal('about')}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Branding */}
        <div className="px-6 text-center pt-2 pb-4 border-b border-[#f3f4f6]">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 bg-gradient-to-br from-[#7c5cff] via-[#6366f1] to-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-50">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-[#111827] tracking-tight">Minomeet AI</h2>
          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-extrabold text-[#2563eb] bg-[#eff6ff] px-2.5 py-0.5 rounded-lg border border-[#bfdbfe]">
              v1.2.0 Release
            </span>
            <span className="text-xs font-semibold text-[#6b7280]">
              Autonomous On-Device &amp; Cloud AI
            </span>
            <span className="text-xs font-semibold text-[#15803d] bg-[#f0fdf4] px-2 py-0.5 rounded-lg border border-[#bbf7d0]">
              MIT License
            </span>
          </div>

          <p className="text-xs text-[#4b5563] max-w-md mx-auto mt-2.5 leading-relaxed">
            Real-time meeting intelligence, neural transcription, and executive Minutes of Meeting (MOM) that run privately on your machine.
          </p>

          {/* GitHub Live Update Checker Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#fafbfc] border border-[#e5e7eb] max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-left">
                <GithubIcon className="w-4 h-4 text-[#111827] flex-none" />
                <div>
                  <div className="text-xs font-bold text-[#111827]">
                    GitHub Release Status
                  </div>
                  <div className="text-[11px] text-[#6b7280]">
                    {checkingUpdate
                      ? 'Checking github.com/shareefmx/minomeet…'
                      : hasChecked
                      ? updateInfo?.hasUpdate
                        ? `New version ${updateInfo?.latestVersion} is available!`
                        : `Current version v1.2.0 is up to date.`
                      : 'Repository: shareefmx/minomeet'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer flex-none ${
                  checkingUpdate
                    ? 'bg-[#e5e7eb] text-[#6b7280] cursor-not-allowed'
                    : 'bg-[#111827] hover:bg-[#1f2937] text-white'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                <span>{checkingUpdate ? 'Checking…' : 'Check for Updates'}</span>
              </button>
            </div>

            {/* Update Info / Commit details when checked */}
            {hasChecked && updateInfo && (
              <div className="mt-3 pt-3 border-t border-[#e5e7eb] text-left">
                {updateInfo.hasUpdate ? (
                  <div className="p-2.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#1e40af] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Update available: {updateInfo.latestVersion}</span>
                      </div>
                      {updateInfo.releaseName && (
                        <div className="text-[11px] text-[#3b82f6] mt-0.5">{updateInfo.releaseName}</div>
                      )}
                    </div>
                    <a
                      href={updateInfo.releaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#2563eb] text-white text-xs font-bold rounded-lg hover:bg-[#1d4ed8] transition flex-none"
                    >
                      <span>Download</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 text-xs text-[#15803d]">
                    <div className="flex items-center gap-1.5 font-medium text-[11.5px]">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-none" />
                      <span>You are running the latest stable build (v1.2.0).</span>
                    </div>
                    {updateInfo.latestCommit && (
                      <span className="text-[10.5px] font-mono text-[#6b7280] bg-white px-2 py-0.5 rounded border border-[#e5e7eb]">
                        Commit #{updateInfo.latestCommit.sha}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Bar */}
        <div className="px-6 py-3.5 bg-[#f8f9fb] border-b border-[#e5e7eb]">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <a
              href="https://github.com/shareefmx/minomeet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white border border-[#e5e7eb] font-bold text-[#374151] hover:text-[#111827] hover:border-[#cbd5e1] hover:shadow-2xs transition"
            >
              <GithubIcon className="w-3.5 h-3.5 text-[#111827]" />
              <span>GitHub Repo</span>
              <ArrowUpRight className="w-3 h-3 text-[#9aa2af]" />
            </a>

            <a
              href="https://github.com/shareefmx/minomeet/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white border border-[#e5e7eb] font-bold text-[#374151] hover:text-[#111827] hover:border-[#cbd5e1] hover:shadow-2xs transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Releases</span>
              <ArrowUpRight className="w-3 h-3 text-[#9aa2af]" />
            </a>

            <a
              href="https://github.com/shareefmx/minomeet/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white border border-[#e5e7eb] font-bold text-[#374151] hover:text-[#111827] hover:border-[#cbd5e1] hover:shadow-2xs transition"
            >
              <AlertCircle className="w-3.5 h-3.5 text-[#dc2626]" />
              <span>Issues / Bugs</span>
              <ArrowUpRight className="w-3 h-3 text-[#9aa2af]" />
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="px-6 py-4 space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-[#6b7280]">
            Core Architecture &amp; Capabilities
          </h4>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#fafbfc] border border-[#e5e7eb]">
              <div className="flex items-center gap-1.5 font-bold text-[#111827] mb-1">
                <Shield className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>100% Privacy-First</span>
              </div>
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                Transcripts, audio, and embeddings remain on this device. Zero telemetry or data harvesting.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#fafbfc] border border-[#e5e7eb]">
              <div className="flex items-center gap-1.5 font-bold text-[#111827] mb-1">
                <Cpu className="w-3.5 h-3.5 text-[#7c3aed]" />
                <span>Multi-Model AI</span>
              </div>
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                Seamless dynamic routing for Ollama, OpenAI, Claude 3.7, Gemini 2.5, Groq, and OpenRouter.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#fafbfc] border border-[#e5e7eb]">
              <div className="flex items-center gap-1.5 font-bold text-[#111827] mb-1">
                <Zap className="w-3.5 h-3.5 text-[#15803d]" />
                <span>Whisper Neural STT</span>
              </div>
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                High-precision multi-language speech recognition powered by Whisper &amp; Parakeet transformers.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#fafbfc] border border-[#e5e7eb]">
              <div className="flex items-center gap-1.5 font-bold text-[#111827] mb-1">
                <Globe className="w-3.5 h-3.5 text-[#e2564c]" />
                <span>Universal Support</span>
              </div>
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                Compatible with Google Meet, Zoom, Teams, Slack Huddles, in-person speech, or audio imports.
              </p>
            </div>
          </div>
        </div>

        {/* Environment Specs & Diagnostics */}
        <div className="px-6 pb-4">
          <div className="p-3 rounded-2xl bg-[#f8f9fb] border border-[#e5e7eb] text-[11px] text-[#4b5563] space-y-1 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6b7280] font-sans font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3 text-[#2563eb]" /> Stack &amp; Runtime:
              </span>
              <span className="font-semibold text-[#111827]">TypeScript 5.8 • Vite 6 • React 18 • Express</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6b7280] font-sans font-bold">Repository:</span>
              <a
                href="https://github.com/shareefmx/minomeet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563eb] hover:underline"
              >
                github.com/shareefmx/minomeet
              </a>
            </div>
          </div>
        </div>

        {/* Replay Tour Action */}
        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={() => {
              closeModal('about');
              window.dispatchEvent(new CustomEvent('minomeet_replay_tour'));
            }}
            className="w-full py-2 px-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1e40af] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#2563eb]" />
            <span>Replay 7-Step Product Tour</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="mt-auto px-6 py-3 bg-[#fafbfc] border-t border-[#e5e7eb] flex items-center justify-center text-xs text-[#6b7280]">
          <div className="flex items-center gap-1.5 text-[11.5px]">
            <span>Crafted by</span>
            <a
              href="https://github.com/shareefmx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#111827] hover:text-[#2563eb] transition"
            >
              @shareefmx
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

