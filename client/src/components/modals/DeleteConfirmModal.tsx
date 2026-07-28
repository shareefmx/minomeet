import React from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal: React.FC = () => {
  const { modals, meetingToDelete, closeDeleteModal, confirmDeleteMeeting } = useMeeting();

  if (!modals.delete || !meetingToDelete) return null;

  return (
    <div className="fixed inset-0 bg-[#0f1117]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 flex-none shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={closeDeleteModal}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-2">
          <h3 className="text-base font-black text-[#111827]">
            Delete Meeting Permanently?
          </h3>
          <p className="text-xs text-[#4b5563] leading-relaxed">
            Are you sure you want to permanently delete <b className="text-[#111827]">"{meetingToDelete.title}"</b>?
          </p>
          <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-[11.5px] text-red-800 leading-relaxed">
            This will remove all associated speech transcripts, MOM executive summaries, and action item records. This action cannot be undone.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <button
            onClick={closeDeleteModal}
            className="px-4 py-2 text-xs font-bold text-[#374151] bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteMeeting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};

