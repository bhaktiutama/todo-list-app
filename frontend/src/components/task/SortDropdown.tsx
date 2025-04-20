import React from 'react';

export type TaskSort = 'order' | 'priority' | 'alphabetical' | 'created';

interface SortDropdownProps {
  value: TaskSort;
  onChange: (value: TaskSort) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  return (
    <select className='border rounded px-2 h-9 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-800 text-black dark:text-white border-slate-300 dark:border-slate-600' value={value} onChange={(e) => onChange(e.target.value as TaskSort)}>
      <option value='order'></option>
      <option value='priority'>Priority</option>
      <option value='alphabetical'>Alphabetical</option>
      <option value='created'>Created Time</option>
    </select>
  );
};
