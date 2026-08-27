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
  Zap,
  ArrowRight
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
    badge: 'Step 1 of 3 • Capture & Transcribe',
    title: 'Record & Transcribe Any Meeting',
    subtitle: 'Dual-channel audio capture with real-time speech-to-text & speaker diarization',
    icon: Mic,
    iconBg: 'bg-gradient-to-br from-[#dc2626] to-[#991b1b]',
    iconColor: 'text-white',
    description: 'Capture high-fidelity audio from your microphone, system sounds (Google Meet, Zoom, Slack Huddles, browser tabs), or import pre-recorded audio files (.mp3, .wav, .m4a, .webm) with real-time scrolling transcripts.',
    features: [
      {
        icon: Mic,
        title: 'Multi-Source Audio Capture',
        text: 'Capture microphone, system/tab audio, or mixed dual-channel streams with live waveforms.'
      },
      {
        icon: FileText,
        title: 'Real-Time Speech-to-Text',
        text: 'Live transcription with speaker diarization, millisecond timestamps, and instant search.'
      }
    ],
    highlightTip: '🎙️ Select "Mixed (Mic + System)" on video calls so both your voice and remote participants are recorded.'
  },
  {
    stepNumber: 2,
    badge: 'Step 2 of 3 • Meeting Intelligence',
    title: 'Executive MOM & Action Items Matrix',
    subtitle: 'Automated executive summaries, key decisions, and deliverable tracking',
    icon: FileCheck,
    iconBg: 'bg-gradient-to-br from-[#7c3aed] to-[#5b21b6]',
    iconColor: 'text-white',
    description: 'Transform lengthy transcripts into structured, actionable Minutes of Meeting (MOM). Automatically extracts key decisions, discussion highlights, and task deliverables with assignees and due dates.',
    features: [
      {
        icon: FileCheck,
        title: 'Structured Executive MOM',
        text: 'Generate executive summaries, decisions, next steps, and customizable meeting note templates.'
      },
      {
        icon: CheckSquare,
        title: 'Action Items Matrix',
        text: 'Interactive task checklists with assignees, due dates, tracking notes, and completion toggles.'
      }
    ],
    highlightTip: '📋 All meeting notes and action items stay 100% private and stored locally on your machine.'
  },
  {
    stepNumber: 3,
    badge: 'Step 3 of 3 • AI Model API Setup',
    title: 'Connect Your AI API Key & Launch',
    subtitle: 'Direct, zero-telemetry connection to Google Gemini, OpenAI, Claude, Groq, or Ollama',
    icon: Key,
    iconBg: 'bg-gradient-to-br from-[#2563eb] to-[#1d4ed8]',
    iconColor: 'text-white',
    description: 'Minomeet connects directly to your own AI API keys with zero third-party telemetry. Configure your credentials once in Settings to power automated synthesis, semantic Q&A, and follow-up emails.',
    features: [
      {
        icon: Zap,
        title: 'Frontier AI Providers',
        text: 'Supports Google Gemini (2.5 Flash/Pro), OpenAI (GPT-4o), Anthropic (Claude 3.7), Groq, and Ollama.'
      },
      {
        icon: MessageSquare,
        title: 'Meeting Q&A & Email Recaps',
        text: 'Ask questions across past meetings with exact citations and draft 1-click tailored follow-up emails.'
      }
    ],
    highlightTip: '🚀 Click below to open Settings, enter your AI API key, and start synthesizing meetings!'
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
            <span className="font-extrabold text-xs text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Website Onboarding Tour</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
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
                <span>Next Step ({currentStepIndex + 1}/3)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
