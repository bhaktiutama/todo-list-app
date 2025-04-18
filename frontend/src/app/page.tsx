'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TodoItem, CreateTodoListRequest } from '../types/todo';
import { todoApi } from '../services/api';

export default function Home() {
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Omit<TodoItem, 'id' | 'created_at' | 'completed_at'>[]>([{ content: '', completed: false, order: 0 }]);
  const [expirationHours, setExpirationHours] = useState<number>(24);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto focus on first input when component mounts
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Auto focus on new item when added
  useEffect(() => {
    if (lastInputRef.current) {
      lastInputRef.current.focus();
    }
  }, [items.length]);

  const handleAddItem = () => {
    setItems([...items, { content: '', completed: false, order: items.length }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;

    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.map((item, i) => ({ ...item, order: i })));
  };

  const handleItemChange = (index: number, content: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], content };
    setItems(newItems);
  };

  const handleKeyPress = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && items[index].content.trim()) {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleToggleComplete = (index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], completed: !newItems[index].completed };
    setItems(newItems);
  };

  const handleCreateTodoList = async () => {
    // Validate at least one item has content
    if (!items.some((item) => item.content.trim())) {
      setError('Please add at least one task');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: CreateTodoListRequest = {
        expiration_hours: expirationHours,
        items: items.filter((item) => item.content.trim()),
      };

      const response = await todoApi.createTodoList(request);

      // Redirect to the edit page
      router.push(`/todo/${response.id}?token=${response.edit_token}`);
    } catch (err) {
      setError('Failed to create todo list. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-900/30 dark:to-blue-900/30'>
      {/* Background Pattern */}
      <div className='fixed inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none opacity-50 dark:opacity-[0.02]' />

      <div className='relative min-h-screen grid place-items-center p-4'>
        <div className='w-full max-w-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10 p-6'>
          <h1 className='text-3xl font-bold text-center mb-8 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent'>Create a Shareable Todo List</h1>

          {error && <div className='bg-red-50/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-700/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4'>{error}</div>}

          <div className='mb-6'>
            <label className='block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium'>Expiration Time</label>
            <select value={expirationHours} onChange={(e) => setExpirationHours(Number(e.target.value))} className='w-full p-2 bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50'>
              <option value={1}>1 hour</option>
              <option value={24}>1 day</option>
              <option value={168}>1 week</option>
            </select>
          </div>

          <div className='mb-6'>
            <label className='block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium'>Tasks</label>
            {items.map((item, index) => (
              <div key={index} className='flex items-center mb-2 group'>
                <input type='checkbox' checked={item.completed} onChange={() => handleToggleComplete(index)} className='mr-2 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500/50 dark:focus:ring-blue-400/50' />
                <input type='text' ref={index === 0 ? firstInputRef : index === items.length - 1 ? lastInputRef : null} value={item.content} onChange={(e) => handleItemChange(index, e.target.value)} onKeyDown={(e) => handleKeyPress(index, e)} placeholder='Enter a task...' className='flex-1 p-2 bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50' />
                <button onClick={() => handleRemoveItem(index)} className='ml-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity' disabled={items.length <= 1}>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                    <path fillRule='evenodd' d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z' clipRule='evenodd' />
                  </svg>
                </button>
              </div>
            ))}

            <button onClick={handleAddItem} className='w-full mt-4 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-200'>
              <div className='flex items-center justify-center'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z' clipRule='evenodd' />
                </svg>
                Add Task
              </div>
            </button>
          </div>

          <button onClick={handleCreateTodoList} disabled={isLoading} className='w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-all disabled:opacity-50'>
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <svg className='animate-spin h-5 w-5 mr-2' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Creating...
              </div>
            ) : (
              'Create Todo List'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
