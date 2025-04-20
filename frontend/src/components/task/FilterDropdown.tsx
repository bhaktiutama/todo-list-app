import React from 'react';

export type TaskFilter = 'all' | 'completed' | 'incomplete';

interface FilterDropdownProps {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange }) => {
  return (
    <select className='border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400' value={value} onChange={(e) => onChange(e.target.value as TaskFilter)}>
      <option value='all'>All</option>
      <option value='completed'>Completed</option>
      <option value='incomplete'>Incomplete</option>
    </select>
  );
};
