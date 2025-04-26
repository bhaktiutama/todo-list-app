import React, { useState, useEffect } from 'react';
import { TodoItem as TodoItemComponent } from './TodoItem';
import { TodoItem as TodoItemType, TodoList as TodoListType, ViewStatus, LikeStatus } from '../types/todo';
import { todoApi } from '../services/api';
import { TagInput } from './tag/TagInput';
import { FilterInput } from './task/FilterInput';
import { SortDropdown, TaskSort } from './task/SortDropdown';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { getClientFingerprint } from '../utils/fingerprint';

interface TodoListProps {
  todoList: TodoListType;
  isEditable: boolean;
  onUpdate: (todoList: TodoListType) => void;
  isSaving?: boolean;
  setIsSyncing?: (v: boolean) => void;
  setIsPolling?: (v: boolean) => void;
}

export function TodoList({ todoList: initialTodoList, isEditable, onUpdate, isSaving = false, setIsSyncing, setIsPolling }: TodoListProps) {
  const [todoList, setTodoList] = useState<TodoListType>(initialTodoList);
  const [isEditing, setIsEditing] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sort, setSort] = useState<TaskSort>('order');
  const [tags, setTags] = useState<string[]>(todoList.tags?.map((tag) => tag.name) || []);
  const [viewStatus, setViewStatus] = useState<ViewStatus>({ hasViewed: false, viewCount: initialTodoList.view_count });
  const [likeStatus, setLikeStatus] = useState<LikeStatus>({ isLiked: false, likeCount: initialTodoList.like_count });
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Record view and check like status on mount
  useEffect(() => {
    const initializeViewAndLike = async () => {
      try {
        const fingerprint = await getClientFingerprint();

        // Record view
        await todoApi.recordView(todoList.id, fingerprint);

        // Check view and like status
        const [viewResult, likeResult] = await Promise.all([todoApi.checkViewStatus(todoList.id, fingerprint), todoApi.checkLikeStatus(todoList.id, fingerprint)]);

        setViewStatus(viewResult);
        setLikeStatus(likeResult);
      } catch (error) {
        console.error('Error initializing view and like:', error);
      }
    };

    initializeViewAndLike();
  }, [todoList.id]);

  // Handle like toggle
  const handleLikeToggle = async () => {
    if (isLikeLoading) return;

    try {
      setIsLikeLoading(true);
      const fingerprint = await getClientFingerprint();
      const result = await todoApi.toggleLike(todoList.id, fingerprint);
      setLikeStatus(result);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

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

  // Polling for updates
  useEffect(() => {
    if (setIsPolling) setIsPolling(true);
    console.log('Starting polling');

    const pollInterval = setInterval(async () => {
      try {
        if (!isEditing) {
          if (setIsSyncing) setIsSyncing(true);
          const data = await todoApi.getTodoList(todoList.id);
          setTodoList(data);
          setTags(data.tags?.map((tag) => tag.name) || []);
        }
      } catch (error) {
        console.error('Error polling todo list:', error);
      } finally {
        if (setIsSyncing) setIsSyncing(false);
      }
    }, 5000);

    return () => {
      console.log('Stopping polling');
      clearInterval(pollInterval);
      if (setIsPolling) setIsPolling(false);
    };
  }, [todoList.id, isEditing, setIsPolling, setIsSyncing]);

  // Filter dan sort item
  let filteredItems = todoList.items;
  if (filterText.trim()) {
    filteredItems = filteredItems.filter((item) => item.content.toLowerCase().includes(filterText.toLowerCase()));
  }
  if (sort === 'priority') {
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

  // Drag and drop handler
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !isEditable) return;
    const sourceIdx = result.source.index;
    const destIdx = result.destination.index;
    if (sourceIdx === destIdx) return;

    // Urutkan ulang array
    const newItems = Array.from(filteredItems);
    const [removed] = newItems.splice(sourceIdx, 1);
    newItems.splice(destIdx, 0, removed);
    // Update order property
    const reordered = newItems.map((item, idx) => ({ ...item, order: idx }));
    const updatedTodoList = { ...todoList, items: reordered };
    setTodoList(updatedTodoList);
    await onUpdate(updatedTodoList);
  };

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

  // Drag only allowed if sort is 'order' and filterText is empty
  const isDragActive = isEditable && sort === 'order' && !filterText.trim();

  // Gunakan urutan asli untuk drag, filtered untuk tampilan biasa
  const draggableItems = isDragActive ? todoList.items : filteredItems;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId='todo-list-droppable' isDropDisabled={!isDragActive}>
        {(provided: DroppableProvided) => (
          <div className='space-y-6 p-6 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-900/40 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl' ref={provided.innerRef} {...provided.droppableProps}>
            <div className='flex flex-col space-y-4'>
              <div className='flex justify-between items-center flex-wrap gap-y-2'>
                <div className='flex flex-col'>
                  <h2 className='text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent'>Your Tasks</h2>
                </div>
                {/* Badge modern untuk views dan likes */}
                <div className='flex flex-row gap-2 items-center mt-2 sm:mt-0'>
                  {/* Views */}
                  <div className='flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 shadow-sm text-sm font-semibold' title='Views'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                    {viewStatus.viewCount}
                  </div>
                  {/* Likes */}
                  <button onClick={handleLikeToggle} disabled={isLikeLoading} className={`flex items-center px-3 py-1 rounded-full ${likeStatus.isLiked ? 'bg-pink-100 dark:bg-pink-800/30' : 'bg-pink-50 dark:bg-pink-900/30'} text-pink-600 dark:text-pink-300 shadow-sm text-sm font-semibold transition-all duration-200 ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-200 dark:hover:bg-pink-800/50 cursor-pointer'}`} title={likeStatus.isLiked ? 'Unlike' : 'Like'}>
                    <svg xmlns='http://www.w3.org/2000/svg' className={`h-5 w-5 mr-1.5 transition-transform duration-200 ${isLikeLoading ? 'animate-pulse' : ''} ${likeStatus.isLiked ? 'scale-110' : 'scale-100'}`} fill={likeStatus.isLiked ? 'currentColor' : 'none'} viewBox='0 0 24 24' stroke='currentColor' strokeWidth={likeStatus.isLiked ? 0 : 2}>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z' />
                    </svg>
                    {likeStatus.likeCount}
                  </button>
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
                  <span className='flex-1 text-center text-xs font-semibold text-blue-600 dark:text-blue-400'></span>
                  <span className='text-xs font-semibold inline-block text-blue-600 dark:text-blue-400'>
                    {completedItems} of {totalItems} completed ({Math.round(completionPercentage)}%)
                  </span>
                </div>
                <div className='overflow-hidden h-2 text-xs flex rounded-full bg-blue-50 dark:bg-blue-900/30'>
                  <div style={{ width: `${completionPercentage}%` }} className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500 ease-out'></div>
                </div>
              </div>

              {/* DRAGGABLE LIST */}
              <div>
                {draggableItems.map((item, index) => (
                  <Draggable key={item.id || `temp-${index}`} draggableId={item.id || `temp-${index}`} index={index} isDragDisabled={!isDragActive}>
                    {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`bg-white dark:bg-slate-800 rounded-xl shadow transition-all duration-200 ${index !== draggableItems.length - 1 ? 'mb-2' : ''} ${dragSnapshot.isDragging ? 'ring-2 ring-blue-400 z-10' : ''}`}
                        style={{
                          ...dragProvided.draggableProps.style,
                          left: 'auto !important',
                          top: 'auto !important',
                          opacity: dragSnapshot.isDragging ? 0.85 : 1,
                          cursor: isDragActive ? 'grab' : 'default',
                        }}
                      >
                        <TodoItemComponent item={item} index={index} isEditable={isEditable} onUpdate={handleItemUpdate} onDelete={handleDeleteItem} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>

              {/* Info jika drag dinonaktifkan */}
              {!isDragActive && isEditable && <div className='text-xs text-slate-400 mt-2 text-center select-none'>Drag & drop hanya aktif saat urutan asli (tanpa filter/sort).</div>}

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
        )}
      </Droppable>
    </DragDropContext>
  );
}
