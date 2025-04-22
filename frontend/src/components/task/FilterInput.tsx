import React from 'react';

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FilterInput: React.FC<FilterInputProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className='relative'>
      <span className='absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none'>
        <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z' />
        </svg>
      </span>
      <input type='text' className='border rounded pl-8 pr-2 h-9 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-800 text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-slate-300 dark:border-slate-600' value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'Filter tasks...'} />
    </div>
  );
};
