import React from 'react';
import { Priority, PRIORITY_CONFIGS } from '@/types/priority';
import { PriorityIndicator } from './PriorityIndicator';

const PRIORITY_CIRCLE_STYLES: Record<Priority, { bg: string; border: string }> = {
  low: { bg: 'bg-green-600', border: 'border-green-600' },
  medium: { bg: 'bg-yellow-400', border: 'border-yellow-400' },
  high: { bg: 'bg-red-600', border: 'border-red-600' },
};

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  className?: string;
  showPillPreview?: boolean;
}

export function PrioritySelector({ value = 'medium', onChange, className = '', showPillPreview = true }: PrioritySelectorProps) {
  // Ensure value exists in PRIORITY_CONFIGS, fallback to 'medium' if not
  const safeValue = Object.keys(PRIORITY_CONFIGS).includes(value) ? value : 'medium';
  const config = PRIORITY_CONFIGS[safeValue];
  const circle = PRIORITY_CIRCLE_STYLES[safeValue as Priority];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className='relative w-full'>
        <select
          value={safeValue}
          onChange={(e) => onChange(e.target.value as Priority)}
          className={`
            appearance-none w-full pl-8 pr-4 py-1.5
            bg-white/90 dark:bg-slate-800/90
            border border-slate-200/50 dark:border-slate-700/50
            rounded-lg
            text-sm font-medium
            text-black dark:text-white
            focus:outline-none focus:ring-2 
            focus:ring-${safeValue}-500/50 dark:focus:ring-${safeValue}-400/50
            transition-all duration-200
          `}
        >
          {Object.entries(PRIORITY_CONFIGS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
        <div className='absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none'>
          <div
            className={`
              w-3 h-3 rounded-full
              ${circle.bg} ${circle.border} border
            `}
          />
        </div>
      </div>
      {showPillPreview && <PriorityIndicator priority={safeValue as Priority} />}
    </div>
  );
}
