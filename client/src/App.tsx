import React, { useState, useEffect } from 'react';
import { useMeeting } from './context/MeetingContext.js';
import { Titlebar } from './components/layout/Titlebar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { ToastHost } from './components/layout/ToastHost.js';
import { HomeScreen } from './components/screens/HomeScreen.js';
import { RecordingScreen } from './components/screens/RecordingScreen.js';
import { NotesScreen } from './components/screens/NotesScreen.js';
import { SettingsScreen } from './components/screens/SettingsScreen.js';
import { ImportAudioModal } from './components/modals/ImportAudioModal.js';
import { ModelSettingsModal } from './components/modals/ModelSettingsModal.js';
import { AskMeetingsModal } from './components/modals/AskMeetingsModal.js';
import { FollowUpEmailModal } from './components/modals/FollowUpEmailModal.js';
import { AboutModal } from './components/modals/AboutModal.js';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal.js';
import { RenameMeetingModal } from './components/modals/RenameMeetingModal.js';
import { Sparkles, X } from 'lucide-react';

export const App: React.FC = () => {
  const { currentScreen } = useMeeting();
  const [showBanner, setShowBanner] = useState<boolean>(true);

  // 6-second auto-dismissing banner on window open
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white font-sans select-none text-[#111827]">
      {/* 6-Second Auto-Dismissing Header Banner with Animated Timeline */}
      {showBanner && (
        <div className="relative bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#312e81] text-white px-6 py-2.5 text-xs flex items-center justify-between shadow-md transition-all duration-500 z-30 flex-none animate-in fade-in slide-in-from-top-2 overflow-hidden">
          <div className="flex items-center gap-2.5 font-medium truncate">
            <span className="p-1 rounded-lg bg-white/15 flex-none shadow-xs">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </span>
            <span className="font-bold text-[13px] tracking-tight">Minomeet AI Meeting Assistant Active</span>
            <span className="hidden md:inline-block opacity-90 text-xs">
              &bull; Privacy-first on-device engine &bull; Audio, transcripts &amp; MOM stay 100% on your machine
            </span>
          </div>

          <div className="flex items-center gap-2 flex-none pl-3">
            <button
              onClick={() => setShowBanner(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Animated 6-Second Timeline Progress Bar matching banner palette */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#818cf8] via-[#a5b4fc] to-[#60a5fa] animate-banner-timeline" />
        </div>
      )}

      {/* Main Top Navigation Header (Height: 64px) */}
      <Titlebar />

      {/* Full-Screen Web Application Body */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-white">
        {/* Left Web Sidebar */}
        <Sidebar />

        {/* Central Screen Viewport */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
          {currentScreen === 'home' && <HomeScreen />}
          {currentScreen === 'recording' && <RecordingScreen />}
          {currentScreen === 'notes' && <NotesScreen />}
          {currentScreen === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* Modals & Overlays */}
      <ImportAudioModal />
      <ModelSettingsModal />
      <AskMeetingsModal />
      <FollowUpEmailModal />
      <AboutModal />
      <DeleteConfirmModal />
      <RenameMeetingModal />

      {/* Toast Notification Container */}
      <ToastHost />
    </div>
  );
};

export default App;
