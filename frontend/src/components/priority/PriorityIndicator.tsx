import React from 'react';
import { Priority } from '@/types/priority';

interface PriorityIndicatorProps {
  priority: Priority;
  className?: string;
}

const PRIORITY_STYLES: Record<Priority, { bg: string; border: string; text: string; label: string }> = {
  low: {
    bg: 'bg-green-600',
    border: 'border-green-600',
    text: 'text-white',
    label: 'Low',
  },
  medium: {
    bg: 'bg-yellow-400',
    border: 'border-yellow-400',
    text: 'text-black',
    label: 'Med',
  },
  high: {
    bg: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-white',
    label: 'High',
  },
};

export function PriorityIndicator({ priority = 'medium', className = '' }: PriorityIndicatorProps) {
  const safePriority: Priority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
  const config = PRIORITY_STYLES[safePriority];

  return (
    <div
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.bg} ${config.text} border ${config.border}
        transition-colors duration-150
        ${className}
      `}
      title={`Priority: ${config.label}`}
    >
      {config.label}
    </div>
  );
}
