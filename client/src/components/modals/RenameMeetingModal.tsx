import React, { useState, useEffect, useRef } from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { Edit3, X, Check } from 'lucide-react';

export const RenameMeetingModal: React.FC = () => {
  const { modals, meetingToRename, closeRenameModal, confirmRenameMeeting } = useMeeting();
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (meetingToRename) {
      setTitle(meetingToRename.title);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [meetingToRename]);

  if (!modals.rename || !meetingToRename) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      confirmRenameMeeting(title.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1117]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 font-black text-base text-[#111827]">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <span>Rename Meeting</span>
          </div>
          <button
            onClick={closeRenameModal}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#6b7280] mb-1.5">
              Meeting Title
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meeting title…"
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#111827] border border-[#d6dbe2] rounded-xl focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closeRenameModal}
              className="px-4 py-2 text-xs font-bold text-[#374151] bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || title.trim() === meetingToRename.title}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Title</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

