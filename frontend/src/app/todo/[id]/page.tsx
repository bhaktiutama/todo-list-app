'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { TodoList } from '../../../components/TodoList';
import { TodoItem, TodoList as TodoListType, UpdateTodoListRequest } from '../../../types/todo';
import { todoApi } from '../../../services/api';

export default function TodoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const editToken = searchParams.get('token');

  const [todoList, setTodoList] = useState<TodoListType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string>('');
  const [editUrl, setEditUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    const fetchTodoList = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await todoApi.getTodoList(id);
        setTodoList(data);

        // Generate URLs
        const baseUrl = window.location.origin;
        setViewUrl(`${baseUrl}/todo/${id}`);
        if (editToken) {
          setEditUrl(`${baseUrl}/todo/${id}?token=${editToken}`);
        }
      } catch (err) {
        setError('Failed to load todo list. It may have expired or been deleted.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodoList();
  }, [id, editToken]);

  const handleUpdateTodoList = async (updatedTodoList: TodoListType) => {
    if (!todoList || !editToken) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Prepare the request with tag names for the API
      const request: UpdateTodoListRequest = {
        items: updatedTodoList.items,
        tags: updatedTodoList.tags?.map((tag) => tag.name) || [],
      };

      console.log('Updating todo list with tags:', request.tags);

      const updatedList = await todoApi.updateTodoList(id, editToken, request);
      setTodoList(updatedList);
    } catch (err) {
      setSaveError('Failed to save changes. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = (url: string, type: 'view' | 'edit') => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopySuccess(`${type === 'view' ? 'View' : 'Edit'} link copied to clipboard!`);
        setTimeout(() => setCopySuccess(null), 3000);
      },
      () => {
        setCopySuccess('Failed to copy link. Please try again.');
      }
    );
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto dark:border-blue-400'></div>
          <p className='mt-4 text-slate-600 dark:text-slate-400'>Loading todo list...</p>
        </div>
      </div>
    );
  }

  if (error || !todoList) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700/50 text-red-700 dark:text-red-400 px-6 py-4 rounded max-w-md w-full'>
          <h2 className='text-lg font-semibold mb-2'>Error</h2>
          <p>{error || 'Todo list not found'}</p>
        </div>
      </div>
    );
  }

  const isEditable = !!editToken;
  const expiresIn = todoList.expires_at ? new Date(todoList.expires_at).getTime() - Date.now() : 0;
  const expiresInHours = Math.max(0, Math.floor(expiresIn / (1000 * 60 * 60)));
  const expiresInMinutes = Math.max(0, Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-900/30 dark:to-blue-900/30'>
      {/* Background Pattern */}
      <div className='fixed inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none opacity-50 dark:opacity-[0.02]' />

      <div className='relative min-h-screen grid place-items-center p-4'>
        <div className='w-full max-w-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10'>
          {/* Header Section */}
          <div className='relative px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50'>
            <div className='grid gap-4'>
              <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>{isEditable ? 'Edit Todo List' : 'View Todo List'}</h1>
                <div className='flex items-center gap-2'>
                  {(isSaving || isSyncing) && (
                    <div className='flex items-center px-3 py-1.5 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/50 dark:border-blue-700/50 shadow-sm text-xs font-medium outline outline-1 outline-blue-200/50 dark:outline-blue-700/50'>
                      <svg className='animate-spin h-4 w-4 mr-2' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      <span>Syncing</span>
                    </div>
                  )}
                  {isPolling && !isSaving && !isSyncing && isEditable && (
                    <div className='flex items-center px-3 py-1.5 bg-green-50/80 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full border border-green-200/50 dark:border-green-700/50 shadow-sm text-xs font-medium outline outline-1 outline-green-200/50 dark:outline-green-700/50'>
                      <div className='w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mr-2 animate-pulse'></div>
                      <span>Auto-saving</span>
                    </div>
                  )}
                  <div className='flex items-center px-3 py-1.5 bg-orange-50/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full border border-orange-200/50 dark:border-orange-700/50 shadow-sm text-xs font-medium outline outline-1 outline-orange-200/50 dark:outline-orange-700/50'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
                    </svg>
                    <span className='text-xs font-medium'>
                      {expiresInHours}h {expiresInMinutes}m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {saveError && (
            <div className='mx-6 mt-4 bg-red-50/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-700/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center text-sm'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-2 flex-shrink-0' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
              {saveError}
            </div>
          )}

          {copySuccess && (
            <div className='mx-6 mt-4 bg-green-50/80 dark:bg-green-900/30 border border-green-200/50 dark:border-green-700/50 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center text-sm'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-2 flex-shrink-0' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              {copySuccess}
            </div>
          )}

          {/* Share Links Section */}
          <div className='p-6'>
            <div className='space-y-4'>
              <div className='grid md:grid-cols-2 gap-4'>
                {/* View Link */}
                <div className='space-y-2'>
                  <label className='block text-xs font-medium text-slate-700 dark:text-slate-300'>View Link</label>
                  <div className='group relative'>
                    <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200'></div>
                    <div className='relative flex'>
                      <input type='text' value={viewUrl} readOnly className='flex-1 px-3 py-2 text-sm bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50' />
                      <button onClick={() => handleCopyLink(viewUrl, 'view')} className='px-4 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-r-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition duration-200'>
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Link */}
                {isEditable && (
                  <div className='space-y-2'>
                    <label className='block text-xs font-medium text-slate-700 dark:text-slate-300'>Edit Link</label>
                    <div className='group relative'>
                      <div className='absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200'></div>
                      <div className='relative flex'>
                        <input type='text' value={editUrl} readOnly className='flex-1 px-3 py-2 text-sm bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-purple-500/50' />
                        <button onClick={() => handleCopyLink(editUrl, 'edit')} className='px-4 text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-r-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition duration-200'>
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className='bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30 rounded-lg p-3 flex items-start gap-2'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                </svg>
                <p className='text-xs text-slate-600 dark:text-slate-300'>{isEditable ? 'Share the view link for read-only access. Keep the edit link private.' : 'This is a read-only view. You cannot make changes.'}</p>
              </div>
            </div>
          </div>

          {/* Todo List Component */}
          <div className='p-6 pt-0'>
            <TodoList todoList={todoList} isEditable={isEditable} onUpdate={handleUpdateTodoList} isSaving={isSaving} setIsSyncing={setIsSyncing} setIsPolling={setIsPolling} />
          </div>
        </div>
      </div>
    </main>
  );
}
