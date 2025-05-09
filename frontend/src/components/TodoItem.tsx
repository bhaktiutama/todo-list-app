import React, { useEffect, useRef } from 'react';
import { TodoItem as TodoItemType } from '../types/todo';
import { Priority } from '../types/priority';
import { PriorityIndicator } from './priority/PriorityIndicator';
import { PrioritySelector } from './priority/PrioritySelector';
import dynamic from 'next/dynamic';

interface TodoItemProps {
  item: TodoItemType;
  index: number;
  isEditable: boolean;
  onUpdate: (item: TodoItemType) => void;
  onDelete: (id: string) => void;
}

// Lazy load ThemeToggle untuk mengurangi main bundle size
const ThemeToggle = dynamic(() => import('@/components/ThemeToggle'), {
  ssr: false, // Hindari server-side rendering
});

export function TodoItem({ item, index, isEditable, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = React.useState(!item.content && isEditable);
  const [editContent, setEditContent] = React.useState(item.content);
  const [isHovered, setIsHovered] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditable) return;

      if (e.key === 'Enter' && isEditing) {
        e.preventDefault();
        // Simulate Tab press
        const nextInput = document.querySelector(`input[type="text"]:not(:focus)`);
        if (nextInput instanceof HTMLElement) {
          nextInput.focus();
        } else {
          handleSave();
        }
      } else if (e.key === 'Escape' && isEditing) {
        setEditContent(item.content);
        setIsEditing(false);
      } else if (e.key === 'Delete' && isHovered && !isEditing && item.id) {
        onDelete(item.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, isHovered, item.content, item.id, isEditable, onDelete]);

  const handleEdit = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editContent.trim() !== '') {
      onUpdate({
        ...item,
        content: editContent,
      });
      setIsEditing(false);
    }
  };

  const handleToggleComplete = () => {
    onUpdate({
      ...item,
      completed: !item.completed,
    });
  };

  const handlePriorityChange = (newPriority: Priority) => {
    onUpdate({
      ...item,
      priority: newPriority,
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl
                ${item.completed ? 'bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/60 dark:to-green-800/60 border border-green-200 dark:border-green-900' : 'bg-white/60 dark:bg-slate-800/60 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/50 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700'}
                transition-all duration-200 ease-in-out transform`}
    >
      <div className='flex items-center justify-center'>
        <input
          type='checkbox'
          checked={item.completed}
          onChange={handleToggleComplete}
          className={`w-5 h-5 rounded-full border-2 
                        transition-all duration-200 ease-in-out cursor-pointer
                        ${item.completed ? 'border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-500 hover:border-green-600 dark:hover:border-green-500' : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400'}
                        focus:ring-2 focus:ring-offset-2 
                        ${item.completed ? 'focus:ring-green-500 dark:focus:ring-green-400' : 'focus:ring-blue-500 dark:focus:ring-blue-400'}
                        mr-4`}
        />
      </div>

      <div className='flex-1 flex items-center space-x-4'>
        {isEditing ? (
          <input
            ref={inputRef}
            type='text'
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSave}
            className='flex-1 p-2 bg-transparent border-b-2 border-blue-500 dark:border-blue-400
                        focus:outline-none focus:border-blue-700 dark:focus:border-blue-300
                        transition-all duration-200 ease-in-out
                        text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500'
            autoFocus
            placeholder='What needs to be done?'
          />
        ) : (
          <>
            <div
              onClick={handleEdit}
              className={`flex-1 py-1 px-2 -ml-2 rounded
                        ${item.completed ? 'line-through text-slate-400 dark:text-slate-200' : 'text-slate-700 dark:text-slate-200'} 
                        ${isEditable ? 'hover:bg-white/50 dark:hover:bg-slate-700/50 cursor-pointer' : ''}
                        transition-all duration-200 ease-in-out`}
            >
              {item.content}
            </div>
            {isEditable ? <div className='flex items-center gap-2'>{isHovered ? <PrioritySelector value={item.priority} onChange={handlePriorityChange} className='w-32' /> : <PriorityIndicator priority={item.priority} />}</div> : <PriorityIndicator priority={item.priority} />}
          </>
        )}
      </div>

      {isEditable && (
        <div
          className={`flex items-center space-x-1 transition-all duration-200 
                    ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
        >
          {!isEditing && (
            <button
              onClick={handleEdit}
              className='p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg
                                hover:bg-blue-50/50 dark:hover:bg-blue-900/50 transition-all duration-200'
              title='Edit (double click)'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
              </svg>
            </button>
          )}
          {item.id && (
            <button
              onClick={() => onDelete(item.id!)}
              className='p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg
                                hover:bg-red-50/50 dark:hover:bg-red-900/50 transition-all duration-200'
              title='Delete (Del)'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
