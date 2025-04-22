'use client';

import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

export default function NewListButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push('/');
    }
    // Jika sudah di halaman utama, event listener di page.tsx akan handle reset
  };

  return (
    <button id='new-list-btn' aria-label='New List' title='New List' className={`p-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-200 hover:bg-slate-300 dark:hover:bg-slate-600 shadow ${className}`} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleClick} type='button'>
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-6 h-6 text-slate-700 dark:text-slate-200'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
      </svg>
    </button>
  );
}
