import React, { useRef, useEffect, useState } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { Copy, Pause, Play, Square, X, Mic, Volume2, Layers, Cpu, Link2, AlertCircle } from 'lucide-react';
import { exportService } from '../../services/export.js';
import { speechService } from '../../services/speech.js';

export const RecordingScreen: React.FC = () => {
  const {
    recordingTimer,
    liveTranscript,
    interimTranscript,
    audioSource,
    setAudioSource,
    stopRecording,
    cancelRecording,
    showToast,
    activeTranscriptionModel
  } = useMeeting();

  const [isPaused, setIsPaused] = useState(false);
  const [isConnectingTab, setIsConnectingTab] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasSystemAudio = speechService.getHasSystemAudio();

  // Auto-scroll as new transcript lines or interim speech arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveTranscript, interimTranscript]);

  const formatTimer = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopy = async () => {
    const text = liveTranscript.map(l => `[${l.time}] ${l.speaker ? `${l.speaker}: ` : ''}${l.text}`).join('\n');
    await exportService.copyToClipboard(text);
    showToast('Copied to clipboard', `${liveTranscript.length} transcript lines copied.`, 'success');
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    showToast(isPaused ? 'Recording Resumed' : 'Recording Paused', '', 'info');
  };

  const handleConnectTabAudio = async () => {
    setIsConnectingTab(true);
    const ok = await speechService.attachSystemAudioTab();
    setIsConnectingTab(false);
    if (ok) {
      showToast('Chrome Tab Audio Connected!', 'Now capturing meeting & video sound.', 'success');
    } else {
      showToast('Tab Audio Notice', 'Select the "Chrome Tab" tab and check "Also share tab audio".', 'info');
    }
  };

  const getSpeakerBadgeStyle = (speaker?: string) => {
    const s = (speaker || 'Speaker 1').toLowerCase();
    if (s.includes('1') || s.includes('mic') || s.includes('you')) {
      return 'bg-[#eff6ff] text-[#1e40af] dark:bg-[#1e3a8a]/40 dark:text-[#93c5fd] border border-[#bfdbfe] dark:border-[#1e40af]';
    } else if (s.includes('2') || s.includes('system') || s.includes('remote') || s.includes('participant')) {
      return 'bg-[#ecfdf5] text-[#065f46] dark:bg-[#064e3b]/40 dark:text-[#6ee7b7] border border-[#a7f3d0] dark:border-[#065f46]';
    } else if (s.includes('3')) {
      return 'bg-[#faf5ff] text-[#6b21a8] dark:bg-[#581c87]/40 dark:text-[#d8b4fe] border border-[#e9d5ff] dark:border-[#6b21a8]';
    }
    return 'bg-[#f3f4f6] text-[#374151] dark:bg-slate-800 dark:text-slate-300 border border-[#e5e7eb] dark:border-slate-700';
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-[#0f172a] text-[#111827] dark:text-slate-100 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#e5e7eb] dark:border-slate-800 bg-[#fdfdfe] dark:bg-[#0f172a] flex-wrap gap-2">
        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f9fafb] dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#374151] dark:text-slate-200 shadow-inner">
            <span className={`w-2.5 h-2.5 rounded-full bg-[#e2564c] ${isPaused ? 'opacity-40' : 'animate-pulse'}`} />
            <span>{isPaused ? 'Paused' : 'Recording'} &bull; {formatTimer(recordingTimer)}</span>
          </div>

          {/* Engine Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] dark:bg-emerald-950/40 border border-[#bbf7d0] dark:border-emerald-800 text-xs font-bold text-[#166534] dark:text-emerald-300 shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-[#16a34a]" />
            <span>Engine: {activeTranscriptionModel?.name || 'Parakeet TDT 1.1B Lightning (Real-Time)'}</span>
          </div>

          {/* Audio Source Switcher Badge */}
          <div className="hidden sm:flex items-center bg-[#f3f4f6] dark:bg-slate-800 rounded-lg p-0.5 border border-[#e5e7eb] dark:border-slate-700 text-xs">
            <button
              onClick={() => {
                setAudioSource('mic');
                showToast('Audio Source: Microphone', 'Capturing local speech (Speaker 1)', 'info');
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                audioSource === 'mic' ? 'bg-white dark:bg-slate-700 text-[#2563eb] dark:text-blue-400 shadow-2xs' : 'text-[#6b7280] dark:text-slate-400 hover:text-[#111827]'
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>Microphone</span>
            </button>
            <button
              onClick={() => {
                setAudioSource('system');
                showToast('Audio Source: System Audio', 'Capturing meeting audio (Speaker 2)', 'info');
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                audioSource === 'system' ? 'bg-white dark:bg-slate-700 text-[#2563eb] dark:text-blue-400 shadow-2xs' : 'text-[#6b7280] dark:text-slate-400 hover:text-[#111827]'
              }`}
            >
              <Volume2 className="w-3 h-3" />
              <span>System Audio</span>
            </button>
            <button
              onClick={() => {
                setAudioSource('mixed');
                showToast('Audio Source: Mixed', 'Capturing Mic (Speaker 1) + System Audio (Speaker 2)', 'info');
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                audioSource === 'mixed' ? 'bg-white dark:bg-slate-700 text-[#2563eb] dark:text-blue-400 shadow-2xs' : 'text-[#6b7280] dark:text-slate-400 hover:text-[#111827]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Mixed</span>
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d6dbe2] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#374151] dark:text-slate-200 hover:bg-[#f3f4f6] dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
          <button
            onClick={cancelRecording}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#fee2e2] dark:border-red-950 bg-[#fef2f2] dark:bg-red-950/30 text-xs font-bold text-[#991b1b] dark:text-red-300 hover:bg-[#fee2e2] transition shadow-sm cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* System & Meeting Audio Link Bar */}
      {(audioSource === 'mixed' || audioSource === 'system') && (
        <div className={`px-6 py-2 flex items-center justify-between text-xs border-b flex-wrap gap-2 transition ${
          hasSystemAudio
            ? 'bg-[#f0fdf4] dark:bg-emerald-950/20 border-[#bbf7d0] dark:border-emerald-800 text-[#166534] dark:text-emerald-300'
            : 'bg-[#fffbeb] dark:bg-amber-950/20 border-[#fde68a] dark:border-amber-800 text-[#92400e] dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {hasSystemAudio ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse" />
                <span className="font-bold">Live System Audio Connected (Zoom / YouTube / Meeting audio active)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-[#d97706] flex-none" />
                <span className="font-semibold">
                  No system audio detected from window share. (macOS requires selecting &ldquo;Chrome Tab&rdquo; to capture audio).
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!hasSystemAudio && (
              <button
                onClick={handleConnectTabAudio}
                disabled={isConnectingTab}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{isConnectingTab ? 'Connecting…' : 'Connect Chrome Tab Audio'}</span>
              </button>
            )}
            <span className="text-[11px] opacity-85 hidden md:inline">
              Tip: Pick <strong>Chrome Tab</strong> &rarr; Check <strong>&ldquo;Also share tab audio&rdquo;</strong>
            </span>
          </div>
        </div>
      )}

      {/* Live Transcript Stream Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-3 pb-28">
        {liveTranscript.length === 0 && !interimTranscript ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="flex items-center gap-2 text-sm text-[#9aa2af] dark:text-slate-400 font-medium animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] animate-ping" />
              <span>Listening in real-time with sub-50ms latency…</span>
            </div>
            <p className="text-xs text-[#cbd5e1] dark:text-slate-500 mt-2">
              Engine: <span className="font-semibold text-[#16a34a]">Parakeet Lightning Real-Time</span> &bull; Audio: <span className="font-semibold capitalize text-[#6b7280] dark:text-slate-400">{audioSource}</span>
            </p>
          </div>
        ) : (
          <>
            {liveTranscript.map((line, idx) => {
              const prevLine = idx > 0 ? liveTranscript[idx - 1] : null;
              const isSameSpeakerAsPrev = prevLine && prevLine.speaker === line.speaker;

              return (
                <div
                  key={line.id || idx}
                  className={`flex items-start gap-3 text-[14.5px] leading-relaxed group ${
                    isSameSpeakerAsPrev ? 'mt-1 pl-14' : 'mt-4'
                  }`}
                >
                  {!isSameSpeakerAsPrev ? (
                    <>
                      <span className="text-xs text-[#9aa2af] dark:text-slate-500 font-mono select-none pt-0.5 min-w-[45px]">
                        [{line.time}]
                      </span>
                      <div className="flex-1">
                        {line.speaker && (
                          <span className={`inline-flex items-center gap-1 font-extrabold mr-2 text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-md shadow-2xs ${getSpeakerBadgeStyle(line.speaker)}`}>
                            {line.speaker}
                          </span>
                        )}
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="text-[#1f2937] dark:text-slate-100 hover:bg-yellow-50/70 dark:hover:bg-yellow-900/30 p-0.5 rounded transition"
                        >
                          {line.text}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1">
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="text-[#1f2937] dark:text-slate-100 hover:bg-yellow-50/70 dark:hover:bg-yellow-900/30 p-0.5 rounded transition"
                      >
                        {line.text}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Real-time Sub-50ms Interim Live Caption Bubble */}
            {interimTranscript && (
              <div className="flex items-start gap-3 text-[14.5px] leading-relaxed bg-[#f0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-800 p-3 rounded-xl shadow-2xs animate-in fade-in duration-75 mt-3">
                <span className="text-xs text-[#16a34a] dark:text-emerald-400 font-mono font-bold select-none pt-0.5 min-w-[45px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-ping" />
                  Live
                </span>
                <div className="flex-1">
                  <span className="font-bold text-[#15803d] dark:text-emerald-300 mr-2 text-[11px] uppercase tracking-wide bg-[#dcfce7] dark:bg-emerald-900/50 px-2 py-0.5 rounded border border-[#86efac] dark:border-emerald-700">
                    Speaking
                  </span>
                  <span className="text-[#14532d] dark:text-emerald-200 font-medium">
                    {interimTranscript}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Live Listening Indicator */}
        {!isPaused && (liveTranscript.length > 0 || interimTranscript) && (
          <div className="flex items-center gap-2 text-xs text-[#9aa2af] dark:text-slate-500 pt-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-dot" />
            <span>Parakeet TDT streaming active…</span>
          </div>
        )}
      </div>

      {/* Floating Bottom Recording Control Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl border border-[#d6dbe2] dark:border-slate-700 flex items-center gap-3.5 px-4 py-2 z-30">
        {/* Pause/Resume button */}
        <button
          onClick={togglePause}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-[#d6dbe2] dark:border-slate-700 text-[#374151] dark:text-slate-200 hover:bg-[#f3f4f6] dark:hover:bg-slate-700 transition cursor-pointer shadow-sm"
          title={isPaused ? 'Resume Recording' : 'Pause Recording'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <Pause className="w-4 h-4 fill-current" />}
        </button>

        {/* Stop Button */}
        <button
          onClick={stopRecording}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e2564c] hover:bg-[#c2453c] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer ring-4 ring-[#e2564c]/20"
          title="Stop & Save Meeting"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>STOP RECORDING</span>
        </button>

        {/* Animated Wave Bars */}
        <div className="flex items-center gap-1 px-2 h-6">
          <span className={`w-1 bg-[#e2564c] rounded-full h-3 ${isPaused ? 'h-1' : 'animate-wave-1'}`} />
          <span className={`w-1 bg-[#e2564c] rounded-full h-5 ${isPaused ? 'h-1' : 'animate-wave-2'}`} />
          <span className={`w-1 bg-[#e2564c] rounded-full h-2.5 ${isPaused ? 'h-1' : 'animate-wave-3'}`} />
          <span className={`w-1 bg-[#e2564c] rounded-full h-4.5 ${isPaused ? 'h-1' : 'animate-wave-4'}`} />
          <span className={`w-1 bg-[#e2564c] rounded-full h-3.5 ${isPaused ? 'h-1' : 'animate-wave-5'}`} />
        </div>
      </div>
    </div>
  );
};
