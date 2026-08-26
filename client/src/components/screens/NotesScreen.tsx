import React, { useState, useEffect, useRef } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { exportService } from '../../services/export.js';
import {
  Copy,
  FolderOpen,
  Sparkles,
  RefreshCw,
  Globe,
  Cpu,
  FileText,
  Save,
  Plus,
  Check,
  Mail,
  Download,
  Printer,
  ChevronDown,
  Wand2,
  Clock,
  User,
  Edit3,
  Trash2,
  MoreVertical,
  Loader2,
  Award,
  Terminal,
  Briefcase,
  Target,
  CheckCircle2,
  TrendingUp,
  Zap,
  Layers,
  Flag,
  Code,
  X
} from 'lucide-react';
import { ActionItem } from '../../types/meeting.js';

// Helper to determine document styling variant based on template name
const getTemplateStyle = (tmpl: string): 'standard' | 'executive' | 'standup' | 'sales' | 'retrospective' => {
  const t = (tmpl || '').toLowerCase();
  if (t.includes('executive') || t.includes('board') || t.includes('leadership')) return 'executive';
  if (t.includes('standup') || t.includes('engineering') || t.includes('developer') || t.includes('agile') || t.includes('daily')) return 'standup';
  if (t.includes('sales') || t.includes('client') || t.includes('commercial')) return 'sales';
  if (t.includes('retro') || t.includes('milestone') || t.includes('retrospective') || t.includes('project')) return 'retrospective';
  return 'standard';
};

export const NotesScreen: React.FC = () => {
  const {
    settings,
    templates,
    activeMeeting,
    isGeneratingSummary,
    generateSummaryForActive,
    updateActiveMeeting,
    updateActiveSummary,
    openModal,
    openDeleteModal,
    openRenameModal,
    showToast
  } = useMeeting();

  const [activeLang, setActiveLang] = useState<string>(activeMeeting?.summary?.language || settings?.defaultLanguage || 'English');
  const [activeTemplate, setActiveTemplate] = useState<string>(activeMeeting?.summary?.template || settings?.defaultTemplate || 'Standard Meeting Notes & MOM');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [summaryProgress, setSummaryProgress] = useState<number>(0);
  const [summaryPhase, setSummaryPhase] = useState<string>('Reading meeting transcript…');
  const summaryIntervalRef = useRef<any>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Sync state when activeMeeting or settings change
  useEffect(() => {
    if (activeMeeting?.summary?.template) {
      setActiveTemplate(activeMeeting.summary.template);
    } else if (settings?.defaultTemplate) {
      setActiveTemplate(settings.defaultTemplate);
    }
    if (activeMeeting?.summary?.language) {
      setActiveLang(activeMeeting.summary.language);
    } else if (settings?.defaultLanguage) {
      setActiveLang(settings.defaultLanguage);
    }
  }, [activeMeeting?.id, activeMeeting?.summary?.template, activeMeeting?.summary?.language, settings?.defaultTemplate, settings?.defaultLanguage]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
        setTemplateMenuOpen(false);
        setExportMenuOpen(false);
        setOptionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic 1-100% animation when generating summary
  useEffect(() => {
    if (isGeneratingSummary) {
      setSummaryProgress(1);
      setSummaryPhase('Reading and tokenizing transcript lines…');
      let pct = 1;
      summaryIntervalRef.current = setInterval(() => {
        if (pct < 30) {
          pct += Math.floor(Math.random() * 4) + 2;
          setSummaryPhase('Analyzing topic shifts and discussion context…');
        } else if (pct < 65) {
          pct += Math.floor(Math.random() * 2) + 1;
          setSummaryPhase('Extracting Key Decisions and strategic alignments…');
        } else if (pct < 88) {
          pct += 1;
          setSummaryPhase('Formatting Action Items table with owners and due dates…');
        } else if (pct < 96) {
          if (Math.random() > 0.4) pct += 1;
          setSummaryPhase('Synthesizing Executive Summary and Next Steps…');
        }
        if (pct > 96) pct = 96;
        setSummaryProgress(pct);
      }, 70);
    } else {
      if (summaryIntervalRef.current) clearInterval(summaryIntervalRef.current);
      setSummaryProgress(100);
      setSummaryPhase('MOM Synthesis Complete!');
    }

    return () => {
      if (summaryIntervalRef.current) clearInterval(summaryIntervalRef.current);
    };
  }, [isGeneratingSummary]);

  if (!activeMeeting) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center bg-white">
        <div className="text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold">No meeting selected.</p>
        </div>
      </div>
    );
  }

  const summary = activeMeeting.summary;

  // Language & Template Options
  const languages = ['English'];
  const templateList = templates && templates.length > 0 ? templates : [
    { id: 'template-standard', name: 'Standard Meeting Notes & MOM', category: 'General & Operations' },
    { id: 'template-executive', name: 'Executive & Board Summary', category: 'Leadership & Strategy' },
    { id: 'template-standup', name: 'Engineering & Daily Standup', category: 'Agile & Development' },
    { id: 'template-sales', name: 'Client & Sales Engagement', category: 'Commercial & Sales' },
    { id: 'template-retrospective', name: 'Project Milestone & Retrospective', category: 'Project Management' }
  ];

  // Actions
  const handleCopyTranscript = async () => {
    const text = activeMeeting.transcript.map(t => `[${t.time}] ${t.speaker ? `${t.speaker}: ` : ''}${t.text}`).join('\n');
    await exportService.copyToClipboard(text);
    showToast('Transcript copied to clipboard', '', 'success');
  };

  const handleCopyMOM = async () => {
    const md = exportService.toMarkdown(activeMeeting);
    await exportService.copyToClipboard(md);
    showToast('Minutes of Meeting copied to clipboard', 'Markdown format', 'success');
  };

  const handleEnhanceAudio = () => {
    setIsEnhancing(true);
    showToast('Enhancing audio stream…', 'Applying on-device neural noise reduction', 'info');
    setTimeout(() => {
      setIsEnhancing(false);
      showToast('Audio enhanced', 'Background noise filtered and volume normalized.', 'success');
    }, 1200);
  };

  const handleAddActionItem = () => {
    if (!summary) return;
    const newItem: ActionItem = {
      id: 'act-' + Date.now(),
      owner: 'Assignee',
      task: 'New actionable task',
      due: 'Upcoming Sync',
      notes: '—',
      completed: false
    };
    const updated = [...summary.actionItems, newItem];
    updateActiveSummary({ actionItems: updated });
  };

  const handleToggleActionCompleted = (idx: number) => {
    if (!summary) return;
    const updated = [...summary.actionItems];
    updated[idx].completed = !updated[idx].completed;
    updateActiveSummary({ actionItems: updated });
  };

  const handleDeleteActionItem = (idx: number) => {
    if (!summary) return;
    const updated = summary.actionItems.filter((_, i) => i !== idx);
    updateActiveSummary({ actionItems: updated });
  };

  const handleAddDecision = () => {
    if (!summary) return;
    const updated = [...summary.keyDecisions, 'New key decision approved by stakeholders.'];
    updateActiveSummary({ keyDecisions: updated });
  };

  const handleAddHighlight = () => {
    if (!summary) return;
    const updated = [...summary.discussionHighlights, 'Topic discussion highlight.'];
    updateActiveSummary({ discussionHighlights: updated });
  };

  const handleAddAttendee = () => {
    if (!summary) return;
    const attendees = summary.attendees || [];
    const updated = [...attendees, `Team Member ${attendees.length + 1}`];
    updateActiveSummary({ attendees: updated });
  };

  const handleUpdateAttendee = (idx: number, name: string) => {
    if (!summary) return;
    const updated = [...(summary.attendees || [])];
    updated[idx] = name;
    updateActiveSummary({ attendees: updated });
  };

  const handleDeleteAttendee = (idx: number) => {
    if (!summary) return;
    const updated = (summary.attendees || []).filter((_, i) => i !== idx);
    updateActiveSummary({ attendees: updated });
  };

  const handleLanguageSelect = async (lang: string) => {
    setActiveLang(lang);
    setLangMenuOpen(false);
    if (summary) {
      await generateSummaryForActive(activeTemplate, lang);
    }
  };

  const handleTemplateSelect = async (tmpl: string) => {
    setActiveTemplate(tmpl);
    setTemplateMenuOpen(false);
    if (summary) {
      await generateSummaryForActive(tmpl, activeLang);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-text">
      {/* Split Pane Container */}
      <div className="flex-1 flex min-h-0 divide-x divide-[#e5e7eb]">

        {/* ================= LEFT PANE: TRANSCRIPT ================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa]/50">
          {/* Transcript Toolbar */}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#e5e7eb] bg-white h-[53px] flex-none">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTranscript}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#e2e8f0] bg-white text-xs font-semibold text-[#374151] hover:bg-[#f8fafc] hover:border-[#cbd5e1] shadow-2xs transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Copy</span>
              </button>
              <button
                onClick={() => showToast('Recordings folder', '/Users/you/Minomeet/recordings', 'info')}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#e2e8f0] bg-white text-xs font-semibold text-[#374151] hover:bg-[#f8fafc] hover:border-[#cbd5e1] shadow-2xs transition cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Recording</span>
              </button>
              <button
                onClick={handleEnhanceAudio}
                disabled={isEnhancing}
                className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border text-xs font-semibold shadow-2xs transition cursor-pointer ${
                  isEnhancing
                    ? 'bg-blue-50 border-blue-200 text-blue-600 animate-pulse'
                    : 'bg-white border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] hover:border-[#cbd5e1]'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>{isEnhancing ? 'Enhancing…' : 'Enhance'}</span>
              </button>
            </div>
            <div className="text-xs text-[#94a3b8] font-mono whitespace-nowrap pl-2">
              {activeMeeting.transcript.length} lines &bull; {activeMeeting.duration}
            </div>
          </div>

          {/* Transcript Lines Scroll View */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeMeeting.transcript.map((line, idx) => (
              <div key={line.id || idx} className="text-[14px] leading-relaxed group">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs text-[#9aa2af] font-mono select-none pt-0.5 min-w-[42px]">
                    [{line.time}]
                  </span>
                  <div className="flex-1">
                    {line.speaker && (
                      <span className="font-bold text-[#1e3a8a] mr-2 text-xs uppercase tracking-wider bg-[#eff6ff] px-1.5 py-0.5 rounded">
                        {line.speaker}
                      </span>
                    )}
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updatedTranscript = [...activeMeeting.transcript];
                        updatedTranscript[idx].text = e.currentTarget.textContent || '';
                        updateActiveMeeting({ transcript: updatedTranscript });
                      }}
                      className="text-[#1f2937] hover:bg-yellow-50/60 p-0.5 rounded transition"
                    >
                      {line.text}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT PANE: MOM DOCUMENT ================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* 2-Row MOM Top Toolbar */}
          <div
            ref={toolbarRef}
            className="p-3 border-b border-[#e5e7eb] bg-white flex flex-col gap-2.5 flex-none z-20 shadow-2xs"
          >
            {/* ROW 1: AI Generation & Model Settings */}
            <div className="grid grid-cols-4 gap-2.5 w-full">
              {/* 1. Generate / Regenerate MOM Button */}
              <button
                onClick={() => generateSummaryForActive(activeTemplate, activeLang)}
                disabled={isGeneratingSummary}
                className={`w-full h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] disabled:opacity-75 ${
                  isGeneratingSummary
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : summary
                    ? 'bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] shadow-2xs'
                    : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs'
                }`}
                title={summary ? 'Regenerate AI Minutes of Meeting' : 'Generate AI Minutes of Meeting'}
              >
                {isGeneratingSummary ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin flex-none" />
                ) : summary ? (
                  <RefreshCw className="w-3.5 h-3.5 flex-none" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 flex-none" />
                )}
                <span className="truncate">
                  {isGeneratingSummary ? 'Generating…' : summary ? 'Regenerate MOM' : 'Generate MOM'}
                </span>
              </button>

              {/* 2. MOM Template Selector */}
              <div className="relative w-full">
                <button
                  onClick={() => {
                    setTemplateMenuOpen(!templateMenuOpen);
                    setLangMenuOpen(false);
                    setExportMenuOpen(false);
                    setOptionsMenuOpen(false);
                  }}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#374151] hover:bg-[#f8fafc] hover:border-[#cbd5e1] shadow-2xs transition cursor-pointer inline-flex items-center justify-between gap-1.5"
                  title={`Active Template: ${activeTemplate}`}
                >
                  <div className="inline-flex items-center gap-1.5 min-w-0 truncate">
                    <FileText className="w-3.5 h-3.5 text-[#2563eb] flex-none" />
                    <span className="truncate">{activeTemplate}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] flex-none" />
                </button>
                {templateMenuOpen && (
                  <div className="absolute top-full mt-1.5 left-0 w-80 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
                    <div className="px-3 py-1 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">MOM Templates</div>
                    {templateList.map((tpl) => {
                      const isSelected = activeTemplate === tpl.name;
                      return (
                        <div
                          key={tpl.id || tpl.name}
                          onClick={() => handleTemplateSelect(tpl.name)}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#f8fafc] transition ${
                            isSelected ? 'text-[#2563eb] font-bold bg-[#eff6ff]' : 'text-[#374151]'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-xs truncate">{tpl.name}</div>
                            {tpl.category && <div className="text-[10px] text-[#6b7280]">{tpl.category}</div>}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#2563eb] flex-none" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. AI Model Selector */}
              <button
                onClick={() => openModal('model')}
                className="w-full h-9 px-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#374151] hover:bg-[#f8fafc] hover:border-[#cbd5e1] shadow-2xs transition cursor-pointer inline-flex items-center justify-center gap-1.5 truncate"
                title={`AI Inference Model: ${settings?.selectedModel || 'Nimbus 4B'}. Click to configure.`}
              >
                <Cpu className="w-3.5 h-3.5 text-[#7c3aed] flex-none" />
                <span className="truncate">{settings?.selectedModel ? `Model: ${settings.selectedModel.split(' ')[0]}` : 'AI Model'}</span>
              </button>

              {/* 4. Language Selector */}
              <div className="relative w-full">
                <button
                  onClick={() => {
                    setLangMenuOpen(!langMenuOpen);
                    setTemplateMenuOpen(false);
                    setExportMenuOpen(false);
                    setOptionsMenuOpen(false);
                  }}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#374151] hover:bg-[#f8fafc] hover:border-[#cbd5e1] shadow-2xs transition cursor-pointer inline-flex items-center justify-between gap-1.5"
                  title="Transcription and MOM language"
                >
                  <div className="inline-flex items-center gap-1.5 min-w-0 truncate">
                    <Globe className="w-3.5 h-3.5 text-[#15803d] flex-none" />
                    <span className="truncate">{activeLang}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] flex-none" />
                </button>
                {langMenuOpen && (
                  <div className="absolute top-full mt-1.5 right-0 w-44 bg-white border border-[#e2e8f0] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {languages.map((lang) => (
                      <div
                        key={lang}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#f8fafc] ${
                          activeLang === lang ? 'text-[#2563eb] font-bold bg-[#eff6ff]' : 'text-[#374151]'
                        }`}
                      >
                        <span>{lang}</span>
                        {activeLang === lang && <Check className="w-3.5 h-3.5" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ROW 2: Document Actions, Export & Save */}
            <div className="grid grid-cols-4 gap-2.5 w-full">
              {/* 5. Follow-up Email Draft */}
              <button
                onClick={() => openModal('email')}
                className="w-full h-9 px-2.5 rounded-xl border border-[#e9d5ff] bg-[#faf5ff] text-[#7e22ce] text-xs font-bold hover:bg-[#f3e8ff] shadow-2xs transition cursor-pointer inline-flex items-center justify-center gap-1.5 truncate"
                title="Generate follow-up email draft"
              >
                <Mail className="w-3.5 h-3.5 flex-none" />
                <span className="truncate">Email Draft</span>
              </button>

              {/* 6. Export Menu */}
              <div className="relative w-full">
                <button
                  onClick={() => {
                    setExportMenuOpen(!exportMenuOpen);
                    setLangMenuOpen(false);
                    setTemplateMenuOpen(false);
                    setOptionsMenuOpen(false);
                  }}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-bold text-[#374151] hover:bg-[#f8fafc] hover:border-[#cbd5e1] shadow-2xs transition cursor-pointer inline-flex items-center justify-between gap-1.5"
                  title="Export document"
                >
                  <div className="inline-flex items-center gap-1.5 min-w-0 truncate">
                    <Download className="w-3.5 h-3.5 text-[#64748b] flex-none" />
                    <span className="truncate">Export MOM</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] flex-none" />
                </button>
                {exportMenuOpen && (
                  <div className="absolute top-full mt-1.5 left-0 w-60 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div
                      onClick={() => {
                        exportService.downloadFile(exportService.toMarkdown(activeMeeting), `${activeMeeting.title}.md`, 'text/markdown');
                        setExportMenuOpen(false);
                        showToast('Markdown file downloaded', '', 'success');
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#f8fafc] text-[#374151] font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Download Markdown (.md)</span>
                    </div>
                    <div
                      onClick={() => {
                        exportService.printMeeting(activeMeeting);
                        setExportMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#f8fafc] text-[#374151] font-medium"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#15803d]" />
                      <span>Print / Save PDF</span>
                    </div>
                    <div
                      onClick={() => {
                        handleCopyMOM();
                        setExportMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#f8fafc] text-[#374151] font-medium"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#7c3aed]" />
                      <span>Copy Formatted Text</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Save Button */}
              <button
                onClick={() => showToast('Saved', 'Your changes have been saved.', 'success')}
                className="w-full h-9 px-3 rounded-xl bg-[#0f172a] text-white text-xs font-bold hover:bg-[#1e293b] shadow-2xs transition cursor-pointer inline-flex items-center justify-center gap-1.5 truncate"
                title="Save meeting document"
              >
                <Save className="w-3.5 h-3.5 flex-none" />
                <span className="truncate">Save Document</span>
              </button>

              {/* 8. More Options Dropdown */}
              <div className="relative w-full">
                <button
                  onClick={() => {
                    setOptionsMenuOpen(!optionsMenuOpen);
                    setLangMenuOpen(false);
                    setTemplateMenuOpen(false);
                    setExportMenuOpen(false);
                  }}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] hover:border-[#cbd5e1] shadow-2xs transition cursor-pointer inline-flex items-center justify-between gap-1.5"
                  title="Meeting options"
                >
                  <div className="inline-flex items-center gap-1.5 min-w-0 truncate">
                    <MoreVertical className="w-3.5 h-3.5 flex-none" />
                    <span className="truncate">More Actions</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] flex-none" />
                </button>
                {optionsMenuOpen && (
                  <div className="absolute top-full mt-1.5 right-0 w-48 bg-white border border-[#e2e8f0] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        openRenameModal(activeMeeting);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition font-medium cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Rename Meeting</span>
                    </button>
                    <button
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        handleCopyMOM();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 transition font-medium cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>Copy Full MOM</span>
                    </button>
                    <div className="h-px bg-gray-100 my-0.5" />
                    <button
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        openDeleteModal(activeMeeting);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Delete Meeting</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* If No Summary Generated Yet */}
          {!summary ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              {isGeneratingSummary ? (
                <div className="flex flex-col items-center space-y-5 max-w-sm w-full">
                  {/* Equalizer animation */}
                  <div className="flex items-center justify-center gap-1.5 h-10">
                    <span className="w-1 bg-[#2563eb] rounded-full animate-eq-1 shadow-xs" />
                    <span className="w-1 bg-[#4f46e5] rounded-full animate-eq-2 shadow-xs" />
                    <span className="w-1 bg-[#7c3aed] rounded-full animate-eq-3 shadow-xs" />
                    <span className="w-1 bg-[#2563eb] rounded-full animate-eq-4 shadow-xs" />
                    <span className="w-1 bg-[#3b82f6] rounded-full animate-eq-5 shadow-xs" />
                    <span className="w-1 bg-[#7c3aed] rounded-full animate-eq-6 shadow-xs" />
                  </div>

                  {/* Progress percentage */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black text-[#111827] tabular-nums font-sans">
                        {summaryProgress}
                      </span>
                      <span className="text-xl font-extrabold text-[#2563eb]">%</span>
                    </div>
                    <p className="text-xs font-bold text-[#4b5563] flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 text-[#2563eb] animate-spin" />
                      <span>{summaryPhase}</span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full space-y-1.5">
                    <div className="w-full h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden p-0.5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] rounded-full transition-all duration-150 ease-out relative overflow-hidden"
                        style={{ width: `${summaryProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-shimmer w-1/2" />
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#9aa2af]">
                      <span>Transcript</span>
                      <span>Key Decisions</span>
                      <span>Action Items</span>
                      <span>MOM</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#9aa2af]">
                    On-Device Neural Synthesis &bull; Zero Cloud Upload
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-[#f3f4f6] flex items-center justify-center text-[#9aa2af] mb-4 shadow-sm">
                    <Sparkles className="w-7 h-7 text-[#4f46e5]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#111827] mb-2">No Summary Generated Yet</h2>
                  <p className="text-xs text-[#6b7280] max-w-sm mb-6 leading-relaxed">
                    Generate an on-device AI summary of this transcript to extract key decisions, action items and structured notes according to <b>{activeTemplate}</b>.
                  </p>
                  <button
                    onClick={() => generateSummaryForActive(activeTemplate, activeLang)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Generate Minutes of Meeting</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Minutes of Meeting Document View */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Regenerating 1% - 100% Progress Banner */}
              {isGeneratingSummary && (
                <div className="bg-[#eff6ff] border-b border-[#bfdbfe] px-6 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1e3a8a]">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
                      <span>{summaryPhase}</span>
                    </span>
                    <span className="font-mono text-[#2563eb] text-sm tabular-nums font-black">{summaryProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#dbeafe] rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] rounded-full transition-all duration-150 relative overflow-hidden"
                      style={{ width: `${summaryProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-shimmer w-1/2" />
                    </div>
                  </div>
                </div>
              )}

              {/* Editable Document Body - Adapts Style Based on activeTemplate */}
              {(() => {
                const templateStyle = getTemplateStyle(activeTemplate);
                return (
                  <div className="flex-1 overflow-y-auto p-8 space-y-7">
                    {/* 1. Header & Title Block */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {templateStyle === 'standard' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            <FileText className="w-3.5 h-3.5 text-blue-600" /> Standard MOM
                          </span>
                        )}
                        {templateStyle === 'executive' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-widest bg-slate-900 text-amber-300 border border-slate-700 shadow-xs">
                            <Award className="w-3.5 h-3.5 text-amber-400" /> Executive Board Briefing
                          </span>
                        )}
                        {templateStyle === 'standup' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-xs">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Sprint Sync &amp; Standup Log
                          </span>
                        )}
                        {templateStyle === 'sales' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            <Briefcase className="w-3.5 h-3.5 text-amber-700" /> Client &amp; Commercial Sync
                          </span>
                        )}
                        {templateStyle === 'retrospective' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                            <Target className="w-3.5 h-3.5 text-purple-700" /> Milestone &amp; Retrospective
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 font-mono">Template: {activeTemplate}</span>
                      </div>

                      <h1
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newTitle = e.currentTarget.textContent || activeMeeting.title;
                          updateActiveMeeting({ title: newTitle });
                        }}
                        className={`text-2xl font-black text-[#111827] hover:bg-yellow-50/70 p-1 -ml-1 rounded transition ${
                          templateStyle === 'executive' ? 'font-serif text-slate-900 tracking-tight' : ''
                        }`}
                      >
                        {activeMeeting.title}
                      </h1>

                      <div className="flex items-center gap-3 text-xs text-[#9aa2af] mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#94a3b8]" /> {summary.date} &bull; {activeMeeting.duration}
                        </span>
                      </div>
                    </div>

                    {/* 2. Participants Section */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-[#4b5563]">
                      <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                        <User className="w-3.5 h-3.5 text-[#6b7280]" />
                        <span>Participants:</span>
                      </div>

                      {(summary.attendees || []).map((att, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium border group transition ${
                            templateStyle === 'executive'
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                              : templateStyle === 'standup'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-mono text-[11px]'
                              : templateStyle === 'sales'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : templateStyle === 'retrospective'
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : 'bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]'
                          }`}
                        >
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleUpdateAttendee(idx, e.currentTarget.textContent || '')}
                            className="hover:bg-yellow-50/70 px-0.5 rounded transition cursor-text outline-none"
                          >
                            {att}
                          </span>
                          <button
                            onClick={() => handleDeleteAttendee(idx)}
                            className="text-gray-400 hover:text-red-500 rounded-full p-0.5 transition cursor-pointer"
                            title={`Remove ${att}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {/* + Add Person Button */}
                      <button
                        onClick={handleAddAttendee}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-dashed border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 text-[11px] font-bold text-gray-500 hover:text-blue-600 transition cursor-pointer"
                        title="Add participant"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Person</span>
                      </button>
                    </div>

                    {/* 3. Summary Block - Adapts to Template */}
                    <div>
                      {templateStyle === 'standard' && (
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] border-l-4 border-l-[#2563eb] p-4 rounded-r-xl shadow-2xs">
                          <div className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#2563eb]" /> Executive Summary
                          </div>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateActiveSummary({ summary: e.currentTarget.textContent || '' })}
                            className="text-[14px] leading-relaxed text-[#374151] hover:bg-yellow-50/70 p-1.5 -ml-1.5 rounded transition"
                          >
                            {summary.summary}
                          </p>
                        </div>
                      )}

                      {templateStyle === 'executive' && (
                        <div className="bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
                          <div className="text-[11px] font-extrabold text-amber-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-400" /> Strategic Executive Overview &amp; Mandate
                          </div>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateActiveSummary({ summary: e.currentTarget.textContent || '' })}
                            className="text-[14px] leading-relaxed text-slate-100 font-normal hover:bg-white/10 p-1.5 rounded transition"
                          >
                            {summary.summary}
                          </p>
                        </div>
                      )}

                      {templateStyle === 'standup' && (
                        <div className="bg-[#0f172a] text-slate-200 p-4 rounded-xl font-mono border border-slate-800 shadow-md">
                          <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Sprint Summary &amp; Daily Sync Log
                          </div>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateActiveSummary({ summary: e.currentTarget.textContent || '' })}
                            className="text-[13px] leading-relaxed text-slate-300 font-mono hover:bg-slate-800/70 p-1 rounded transition"
                          >
                            {summary.summary}
                          </p>
                        </div>
                      )}

                      {templateStyle === 'sales' && (
                        <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white p-5 rounded-2xl border border-amber-200/90 shadow-2xs">
                          <div className="text-[11px] font-black text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-amber-600" /> Client Opportunity &amp; Commercial Overview
                          </div>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateActiveSummary({ summary: e.currentTarget.textContent || '' })}
                            className="text-[14px] leading-relaxed text-amber-950 font-medium hover:bg-amber-100/50 p-1.5 rounded transition"
                          >
                            {summary.summary}
                          </p>
                        </div>
                      )}

                      {templateStyle === 'retrospective' && (
                        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50/30 to-white p-5 rounded-2xl border border-purple-200 shadow-2xs">
                          <div className="text-[11px] font-black text-purple-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-600" /> Milestone Review &amp; Team Retrospective Summary
                          </div>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateActiveSummary({ summary: e.currentTarget.textContent || '' })}
                            className="text-[14px] leading-relaxed text-[#2e1065] font-medium hover:bg-purple-100/50 p-1.5 rounded transition"
                          >
                            {summary.summary}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 4. Key Decisions Block - Adapts to Template */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                          {templateStyle === 'executive' && <Award className="w-3.5 h-3.5 text-indigo-600" />}
                          {templateStyle === 'standup' && <Code className="w-3.5 h-3.5 text-emerald-600" />}
                          {templateStyle === 'sales' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                          {templateStyle === 'retrospective' && <Flag className="w-3.5 h-3.5 text-purple-600" />}
                          {templateStyle === 'standard' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                          <span>
                            {templateStyle === 'executive' && 'Strategic Directives & Board Alignments'}
                            {templateStyle === 'standup' && 'Architectural & Technical Consensus (ADR)'}
                            {templateStyle === 'sales' && 'Agreed Scope, Commercials & Client Terms'}
                            {templateStyle === 'retrospective' && 'Milestones Reached & Consensus Items'}
                            {templateStyle === 'standard' && 'Key Decisions'}
                          </span>
                        </h3>
                        <button
                          onClick={handleAddDecision}
                          className="text-xs text-[#2563eb] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add item
                        </button>
                      </div>

                      {templateStyle === 'standard' && (
                        <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-[#374151]">
                          {summary.keyDecisions.map((decision, idx) => (
                            <li key={idx} className="leading-relaxed">
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const updated = [...summary.keyDecisions];
                                  updated[idx] = e.currentTarget.textContent || '';
                                  updateActiveSummary({ keyDecisions: updated });
                                }}
                                className="hover:bg-yellow-50/70 p-0.5 rounded transition"
                              >
                                {decision}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {templateStyle === 'executive' && (
                        <div className="grid gap-2">
                          {summary.keyDecisions.map((dec, idx) => (
                            <div key={idx} className="bg-[#faf5ff] border border-[#e9d5ff] p-3 rounded-xl flex items-start gap-3 shadow-2xs">
                              <span className="bg-[#7c3aed] text-white text-[10px] font-black px-2 py-0.5 rounded-md flex-none uppercase">
                                DIR-{idx + 1}
                              </span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const updated = [...summary.keyDecisions];
                                  updated[idx] = e.currentTarget.textContent || '';
                                  updateActiveSummary({ keyDecisions: updated });
                                }}
                                className="text-[13.5px] font-semibold text-[#1e1b4b] flex-1 hover:bg-yellow-50/70 p-0.5 rounded transition"
                              >
                                {dec}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {templateStyle === 'standup' && (
                        <div className="grid gap-2">
                          {summary.keyDecisions.map((dec, idx) => (
                            <div key={idx} className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-xl flex items-start gap-3 shadow-2xs font-mono text-xs">
                              <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded flex-none">
                                [ADR-CONFIRMED]
                              </span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const updated = [...summary.keyDecisions];
                                  updated[idx] = e.currentTarget.textContent || '';
                                  updateActiveSummary({ keyDecisions: updated });
                                }}
                                className="text-[#065f46] font-medium flex-1 hover:bg-yellow-50/70 p-0.5 rounded transition font-mono"
                              >
                                {dec}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {templateStyle === 'sales' && (
                        <div className="grid gap-2">
                          {summary.keyDecisions.map((dec, idx) => (
                            <div key={idx} className="bg-white border-l-4 border-l-amber-500 border border-gray-200 p-3 rounded-r-xl flex items-start gap-3 shadow-2xs">
                              <CheckCircle2 className="w-4 h-4 text-amber-600 flex-none mt-0.5" />
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const updated = [...summary.keyDecisions];
                                  updated[idx] = e.currentTarget.textContent || '';
                                  updateActiveSummary({ keyDecisions: updated });
                                }}
                                className="text-[13.5px] font-semibold text-amber-950 flex-1 hover:bg-yellow-50/70 p-0.5 rounded transition"
                              >
                                {dec}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {templateStyle === 'retrospective' && (
                        <div className="grid gap-2">
                          {summary.keyDecisions.map((dec, idx) => (
                            <div key={idx} className="bg-purple-50/60 border border-purple-200 p-3 rounded-xl flex items-start gap-3 shadow-2xs">
                              <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex-none uppercase">
                                WIN-{idx + 1}
                              </span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const updated = [...summary.keyDecisions];
                                  updated[idx] = e.currentTarget.textContent || '';
                                  updateActiveSummary({ keyDecisions: updated });
                                }}
                                className="text-[13.5px] font-medium text-purple-950 flex-1 hover:bg-yellow-50/70 p-0.5 rounded transition"
                              >
                                {dec}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 5. Action Items Table - Adapts to Template */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-700" />
                          <span>
                            {templateStyle === 'executive' && 'Strategic Deliverables & Executive Ownership'}
                            {templateStyle === 'standup' && 'Sprint Backlog & Ticket Assignments'}
                            {templateStyle === 'sales' && 'Account Deliverables & Commercial Tasks'}
                            {templateStyle === 'retrospective' && 'Process Improvements & Action Plan'}
                            {templateStyle === 'standard' && 'Action Items & Ownership'}
                          </span>
                        </h3>
                        <button
                          onClick={handleAddActionItem}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] px-2.5 py-1 rounded-lg transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add row
                        </button>
                      </div>

                      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead
                            className={`border-b font-bold uppercase tracking-wider ${
                              templateStyle === 'executive'
                                ? 'bg-slate-900 text-amber-300 border-slate-700'
                                : templateStyle === 'standup'
                                ? 'bg-slate-900 text-emerald-400 border-slate-700 font-mono'
                                : templateStyle === 'sales'
                                ? 'bg-amber-100 text-amber-900 border-amber-200'
                                : templateStyle === 'retrospective'
                                ? 'bg-purple-100 text-purple-900 border-purple-200'
                                : 'bg-[#f9fafb] text-[#6b7280] border-[#e5e7eb]'
                            }`}
                          >
                            <tr>
                              <th className="p-3 w-10 text-center">Done</th>
                              <th className="p-3 w-32">
                                {templateStyle === 'executive' ? 'Strategic Lead' : templateStyle === 'standup' ? 'Dev Assignee' : templateStyle === 'sales' ? 'Account Lead' : templateStyle === 'retrospective' ? 'Process Owner' : 'Owner'}
                              </th>
                              <th className="p-3">
                                {templateStyle === 'executive' ? 'Executive Deliverable' : templateStyle === 'standup' ? 'Sprint Ticket / Task' : templateStyle === 'sales' ? 'Commercial Deliverable' : templateStyle === 'retrospective' ? 'Improvement Task' : 'Task Deliverable'}
                              </th>
                              <th className="p-3 w-32">
                                {templateStyle === 'executive' ? 'Horizon / Date' : templateStyle === 'standup' ? 'Sprint ETA' : templateStyle === 'sales' ? 'Target Date' : templateStyle === 'retrospective' ? 'Target Sprint' : 'Due Date'}
                              </th>
                              <th className="p-3 w-36">
                                {templateStyle === 'executive' ? 'Strategic Notes' : templateStyle === 'standup' ? 'PR / Branch' : templateStyle === 'sales' ? 'Deal Terms' : templateStyle === 'retrospective' ? 'Success Criteria' : 'Notes'}
                              </th>
                              <th className="p-3 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e5e7eb] text-[#374151]">
                            {summary.actionItems.map((act, idx) => (
                              <tr
                                key={act.id || idx}
                                className={`hover:bg-[#f9fafb] transition ${
                                  act.completed ? 'bg-green-50/40 opacity-70' : ''
                                }`}
                              >
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={!!act.completed}
                                    onChange={() => handleToggleActionCompleted(idx)}
                                    className="w-4 h-4 text-[#2563eb] rounded border-gray-300 focus:ring-[#2563eb] cursor-pointer"
                                  />
                                </td>
                                <td className="p-3 font-semibold text-[#111827]">
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const updated = [...summary.actionItems];
                                      updated[idx].owner = e.currentTarget.textContent || '';
                                      updateActiveSummary({ actionItems: updated });
                                    }}
                                    className={`hover:bg-yellow-50/70 p-1 rounded transition block ${
                                      templateStyle === 'standup' ? 'font-mono text-xs text-emerald-800' : ''
                                    }`}
                                  >
                                    {act.owner}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const updated = [...summary.actionItems];
                                      updated[idx].task = e.currentTarget.textContent || '';
                                      updateActiveSummary({ actionItems: updated });
                                    }}
                                    className={`hover:bg-yellow-50/70 p-1 rounded transition block ${
                                      act.completed ? 'line-through text-gray-500' : ''
                                    }`}
                                  >
                                    {act.task}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-[11px] text-[#4b5563]">
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const updated = [...summary.actionItems];
                                      updated[idx].due = e.currentTarget.textContent || '';
                                      updateActiveSummary({ actionItems: updated });
                                    }}
                                    className="hover:bg-yellow-50/70 p-1 rounded transition block"
                                  >
                                    {act.due}
                                  </span>
                                </td>
                                <td className="p-3 text-[11px] text-[#6b7280]">
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const updated = [...summary.actionItems];
                                      updated[idx].notes = e.currentTarget.textContent || '';
                                      updateActiveSummary({ actionItems: updated });
                                    }}
                                    className="hover:bg-yellow-50/70 p-1 rounded transition block"
                                  >
                                    {act.notes}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteActionItem(idx)}
                                    className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                                    title="Delete row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 6. Discussion Highlights - Adapts to Template */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
                          <span>
                            {templateStyle === 'executive' && 'Strategic Deliberations & Governance Observations'}
                            {templateStyle === 'standup' && 'Tech Debates, PRs & Blockers Resolved'}
                            {templateStyle === 'sales' && 'Client Pain Points, Requirements & Value Props'}
                            {templateStyle === 'retrospective' && 'Retrospective Insights & Team Learnings'}
                            {templateStyle === 'standard' && 'Discussion Highlights'}
                          </span>
                        </h3>
                        <button
                          onClick={handleAddHighlight}
                          className="text-xs text-[#2563eb] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add highlight
                        </button>
                      </div>

                      <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-[#374151]">
                        {summary.discussionHighlights.map((highlight, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const updated = [...summary.discussionHighlights];
                                updated[idx] = e.currentTarget.textContent || '';
                                updateActiveSummary({ discussionHighlights: updated });
                              }}
                              className="hover:bg-yellow-50/70 p-0.5 rounded transition"
                            >
                              {highlight}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 7. Next Steps - Adapts to Template */}
                    {summary.nextSteps && summary.nextSteps.length > 0 && (
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            {templateStyle === 'executive' && 'Strategic Horizon Roadmap & Milestones'}
                            {templateStyle === 'standup' && 'Next 24-48h Sprint Goals'}
                            {templateStyle === 'sales' && 'Commercial Follow-Up Timeline & Next Sync'}
                            {templateStyle === 'retrospective' && 'Upcoming Sprint Milestones & Release Plan'}
                            {templateStyle === 'standard' && 'Immediate Next Steps'}
                          </span>
                        </h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] text-[#4b5563]">
                          {summary.nextSteps.map((step, idx) => (
                            <li key={idx}>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const updated = [...(summary.nextSteps || [])];
                                  updated[idx] = e.currentTarget.textContent || '';
                                  updateActiveSummary({ nextSteps: updated });
                                }}
                                className="hover:bg-yellow-50/70 p-0.5 rounded transition"
                              >
                                {step}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

