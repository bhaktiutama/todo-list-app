'use client';

import React from 'react';

export default function DuplicateListButton({ onClick, className = '' }: { onClick?: () => void; className?: string }) {
  const handleClick = onClick || (() => alert('Duplicate clicked'));
  return (
    <button id='duplicate-list-btn' aria-label='Duplicate List' title='Duplicate List' className={`p-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-200 hover:bg-slate-300 dark:hover:bg-slate-600 shadow ${className}`} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleClick} type='button'>
      {/* Ikon duplicate: dua kotak tumpuk */}
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-6 h-6 text-slate-700 dark:text-slate-200'>
        <rect x='9' y='9' width='10' height='10' rx='2' />
        <rect x='5' y='5' width='10' height='10' rx='2' />
      </svg>
    </button>
  );
}
