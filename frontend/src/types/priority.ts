export type Priority = 'low' | 'medium' | 'high';

export interface PriorityConfig {
  label: string;
  color: {
    bg: string;
    border: string;
    text: string;
    darkBg: string;
    darkBorder: string;
    darkText: string;
  };
}

export const PRIORITY_CONFIGS: Record<Priority, PriorityConfig> = {
  low: {
    label: 'Low',
    color: {
      bg: 'from-green-50/80 to-green-100/80',
      border: 'border-green-200',
      text: 'text-green-600',
      darkBg: 'dark:from-green-900/20 dark:to-green-800/20',
      darkBorder: 'dark:border-green-800',
      darkText: 'dark:text-green-400',
    },
  },
  medium: {
    label: 'Med',
    color: {
      bg: 'from-yellow-50/80 to-yellow-100/80',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      darkBg: 'dark:from-yellow-900/20 dark:to-yellow-800/20',
      darkBorder: 'dark:border-yellow-800',
      darkText: 'dark:text-yellow-400',
    },
  },
  high: {
    label: 'High',
    color: {
      bg: 'from-red-50/80 to-red-100/80',
      border: 'border-red-200',
      text: 'text-red-600',
      darkBg: 'dark:from-red-900/20 dark:to-red-800/20',
      darkBorder: 'dark:border-red-800',
      darkText: 'dark:text-red-400',
    },
  },
};
