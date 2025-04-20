import React, { useState, useEffect } from 'react';
import { TodoItem as TodoItemComponent } from './TodoItem';
import { TodoItem as TodoItemType, TodoList as TodoListType } from '../types/todo';
import { useWebSocket } from '../hooks/useWebSocket';
import { todoApi } from '../services/api';
import { TagInput } from './tag/TagInput';
import { FilterInput } from './task/FilterInput';
import { SortDropdown, TaskSort } from './task/SortDropdown';

interface TodoListProps {
  todoList: TodoListType;
  isEditable: boolean;
  onUpdate: (todoList: TodoListType) => void;
  isSaving?: boolean;
}

export function TodoList({ todoList: initialTodoList, isEditable, onUpdate, isSaving = false }: TodoListProps) {
  const [todoList, setTodoList] = useState<TodoListType>(initialTodoList);
  const [isPolling, setIsPolling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isWebSocketEnabled = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';
  const [filterText, setFilterText] = useState('');
  const [sort, setSort] = useState<TaskSort>('order');

  // Initialize tags from todoList.tags
  const [tags, setTags] = useState<string[]>(todoList.tags?.map((tag) => tag.name) || []);

  // Update local state when initialTodoList changes
  useEffect(() => {
    setTodoList(initialTodoList);
    // Update tags when todoList changes
    const incomingTags = initialTodoList.tags?.map((tag) => tag.name) || [];
    console.log('Received updated todo list with tags:', incomingTags);
    setTags(incomingTags);
  }, [initialTodoList]);

  // Calculate completion stats
  const totalItems = todoList.items.length;
  const completedItems = todoList.items.filter((item) => item.completed).length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Setup WebSocket or polling based on configuration
  const { isConnected } = useWebSocket({
    todoId: todoList.id,
    onUpdate: (updatedTodoList) => {
      if (!isEditing) {
        // Only update if not actively editing
        setTodoList(updatedTodoList);
        // Update the tags from incoming todo list
        setTags(updatedTodoList.tags?.map((tag) => tag.name) || []);
        setIsSyncing(false);
      }
    },
  });

  // Polling when WebSocket is disabled
  useEffect(() => {
    if (isWebSocketEnabled) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    console.log('Starting polling');

    const pollInterval = setInterval(async () => {
      try {
        if (!isEditing) {
          setIsSyncing(true);
          const data = await todoApi.getTodoList(todoList.id);
          setTodoList(data);
          // Update tags from fresh data
          setTags(data.tags?.map((tag) => tag.name) || []);
        }
      } catch (error) {
        console.error('Error polling todo list:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 5000);

    return () => {
      console.log('Stopping polling');
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [isWebSocketEnabled, todoList.id, isEditing]);

  // Filter dan sort item
  let filteredItems = todoList.items;
  if (filterText.trim()) {
    filteredItems = filteredItems.filter((item) => item.content.toLowerCase().includes(filterText.toLowerCase()));
  }
  if (sort === 'priority') {
    // Sort by priority: high > medium > low
    filteredItems = [...filteredItems].sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  } else if (sort === 'alphabetical') {
    filteredItems = [...filteredItems].sort((a, b) => a.content.localeCompare(b.content));
  } else if (sort === 'created') {
    filteredItems = [...filteredItems].sort((a, b) => {
      if (!a.created_at) return 1;
      if (!b.created_at) return -1;
      return a.created_at > b.created_at ? 1 : -1;
    });
  }
  // order: default urutan

  const handleItemUpdate = async (updatedItem: TodoItemType) => {
    if (!isEditable) return;

    setIsEditing(true);
    const updatedItems = todoList.items.map((item) => (item.id === updatedItem.id ? updatedItem : item));

    const updatedTodoList = {
      ...todoList,
      items: updatedItems,
    };

    setTodoList(updatedTodoList);
    await onUpdate(updatedTodoList);
    setIsEditing(false);
  };

  // Add a function to handle tag changes
  const handleTagsChange = async (newTags: string[]) => {
    if (!isEditable) return;

    setIsEditing(true);
    setTags(newTags);

    // Create temporary tag objects with the required structure
    const tagObjects = newTags.map((name) => ({
      id: '',
      name,
      created_at: '',
      updated_at: '',
    }));

    const updatedTodoList = {
      ...todoList,
      tags: tagObjects,
    };

    setTodoList(updatedTodoList);

    try {
      // When sending to the API, just send the tag names
      await onUpdate({
        ...updatedTodoList,
        tags: tagObjects,
      });
    } catch (error) {
      console.error('Error updating tags:', error);
      // Revert to previous tags on error
      setTags(todoList.tags?.map((tag) => tag.name) || []);
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddItem = async () => {
    if (!isEditable) return;

    setIsEditing(true);
    const newItem: TodoItemType = {
      id: `temp-${Date.now()}`,
      content: '',
      completed: false,
      order: todoList.items.length,
      created_at: new Date().toISOString(),
      priority: 'medium',
    };

    const updatedTodoList = {
      ...todoList,
      items: [...todoList.items, newItem],
    };

    setTodoList(updatedTodoList);
    await onUpdate(updatedTodoList);
    setIsEditing(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!isEditable) return;

    setIsEditing(true);
    const updatedItems = todoList.items
      .filter((item) => item.id !== itemId)
      .map((item, index) => ({
        ...item,
        order: index,
      }));

    const updatedTodoList = {
      ...todoList,
      items: updatedItems,
    };

    setTodoList(updatedTodoList);
    await onUpdate(updatedTodoList);
    setIsEditing(false);
  };

  return (
    <div className='space-y-6 p-6 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-xl'>
      <div className='flex flex-col space-y-4'>
        <div className='flex justify-between items-center'>
          <div className='flex flex-col'>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent'>Your Tasks</h2>
          </div>
          <div className='flex items-center space-x-3'>
            {(isSaving || isSyncing) && (
              <div className='flex items-center px-3 py-1 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full'>
                <svg className='animate-spin h-4 w-4 mr-2' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                <span className='text-sm font-medium'>Syncing</span>
              </div>
            )}
            {isPolling && !isSaving && !isSyncing && isEditable && (
              <div className='px-3 py-1 bg-green-50/80 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center'>
                <div className='w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mr-2 animate-pulse'></div>
                <span className='text-sm font-medium'>Auto-saving</span>
              </div>
            )}
          </div>
        </div>

        <div className='w-full'>
          <TagInput tags={tags} onChange={handleTagsChange} />
        </div>
        <div className='flex flex-wrap gap-2 items-center w-full'>
          <FilterInput value={filterText} onChange={setFilterText} />
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <div className='relative pt-4'>
          <div className='flex mb-2 items-center justify-between'>
            <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/30'>Task Progress</span>
            <span className='flex-1 text-center text-xs font-semibold text-blue-600 dark:text-blue-400'>{Math.round(completionPercentage)}%</span>
            <span className='text-xs font-semibold inline-block text-blue-600 dark:text-blue-400'>
              {completedItems} of {totalItems} completed
            </span>
          </div>
          <div className='overflow-hidden h-2 text-xs flex rounded-full bg-blue-50 dark:bg-blue-900/30'>
            <div style={{ width: `${completionPercentage}%` }} className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500 ease-out'></div>
          </div>
        </div>

        <div className='space-y-2'>
          {filteredItems.map((item, index) => (
            <TodoItemComponent key={item.id || `temp-${index}`} item={item} index={index} isEditable={isEditable} onUpdate={handleItemUpdate} onDelete={handleDeleteItem} />
          ))}
        </div>

        {isEditable && (
          <button onClick={handleAddItem} className='w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200/50 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50'>
            <div className='flex items-center justify-center'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z' clipRule='evenodd' />
              </svg>
              Add Task
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
