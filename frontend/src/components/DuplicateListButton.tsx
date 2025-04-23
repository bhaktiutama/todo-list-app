'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { todoApi } from '../services/api';

export default function DuplicateListButton({ className = '' }: { onClick?: () => void; className?: string }) {
  const params = useParams();
  const router = useRouter();
  const todoId = params?.id as string;

  const handleDuplicate = async () => {
    if (!todoId) {
      return; // Tidak melakukan apa-apa jika tidak ada todoId (tidak di halaman todo)
    }

    try {
      const result = await todoApi.duplicateTodoList(todoId);
      // Redirect ke todolist baru dengan edit token
      router.push(`/todo/${result.id}?token=${result.edit_token}`);
    } catch (err) {
      console.error('Failed to duplicate list:', err);
      // Bisa ditambahkan toast/notification di sini
    }
  };

  // Hanya tampilkan tombol jika berada di halaman todo
  if (!todoId) {
    return null;
  }

  return (
    <button id='duplicate-list-btn' aria-label='Duplicate List' title='Duplicate List' className={`p-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-200 hover:bg-slate-300 dark:hover:bg-slate-600 shadow ${className}`} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleDuplicate} type='button'>
      {/* Ikon duplicate: dua kotak tumpuk */}
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-6 h-6 text-slate-700 dark:text-slate-200'>
        <rect x='9' y='9' width='10' height='10' rx='2' />
        <rect x='5' y='5' width='10' height='10' rx='2' />
      </svg>
    </button>
  );
}
