import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { Cpu, X, Check, Sliders } from 'lucide-react';
import { AI_PROVIDERS_CONFIG, getAvailableModelsForProvider } from '../../utils/aiModelConfig.js';

export const ModelSettingsModal: React.FC = () => {
  const { modals, closeModal, settings, updateSettings, showToast, setCurrentScreen, setSettingsTab } = useMeeting();
  const [selected, setSelected] = useState<string>(settings?.selectedModel || 'Nimbus 4B (High Quality)');

  React.useEffect(() => {
    if (settings?.selectedModel) {
      setSelected(settings.selectedModel);
    }
  }, [settings?.selectedModel, modals.model]);

  if (!modals.model) return null;

  const handleSave = async () => {
    let provId = settings?.activeAIProvider || 'builtin';
    for (const prov of AI_PROVIDERS_CONFIG) {
      const models = getAvailableModelsForProvider(settings, prov.id);
      if (models.some(m => m.id === selected)) {
        provId = prov.id;
        break;
      }
    }

    await updateSettings({
      activeAIProvider: provId,
      selectedModel: selected
    });
    closeModal('model');
    showToast('AI Model Selected', `Active model set to ${selected}`, 'success');
  };

  const handleGoToSettings = () => {
    closeModal('model');
    setSettingsTab('model');
    setCurrentScreen('settings');
  };

  return (
    <div className="fixed inset-0 bg-[#0f1117]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 font-extrabold text-base text-[#111827]">
            <Cpu className="w-4 h-4 text-[#2563eb]" />
            <span>AI Model &amp; Synthesis Engine</span>
          </div>
          <button
            onClick={() => closeModal('model')}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-[#6b7280]">
              Select the active AI model used across all meetings, notes, and agents.
            </p>
            <button
              onClick={handleGoToSettings}
              className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-1 cursor-pointer flex-none"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure in Settings</span>
            </button>
          </div>

          <div className="space-y-2">
            {AI_PROVIDERS_CONFIG.flatMap(prov =>
              getAvailableModelsForProvider(settings, prov.id).map(m => {
                const isSelected = selected === m.id;
                return (
                  <div
                    key={`${prov.id}-${m.id}`}
                    onClick={() => setSelected(m.id)}
                    className={`border-2 rounded-xl p-3.5 cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff] shadow-2xs'
                        : 'border-[#e5e7eb] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#111827]">{m.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#f3f4f6] text-[#4b5563]">
                          {prov.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6b7280]">{m.tag || 'Standard'} &bull; {m.contextWindow || 'Dynamic'}</p>
                    </div>
                    {isSelected && (
                      <span className="bg-[#2563eb] text-white p-1 rounded-full flex-none">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <button
            onClick={handleGoToSettings}
            className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
          >
            Manage AI Providers in Settings &rarr;
          </button>
          <div className="flex items-center gap-2">
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
              Set Active Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
