import React from 'react';
import { TodoList } from '@/types/todo';
import { formatTimeLeft, formatRelativeTime } from '@/utils/dateUtils';

interface TodoListCardProps {
  todoList: TodoList;
  onClick?: () => void;
  className?: string;
}

export const TodoListCard: React.FC<TodoListCardProps> = ({ todoList, onClick, className = '' }) => {
  return (
    <div onClick={onClick} className={`space-y-6 p-6 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-900/40 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl transition hover:shadow-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}>
      <div className='flex flex-col gap-3'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent'>{todoList.title}</h3>
            <div className='flex flex-wrap gap-2 mt-2'>
              {todoList.tags?.map((tag) => (
                <span key={tag.id} className='px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'>
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <svg xmlns='http://www.w3.org/2000/svg' className={`h-4 w-4 ${new Date(todoList.expires_at) <= new Date() ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`} viewBox='0 0 20 20' fill='currentColor'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
            </svg>
            <span className={`text-xs font-medium ${new Date(todoList.expires_at) <= new Date() ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>{formatTimeLeft(todoList.expires_at)}</span>
          </div>
        </div>

        {/* Tasks List */}
        <div className='space-y-1'>
          {todoList.items.slice(0, 2).map((item) => (
            <div key={item.id} className='flex items-center gap-3 py-1'>
              <input type='checkbox' checked={item.completed} readOnly className='h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500/50 dark:focus:ring-blue-400/50' />
              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{item.content}</span>
              {item.priority && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium
                    ${item.priority === 'high' ? 'bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-300' : item.priority === 'medium' ? 'bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300' : 'bg-green-100/80 dark:bg-green-900/30 text-green-600 dark:text-green-300'}`}
                >
                  {item.priority}
                </span>
              )}
            </div>
          ))}
          {todoList.items.length > 2 && <div className='text-xs text-slate-400 dark:text-slate-500 italic pl-7 pt-0.5'>...and {todoList.items.length - 2} more tasks</div>}
        </div>

        {/* Footer Stats */}
        <div className='-mx-6 px-6 pt-3 border-t border-slate-200/50 dark:border-slate-700/50'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1 text-slate-500 dark:text-slate-400'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path d='M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z' />
              </svg>
              <span className='text-xs'>{todoList.like_count}</span>
            </div>
            <div className='flex items-center gap-1 text-slate-500 dark:text-slate-400'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                <path fillRule='evenodd' d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z' clipRule='evenodd' />
              </svg>
              <span className='text-xs'>{todoList.view_count}</span>
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-auto'>{formatRelativeTime(todoList.created_at)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
