import React, { useRef, useEffect, useState } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { Copy, Pause, Play, Square, X, Mic, Volume2, Layers } from 'lucide-react';
import { exportService } from '../../services/export.js';

export const RecordingScreen: React.FC = () => {
  const {
    recordingTimer,
    liveTranscript,
    audioSource,
    setAudioSource,
    stopRecording,
    cancelRecording,
    showToast
  } = useMeeting();

  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as new transcript lines arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveTranscript]);

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

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#e5e7eb] bg-[#fdfdfe] flex-wrap gap-2">
        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f9fafb] border border-[#e5e7eb] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#374151] shadow-inner">
            <span className={`w-2.5 h-2.5 rounded-full bg-[#e2564c] ${isPaused ? 'opacity-40' : 'animate-pulse'}`} />
            <span>{isPaused ? 'Paused' : 'Recording'} &bull; {formatTimer(recordingTimer)}</span>
          </div>

          {/* Audio Source Switcher Badge */}
          <div className="hidden sm:flex items-center bg-[#f3f4f6] rounded-lg p-0.5 border border-[#e5e7eb] text-xs">
            <button
              onClick={() => {
                setAudioSource('mic');
                showToast('Audio Source: Microphone', 'Capturing local speech', 'info');
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                audioSource === 'mic' ? 'bg-white text-[#2563eb] shadow-2xs' : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>Microphone</span>
            </button>
            <button
              onClick={() => {
                setAudioSource('system');
                showToast('Audio Source: System Audio', 'Capturing computer & meeting audio', 'info');
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                audioSource === 'system' ? 'bg-white text-[#2563eb] shadow-2xs' : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              <Volume2 className="w-3 h-3" />
              <span>System Audio</span>
            </button>
            <button
              onClick={() => {
                setAudioSource('mixed');
                showToast('Audio Source: Mixed', 'Capturing Mic + System Audio simultaneously', 'info');
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                audioSource === 'mixed' ? 'bg-white text-[#2563eb] shadow-2xs' : 'text-[#6b7280] hover:text-[#111827]'
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d6dbe2] bg-white text-xs font-bold text-[#374151] hover:bg-[#f3f4f6] transition shadow-sm cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
          <button
            onClick={cancelRecording}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#fee2e2] bg-[#fef2f2] text-xs font-bold text-[#991b1b] hover:bg-[#fee2e2] transition shadow-sm cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Live Transcript Stream Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-4 pb-28">
        {liveTranscript.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="flex items-center gap-2 text-sm text-[#9aa2af] font-medium animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] animate-ping" />
              <span>Listening to live speech stream and transcribing in real-time…</span>
            </div>
            <p className="text-xs text-[#cbd5e1] mt-2">
              Audio Source: <span className="font-semibold capitalize text-[#6b7280]">{audioSource}</span> &bull; Speech recognition active
            </p>
          </div>
        ) : (
          liveTranscript.map((line, idx) => (
            <div key={line.id || idx} className="flex items-start gap-3 text-[14.5px] leading-relaxed group">
              <span className="text-xs text-[#9aa2af] font-mono select-none pt-0.5 min-w-[45px]">
                [{line.time}]
              </span>
              <div className="flex-1">
                {line.speaker && (
                  <span className="font-bold text-[#1e3a8a] mr-2 text-xs uppercase tracking-wide bg-[#eff6ff] px-1.5 py-0.5 rounded">
                    {line.speaker}
                  </span>
                )}
                <span
                  contentEditable
                  suppressContentEditableWarning
                  className="text-[#1f2937] hover:bg-yellow-50/70 p-0.5 rounded transition"
                >
                  {line.text}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Live Listening Indicator */}
        {!isPaused && liveTranscript.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#9aa2af] pt-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#60a5fa] animate-pulse-dot" />
            <span>Transcribing live conversation…</span>
          </div>
        )}
      </div>

      {/* Floating Bottom Recording Control Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-[#d6dbe2] flex items-center gap-3.5 px-4 py-2 z-30">
        {/* Pause/Resume button */}
        <button
          onClick={togglePause}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#d6dbe2] text-[#374151] hover:bg-[#f3f4f6] transition cursor-pointer shadow-sm"
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
