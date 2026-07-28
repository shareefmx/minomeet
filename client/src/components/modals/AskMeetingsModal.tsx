import React, { useState } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import { X, Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export const AskMeetingsModal: React.FC = () => {
  const { modals, closeModal, selectMeeting, meetings, showToast } = useMeeting();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ query: string; answer: string; sources: any[] }[]>([
    {
      query: 'What was decided regarding the Argus and Pulse scanners?',
      answer: 'Based on your meeting archives, here is what was recorded:\n\n• **Product Security Sync — Aug 24**: The legacy static scanner was completely replaced with the new Argus engine company-wide without reported regressions.\n• **Pulse Scanner**: Remains in beta specifically targeting single-page apps, with the GA rollout date to be confirmed by Priya by Friday after one more regression pass.',
      sources: [
        { meetingId: 'meeting-1', meetingTitle: 'Product Security Sync — Aug 24', snippet: 'Replaced legacy static scanner with Argus.' }
      ]
    }
  ]);

  if (!modals.ask) return null;

  const handleAsk = async (questionText?: string) => {
    const q = (questionText || query).trim();
    if (!q) return;

    setLoading(true);
    setQuery('');

    try {
      const res = await api.askMeetings(q);
      setHistory(prev => [
        { query: q, answer: res.answer, sources: res.sources },
        ...prev
      ]);
    } catch (err: any) {
      showToast('Question failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'What was decided about the Argus scanner rollout?',
    'What are Priya\'s upcoming action items?',
    'What did the team discuss regarding Redis caching?',
    'Summarize all client onboarding tasks'
  ];

  return (
    <div className="fixed inset-0 bg-[#0f1117]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-2xl h-[620px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] bg-gradient-to-r from-[#eef2ff] to-[#f8f9fc]">
          <div className="flex items-center gap-2 font-black text-base text-[#111827]">
            <div className="w-6 h-6 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Ask Your Meetings</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#f2e9ff] text-[#7c3aed]">
              AI Semantic Search
            </span>
          </div>
          <button
            onClick={() => closeModal('ask')}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Prompts */}
        <div className="px-6 py-2.5 bg-[#fbfcfd] border-b border-[#e5e7eb] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="font-bold text-[#6b7280] flex-none">Suggestions:</span>
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleAsk(sq)}
              className="flex-none px-2.5 py-1 rounded-full bg-white hover:bg-[#eff6ff] hover:text-[#2563eb] text-[#4b5563] border border-[#d6dbe2] transition shadow-2xs cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Chat History View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-2.5">
              {/* Question bubble */}
              <div className="flex items-start justify-end">
                <div className="bg-[#2563eb] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-xs font-semibold max-w-lg shadow-xs">
                  {item.query}
                </div>
              </div>

              {/* Answer bubble */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white flex items-center justify-center flex-none shadow-xs mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#f8fafd] border border-[#e5e7eb] rounded-2xl rounded-tl-xs p-4 text-xs text-[#374151] leading-relaxed max-w-xl shadow-xs">
                  <div className="whitespace-pre-line font-normal">{item.answer}</div>

                  {/* Sources list */}
                  {item.sources && item.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#e5e7eb]/80 space-y-1">
                      <div className="text-[10.5px] font-bold uppercase text-[#9aa2af] tracking-wider">
                        Sourced Meetings:
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.sources.map((s: any, sIdx: number) => (
                          <button
                            key={sIdx}
                            onClick={() => {
                              const found = meetings.find(m => m.id === s.meetingId);
                              if (found) {
                                closeModal('ask');
                                selectMeeting(found);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#bfdbfe] text-[#1e3a8a] text-[11px] font-semibold hover:bg-[#eff6ff] transition cursor-pointer"
                          >
                            <span>{s.meetingTitle}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-[#6b7280] font-semibold animate-pulse pl-10">
              <Loader2 className="w-4 h-4 animate-spin text-[#4f46e5]" />
              <span>Synthesizing answer from your meetings…</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your past meetings, decisions, or tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs border border-[#d6dbe2] rounded-xl bg-white focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] shadow-inner"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold rounded-xl transition disabled:opacity-40 shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

