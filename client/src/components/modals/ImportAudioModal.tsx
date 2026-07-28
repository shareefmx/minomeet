import React, { useState, useRef } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import { Upload, X, FileAudio, Check, Loader2 } from 'lucide-react';

export const ImportAudioModal: React.FC = () => {
  const { modals, closeModal, selectMeeting, refreshMeetings, showToast } = useMeeting();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [autoSummarize, setAutoSummarize] = useState<boolean>(true);
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
    showToast('Importing audio…', 'Processing on-device acoustic recognition', 'info');

    try {
      const meeting = await api.importAudio(selectedFile, autoSummarize);
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
            <span>Import Audio File</span>
          </div>
          <button
            onClick={() => closeModal('import')}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#6b7280]">
            Import an audio or video file to create a new meeting with an on-device transcript.
          </p>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#d6dbe2] hover:border-[#2563eb] rounded-2xl p-8 text-center bg-[#fafbfc] transition flex flex-col items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.ogg,.flac,.webm"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center mb-3">
              <FileAudio className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#111827] flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{selectedFile.name}</span>
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
                <div className="text-[11px] text-[#9aa2af] pt-2">
                  MP4, WAV, MP3, FLAC, OGG, MKV, WebM, M4A
                </div>
              </div>
            )}
          </div>

          {/* Auto Summarize Checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-[#374151] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSummarize}
              onChange={(e) => setAutoSummarize(e.target.checked)}
              className="w-4 h-4 text-[#2563eb] rounded border-gray-300 focus:ring-[#2563eb]"
            />
            <span>Automatically generate AI Minutes of Meeting (MOM) upon import</span>
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
                <span>Transcribing…</span>
              </>
            ) : (
              <span>Import Audio</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

