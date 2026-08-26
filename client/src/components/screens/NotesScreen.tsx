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
  Loader2
} from 'lucide-react';
import { ActionItem } from '../../types/meeting.js';

export const NotesScreen: React.FC = () => {
  const {
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

  const [activeLang, setActiveLang] = useState<string>(activeMeeting?.summary?.language || 'Auto');
  const [activeTemplate, setActiveTemplate] = useState<string>(activeMeeting?.summary?.template || 'Standard Meeting Notes');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [summaryProgress, setSummaryProgress] = useState<number>(0);
  const [summaryPhase, setSummaryPhase] = useState<string>('Reading meeting transcript…');
  const summaryIntervalRef = useRef<any>(null);

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

  // Language options
  const languages = ['Auto', 'English', 'Spanish', 'French', 'German', 'Hindi', 'Malayalam'];
  const templates = [
    'Standard Meeting Notes',
    'Daily Standup',
    'Project Sync / Status Update',
    'Retrospective (Agile)',
    'Client / Sales Meeting'
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
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e5e7eb] bg-white flex-wrap">
            <button
              onClick={handleCopyTranscript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d6dbe2] bg-white text-xs font-bold text-[#374151] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => showToast('Recordings folder', '/Users/you/Minomeet/recordings', 'info')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d6dbe2] bg-white text-xs font-bold text-[#374151] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Recording</span>
            </button>
            <button
              onClick={handleEnhanceAudio}
              disabled={isEnhancing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-sm transition cursor-pointer ${
                isEnhancing
                  ? 'bg-blue-50 border-blue-200 text-blue-600 animate-pulse'
                  : 'bg-white border-[#d6dbe2] text-[#374151] hover:bg-[#f6f7f9]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isEnhancing ? 'Enhancing…' : 'Enhance'}</span>
            </button>
            <div className="ml-auto text-xs text-[#9aa2af] font-mono">
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

          {/* If No Summary Generated Yet */}
          {!summary ? (
            <div className="flex-1 flex flex-col">
              <div className="px-5 py-3 border-b border-[#e5e7eb] font-extrabold text-[13.5px] text-[#111827]">
                Minutes of Meeting Summary
              </div>
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
                      Generate an on-device AI summary of this transcript to extract key decisions, action items and structured notes.
                    </p>
                    <button
                      onClick={() => generateSummaryForActive(activeTemplate, activeLang)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Generate Summary</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Minutes of Meeting Document View */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* MOM Toolbar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e5e7eb] bg-white flex-wrap shadow-xs">
                {/* Regenerate Button */}
                <button
                  onClick={() => generateSummaryForActive(activeTemplate, activeLang)}
                  disabled={isGeneratingSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dbeafe] border border-[#bfdbfe] text-[#1e3a8a] text-xs font-bold hover:bg-[#bfdbfe] shadow-sm transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingSummary ? 'Generating…' : 'Regenerate Summary'}</span>
                </button>

                {/* Language Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setLangMenuOpen(!langMenuOpen);
                      setTemplateMenuOpen(false);
                      setExportMenuOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#d6dbe2] bg-white text-xs font-semibold text-[#374151] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#4b5563]" />
                    <span>{activeLang}</span>
                    <ChevronDown className="w-3 h-3 text-[#9aa2af]" />
                  </button>
                  {langMenuOpen && (
                    <div className="absolute top-full mt-1.5 left-0 w-44 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-1 z-50 text-xs">
                      {languages.map((lang) => (
                        <div
                          key={lang}
                          onClick={() => handleLanguageSelect(lang)}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#f3f4f6] ${
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

                {/* AI Model Button */}
                <button
                  onClick={() => openModal('model')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#d6dbe2] bg-white text-xs font-semibold text-[#374151] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#7c3aed]" />
                  <span>AI Model</span>
                </button>

                {/* Template Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setTemplateMenuOpen(!templateMenuOpen);
                      setLangMenuOpen(false);
                      setExportMenuOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#d6dbe2] bg-white text-xs font-semibold text-[#374151] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer max-w-[200px] truncate"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#4b5563]" />
                    <span className="truncate">{activeTemplate}</span>
                    <ChevronDown className="w-3 h-3 text-[#9aa2af] flex-none" />
                  </button>
                  {templateMenuOpen && (
                    <div className="absolute top-full mt-1.5 left-0 w-64 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-1 z-50 text-xs">
                      {templates.map((tmpl) => (
                        <div
                          key={tmpl}
                          onClick={() => handleTemplateSelect(tmpl)}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#f3f4f6] ${
                            activeTemplate === tmpl ? 'text-[#2563eb] font-bold bg-[#eff6ff]' : 'text-[#374151]'
                          }`}
                        >
                          <span>{tmpl}</span>
                          {activeTemplate === tmpl && <Check className="w-3.5 h-3.5" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1" />

                {/* Follow-up Email Generator */}
                <button
                  onClick={() => openModal('email')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#c9dcff] bg-[#eff4ff] text-[#1e3a8a] text-xs font-bold hover:bg-[#dbeafe] shadow-sm transition cursor-pointer"
                  title="Generate follow-up email draft"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Draft</span>
                </button>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setExportMenuOpen(!exportMenuOpen);
                      setLangMenuOpen(false);
                      setTemplateMenuOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d6dbe2] bg-white text-xs font-bold text-[#374151] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                    <ChevronDown className="w-3 h-3 text-[#9aa2af]" />
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute top-full mt-1.5 right-0 w-48 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-1.5 z-50 text-xs">
                      <div
                        onClick={() => {
                          exportService.downloadFile(exportService.toMarkdown(activeMeeting), `${activeMeeting.title}.md`, 'text/markdown');
                          setExportMenuOpen(false);
                          showToast('Markdown file downloaded', '', 'success');
                        }}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#f3f4f6] text-[#374151]"
                      >
                        <Download className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Download as Markdown (.md)</span>
                      </div>
                      <div
                        onClick={() => {
                          exportService.printMeeting(activeMeeting);
                          setExportMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#f3f4f6] text-[#374151]"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#15803d]" />
                        <span>Print / Save as PDF</span>
                      </div>
                      <div
                        onClick={() => {
                          handleCopyMOM();
                          setExportMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#f3f4f6] text-[#374151]"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#7c3aed]" />
                        <span>Copy Formatted Text</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <button
                  onClick={() => showToast('Saved', 'Your changes have been saved.', 'success')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-bold hover:bg-[#1f2937] shadow-sm transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                {/* Meeting Options Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
                    className="p-1.5 rounded-lg border border-[#d6dbe2] bg-white text-[#6b7280] hover:text-[#111827] hover:bg-[#f6f7f9] shadow-sm transition cursor-pointer"
                    title="Meeting options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                  {optionsMenuOpen && (
                    <div className="absolute top-full mt-1.5 right-0 w-36 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-1 z-50 text-xs">
                      <button
                        onClick={() => {
                          setOptionsMenuOpen(false);
                          openRenameModal(activeMeeting);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition font-medium cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Rename</span>
                      </button>
                      <div className="h-px bg-gray-100 my-0.5" />
                      <button
                        onClick={() => {
                          setOptionsMenuOpen(false);
                          openDeleteModal(activeMeeting);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

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

              {/* Editable Document Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Title */}
                <div>
                  <h1
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newTitle = e.currentTarget.textContent || activeMeeting.title;
                      updateActiveMeeting({ title: newTitle });
                    }}
                    className="text-2xl font-black text-[#111827] hover:bg-yellow-50/70 p-1 -ml-1 rounded transition"
                  >
                    {activeMeeting.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-[#9aa2af] mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {summary.date} &bull; {activeMeeting.duration}
                    </span>
                    <span>&bull;</span>
                    <span>Generated by Minomeet AI ({summary.modelUsed})</span>
                  </div>
                </div>

                {/* Attendees */}
                {summary.attendees && summary.attendees.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs text-[#4b5563]">
                    <User className="w-3.5 h-3.5 text-[#6b7280]" />
                    <span className="font-bold text-[#111827]">Attendees:</span>
                    {summary.attendees.map((att, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]">
                        {att}
                      </span>
                    ))}
                  </div>
                )}

                {/* Executive Summary */}
                <div>
                  <h3 className="text-sm font-extrabold text-[#111827] mb-2 uppercase tracking-wide">
                    Executive Summary
                  </h3>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      updateActiveSummary({ summary: e.currentTarget.textContent || '' });
                    }}
                    className="text-[14.5px] leading-relaxed text-[#374151] hover:bg-yellow-50/70 p-1.5 -ml-1.5 rounded transition"
                  >
                    {summary.summary}
                  </p>
                </div>

                {/* Key Decisions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-wide">
                      Key Decisions
                    </h3>
                    <button
                      onClick={handleAddDecision}
                      className="text-xs text-[#2563eb] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add decision
                    </button>
                  </div>
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
                </div>

                {/* Action Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-wide">
                      Action Items &amp; Ownership
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
                      <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3 w-10 text-center">Done</th>
                          <th className="p-3 w-28">Owner</th>
                          <th className="p-3">Task Deliverable</th>
                          <th className="p-3 w-32">Due Date</th>
                          <th className="p-3 w-40">Notes</th>
                          <th className="p-3 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e7eb] text-[#374151]">
                        {summary.actionItems.map((act, idx) => (
                          <tr key={act.id || idx} className={`hover:bg-[#f9fafb] transition ${act.completed ? 'bg-green-50/40 opacity-70' : ''}`}>
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
                                className="hover:bg-yellow-50/70 p-1 rounded transition block"
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
                                className={`hover:bg-yellow-50/70 p-1 rounded transition block ${act.completed ? 'line-through text-gray-500' : ''}`}
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
                                title="Delete task"
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

                {/* Discussion Highlights */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-wide">
                      Discussion Highlights
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

                {/* Next Steps */}
                {summary.nextSteps && summary.nextSteps.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-[#111827] mb-2 uppercase tracking-wide">
                      Immediate Next Steps
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-[13.5px] text-[#4b5563]">
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
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

