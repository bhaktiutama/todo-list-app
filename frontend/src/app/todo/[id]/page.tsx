'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { TodoList } from '../../../components/TodoList';
import { TodoItem, TodoList as TodoListType, UpdateTodoListRequest } from '../../../types/todo';
import { todoApi } from '../../../services/api';
import DuplicateListButton from '../../../components/DuplicateListButton';

export default function TodoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [showShareLinks, setShowShareLinks] = useState(false);

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

  const handleDuplicate = async () => {
    try {
      const result = await todoApi.duplicateTodoList(id);
      // Redirect ke todolist baru dengan edit token
      router.push(`/todo/${result.id}?token=${result.edit_token}`);
    } catch (err) {
      console.error('Failed to duplicate list:', err);
      // Bisa ditambahkan toast/notification di sini
    }
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

      <div className='fixed top-0 left-0 w-full min-h-screen place-items-center p-4 pt-20 z-10'>
        <div className='w-full max-w-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10'>
          {/* Header Section */}
          <div className='relative px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50'>
            <div className='grid gap-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>{isEditable ? 'Edit Todo List' : 'View Todo List'}</h1>
                  <button className='ml-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-lg' onClick={() => setShowShareLinks((v) => !v)} type='button' aria-label={showShareLinks ? 'Hide Share Links' : 'Show Share Links'}>
                    {showShareLinks ? (
                      // Chevron up in square
                      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='w-5 h-5'>
                        <rect x='3' y='3' width='18' height='18' rx='3' fill='none' />
                        <polyline points='8 14 12 10 16 14' />
                      </svg>
                    ) : (
                      // Chevron down in square
                      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='w-5 h-5'>
                        <rect x='3' y='3' width='18' height='18' rx='3' fill='none' />
                        <polyline points='8 10 12 14 16 10' />
                      </svg>
                    )}
                  </button>
                </div>
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
            <div className='fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none'>
              <div className='animate-fade-in-up bg-green-50/90 dark:bg-green-900/80 border border-green-200/70 dark:border-green-700/70 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center shadow-lg text-sm min-w-[200px] pointer-events-auto'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-2 flex-shrink-0' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                {copySuccess}
              </div>
            </div>
          )}

          {/* Share Links Section */}
          <div className='p-6'>
            {showShareLinks === true ? (
              <div className='space-y-4'>
                <div className='grid md:grid-cols-2 gap-4'>
                  {/* View Link */}
                  <div className='space-y-2'>
                    <label className='block text-xs font-medium text-slate-700 dark:text-slate-300'>View Link</label>
                    <div className='group relative'>
                      <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200'></div>
                      <div className='relative flex'>
                        {/* Icon readonly (eye) */}
                        <span className='absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none'>
                          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 12C2.25 12 5.25 5.25 12 5.25s9.75 6.75 9.75 6.75-3 6.75-9.75 6.75S2.25 12 2.25 12z' />
                            <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          </svg>
                        </span>
                        <input type='text' value={viewUrl} readOnly className='flex-1 px-3 py-2 pl-8 text-sm bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50' />
                        <button onClick={() => handleCopyLink(viewUrl, 'view')} className='px-4 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-r-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition duration-200 flex items-center justify-center'>
                          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 8.25V6.75A2.25 2.25 0 0014.25 4.5h-6A2.25 2.25 0 006 6.75v6A2.25 2.25 0 008.25 15h1.5' />
                            <path strokeLinecap='round' strokeLinejoin='round' d='M18 9.75h-6A2.25 2.25 0 009.75 12v6A2.25 2.25 0 0012 20.25h6A2.25 2.25 0 0020.25 18v-6A2.25 2.25 0 0018 9.75z' />
                          </svg>
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
                          {/* Icon edit (pencil) */}
                          <span className='absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none'>
                            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
                              <path strokeLinecap='round' strokeLinejoin='round' d='M16.862 3.487a2.1 2.1 0 1 1 2.97 2.97L8.978 17.31a4.2 4.2 0 0 1-1.67 1.05l-3.33 1.11a.6.6 0 0 1-.76-.76l1.11-3.33a4.2 4.2 0 0 1 1.05-1.67l10.479-10.223Z' />
                            </svg>
                          </span>
                          <input type='text' value={editUrl} readOnly className='flex-1 px-3 py-2 pl-8 text-sm bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-purple-500/50' />
                          <button onClick={() => handleCopyLink(editUrl, 'edit')} className='px-4 text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-r-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition duration-200 flex items-center justify-center'>
                            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
                              <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 8.25V6.75A2.25 2.25 0 0014.25 4.5h-6A2.25 2.25 0 006 6.75v6A2.25 2.25 0 008.25 15h1.5' />
                              <path strokeLinecap='round' strokeLinejoin='round' d='M18 9.75h-6A2.25 2.25 0 009.75 12v6A2.25 2.25 0 0012 20.25h6A2.25 2.25 0 0020.25 18v-6A2.25 2.25 0 0018 9.75z' />
                            </svg>
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
            ) : showShareLinks === false ? (
              <div className='h-px bg-slate-100 dark:bg-slate-800 my-2' />
            ) : null}
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
