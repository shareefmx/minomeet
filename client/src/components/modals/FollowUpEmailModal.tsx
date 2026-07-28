import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import { exportService } from '../../services/export.js';
import { Mail, X, Copy, Send, Sparkles, Loader2 } from 'lucide-react';

export const FollowUpEmailModal: React.FC = () => {
  const { modals, closeModal, activeMeeting, showToast } = useMeeting();
  const [tone, setTone] = useState<'professional' | 'concise' | 'action-oriented'>('professional');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modals.email && activeMeeting) {
      loadEmailDraft(tone);
    }
  }, [modals.email, activeMeeting, tone]);

  if (!modals.email || !activeMeeting) return null;

  const loadEmailDraft = async (selectedTone: 'professional' | 'concise' | 'action-oriented') => {
    setLoading(true);
    try {
      const res = await api.generateFollowUpEmail(activeMeeting.id, selectedTone);
      setSubject(res.subject);
      setBody(res.body);
    } catch (err: any) {
      showToast('Draft generation failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const full = `Subject: ${subject}\n\n${body}`;
    await exportService.copyToClipboard(full);
    showToast('Email draft copied to clipboard', '', 'success');
  };

  const handleOpenClient = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <div className="fixed inset-0 bg-[#0f1117]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 font-black text-base text-[#111827]">
            <Mail className="w-4 h-4 text-[#2563eb]" />
            <span>Generate Follow-Up Email Draft</span>
          </div>
          <button
            onClick={() => closeModal('email')}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tone Selector */}
        <div className="px-6 py-3 bg-[#f8fafd] border-b border-[#e5e7eb] flex items-center gap-3">
          <span className="text-xs font-bold text-[#6b7280]">Email Style / Tone:</span>
          {(['professional', 'concise', 'action-oriented'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer border ${
                tone === t
                  ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-2xs'
                  : 'bg-white border-[#d6dbe2] text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
              <p className="text-xs text-[#6b7280] font-semibold">Drafting stakeholder email from action items…</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6b7280] mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-[#111827] border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6b7280] mb-1">
                  Email Body (Editable)
                </label>
                <textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3.5 text-xs text-[#374151] font-mono leading-relaxed border border-[#d6dbe2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563eb] resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <button
            onClick={() => loadEmailDraft(tone)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4f46e5] hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Regenerate Draft</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#d6dbe2] bg-white text-xs font-bold text-[#374151] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Email</span>
            </button>
            <button
              onClick={handleOpenClient}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in Mail App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

