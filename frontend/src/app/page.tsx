'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TodoItem, CreateTodoListRequest } from '../types/todo';
import { todoApi } from '../services/api';
import { Priority } from '../types/priority';
import { PrioritySelector } from '../components/priority/PrioritySelector';
import { TagInput } from '../components/tag/TagInput';
import NewListButton from '@/components/NewListButton';
import { FilterTag } from '@/components/tag/FilterTag';

const MOCK_TRENDING_TAGS = ['urgent', 'work', 'personal', 'shopping', 'study', 'project', 'health', 'travel', 'finance', 'fun'];

const MOCK_TIMELINE = Array.from({ length: 20 }).map((_, i) => ({
  id: `mock-${i + 1}`,
  title: `Todo List ${i + 1}`,
  tags: [MOCK_TRENDING_TAGS[i % MOCK_TRENDING_TAGS.length]],
  createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
  items: [
    { content: `Item 1 for ${i + 1}`, completed: false },
    { content: `Item 2 for ${i + 1}`, completed: true },
    { content: `Item 3 for ${i + 1}`, completed: false },
  ].slice(0, (i % 3) + 1),
  // Tambah data mock untuk like, view, dan expiration
  like_count: Math.floor(Math.random() * 50),
  view_count: Math.floor(Math.random() * 100) + 50,
  expiration_time: new Date(Date.now() + (Math.floor(Math.random() * 72) + 1) * 3600 * 1000).toISOString(),
}));

function formatRelativeTime(dateStr: string) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Tambah fungsi untuk format sisa waktu expired
function formatTimeLeft(expirationTime: string) {
  const now = Date.now();
  const expiration = new Date(expirationTime).getTime();
  const diff = Math.floor((expiration - now) / 1000);

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }
  if (hours > 0) return `${hours}h left`;
  return `${minutes}m left`;
}

export default function Home() {
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Omit<TodoItem, 'id' | 'created_at' | 'completed_at'>[]>([{ content: '', completed: false, order: 0, priority: 'medium' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [expirationHours, setExpirationHours] = useState<number>(24);
  const [title, setTitle] = useState<string>('Your Tasks');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState('');
  const [timeline, setTimeline] = React.useState(MOCK_TIMELINE);
  const [visibleCount, setVisibleCount] = React.useState(10);
  const [showCreateForm, setShowCreateForm] = React.useState(true);
  const mainRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Reset form jika tombol '+ New List' diklik di halaman ini
    const handleNewListClick = (e: Event) => {
      e.preventDefault();
      setItems([{ content: '', completed: false, order: 0, priority: 'medium' }]);
      setTags([]);
      setExpirationHours(24);
      setError(null);
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    };
    const btn = document.getElementById('new-list-btn');
    if (btn) {
      btn.addEventListener('click', handleNewListClick);
    }
    return () => {
      if (btn) {
        btn.removeEventListener('click', handleNewListClick);
      }
    };
  }, []);

  const handleAddItem = () => {
    setItems([...items, { content: '', completed: false, order: items.length, priority: 'medium' }]);
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

  const handlePriorityChange = (index: number, priority: Priority) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], priority };
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
        title,
        expiration_hours: expirationHours,
        items: items.filter((item) => item.content.trim()),
        tags: tags.map((name) => ({ name })),
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

  // Infinite scroll (tanpa library)
  React.useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setVisibleCount((c) => Math.min(c + 10, timeline.length));
      }
    };
    const node = mainRef.current;
    if (node) node.addEventListener('scroll', handleScroll);
    return () => {
      if (node) node.removeEventListener('scroll', handleScroll);
    };
  }, [timeline.length]);

  // Filter timeline by tag & search
  const filteredTimeline = timeline.filter((item) => {
    const matchTag = selectedTags.length === 0 || item.tags.some((t) => selectedTags.includes(t));
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <main className='min-h-screen flex justify-center bg-gradient-to-br from-slate-200 via-purple-50/40 to-blue-50/40 dark:from-slate-900 dark:via-purple-900/30 dark:to-blue-900/30'>
      {/* Main Content */}
      <section className='flex-1 max-w-3xl overflow-y-auto' ref={mainRef}>
        <div className='w-full p-4 pt-10'>
          {/* Form Create Todo List */}
          <div className='mb-6'>
            <div className='backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10'>
              <div className='relative px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50'>
                <div className='grid gap-4'>
                  <div className='flex items-center gap-2'>
                    <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>Create Todo List</h1>
                    <button className='ml-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-lg' onClick={() => setShowCreateForm((v) => !v)} type='button' aria-label={showCreateForm ? 'Hide Create Form' : 'Show Create Form'}>
                      {showCreateForm ? (
                        <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='w-5 h-5'>
                          <rect x='3' y='3' width='18' height='18' rx='3' fill='none' />
                          <polyline points='8 14 12 10 16 14' />
                        </svg>
                      ) : (
                        <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='w-5 h-5'>
                          <rect x='3' y='3' width='18' height='18' rx='3' fill='none' />
                          <polyline points='8 10 12 14 16 10' />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {!showCreateForm && <div className='h-px bg-slate-100 dark:bg-slate-800 my-2' />}

              {showCreateForm && (
                <div className='p-6'>
                  {error && <div className='bg-red-50/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-700/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4'>{error}</div>}
                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className='block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium'>Title</label>
                        <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} className='w-full px-2 py-1 bg-transparent text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent focus:outline-none' placeholder='Your Tasks' />
                      </div>
                      <div>
                        <label className='block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium'>Expiration Time</label>
                        <select value={expirationHours} onChange={(e) => setExpirationHours(Number(e.target.value))} className='w-full p-2 bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50'>
                          <option value={1}>1 hour</option>
                          <option value={24}>1 day</option>
                          <option value={168}>1 week</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className='block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium'>Tags</label>
                      <TagInput tags={tags} onChange={setTags} placeholder='Add tags for your todo list' />
                    </div>
                    <div>
                      <label className='block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium'>Tasks</label>
                      {items.map((item, index) => (
                        <div key={index} className='flex items-center mb-2 group'>
                          <input type='checkbox' checked={item.completed} onChange={() => handleToggleComplete(index)} className='mr-2 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500/50 dark:focus:ring-blue-400/50' />
                          <input type='text' ref={index === 0 ? firstInputRef : index === items.length - 1 ? lastInputRef : null} value={item.content} onChange={(e) => handleItemChange(index, e.target.value)} onKeyDown={(e) => handleKeyPress(index, e)} placeholder='Enter a task...' className='flex-1 p-2 bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50' />
                          <PrioritySelector value={item.priority} onChange={(priority) => handlePriorityChange(index, priority)} className='ml-2 w-28' showPillPreview={false} />
                          <button onClick={() => handleRemoveItem(index)} className='ml-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity' disabled={items.length <= 1}>
                            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                              <path fillRule='evenodd' d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z' clipRule='evenodd' />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button onClick={handleAddItem} className='w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200/50 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50'>
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
              )}
            </div>
          </div>

          {/* Trending Tags */}
          <div className='mb-6'>
            <div className='backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10'>
              <div className='relative px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50'>
                <div className='grid gap-4'>
                  <div className='flex items-center gap-2'>
                    <h2 className='text-2xl font-semibold text-slate-900 dark:text-white'>Trending Tags</h2>
                  </div>
                </div>
              </div>
              <div className='p-6'>
                <FilterTag tags={MOCK_TRENDING_TAGS} selectedTags={selectedTags} onChange={setSelectedTags} />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className='flex flex-col md:flex-row md:items-center gap-2 mb-6'>
            <div className='flex-1'>
              <div className='relative'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z' />
                  </svg>
                </span>
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Cari todo list...'
                  className='w-full px-6 py-4 pl-12 rounded-xl border border-white/20 dark:border-white/10 
                    bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
                    text-slate-900 dark:text-slate-100 
                    placeholder-slate-400 dark:placeholder-slate-500
                    shadow-glass-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
                    text-base'
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className='flex flex-col gap-3'>
            {filteredTimeline.slice(0, visibleCount).map((item) => (
              <div key={item.id} className='bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-white/10 rounded-xl p-4 shadow-glass-lg hover:shadow-lg transition cursor-pointer' onClick={() => router.push(`/todo/${item.id}`)}>
                <div className='flex flex-col gap-2'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='font-semibold text-slate-800 dark:text-slate-100 text-lg truncate'>{item.title}</div>
                      <div className='flex flex-wrap gap-2 mt-1'>
                        {item.tags.map((tag) => (
                          <span key={tag} className='px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'>{`#${tag}`}</span>
                        ))}
                      </div>
                    </div>
                    <div className='text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap'>{formatRelativeTime(item.createdAt)}</div>
                  </div>

                  {/* Excerpt items */}
                  <ul className='mt-1 ml-2 list-disc text-slate-600 dark:text-slate-300 text-sm'>
                    {item.items &&
                      item.items.slice(0, 2).map((it: any, idx: number) => (
                        <li key={idx} className='truncate'>
                          {it.content}
                        </li>
                      ))}
                    {item.items && item.items.length > 2 && <li className='italic text-xs text-slate-400 dark:text-slate-500'>...and more</li>}
                  </ul>

                  {/* Stats & Info */}
                  <div className='-mx-4 px-4 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800'>
                    <div className='flex items-center gap-4'>
                      {/* Like Count */}
                      <div className='flex items-center gap-1 text-slate-500 dark:text-slate-400'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                          <path d='M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z' />
                        </svg>
                        <span className='text-xs'>{item.like_count}</span>
                      </div>

                      {/* View Count */}
                      <div className='flex items-center gap-1 text-slate-500 dark:text-slate-400'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                          <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                          <path fillRule='evenodd' d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z' clipRule='evenodd' />
                        </svg>
                        <span className='text-xs'>{item.view_count}</span>
                      </div>

                      {/* Expiration Time */}
                      <div className='flex items-center gap-1 ml-auto'>
                        <svg xmlns='http://www.w3.org/2000/svg' className={`h-4 w-4 ${new Date(item.expiration_time) <= new Date() ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`} viewBox='0 0 20 20' fill='currentColor'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
                        </svg>
                        <span className={`text-xs font-medium ${new Date(item.expiration_time) <= new Date() ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>{formatTimeLeft(item.expiration_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
