'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TodoItem, CreateTodoListRequest, TodoList } from '../types/todo';
import { todoApi } from '../services/api';
import { Priority } from '../types/priority';
import { PrioritySelector } from '../components/priority/PrioritySelector';
import { TagInput } from '../components/tag/TagInput';
import NewListButton from '@/components/NewListButton';
import { FilterTag } from '@/components/tag/FilterTag';
import { TodoListCard } from '@/components/TodoListCard';
import { formatTimeLeft, formatRelativeTime } from '@/utils/dateUtils';
import { OnboardingGuide } from '../components/OnboardingGuide';
import { RestartTour } from '../components/RestartTour';

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

export default function Home() {
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Form states
  const [items, setItems] = useState<Omit<TodoItem, 'id' | 'created_at' | 'completed_at'>[]>([{ content: '', completed: false, order: 0, priority: 'medium' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [expirationHours, setExpirationHours] = useState<number>(24);
  const [title, setTitle] = useState<string>('Your Tasks');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Timeline states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [timeline, setTimeline] = useState<TodoList[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load initial data
  const loadTimeline = useCallback(
    async (reset: boolean = false) => {
      try {
        setIsLoadingMore(true);

        // Reset timeline if filters change
        const cursor = reset ? undefined : nextCursor;

        const timelineResponse = await todoApi.getTimelineTodoLists({
          cursor,
          limit: 10,
          tags: selectedTags,
          search,
        });

        setTimeline((prev) => (reset ? timelineResponse.data : [...prev, ...timelineResponse.data]));
        setNextCursor(timelineResponse.nextCursor);
        setHasMore(timelineResponse.hasMore);
      } catch (err) {
        console.error('Failed to load timeline:', err);
        setError('Failed to load todo lists');
      } finally {
        setIsLoadingMore(false);
      }
    },
    [nextCursor, selectedTags, search]
  );

  // Load trending tags
  const loadTrendingTags = useCallback(async () => {
    try {
      const tags = await todoApi.getTrendingTags(10);
      setTrendingTags(tags);
    } catch (err) {
      console.error('Failed to load trending tags:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTimeline(true);
    loadTrendingTags();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadTimeline(true);
  }, [selectedTags, search]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = async () => {
      if (loadingRef.current || !hasMore || isLoadingMore) return;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop + windowHeight >= documentHeight - 100) {
        loadingRef.current = true;
        await loadTimeline();
        loadingRef.current = false;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoadingMore, loadTimeline]);

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
      setShowCreateForm(true);
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

  return (
    <>
      <OnboardingGuide />
      <RestartTour />
      <main className='min-h-screen flex justify-center bg-gradient-to-br from-slate-200 via-purple-50/40 to-blue-50/40 dark:from-slate-900 dark:via-purple-900/30 dark:to-blue-900/30'>
        {/* Main Content */}
        <section className='flex-1 max-w-3xl w-full'>
          <div className='w-full p-4 pt-10 pb-20'>
            {/* Form Create Todo List */}
            <div className='mb-6'>
              <div className='backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10'>
                <div className='relative px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50'>
                  <div className='grid gap-4'>
                    <div className='flex items-center gap-2'>
                      <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>Create Todo List</h1>
                      <button className='toggle-form ml-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-lg' onClick={() => setShowCreateForm((v) => !v)} type='button' aria-label={showCreateForm ? 'Hide Create Form' : 'Show Create Form'}>
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

                {showCreateForm ? (
                  <div className='todo-form space-y-6 p-6 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-900/40 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl'>
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
                      <button onClick={handleCreateTodoList} disabled={isLoading} className='add-button w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-all disabled:opacity-50'>
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
                ) : (
                  <div className='h-px bg-slate-100 dark:bg-slate-800 my-2' />
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
                  <FilterTag tags={trendingTags} selectedTags={selectedTags} onChange={setSelectedTags} />
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className='mb-6'>
              <div className='flex flex-col md:flex-row md:items-center gap-2'>
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
                      placeholder='Search todo lists...'
                      className='search-todo-lists w-full px-6 py-4 pl-12 rounded-xl border border-white/20 dark:border-white/10 
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
            </div>

            {/* Timeline with better loading indicators */}
            <div className='flex flex-col gap-6'>
              {timeline.map((item) => (
                <TodoListCard key={item.id} todoList={item} onClick={() => router.push(`/todo/${item.id}`)} />
              ))}

              {isLoadingMore && (
                <div className='flex justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                </div>
              )}

              {!isLoadingMore && !hasMore && timeline.length > 0 && <div className='text-center py-8 text-slate-500 dark:text-slate-400'>No more todo lists to load</div>}

              {!isLoadingMore && timeline.length === 0 && <div className='text-center py-8 text-slate-500 dark:text-slate-400'>No todo lists found</div>}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
