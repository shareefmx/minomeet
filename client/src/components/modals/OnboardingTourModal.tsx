import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import {
  Sparkles,
  Key,
  Mic,
  FileText,
  FileCheck,
  CheckSquare,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  X,
  Shield,
  Zap,
  Sliders,
  Users,
  Send,
  Upload,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface TourStep {
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  description: string;
  features: { icon: React.FC<{ className?: string }>; title: string; text: string }[];
  highlightTip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    badge: 'Step 1 of 7 • Platform Overview',
    title: 'Welcome to Minomeet AI',
    subtitle: 'Autonomous On-Device & Cloud Meeting Intelligence Assistant',
    icon: Sparkles,
    iconBg: 'bg-gradient-to-br from-[#4f46e5] to-[#3730a3]',
    iconColor: 'text-white',
    description: 'Minomeet transforms raw meeting conversations into structured, actionable intelligence—combining real-time transcription, executive summaries, decision matrices, and semantic Q&A.',
    features: [
      {
        icon: Shield,
        title: '100% Privacy-First',
        text: 'Audio streams, live transcripts, and notes are processed and stored locally on your machine.'
      },
      {
        icon: Zap,
        title: 'Autonomous Multi-Model AI',
        text: 'Instantly orchestrate Google Gemini, OpenAI, Claude 3.7, Groq, and Ollama for all synthesis tasks.'
      }
    ],
    highlightTip: '💡 Minomeet operates with zero third-party telemetry, keeping corporate conversations completely confidential.'
  },
  {
    stepNumber: 2,
    badge: 'Step 2 of 7 • AI Model & API Key',
    title: 'Connect Your Preferred AI Engine',
    subtitle: 'Direct, zero-cloud-telemetry integration with frontier LLM providers',
    icon: Key,
    iconBg: 'bg-gradient-to-br from-[#2563eb] to-[#1d4ed8]',
    iconColor: 'text-white',
    description: 'Minomeet connects directly to your own AI API keys. Configure your credentials once in Settings to power executive summaries, action item extraction, and meeting search.',
    features: [
      {
        icon: Zap,
        title: 'Supported Cloud Providers',
        text: 'Google Gemini (2.5 Flash/Pro), OpenAI (GPT-4o/o3-mini), Anthropic (Claude 3.7), Groq (LPU Speed), OpenRouter.'
      },
      {
        icon: Shield,
        title: 'Local / Self-Hosted Support',
        text: 'Connect to Ollama or custom OpenAI-compatible endpoints running on your device or LAN.'
      }
    ],
    highlightTip: '🔑 After completing this tour, you will be automatically navigated to Settings to set up your AI API key.'
  },
  {
    stepNumber: 3,
    badge: 'Step 3 of 7 • Audio Recording & Ingestion',
    title: 'Multi-Source Audio Capture',
    subtitle: 'Record microphone, browser tabs, video calls, or import files',
    icon: Mic,
    iconBg: 'bg-gradient-to-br from-[#dc2626] to-[#991b1b]',
    iconColor: 'text-white',
    description: 'Capture high-fidelity dual-channel audio from any source with live interactive waveform visualization and automated gain control.',
    features: [
      {
        icon: Mic,
        title: 'Dual-Channel Capture',
        text: 'Capture your microphone, system audio (Google Meet, Zoom, Slack Huddles), or mixed simultaneous stream.'
      },
      {
        icon: Upload,
        title: 'Audio File Ingestion',
        text: 'Drag and drop pre-recorded .mp3, .wav, .m4a, or .webm recordings for instant background transcription.'
      }
    ],
    highlightTip: '🎙️ Select "Mixed (Mic + System)" when on video calls so both your voice and remote speakers are captured.'
  },
  {
    stepNumber: 4,
    badge: 'Step 4 of 7 • Speech-to-Text',
    title: 'Real-Time Live Transcriptions',
    subtitle: 'Lightning-fast speech recognition with speaker diarization',
    icon: FileText,
    iconBg: 'bg-gradient-to-br from-[#0891b2] to-[#0e7490]',
    iconColor: 'text-white',
    description: 'Watch conversations turn into searchable text in real time with automatic speaker segmentation and millisecond timestamps.',
    features: [
      {
        icon: Users,
        title: 'Speaker Diarization',
        text: 'Distinguish between different meeting participants with automatic speaker attribution tags.'
      },
      {
        icon: Zap,
        title: 'Live Scrolling Captions',
        text: 'Interactive live transcript flow with inline search, playback jumping, and dialogue editing.'
      }
    ],
    highlightTip: '⚡ Live transcripts are automatically saved in local archives even before you click Stop Recording.'
  },
  {
    stepNumber: 5,
    badge: 'Step 5 of 7 • Meeting Intelligence',
    title: 'Executive Minutes of Meeting (MOM)',
    subtitle: 'Structured summaries, key decisions, and template styles',
    icon: FileCheck,
    iconBg: 'bg-gradient-to-br from-[#7c3aed] to-[#5b21b6]',
    iconColor: 'text-white',
    description: 'Transform lengthy transcripts into clean, actionable Minutes of Meeting formatted for executive review and cross-team sharing.',
    features: [
      {
        icon: FileCheck,
        title: 'Structured Sections',
        text: 'Automated generation of Executive Summaries, Key Decisions, Discussion Highlights, and Next Steps.'
      },
      {
        icon: Sliders,
        title: 'Custom MOM Templates',
        text: 'Choose from Standard Notes, Daily Standups, Client Discovery, Technical Design, or Executive Board styles.'
      }
    ],
    highlightTip: '📋 You can edit any summary section inline or re-synthesize specific sections with new prompts anytime.'
  },
  {
    stepNumber: 6,
    badge: 'Step 6 of 7 • Action Items Matrix',
    title: 'Deliverables & Ownership Tracking',
    subtitle: 'Assignees, due dates, context notes, and completion toggles',
    icon: CheckSquare,
    iconBg: 'bg-gradient-to-br from-[#16a34a] to-[#15803d]',
    iconColor: 'text-white',
    description: 'Never let critical tasks slip through the cracks. Minomeet extracts all commitments and deliverables into an interactive action items matrix.',
    features: [
      {
        icon: Users,
        title: 'Owner & Due Date Tagging',
        text: 'Intelligently identifies task owners, explicit deadlines, and tracking notes directly from dialogue.'
      },
      {
        icon: CheckCircle2,
        title: 'Interactive Checklists',
        text: 'Mark items as complete, re-assign team members, add new tasks, or filter pending action items.'
      }
    ],
    highlightTip: '✅ Action items sync seamlessly into follow-up email drafts and exported PDF reports.'
  },
  {
    stepNumber: 7,
    badge: 'Step 7 of 7 • Q&A, Export & Sharing',
    title: 'Ask Your Meetings & Instant Emails',
    subtitle: 'Cross-meeting semantic search and 1-click follow-up emails',
    icon: MessageSquare,
    iconBg: 'bg-gradient-to-br from-[#ea580c] to-[#c2410c]',
    iconColor: 'text-white',
    description: 'Ask natural-language questions across your entire historical meeting archives and generate polished follow-up emails in seconds.',
    features: [
      {
        icon: MessageSquare,
        title: 'Semantic Meeting Q&A',
        text: 'Ask "What did we decide about the Q3 budget?" and get instant answers with direct timestamp citations.'
      },
      {
        icon: Send,
        title: '1-Click Email Recaps & Export',
        text: 'Generate tailored email drafts (Professional, Concise, Action-Oriented) and export to Markdown, Text, or PDF.'
      }
    ],
    highlightTip: '🚀 You are all set! Click below to open Settings and configure your AI Model API key to get started.'
  }
];

export const OnboardingTourModal: React.FC = () => {
  const { setCurrentScreen, setSettingsTab } = useMeeting();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Check if first-time user
  useEffect(() => {
    const completed = localStorage.getItem('minomeet_onboarding_completed');
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  // Listen for custom trigger to replay tour
  useEffect(() => {
    const handleReplay = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };
    window.addEventListener('minomeet_replay_tour', handleReplay);
    return () => window.removeEventListener('minomeet_replay_tour', handleReplay);
  }, []);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleCompleteAndSetupAI = () => {
    localStorage.setItem('minomeet_onboarding_completed', 'true');
    setIsOpen(false);
    // Navigate user directly to AI Model Settings
    setCurrentScreen('settings');
    setSettingsTab('model');
  };

  const handleSkip = () => {
    localStorage.setItem('minomeet_onboarding_completed', 'true');
    setIsOpen(false);
    // Also navigate to Settings on skip so they can setup AI
    setCurrentScreen('settings');
    setSettingsTab('model');
  };

  const handleNext = () => {
    if (isLastStep) {
      handleCompleteAndSetupAI();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
              {currentStep.badge}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-[#64748b] hover:text-[#0f172a] px-2.5 py-1 rounded-lg hover:bg-[#f1f5f9] transition cursor-pointer flex items-center gap-1"
            title="Skip introduction and proceed to AI setup"
          >
            <span>Skip Tour</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* Step Icon & Headings */}
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl ${currentStep.iconBg} ${currentStep.iconColor} shadow-md flex-none`}>
              <StepIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
                {currentStep.title}
              </h2>
              <p className="text-xs font-medium text-[#64748b]">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#334155] leading-relaxed bg-[#f8fafc] p-3.5 rounded-2xl border border-[#e2e8f0]">
            {currentStep.description}
          </p>

          {/* 2 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentStep.features.map((feat, idx) => {
              const FeatIcon = feat.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl border border-[#e2e8f0] bg-white shadow-2xs space-y-1.5 hover:border-[#bfdbfe] transition">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#eff6ff] text-[#2563eb]">
                      <FeatIcon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[#0f172a]">{feat.title}</h4>
                  </div>
                  <p className="text-[11px] text-[#64748b] leading-relaxed">
                    {feat.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pro Tip Callout */}
          {currentStep.highlightTip && (
            <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] font-medium text-[#166534] leading-relaxed">
              {currentStep.highlightTip}
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between gap-4 flex-none">
          
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                aria-label={`Go to step ${step.stepNumber}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#2563eb]'
                    : idx < currentStepIndex
                    ? 'w-2 bg-[#93c5fd]'
                    : 'w-2 bg-[#cbd5e1]'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-xs font-bold text-[#334155] inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={handleCompleteAndSetupAI}
                className="px-5 py-2 bg-gradient-to-r from-[#2563eb] to-[#4f46e5] hover:from-[#1d4ed8] hover:to-[#4338ca] text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2 animate-pulse"
              >
                <span>Set Up AI Model &amp; API Key</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Next Step ({currentStepIndex + 1}/7)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
