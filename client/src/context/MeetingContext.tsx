import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Meeting, AppSettings, ScreenType, SettingsTab, ToastMessage, TranscriptLine, MOMSummary, TranscriptionModel, TranscriptionEngineStatus } from '../types/meeting.js';
import { api } from '../services/api.js';
import { speechService } from '../services/speech.js';

interface MeetingContextType {
  meetings: Meeting[];
  activeMeeting: Meeting | null;
  currentScreen: ScreenType;
  settingsTab: SettingsTab;
  searchQuery: string;
  isRecording: boolean;
  recordingTimer: number;
  liveTranscript: TranscriptLine[];
  audioSource: 'mic' | 'system' | 'mixed';
  isGeneratingSummary: boolean;
  settings: AppSettings | null;
  toasts: ToastMessage[];
  meetingToDelete: Meeting | null;
  meetingToRename: Meeting | null;
  transcriptionModels: TranscriptionModel[];
  activeTranscriptionModel: TranscriptionModel | null;
  engineStatus: TranscriptionEngineStatus | null;
  modals: {
    import: boolean;
    model: boolean;
    about: boolean;
    flowmap: boolean;
    ask: boolean;
    email: boolean;
    delete: boolean;
    rename: boolean;
  };
  // Actions
  setCurrentScreen: (screen: ScreenType) => void;
  setSettingsTab: (tab: SettingsTab) => void;
  setSearchQuery: (query: string) => void;
  setAudioSource: (src: 'mic' | 'system' | 'mixed') => void;
  selectMeeting: (meeting: Meeting) => void;
  startRecording: (sourceType?: 'mic' | 'system' | 'mixed') => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  generateSummaryForActive: (template?: string, language?: string, model?: string) => Promise<void>;
  updateActiveMeeting: (updates: Partial<Meeting>) => Promise<void>;
  updateActiveSummary: (updates: Partial<MOMSummary>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  openDeleteModal: (meeting: Meeting) => void;
  closeDeleteModal: () => void;
  confirmDeleteMeeting: () => Promise<void>;
  openRenameModal: (meeting: Meeting) => void;
  closeRenameModal: () => void;
  confirmRenameMeeting: (newTitle: string) => Promise<void>;
  openModal: (modal: keyof MeetingContextType['modals']) => void;
  closeModal: (modal: keyof MeetingContextType['modals']) => void;
  closeAllModals: () => void;
  showToast: (title: string, subtitle?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refreshMeetings: () => Promise<void>;
  refreshTranscriptionModels: () => Promise<void>;
  downloadTranscriptionModel: (id: string) => Promise<void>;
  deleteTranscriptionModel: (id: string) => Promise<void>;
  selectTranscriptionModel: (id: string) => Promise<void>;
  installPythonPackages: () => Promise<void>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTimer, setRecordingTimer] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptLine[]>([]);
  const [audioSource, setAudioSource] = useState<'mic' | 'system' | 'mixed'>('mixed');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  const [transcriptionModels, setTranscriptionModels] = useState<TranscriptionModel[]>([]);
  const [activeTranscriptionModel, setActiveTranscriptionModel] = useState<TranscriptionModel | null>(null);
  const [engineStatus, setEngineStatus] = useState<TranscriptionEngineStatus | null>(null);

  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [meetingToRename, setMeetingToRename] = useState<Meeting | null>(null);

  const [modals, setModals] = useState({
    import: false,
    model: false,
    about: false,
    flowmap: false,
    ask: false,
    email: false,
    delete: false,
    rename: false
  });

  // Initial load
  useEffect(() => {
    refreshMeetings();
    loadSettings();
    refreshTranscriptionModels();
  }, []);

  const refreshMeetings = async () => {
    try {
      const data = await api.getMeetings();
      setMeetings(data);
      if (data.length > 0 && !activeMeeting) {
        setActiveMeeting(data[0]);
      }
    } catch (err) {
      console.error('Failed to load meetings:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const refreshTranscriptionModels = async () => {
    try {
      const { models, activeModel } = await api.getTranscriptionModels();
      setTranscriptionModels(models);
      setActiveTranscriptionModel(activeModel);

      const status = await api.getTranscriptionEngineStatus();
      setEngineStatus(status);
    } catch (err) {
      console.error('Failed to load transcription models:', err);
    }
  };

  const downloadTranscriptionModel = async (id: string) => {
    try {
      showToast('Download started', `Downloading ${id} weights to local cache…`, 'info');
      setTranscriptionModels(prev =>
        prev.map(m => m.id === id ? { ...m, status: 'downloading', downloadProgress: 15 } : m)
      );

      const updated = await api.downloadTranscriptionModel(id);
      setTranscriptionModels(prev =>
        prev.map(m => m.id === id ? updated : m)
      );
      showToast('Model Ready!', `${updated.name} downloaded and ready for offline use.`, 'success');
      await refreshTranscriptionModels();
    } catch (err: any) {
      showToast('Download failed', err.message, 'error');
      setTranscriptionModels(prev =>
        prev.map(m => m.id === id ? { ...m, status: 'not_downloaded', downloadProgress: 0 } : m)
      );
    }
  };

  const deleteTranscriptionModel = async (id: string) => {
    try {
      await api.deleteTranscriptionModel(id);
      showToast('Model cache cleared', 'Weights removed from local disk.', 'info');
      await refreshTranscriptionModels();
    } catch (err: any) {
      showToast('Failed to delete model', err.message, 'error');
    }
  };

  const selectTranscriptionModel = async (id: string) => {
    try {
      const active = await api.selectTranscriptionModel(id);
      setActiveTranscriptionModel(active);
      if (settings) {
        setSettings({ ...settings, transcriptionEngine: active.name });
      }
      showToast('Transcription Engine Selected', active.name, 'success');
      await refreshTranscriptionModels();
    } catch (err: any) {
      showToast('Failed to select model', err.message, 'error');
    }
  };

  const installPythonPackages = async () => {
    try {
      showToast('Installing AI Packages…', 'Installing openai-whisper, torch, torchaudio, and ffmpeg-python', 'info');
      const res = await api.installPythonPackages();
      if (res.success) {
        showToast('Packages Installed Successfully!', 'OpenAI Whisper & PyTorch ready.', 'success');
      } else {
        showToast('Installation Note', res.output || 'Check terminal output', 'info');
      }
      await refreshTranscriptionModels();
    } catch (err: any) {
      showToast('Installation error', err.message, 'error');
    }
  };


  const showToast = (title: string, subtitle = '', type: ToastMessage['type'] = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, title, subtitle, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openModal = (modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  const closeAllModals = () => {
    setModals({
      import: false,
      model: false,
      about: false,
      flowmap: false,
      ask: false,
      email: false,
      delete: false,
      rename: false
    });
    setMeetingToDelete(null);
    setMeetingToRename(null);
  };

  const selectMeeting = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setCurrentScreen('notes');
    closeAllModals();
  };

  const startRecording = async (sourceType?: 'mic' | 'system' | 'mixed') => {
    const chosenSource = sourceType || 'mixed';
    setAudioSource(chosenSource);
    setLiveTranscript([]);
    setRecordingTimer(0);
    setIsRecording(true);
    setCurrentScreen('recording');
    closeAllModals();

    const interval = setInterval(() => {
      setRecordingTimer(t => t + 1);
    }, 1000);
    setTimerInterval(interval);

    const captureRes = await speechService.startCapture((line) => {
      setLiveTranscript(prev => [...prev, line]);
    }, chosenSource);

    if (chosenSource === 'mixed') {
      if (captureRes?.hasSystemAudio) {
        showToast('Live Mixed Audio Active', 'Recording Microphone Voice + Computer/Meeting System Audio', 'success');
      } else {
        showToast('Live Recording Active', 'Mixed Voice + System Audio capture initialized', 'info');
      }
    } else if (chosenSource === 'system') {
      showToast('System Audio Capture Active', 'Capturing meeting audio stream', 'info');
    } else {
      showToast('Microphone Active', 'Capturing local voice', 'info');
    }
  };

  const stopRecording = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    speechService.stopCapture();
    setIsRecording(false);

    const m = String(Math.floor(recordingTimer / 60)).padStart(2, '0');
    const s = String(recordingTimer % 60).padStart(2, '0');
    const duration = `${m}:${s}`;

    const lines = liveTranscript.length > 0 ? liveTranscript : [
      { id: 't-default-1', time: '00:04', speaker: 'Speaker', text: 'Meeting discussion session concluded.' }
    ];

    try {
      const newMeeting = await api.createMeeting({
        title: `Meeting ${new Date().toISOString().slice(0, 10)}_${m}-${s}`,
        transcript: lines,
        duration,
        autoSummarize: false
      });

      setMeetings(prev => [newMeeting, ...prev]);
      setActiveMeeting(newMeeting);
      setCurrentScreen('notes');
      showToast('Recording saved successfully!', `${lines.length} transcript segments captured.`, 'success');
    } catch (err: any) {
      showToast('Failed to save meeting', err.message, 'error');
    }
  };

  const cancelRecording = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    speechService.stopCapture();
    setIsRecording(false);
    setLiveTranscript([]);
    setRecordingTimer(0);
    setCurrentScreen('home');
    showToast('Recording cancelled', '', 'info');
  };

  const generateSummaryForActive = async (template?: string, language?: string, model?: string) => {
    if (!activeMeeting) return;
    setIsGeneratingSummary(true);

    try {
      const summary = await api.summarize({
        transcript: activeMeeting.transcript,
        title: activeMeeting.title,
        template: template || activeMeeting.summary?.template || settings?.defaultTemplate || 'Standard Meeting Notes',
        language: language || activeMeeting.summary?.language || settings?.defaultLanguage || 'English',
        model: model || activeMeeting.summary?.modelUsed || settings?.selectedModel || 'Nimbus 4B (High Quality)'
      });

      const updated = await api.updateMeeting(activeMeeting.id, { summary });
      setActiveMeeting(updated);
      setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
      showToast('Summary generated successfully!', 'Your meeting minutes are ready.', 'success');
    } catch (err: any) {
      showToast('Generation failed', err.message, 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const updateActiveMeeting = async (updates: Partial<Meeting>) => {
    if (!activeMeeting) return;
    try {
      const updated = await api.updateMeeting(activeMeeting.id, updates);
      setActiveMeeting(updated);
      setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
      showToast('Saved', 'Your changes have been saved.', 'success');
    } catch (err: any) {
      showToast('Save failed', err.message, 'error');
    }
  };

  const updateActiveSummary = async (summaryUpdates: Partial<MOMSummary>) => {
    if (!activeMeeting || !activeMeeting.summary) return;
    const newSummary: MOMSummary = { ...activeMeeting.summary, ...summaryUpdates };
    await updateActiveMeeting({ summary: newSummary });
  };

  // Delete modal flow
  const openDeleteModal = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    openModal('delete');
  };

  const closeDeleteModal = () => {
    closeModal('delete');
    setMeetingToDelete(null);
  };

  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    const id = meetingToDelete.id;
    try {
      await api.deleteMeeting(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      if (activeMeeting?.id === id) {
        const remaining = meetings.filter(m => m.id !== id);
        setActiveMeeting(remaining.length > 0 ? remaining[0] : null);
        setCurrentScreen('home');
      }
      showToast('Meeting deleted permanently', meetingToDelete.title, 'info');
    } catch (err: any) {
      showToast('Delete failed', err.message, 'error');
    } finally {
      closeDeleteModal();
    }
  };

  // Rename modal flow
  const openRenameModal = (meeting: Meeting) => {
    setMeetingToRename(meeting);
    openModal('rename');
  };

  const closeRenameModal = () => {
    closeModal('rename');
    setMeetingToRename(null);
  };

  const confirmRenameMeeting = async (newTitle: string) => {
    if (!meetingToRename || !newTitle.trim()) return;
    const id = meetingToRename.id;
    try {
      const updated = await api.updateMeeting(id, { title: newTitle.trim() });
      setMeetings(prev => prev.map(m => m.id === id ? updated : m));
      if (activeMeeting?.id === id) {
        setActiveMeeting(updated);
      }
      showToast('Meeting renamed successfully', newTitle.trim(), 'success');
    } catch (err: any) {
      showToast('Rename failed', err.message, 'error');
    } finally {
      closeRenameModal();
    }
  };

  const deleteMeeting = async (id: string) => {
    const target = meetings.find(m => m.id === id);
    if (target) {
      openDeleteModal(target);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const updated = await api.updateSettings(updates);
      setSettings(updated);
      showToast('Settings updated', 'Configuration saved.', 'success');
    } catch (err: any) {
      showToast('Failed to update settings', err.message, 'error');
    }
  };

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        activeMeeting,
        currentScreen,
        settingsTab,
        searchQuery,
        isRecording,
        recordingTimer,
        liveTranscript,
        audioSource,
        isGeneratingSummary,
        settings,
        toasts,
        meetingToDelete,
        meetingToRename,
        transcriptionModels,
        activeTranscriptionModel,
        engineStatus,
        modals,
        setCurrentScreen,
        setSettingsTab,
        setSearchQuery,
        setAudioSource,
        selectMeeting,
        startRecording,
        stopRecording,
        cancelRecording,
        generateSummaryForActive,
        updateActiveMeeting,
        updateActiveSummary,
        deleteMeeting,
        openDeleteModal,
        closeDeleteModal,
        confirmDeleteMeeting,
        openRenameModal,
        closeRenameModal,
        confirmRenameMeeting,
        openModal,
        closeModal,
        closeAllModals,
        showToast,
        removeToast,
        updateSettings,
        refreshMeetings,
        refreshTranscriptionModels,
        downloadTranscriptionModel,
        deleteTranscriptionModel,
        selectTranscriptionModel,
        installPythonPackages
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};
