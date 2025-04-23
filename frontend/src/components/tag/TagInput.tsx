import React, { useState, useRef, useEffect } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState(80); // Default min width
  const MAX_TAGS = 4; // Maximum number of tags allowed

  // Calculate input width based on content
  useEffect(() => {
    const calculateWidth = () => {
      const placeholderText = tags.length === 0 ? placeholder || 'Add tag' : '';
      const textToMeasure = input || placeholderText;

      // Approximate width calculation based on character count
      // This value is approximate and can be adjusted
      const calculatedWidth = Math.max(80, textToMeasure.length * 8 + 10);
      setInputWidth(calculatedWidth);
    };

    calculateWidth();
  }, [input, tags.length, placeholder]);

  const handleAddTag = (newTag: string) => {
    if (newTag && !tags.includes(newTag) && tags.length < MAX_TAGS) {
      onChange([...tags, newTag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
    // Fokus kembali ke input setelah hapus tag
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if input contains comma, and add tags if it does
    if (value.includes(',')) {
      const parts = value.split(',');

      // Process all parts except the last one (which might be incomplete)
      for (let i = 0; i < parts.length - 1; i++) {
        const newTag = parts[i].trim();
        if (newTag) {
          handleAddTag(newTag);
        }
      }

      // Keep only the part after the last comma in the input
      setInput(parts[parts.length - 1]);
    } else {
      setInput(value);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === ' ' || e.key === 'Enter') && input.trim()) {
      e.preventDefault();
      handleAddTag(input.trim());
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Hapus tag terakhir jika input kosong dan tekan backspace
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className={`flex flex-wrap flex-1 min-w-[180px] items-center gap-x-2 gap-y-1 rounded px-0 py-0 transition-colors duration-200
        ${tags.length > 0 ? 'border-none bg-transparent' : 'border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}
    >
      {tags.map((tag) => (
        <span key={tag} className='flex items-center bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium border border-blue-500 dark:bg-blue-600 dark:text-white dark:border-blue-600 h-6'>
          <span className='mr-1'>#{tag}</span>
          <button type='button' className='ml-1 text-white hover:text-red-200 focus:outline-none dark:text-white dark:hover:text-red-300' onClick={() => handleRemoveTag(tag)} aria-label={`Remove tag ${tag}`}>
            ×
          </button>
        </span>
      ))}
      {tags.length < MAX_TAGS ? (
        <div className='relative flex-grow'>
          <span className='absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none'>
            {/* fa-tag icon */}
            <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 20 20' stroke='currentColor' strokeWidth={2}>
              <path d='M17.707 10.293l-7-7A1 1 0 009.586 3H4a1 1 0 00-1 1v5.586a1 1 0 00.293.707l7 7a1 1 0 001.414 0l6-6a1 1 0 000-1.414z' />
              <circle cx='6.5' cy='6.5' r='1.5' />
            </svg>
          </span>
          <input
            ref={inputRef}
            type='text'
            className='w-full bg-transparent outline-none border-none text-sm text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-500 h-9 py-1 pl-8 pr-2'
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder={tags.length === 0 ? placeholder || 'Add tag' : ''}
            style={{
              lineHeight: '1.5rem',
              ...(tags.length > 0 ? { width: `${inputWidth}px` } : {}),
            }}
          />
        </div>
      ) : (
        <span className='text-xs text-orange-500 dark:text-orange-400'>Max 4 tags</span>
      )}
    </div>
  );
};
