import React, { useState, useRef } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import { Upload, X, FileAudio, Check, Loader2, Cpu, Globe, FileText } from 'lucide-react';

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
  const [autoSummarize, setAutoSummarize] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>(activeTranscriptionModel?.id || 'whisper-large-v3-turbo');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(settings?.defaultLanguage || 'English');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(settings?.defaultTemplate || 'Standard Meeting Notes');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!modals.import) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', '', 'warning');
      return;
    }

    setIsUploading(true);
    const chosenModelObj = transcriptionModels.find(m => m.id === selectedModel);
    showToast('Importing audio…', `Transcribing with ${chosenModelObj?.name || selectedModel}`, 'info');

    try {
      const meeting = await api.importAudio({
        file: selectedFile,
        autoSummarize,
        model: selectedModel,
        language: selectedLanguage,
        template: selectedTemplate
      });
      await refreshMeetings();
      closeModal('import');
      selectMeeting(meeting);
      showToast('Audio imported successfully!', 'On-device transcript created.', 'success');
    } catch (err: any) {
      showToast('Import failed', err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1117]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 font-extrabold text-base text-[#111827]">
            <Upload className="w-4 h-4 text-[#2563eb]" />
            <span>Import Audio &amp; Transcribe</span>
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
            Import a meeting audio recording to generate an on-device transcript using local Whisper or Parakeet models.
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
              accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.ogg,.flac,.webm"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center mb-2">
              <FileAudio className="w-5 h-5" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#111827] flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="truncate max-w-xs">{selectedFile.name}</span>
                </div>
                <div className="text-xs text-[#9aa2af]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to transcribe
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-bold shadow-sm hover:bg-[#1f2937] transition cursor-pointer"
                >
                  Select Audio File
                </button>
                <div className="text-[11px] text-[#9aa2af] pt-1">
                  MP3, WAV, M4A, MP4, FLAC, WebM, OGG
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
                <option value="English">English</option>
                <option value="Auto">Auto Detect</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Hindi">Hindi</option>
                <option value="Malayalam">Malayalam</option>
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
            disabled={isUploading}
            className="px-4 py-2 rounded-xl border border-[#d6dbe2] text-xs font-bold text-[#374151] hover:bg-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Transcribing with Whisper…</span>
              </>
            ) : (
              <span>Import &amp; Transcribe</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


