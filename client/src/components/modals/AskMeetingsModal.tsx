import React, { useState, useRef, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { api } from '../../services/api.js';
import { getEffectiveModelForAgent } from '../../utils/aiModelConfig.js';
import { ChatMessage } from '../../types/meeting.js';
import {
  X,
  Send,
  Sparkles,
  Loader2,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Layers,
  CheckSquare,
  Award,
  Users,
  FileText,
  Filter,
  Bot
} from 'lucide-react';

export const AskMeetingsModal: React.FC = () => {
  const {
    modals,
    closeModal,
    selectMeeting,
    meetings,
    activeMeeting,
    showToast,
    settings,
    setCurrentScreen,
    setSettingsTab
  } = useMeeting();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMeetingScope, setSelectedMeetingScope] = useState<string>('all');
  const [activeMode, setActiveMode] = useState<'all' | 'action_items' | 'decisions' | 'attendees' | 'summary'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeModel = getEffectiveModelForAgent(settings, 'ask_meetings');

  // Initialize with empty chat for natural user conversations
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // When modal opens, auto-scope to active meeting if available
  useEffect(() => {
    if (modals.ask) {
      if (activeMeeting) {
        setSelectedMeetingScope(activeMeeting.id);
      } else {
        setSelectedMeetingScope('all');
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [modals.ask, activeMeeting]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!modals.ask) return null;

  const handleSendMessage = async (questionText?: string) => {
    const textToSend = (questionText || query).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setQuery('');
    setLoading(true);

    try {
      // Build history for backend LLM
      const historyPayload = newHistory.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.askMeetings(
        textToSend,
        selectedMeetingScope === 'all' ? undefined : selectedMeetingScope,
        historyPayload,
        activeMode
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: res.sources,
        suggestedFollowUps: res.suggestedFollowUps
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      showToast('Assistant Error', err.message, 'error');
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Could not generate answer: ${err.message}. Please check connection or AI model settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleCopyMessage = async (content: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
      showToast('Copied to clipboard', '', 'success');
    } catch {
      showToast('Failed to copy', '', 'error');
    }
  };

  // Dynamic suggestion chips based on mode
  const getSuggestionsForMode = () => {
    switch (activeMode) {
      case 'action_items':
        return [
          'List all pending action items with assignees',
          'What tasks are assigned for this week?',
          'Which deliverables are currently unassigned?'
        ];
      case 'decisions':
        return [
          'What key decisions were approved across all syncs?',
          'List all architecture and technical decisions',
          'What was agreed upon regarding product rollout?'
        ];
      case 'attendees':
        return [
          'Who participated in the recent syncs?',
          'What updates did the engineering team provide?',
          'Summarize contributions by speaker'
        ];
      case 'summary':
        return [
          'Summarize the primary objectives of all meetings',
          'Compare recent meeting topics',
          'What were the top roadblocks discussed?'
        ];
      default:
        return [
          'What was decided about the Argus and Pulse scanners?',
          'Summarize all pending action deliverables',
          'What did the team discuss regarding Redis caching?',
          'Who has upcoming task deadlines?'
        ];
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1117]/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-3xl h-[680px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#e5e7eb] bg-gradient-to-r from-[#eef2ff] via-[#f8fafc] to-[#ffffff]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#111827]">Ask Your Meetings AI</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#f2e9ff] text-[#7c3aed] border border-[#e9d5ff]">
                  Chatbot
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeModel.status === 'connected' ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                  {activeModel.status === 'connected' ? `● ${activeModel.modelId.split(' ')[0]}` : '● Offline'}
                </span>
              </div>
              <p className="text-[11px] text-[#6b7280] font-medium">
                Conversational search & intelligence across all meeting notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => closeModal('ask')}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SCOPE & PARAMETER CONTROLS */}
        <div className="px-6 py-2 bg-[#fbfcfd] border-b border-[#e5e7eb] flex items-center justify-between gap-3 flex-wrap">
          {/* Meeting Scope Selector */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#6366f1]" />
            <span className="text-[11px] font-bold text-[#475569]">Scope:</span>
            <select
              value={selectedMeetingScope}
              onChange={(e) => setSelectedMeetingScope(e.target.value)}
              aria-label="Meeting Scope"
              className="h-7 px-2.5 rounded-lg border border-[#cbd5e1] bg-white text-xs font-semibold text-[#1e293b] focus:outline-none focus:border-[#2563eb] cursor-pointer shadow-2xs max-w-xs truncate"
            >
              <option value="all">⚡ All Meeting Notes ({meetings.length} Total)</option>
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  📌 {m.title} ({m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Sync'})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            <span className="text-[#94a3b8] font-bold text-[10px] uppercase flex items-center gap-1 mr-1">
              <Filter className="w-2.5 h-2.5" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All', icon: Sparkles },
              { id: 'action_items', label: 'Tasks', icon: CheckSquare },
              { id: 'decisions', label: 'Decisions', icon: Award },
              { id: 'attendees', label: 'Speakers', icon: Users },
              { id: 'summary', label: 'Summary', icon: FileText }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id as any)}
                  className={`px-2 py-0.5 rounded-full font-bold transition flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-[#2563eb] text-white shadow-2xs'
                      : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
                  }`}
                >
                  <Icon className="w-2.5 h-2.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CHAT CONVERSATION VIEW */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#fafbfc]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-sm text-[#0f172a]">Ask your meeting notes anything</h3>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Type any question below to get a simple, direct answer from the AI agent based on your meeting notes.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-lg">
                {getSuggestionsForMode().slice(0, 3).map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sq)}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-[#eff6ff] hover:text-[#2563eb] text-[#475569] border border-[#e2e8f0] text-xs font-medium transition shadow-2xs cursor-pointer"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((item, idx) => (
            <div key={item.id || idx} className="space-y-2">
              {/* USER MESSAGE */}
              {item.role === 'user' ? (
                <div className="flex items-start justify-end gap-2">
                  <div className="flex flex-col items-end max-w-xl">
                    <div className="bg-[#2563eb] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-xs font-semibold shadow-xs leading-relaxed">
                      {item.content}
                    </div>
                    {item.timestamp && (
                      <span className="text-[10px] text-[#94a3b8] mt-1 font-medium mr-1">
                        {item.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* ASSISTANT MESSAGE */
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white flex items-center justify-center flex-none shadow-xs mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 max-w-2xl bg-white border border-[#e5e7eb] rounded-2xl rounded-tl-xs p-4 sm:p-5 text-xs text-[#1e293b] shadow-xs space-y-3">
                    {/* Message Body with Markdown formatting */}
                    <div className="whitespace-pre-line leading-relaxed font-normal text-xs text-[#334155]">
                      {item.content}
                    </div>

                    {/* Sources Cards */}
                    {item.sources && item.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#f1f5f9] space-y-2">
                        <div className="text-[10px] font-black uppercase text-[#94a3b8] tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-[#6366f1]" />
                          <span>Referenced Meeting Notes ({item.sources.length}):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                          {item.sources.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#bfdbfe] hover:bg-[#eff6ff]/50 transition flex flex-col justify-between gap-1.5"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-[#1e3a8a] truncate">
                                  {s.meetingTitle}
                                </span>
                                {s.type && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-[#475569] border border-[#e2e8f0] uppercase">
                                    {s.type}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#64748b] line-clamp-2 italic">
                                &quot;{s.snippet}&quot;
                              </p>
                              <button
                                onClick={() => {
                                  const found = meetings.find(m => m.id === s.meetingId);
                                  if (found) {
                                    closeModal('ask');
                                    selectMeeting(found);
                                    setCurrentScreen('notes');
                                  }
                                }}
                                className="self-end inline-flex items-center gap-1 text-[10px] font-bold text-[#2563eb] hover:underline cursor-pointer pt-1"
                              >
                                <span>Open Note</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Suggested Follow-Ups */}
                    {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#f1f5f9] space-y-1.5">
                        <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                          Suggested Follow-ups:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.suggestedFollowUps.map((fu, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleSendMessage(fu)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f1f5f9] hover:bg-[#e0e7ff] text-[#4338ca] text-[11px] font-semibold border border-[#e2e8f0] transition cursor-pointer"
                            >
                              <span>{fu}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Actions (Copy) */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#f8fafc] text-[10px] text-[#94a3b8]">
                      <span>{item.timestamp || 'Just now'}</span>
                      <button
                        onClick={() => handleCopyMessage(item.content, idx)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#1e293b] transition cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-[#15803d]" />
                            <span className="text-[#15803d] font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )))}

          {/* THINKING / LOADING INDICATOR */}
          {loading && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white flex items-center justify-center flex-none shadow-xs mt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-white border border-[#e5e7eb] rounded-2xl rounded-tl-xs p-4 text-xs text-[#64748b] font-medium shadow-xs inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4f46e5]" />
                <span>Synthesizing answer from meeting archives with {activeModel.modelId.split(' ')[0]}…</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* ACTIVE MODEL FOOTER */}
        <div className="px-6 py-2 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#475569]">AI Model:</span>
            <span className="font-semibold text-[#1e293b]">{activeModel.providerName} &bull; {activeModel.modelId}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeModel.status === 'connected' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
              {activeModel.status === 'connected' ? '● Ready' : '● Not Configured'}
            </span>
          </div>
          <button
            onClick={() => {
              closeModal('ask');
              setSettingsTab('model');
              setCurrentScreen('settings');
            }}
            className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer flex-none"
          >
            Configure in Settings &rarr;
          </button>
        </div>

        {/* INPUT COMPOSER BAR */}
        <div className="p-3.5 sm:p-4 border-t border-[#e5e7eb] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={
                selectedMeetingScope === 'all'
                  ? 'Ask anything about decisions, action items, or quotes across all meetings…'
                  : 'Ask anything about this specific meeting note…'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs border border-[#d6dbe2] rounded-xl bg-[#fafbfc] focus:bg-white focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] shadow-inner transition font-medium"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold rounded-xl transition disabled:opacity-40 shadow-xs cursor-pointer flex-none"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

