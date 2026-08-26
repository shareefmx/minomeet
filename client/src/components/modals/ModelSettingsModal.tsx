import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { Cpu, X, Check, Download, Trash2, Loader2, HardDrive, Cloud } from 'lucide-react';

interface AIModelItem {
  id: string;
  name: string;
  desc: string;
  meta: string;
  ready: boolean;
  downloading?: boolean;
  progress?: number;
}

export const ModelSettingsModal: React.FC = () => {
  const { modals, closeModal, settings, updateSettings, showToast } = useMeeting();
  const [selected, setSelected] = useState<string>(settings?.selectedModel || 'Nimbus 4B (High Quality)');

  const [aiModels, setAiModels] = useState<AIModelItem[]>([
    {
      id: 'Nimbus 4B (High Quality)',
      name: 'Nimbus 4B (High Quality)',
      desc: 'Highest quality on-device summaries. Best for dense, multi-speaker meetings and nuanced action items.',
      meta: '~2.8 GiB · 32768 tokens',
      ready: true
    },
    {
      id: 'Nimbus 2B (Balanced)',
      name: 'Nimbus 2B (Balanced)',
      desc: 'Balanced model for built-in summaries. Higher quality with modest local memory footprint.',
      meta: '~1.2 GiB · 32768 tokens',
      ready: false
    },
    {
      id: 'Nimbus 1B (Fast)',
      name: 'Nimbus 1B (Fast)',
      desc: 'Fastest lightweight model. Runs smoothly on any hardware with ~1GB RAM for quick summaries.',
      meta: '~1019 MiB · 32768 tokens',
      ready: false
    }
  ]);

  if (!modals.model) return null;

  const handleDownload = (id: string) => {
    setAiModels(prev =>
      prev.map(m => m.id === id ? { ...m, downloading: true, progress: 15 } : m)
    );
    showToast(`Downloading ${id}…`, 'Fetching model weights to local disk cache', 'info');

    let current = 15;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 20) + 12;
      if (current >= 100) {
        clearInterval(interval);
        setAiModels(prev =>
          prev.map(m => m.id === id ? { ...m, downloading: false, ready: true, progress: 100 } : m)
        );
        showToast('Model Ready!', `${id} downloaded to disk cache.`, 'success');
      } else {
        setAiModels(prev =>
          prev.map(m => m.id === id ? { ...m, progress: current } : m)
        );
      }
    }, 400);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAiModels(prev =>
      prev.map(m => m.id === id ? { ...m, ready: false, downloading: false, progress: 0 } : m)
    );
    if (selected === id) {
      setSelected('Nimbus 4B (High Quality)');
    }
    showToast('Model Deleted', `${id} removed from local storage.`, 'info');
  };

  const handleSave = async () => {
    await updateSettings({ selectedModel: selected });
    closeModal('model');
    showToast('Model configuration saved', `Active model: ${selected}`, 'success');
  };

  const installed = aiModels.filter(m => m.ready);
  const downloadable = aiModels.filter(m => !m.ready);

  return (
    <div className="fixed inset-0 bg-[#0f1117]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 font-extrabold text-base text-[#111827]">
            <Cpu className="w-4 h-4 text-[#7c3aed]" />
            <span>AI Summarization Engine Settings</span>
          </div>
          <button
            onClick={() => closeModal('model')}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-[#6b7280]">
            Summarization Model — Built-in AI (offline, privacy-first, zero API dependencies)
          </p>

          {/* 1. LOCALLY INSTALLED MODELS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1e3a8a] flex items-center gap-1.5 uppercase tracking-wider">
                <HardDrive className="w-3.5 h-3.5 text-[#2563eb]" />
                Locally Installed Models ({installed.length})
              </span>
              <span className="text-[10px] text-[#15803d] font-bold bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                ● Ready Offline
              </span>
            </div>

            {installed.map((m) => {
              const isSelected = selected === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                    isSelected
                      ? 'border-[#2563eb] bg-[#f5f8ff] shadow-xs'
                      : 'border-[#e5e7eb] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm text-[#111827] mb-1">
                    <span>{m.name}</span>
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="text-[10px] font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready · Selected
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleDelete(m.id, e)}
                          className="p-1 rounded-lg border border-[#fee2e2] bg-[#fef2f2] text-[#ef4444] hover:bg-[#fee2e2] transition cursor-pointer"
                          title="Delete model from disk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#6b7280] leading-relaxed mb-2">
                    {m.desc}
                  </p>
                  <div className="text-[11px] text-[#9aa2af] font-mono">
                    {m.meta} · Installed on disk
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. AVAILABLE FOR DOWNLOAD */}
          <div className="space-y-2.5 pt-2 border-t border-[#e5e7eb]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6b7280] flex items-center gap-1.5 uppercase tracking-wider">
                <Cloud className="w-3.5 h-3.5 text-[#64748b]" />
                Available for Download ({downloadable.length})
              </span>
              <span className="text-[11px] text-[#6b7280]">
                Download once to enable
              </span>
            </div>

            {downloadable.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#6b7280] bg-[#fafbfc] rounded-xl border border-[#e5e7eb]">
                All summarization models are currently installed.
              </div>
            ) : (
              downloadable.map((m) => {
                return (
                  <div
                    key={m.id}
                    className="border border-[#e5e7eb] rounded-xl p-4 bg-[#fafbfc] transition hover:border-[#cbd5e1]"
                  >
                    <div className="flex items-center justify-between font-bold text-sm text-[#111827] mb-1">
                      <span>{m.name}</span>
                      {m.downloading ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1e40af] bg-[#dbeafe] px-2.5 py-1 rounded-lg"
                        >
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Downloading {m.progress || 15}%</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownload(m.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] px-2.5 py-1 rounded-lg transition cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#6b7280] leading-relaxed mb-2">
                      {m.desc}
                    </p>
                    <div className="text-[11px] text-[#9aa2af] font-mono">
                      {m.meta}
                    </div>

                    {/* Downloading progress bar */}
                    {m.downloading && (
                      <div className="mt-2.5 space-y-1">
                        <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2563eb] transition-all duration-300 rounded-full"
                            style={{ width: `${m.progress || 15}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <button
            onClick={() => closeModal('model')}
            className="px-4 py-2 rounded-xl border border-[#d6dbe2] text-xs font-bold text-[#374151] hover:bg-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-sm transition cursor-pointer"
          >
            Save Model
          </button>
        </div>
      </div>
    </div>
  );
};


