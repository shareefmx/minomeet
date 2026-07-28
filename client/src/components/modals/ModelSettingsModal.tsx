import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { Cpu, X, Check, Download } from 'lucide-react';

export const ModelSettingsModal: React.FC = () => {
  const { modals, closeModal, settings, updateSettings, showToast } = useMeeting();
  const [selected, setSelected] = useState<string>(settings?.selectedModel || 'Nimbus 4B (High Quality)');

  if (!modals.model) return null;

  const models = [
    {
      id: 'Nimbus 4B (High Quality)',
      name: 'Nimbus 4B (High Quality)',
      desc: 'Highest quality on-device summaries. Best for dense, multi-speaker meetings and nuanced action items.',
      meta: '~2.8 GiB · 32768 tokens · Ready',
      ready: true,
      badge: '● Ready · Selected'
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
  ];

  const handleSave = async () => {
    await updateSettings({ selectedModel: selected });
    closeModal('model');
    showToast('Model configuration saved', `Active model: ${selected}`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-[#0f1117]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 font-extrabold text-base text-[#111827]">
            <Cpu className="w-4 h-4 text-[#7c3aed]" />
            <span>AI Model Settings</span>
          </div>
          <button
            onClick={() => closeModal('model')}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-[#6b7280]">
            Summarization Model — Built-in AI (offline, privacy-first, zero API dependencies)
          </p>

          <div className="space-y-3 pt-1">
            {models.map((m) => {
              const isSelected = selected === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                    isSelected
                      ? 'border-[#2563eb] bg-[#f5f8ff]'
                      : 'border-[#e5e7eb] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm text-[#111827] mb-1">
                    <span>{m.name}</span>
                    {isSelected ? (
                      <span className="text-[10px] font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast(`Downloading ${m.name}…`, 'Local weights downloading to disk cache', 'info');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] px-2 py-1 rounded-lg transition"
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
                </div>
              );
            })}
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

