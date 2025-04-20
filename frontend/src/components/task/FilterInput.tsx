import React from 'react';

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FilterInput: React.FC<FilterInputProps> = ({ value, onChange, placeholder }) => {
  return <input type='text' className='border rounded px-2 h-9 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-800 text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-slate-300 dark:border-slate-600' value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'Filter tasks...'} />;
};
