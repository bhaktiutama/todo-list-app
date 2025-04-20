import React from 'react';

interface FilterTagProps {
  tags: string[];
  selectedTags: string[];
  onChange: (selected: string[]) => void;
}

export const FilterTag: React.FC<FilterTagProps> = ({ tags, selectedTags, onChange }) => {
  const handleToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className='flex flex-wrap gap-2'>
      {tags.map((tag) => (
        <button key={tag} type='button' className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTags.includes(tag) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'}`} onClick={() => handleToggle(tag)}>
          {tag}
        </button>
      ))}
    </div>
  );
};
