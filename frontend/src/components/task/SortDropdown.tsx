import React from 'react';

export type TaskSort = 'order' | 'priority' | 'alphabetical' | 'created';

interface SortDropdownProps {
  value: TaskSort;
  onChange: (value: TaskSort) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  return (
    <div className='relative'>
      <span className='absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none'>
        <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 20 20' stroke='currentColor' strokeWidth={2}>
          <rect x='3' y='5' width='14' height='2' rx='1' />
          <rect x='5' y='9' width='10' height='2' rx='1' />
          <rect x='7' y='13' width='6' height='2' rx='1' />
        </svg>
      </span>
      <select className='border rounded pl-8 pr-2 h-9 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-800 text-black dark:text-white border-slate-300 dark:border-slate-600' value={value} onChange={(e) => onChange(e.target.value as TaskSort)}>
        <option value='order'></option>
        <option value='priority'>Priority</option>
        <option value='alphabetical'>Alphabetical</option>
        <option value='created'>Created Time</option>
      </select>
    </div>
  );
};
