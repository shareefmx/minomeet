import React, { useState, useRef, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import {
  Upload,
  X,
  FileAudio,
  FileVideo,
  Check,
  Loader2,
  Cpu,
  Globe,
  FileText,
  Sparkles,
  Activity,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const ImportAudioModal: React.FC = () => {
  const {
    modals,
    closeModal,
    selectMeeting,
    refreshMeetings,
    showToast,
    transcriptionModels,
    activeTranscriptionModel,
    settings
  } = useMeeting();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<string>('00:00');
  const [autoSummarize, setAutoSummarize] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>(activeTranscriptionModel?.id || 'whisper-large-v3-turbo');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(settings?.defaultLanguage || 'English');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(settings?.defaultTemplate || 'Standard Meeting Notes');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressPhase, setProgressPhase] = useState<string>('Preparing media pipeline...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<any>(null);

  // Sync selectedModel if active model loads
  useEffect(() => {
    if (activeTranscriptionModel?.id && !selectedModel) {
      setSelectedModel(activeTranscriptionModel.id);
    }
  }, [activeTranscriptionModel]);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!modals.import) return null;

  const isVideoFile = (file: File) => {
    return file.type.startsWith('video/') || ['.mp4', '.mov', '.mkv', '.avi', '.flv', '.wmv', '.m4v', '.3gp', '.ts', '.mpeg', '.mpg'].some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const inspectMediaFile = (file: File) => {
    setSelectedFile(file);
    setAudioDuration('00:00');

    try {
      const url = URL.createObjectURL(file);
      const isVid = isVideoFile(file);
      const mediaElem = isVid ? document.createElement('video') : new Audio();
      mediaElem.preload = 'metadata';
      mediaElem.src = url;

      mediaElem.onloadedmetadata = () => {
        const dur = mediaElem.duration;
        if (dur && !isNaN(dur) && isFinite(dur)) {
          const totalSec = Math.round(dur);
          const h = Math.floor(totalSec / 3600);
          const m = Math.floor((totalSec % 3600) / 60);
          const s = totalSec % 60;
          const formatted = h > 0
            ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          setAudioDuration(formatted);
        }
        URL.revokeObjectURL(url);
      };

      mediaElem.onerror = () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.warn('Could not read media file metadata in browser:', e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      inspectMediaFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      inspectMediaFile(e.dataTransfer.files[0]);
    }
  };

  const getPhaseDescription = (pct: number) => {
    if (pct < 20) return 'Ingesting media stream & processing audio channels…';
    if (pct < 45) return 'Computing 128-band log-Mel Spectrogram…';
    if (pct < 75) return 'Running Whisper neural transformer speech decoding…';
    if (pct < 95) return 'Synthesizing structured AI Minutes of Meeting (MOM)…';
    if (pct < 100) return 'Finalizing transcript segments & workspace…';
    return 'Transcription complete! Opening meeting…';
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', '', 'warning');
      return;
    }

    setIsUploading(true);
    setProgressPercent(1);
    setProgressPhase(getPhaseDescription(1));

    let currentPct = 1;
    let active = true;

    const advanceProgress = () => {
      if (!active) return;

      // Realistic staged progression across audio processing pipeline:
      // 1-20%: Audio channel ingestion & normalization (~260ms / 1%)
      // 20-45%: Computing log-mel spectrogram (~360ms / 1%)
      // 45-75%: Neural speech acoustic decoding (~500ms / 1%)
      // 75-92%: Structured AI MOM summary synthesis (~750ms / 1%)
      // 92-96%: Segment packaging & final pass (~1600ms / 1%)
      let delay = 260;
      let step = 1;

      if (currentPct < 20) {
        delay = 260;
      } else if (currentPct < 45) {
        delay = 360;
      } else if (currentPct < 75) {
        delay = 500;
      } else if (currentPct < 92) {
        delay = 750;
      } else if (currentPct < 96) {
        delay = 1600;
      } else {
        // Hold asymptotically at 96% with gentle slow micro-intervals
        delay = 3500;
        step = 0;
      }

      if (currentPct + step <= 96) {
        currentPct += step;
      }

      setProgressPercent(currentPct);
      setProgressPhase(getPhaseDescription(currentPct));

      if (active) {
        progressIntervalRef.current = setTimeout(advanceProgress, delay);
      }
    };

    progressIntervalRef.current = setTimeout(advanceProgress, 260);

    try {
      const meeting = await api.importAudio({
        file: selectedFile,
        autoSummarize,
        model: selectedModel,
        language: selectedLanguage,
        template: selectedTemplate,
        duration: audioDuration !== '00:00' ? audioDuration : undefined
      });

      active = false;
      if (progressIntervalRef.current) clearTimeout(progressIntervalRef.current);

      // Hit 100% completion cleanly
      setProgressPercent(100);
      setProgressPhase('Transcription Complete! Opening Meeting…');

      await refreshMeetings();

      // Brief pause to display the completed checkmark
      setTimeout(() => {
        setIsUploading(false);
        closeModal('import');
        setSelectedFile(null);
        setAudioDuration('00:00');
        setProgressPercent(0);
        selectMeeting(meeting);
        showToast('Audio transcribed successfully!', `Meeting duration: ${meeting.duration} • MOM ready.`, 'success');
      }, 400);
    } catch (err: any) {
      active = false;
      if (progressIntervalRef.current) clearTimeout(progressIntervalRef.current);
      setIsUploading(false);
      setProgressPercent(0);
      showToast('Import failed', err.message, 'error');
    }
  };

  const chosenModel = transcriptionModels.find(m => m.id === selectedModel);

  return (
    <div className="fixed inset-0 bg-[#0f1117]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e5e7eb] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ================= STAGE 1: 1% - 100% TRANSCRIPTION LOADING ANIMATION ================= */}
        {isUploading ? (
          <div className="p-8 sm:p-10 space-y-6">
            {/* Header Status */}
            <div className="flex items-center justify-between border-b border-[#f1f3f5] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#111827]">
                    On-Device AI Transcription
                  </h3>
                  <p className="text-[11px] text-[#6b7280]">
                    Local neural speech decoding in progress
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[11px] font-bold text-[#1e3a8a]">
                <Cpu className="w-3 h-3 text-[#2563eb]" />
                <span>{chosenModel?.name?.split(' ')[0] || 'Whisper'} {chosenModel?.name?.split(' ')[1] || 'Turbo'}</span>
              </div>
            </div>

            {/* Giant Percentage & Soundwave Equalizer Display */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              {/* Soundwave Bouncing Bars */}
              <div className="flex items-center justify-center gap-1.5 h-12">
                <span className="w-1.5 bg-gradient-to-t from-[#2563eb] to-[#60a5fa] rounded-full animate-eq-1 shadow-xs" />
                <span className="w-1.5 bg-gradient-to-t from-[#2563eb] to-[#818cf8] rounded-full animate-eq-2 shadow-xs" />
                <span className="w-1.5 bg-gradient-to-t from-[#4f46e5] to-[#a78bfa] rounded-full animate-eq-3 shadow-xs" />
                <span className="w-1.5 bg-gradient-to-t from-[#2563eb] to-[#38bdf8] rounded-full animate-eq-4 shadow-xs" />
                <span className="w-1.5 bg-gradient-to-t from-[#7c3aed] to-[#c084fc] rounded-full animate-eq-5 shadow-xs" />
                <span className="w-1.5 bg-gradient-to-t from-[#2563eb] to-[#60a5fa] rounded-full animate-eq-6 shadow-xs" />
                <span className="w-1.5 bg-gradient-to-t from-[#4f46e5] to-[#818cf8] rounded-full animate-eq-7 shadow-xs" />
              </div>

              {/* Numerical Percentage */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight text-[#111827] tabular-nums font-sans">
                    {progressPercent}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#2563eb]">
                    %
                  </span>
                </div>
                <div className="text-xs font-bold text-[#4b5563] mt-1 flex items-center justify-center gap-1.5">
                  {progressPercent === 100 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Completed
                    </span>
                  ) : (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-[#2563eb] animate-spin" />
                      <span>{progressPhase}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Glowing 100% Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-[#e2e8f0] rounded-full overflow-hidden p-0.5 relative shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer w-1/2" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#9aa2af]">
                <span>0% Input</span>
                <span>Spectrogram</span>
                <span>Neural STT</span>
                <span>100% Ready</span>
              </div>
            </div>

            {/* Phase Step Checkmarks */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                progressPercent >= 20 ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]' : 'bg-[#f9fafb] border-[#e5e7eb] text-[#6b7280]'
              }`}>
                {progressPercent >= 20 ? <Check className="w-3.5 h-3.5 flex-none" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-none" />}
                <span className="truncate font-semibold">1. Media &amp; Audio Ingestion</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                progressPercent >= 45 ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]' : 'bg-[#f9fafb] border-[#e5e7eb] text-[#6b7280]'
              }`}>
                {progressPercent >= 45 ? <Check className="w-3.5 h-3.5 flex-none" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-none" />}
                <span className="truncate font-semibold">2. Mel Spectrogram</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                progressPercent >= 75 ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]' : 'bg-[#f9fafb] border-[#e5e7eb] text-[#6b7280]'
              }`}>
                {progressPercent >= 75 ? <Check className="w-3.5 h-3.5 flex-none" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-none" />}
                <span className="truncate font-semibold">3. Whisper Decoding</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                progressPercent >= 88 ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]' : 'bg-[#f9fafb] border-[#e5e7eb] text-[#6b7280]'
              }`}>
                {progressPercent >= 88 ? <Check className="w-3.5 h-3.5 flex-none" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-none" />}
                <span className="truncate font-semibold">4. AI MOM Synthesis</span>
              </div>
            </div>

            {/* Privacy Badge Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6b7280] pt-1">
              <Lock className="w-3 h-3 text-[#15803d]" />
              <span>100% On-Device Processing &bull; Audio never leaves this machine</span>
            </div>
          </div>
        ) : (
          /* ================= STAGE 2: AUDIO / VIDEO CONFIGURATION & FILE SELECTOR ================= */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2 font-extrabold text-base text-[#111827]">
                <Upload className="w-4 h-4 text-[#2563eb]" />
                <span>Import Recording (Audio &amp; Video)</span>
              </div>
              <button
                onClick={() => closeModal('import')}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-[#6b7280]">
                Import an audio or video recording from Zoom, Google Meet, Teams, or local files to generate a structured MOM transcript.
              </p>

              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#d6dbe2] hover:border-[#2563eb] rounded-2xl p-6 text-center bg-[#fafbfc] transition flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.mov,.mkv,.avi,.webm,.flv,.m4v,.ogg,.flac,.aac"
                  className="hidden"
                />
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${
                  selectedFile && isVideoFile(selectedFile)
                    ? 'bg-purple-50 text-[#7c3aed]'
                    : 'bg-indigo-50 text-[#4f46e5]'
                }`}>
                  {selectedFile && isVideoFile(selectedFile) ? (
                    <FileVideo className="w-5 h-5" />
                  ) : (
                    <FileAudio className="w-5 h-5" />
                  )}
                </div>

                {selectedFile ? (
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-[#111827] flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="truncate max-w-xs">{selectedFile.name}</span>
                    </div>
                    <div className="text-xs text-[#6b7280] flex items-center justify-center gap-2 flex-wrap">
                      <span className="font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {isVideoFile(selectedFile) ? '🎬 Video Recording' : '🎙️ Audio Recording'}
                      </span>
                      {audioDuration && audioDuration !== '00:00' && (
                        <>
                          <span>&bull;</span>
                          <span className="inline-flex items-center gap-1 font-bold text-[#1e3a8a] bg-[#dbeafe] px-2 py-0.5 rounded-md border border-[#bfdbfe]">
                            Length: {audioDuration}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-bold shadow-sm hover:bg-[#1f2937] transition cursor-pointer"
                    >
                      Select Audio or Video File
                    </button>
                    <div className="text-[11px] text-[#9aa2af] pt-1">
                      MP3, MP4, WAV, M4A, MOV, MKV, WebM, FLAC, AVI
                    </div>
                  </div>
                )}
              </div>

              {/* Model Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#2563eb]" />
                  <span>Transcription Model</span>
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563eb] bg-white text-[#111827]"
                >
                  {transcriptionModels.length > 0 ? (
                    transcriptionModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.sizeFormatted}) {m.status === 'downloaded' ? '✓ Ready' : '📥 Download on Import'}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="whisper-large-v3-turbo">Whisper Large-v3 Turbo (Recommended · 1.5 GB)</option>
                      <option value="whisper-large-v3">Whisper Large-v3 (Studio Grade · 3.1 GB)</option>
                      <option value="whisper-medium">Whisper Medium (High Accuracy · 1.5 GB)</option>
                      <option value="whisper-small">Whisper Small (Fast · 461 MB)</option>
                      <option value="whisper-base">Whisper Base (Lightweight · 142 MB)</option>
                      <option value="parakeet-tdt-lightning">Parakeet TDT 1.1B Lightning (Real-Time · 620 MB)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Language & Template Selection Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Language</span>
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563eb] bg-white text-[#111827]"
                  >
                    <option value="English">English (Global / US / UK)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span>MOM Template</span>
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563eb] bg-white text-[#111827]"
                  >
                    <option value="Standard Meeting Notes">Standard Notes</option>
                    <option value="Daily Standup">Daily Standup</option>
                    <option value="Project Sync / Status Update">Project Sync</option>
                    <option value="Retrospective (Agile)">Agile Retro</option>
                    <option value="Client / Sales Meeting">Client Meeting</option>
                  </select>
                </div>
              </div>

              {/* Auto Summarize Checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-[#374151] cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={autoSummarize}
                  onChange={(e) => setAutoSummarize(e.target.checked)}
                  className="w-4 h-4 text-[#2563eb] rounded border-gray-300 focus:ring-[#2563eb]"
                />
                <span>Automatically generate structured AI Minutes of Meeting (MOM)</span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
              <button
                onClick={() => closeModal('import')}
                className="px-4 py-2 rounded-xl border border-[#d6dbe2] text-xs font-bold text-[#374151] hover:bg-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Import &amp; Transcribe</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


