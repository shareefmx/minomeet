import React from 'react';
import { useMeeting } from '../../context/MeetingContext.js';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export const ToastHost: React.FC = () => {
  const { toasts, removeToast } = useMeeting();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-6 bottom-6 flex flex-col gap-2.5 z-[100] max-w-[360px] pointer-events-none">
      {toasts.map((t) => {
        let style = 'bg-[#dcfce7] border-[#86efac] text-[#15803d]';
        let Icon = CheckCircle2;

        if (t.type === 'info') {
          style = 'bg-[#eff4ff] border-[#c9dcff] text-[#1e3a8a]';
          Icon = Info;
        } else if (t.type === 'warning') {
          style = 'bg-[#fef3c7] border-[#fde68a] text-[#92400e]';
          Icon = AlertTriangle;
        } else if (t.type === 'error') {
          style = 'bg-[#fdeceb] border-[#fca5a5] text-[#b91c1c]';
          Icon = XCircle;
        }

        return (
          <div
            key={t.id}
            className={`toast-enter flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg text-[13px] pointer-events-auto transition-all ${style}`}
          >
            <Icon className="w-4 h-4 flex-none mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-bold">{t.title}</div>
              {t.subtitle && <div className="text-[12px] opacity-85 mt-0.5">{t.subtitle}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="opacity-60 hover:opacity-100 p-0.5 text-current transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

