import React, { useState } from 'react';
import { Star, Copy, Check, FolderOpen } from 'lucide-react';

// ============================================================================
// 1. SettingsCard: Outer card + Header row
// ============================================================================
export interface SettingsCardProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  badge,
  actions,
  icon: Icon,
  children,
  className = '',
  id
}) => (
  <div
    id={id}
    className={`border border-[#e5e7eb] rounded-2xl p-5 bg-white shadow-xs space-y-3.5 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#f3f4f6] dark:border-neutral-800">
      <div>
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          {Icon && <Icon className="w-4 h-4 text-[#2563eb]" />}
          <h4 className="text-sm font-bold text-[#111827] dark:text-neutral-100">{title}</h4>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-[#6b7280] dark:text-neutral-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-none">{actions}</div>}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

// ============================================================================
// 2. Toggle: Custom switch w-10 h-5.5 with role="switch"
// ============================================================================
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  ariaLabel,
  disabled = false
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel || label || 'Toggle switch'}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 disabled:opacity-50 disabled:cursor-not-allowed ${
      checked ? 'bg-[#2563eb]' : 'bg-[#d1d5db]'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-150 ease-in-out mt-[3px] ml-[3px] ${
        checked ? 'translate-x-4.5' : 'translate-x-0'
      }`}
    />
  </button>
);

// ============================================================================
// 3. SegmentedPills: bg-[#f3f4f6] with active white pill & #2563eb text
// ============================================================================
export interface SegmentedPillsProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export const SegmentedPills: React.FC<SegmentedPillsProps> = ({
  options,
  value,
  onChange,
  className = ''
}) => (
  <div className={`inline-flex items-center bg-[#f3f4f6] border border-[#e5e7eb] p-1 rounded-xl gap-1 ${className}`}>
    {options.map((opt) => {
      const active = opt.id === value;
      return (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
            active
              ? 'bg-white text-[#2563eb] shadow-xs'
              : 'text-[#6b7280] hover:text-[#111827]'
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

// ============================================================================
// 4. StatusBadge: tone="success|info|warning|danger|neutral"
// ============================================================================
export interface StatusBadgeProps {
  tone?: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  tone = 'neutral',
  children,
  className = ''
}) => {
  const styles = {
    success: 'bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]',
    info: 'bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]',
    warning: 'bg-[#fef3c7] border-[#fde68a] text-[#92400e]',
    danger: 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]',
    neutral: 'bg-[#f3f4f6] border-[#e5e7eb] text-[#4b5563]'
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

// ============================================================================
// 5. StarRating: 5 stars (filled #2563eb, empty #bfdbfe) + text pill
// ============================================================================
export interface StarRatingProps {
  value: number; // 0.0 to 5.0
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, className = '' }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = star <= Math.floor(value);
          const half = !filled && star === Math.ceil(value) && value % 1 >= 0.25;
          return (
            <div key={star} className="relative w-3.5 h-3.5 flex items-center justify-center">
              {/* Background empty star */}
              <Star className="w-3.5 h-3.5 text-[#bfdbfe] fill-[#bfdbfe]" />
              {/* Filled star overlay */}
              {filled && (
                <Star className="w-3.5 h-3.5 text-[#2563eb] fill-[#2563eb] absolute inset-0" />
              )}
              {/* Half-filled star overlay */}
              {half && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className="w-3.5 h-3.5 text-[#2563eb] fill-[#2563eb]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span className="bg-[#eff6ff] px-2 py-0.5 rounded-full border border-[#bfdbfe] text-[10px] font-bold text-[#1d4ed8]">
        {value.toFixed(1)} / 5.0
      </span>
    </div>
  );
};

// ============================================================================
// 6. PathBox: Monospace text box with Copy and Open Folder buttons
// ============================================================================
export interface PathBoxProps {
  path: string;
  onCopy?: () => void;
  onOpen?: () => void;
  className?: string;
}

export const PathBox: React.FC<PathBoxProps> = ({ path, onCopy, onOpen, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(path);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl font-mono text-[11px] text-[#374151] ${className}`}
    >
      <span className="truncate select-all max-w-full" title={path}>
        {path}
      </span>
      <div className="flex items-center gap-1.5 flex-none font-sans">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#eff6ff] hover:text-[#2563eb] text-[10px] font-bold transition cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-[#15803d]" /> : <Copy className="w-3 h-3 text-[#6b7280]" />}
          <span>{copied ? 'Copied' : 'Copy Path'}</span>
        </button>
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#eff6ff] hover:text-[#2563eb] text-[10px] font-bold transition cursor-pointer"
          >
            <FolderOpen className="w-3 h-3 text-[#2563eb]" />
            <span>Open Folder</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 7. ProgressBar: h-1.5, track #dbeafe, fill #2563eb (amber when paused, red on error)
// ============================================================================
export interface ProgressBarProps {
  value: number; // 0 to 100
  tone?: 'default' | 'paused' | 'error';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  tone = 'default',
  className = ''
}) => {
  const fillColor = {
    default: 'bg-[#2563eb]',
    paused: 'bg-amber-500',
    error: 'bg-red-500'
  }[tone];

  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full h-1.5 rounded-full bg-[#dbeafe] overflow-hidden ${className}`}>
      <div
        className={`h-full transition-all duration-200 ${fillColor}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

// ============================================================================
// 8. InlineConfirm: Confirmation row with Cancel and Confirm buttons
// ============================================================================
export interface InlineConfirmProps {
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  className?: string;
}

export const InlineConfirm: React.FC<InlineConfirmProps> = ({
  message = 'Delete?',
  onCancel,
  onConfirm,
  className = ''
}) => (
  <div
    className={`inline-flex items-center gap-1.5 p-1 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-xs ${className}`}
  >
    <span className="text-[#dc2626] font-bold px-1.5 text-[11px]">{message}</span>
    <button
      type="button"
      onClick={onCancel}
      className="px-2 py-0.5 rounded-lg bg-white border border-[#d1d5db] text-[#374151] font-bold text-[10px] hover:bg-gray-50 transition cursor-pointer"
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onConfirm}
      className="px-2 py-0.5 rounded-lg bg-[#dc2626] text-white font-bold text-[10px] hover:bg-[#b91c1c] transition cursor-pointer"
    >
      Confirm
    </button>
  </div>
);
