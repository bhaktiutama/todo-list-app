import React, { useEffect, useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TodoItem as TodoItemType } from '../types/todo';

interface TodoItemProps {
    item: TodoItemType;
    index: number;
    onToggleComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, content: string) => void;
    isEditable: boolean;
}

export function TodoItem({
    item,
    index,
    onToggleComplete,
    onDelete,
    onEdit,
    isEditable
}: TodoItemProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editContent, setEditContent] = React.useState(item.content);
    const [isHovered, setIsHovered] = React.useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isEditable) return;
            
            if (e.key === 'Enter' && isEditing) {
                handleSave();
            } else if (e.key === 'Escape' && isEditing) {
                setEditContent(item.content);
                setIsEditing(false);
            } else if (e.key === 'Delete' && isHovered && !isEditing) {
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
            onEdit(item.id, editContent);
            setIsEditing(false);
        }
    };

    return (
        <Draggable draggableId={item.id} index={index} isDragDisabled={!isEditable}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`group relative flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl
                        ${snapshot.isDragging 
                            ? 'shadow-lg scale-[1.02] ring-2 ring-blue-500 ring-opacity-50' 
                            : 'shadow-sm hover:shadow-md'
                        }
                        ${item.completed 
                            ? 'bg-gradient-to-r from-green-50/80 to-green-100/80 border border-green-200' 
                            : 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/50 border border-gray-100 hover:border-blue-200'
                        }
                        transition-all duration-200 ease-in-out transform
                        ${isEditable ? 'cursor-grab active:cursor-grabbing' : ''}
                        ${snapshot.isDragging ? 'rotate-1' : ''}`}
                    style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.02)` : provided.draggableProps.style?.transform,
                    }}
                >
                    {/* Drag Handle Indicator */}
                    {isEditable && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-gradient-to-b from-gray-200 to-gray-300
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-2`} />
                    )}

                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => onToggleComplete(item.id)}
                            className={`w-5 h-5 rounded-full border-2 
                                transition-all duration-200 ease-in-out cursor-pointer
                                ${item.completed
                                    ? 'border-green-500 bg-green-500 hover:bg-green-600 hover:border-green-600'
                                    : 'border-gray-300 hover:border-blue-500'
                                }
                                focus:ring-2 focus:ring-offset-2 
                                ${item.completed ? 'focus:ring-green-500' : 'focus:ring-blue-500'}
                                mr-4`}
                        />
                    </div>
                    
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onBlur={handleSave}
                            className="flex-1 p-2 bg-transparent border-b-2 border-blue-500 
                                focus:outline-none focus:border-blue-700
                                transition-all duration-200 ease-in-out
                                text-gray-700 placeholder-gray-400"
                            autoFocus
                            placeholder="What needs to be done?"
                        />
                    ) : (
                        <div
                            onClick={handleEdit}
                            className={`flex-1 py-1 px-2 -ml-2 rounded
                                ${item.completed 
                                    ? 'line-through text-gray-400' 
                                    : 'text-gray-700'
                                } 
                                ${isEditable ? 'hover:bg-white/50 cursor-pointer' : ''}
                                transition-all duration-200 ease-in-out`}
                        >
                            {item.content}
                        </div>
                    )}

                    {isEditable && (
                        <div className={`flex items-center space-x-1 transition-all duration-200 
                            ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                            {!isEditing && (
                                <button
                                    onClick={handleEdit}
                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg
                                        hover:bg-blue-50/50 transition-all duration-200"
                                    title="Edit (double click)"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg
                                    hover:bg-red-50/50 transition-all duration-200"
                                title="Delete (Del)"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Completion indicator */}
                    {item.completed && (
                        <div className="absolute right-0 top-0 -mt-2 -mr-2">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-green-500 rounded-full blur opacity-30"></div>
                                <div className="relative bg-white text-green-500 rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
} 