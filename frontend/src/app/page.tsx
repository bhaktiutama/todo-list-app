'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TodoItem, CreateTodoListRequest } from '../types/todo';
import { todoApi } from '../services/api';

export default function Home() {
    const router = useRouter();
    const [items, setItems] = useState<Omit<TodoItem, 'id' | 'created_at' | 'completed_at'>[]>([
        { content: '', completed: false, order: 0 },
    ]);
    const [expirationHours, setExpirationHours] = useState<number>(24);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddItem = () => {
        setItems([
            ...items,
            { content: '', completed: false, order: items.length },
        ]);
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

    const handleToggleComplete = (index: number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], completed: !newItems[index].completed };
        setItems(newItems);
    };

    const handleCreateTodoList = async () => {
        // Validate at least one item has content
        if (!items.some(item => item.content.trim())) {
            setError('Please add at least one task');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const request: CreateTodoListRequest = {
                expiration_hours: expirationHours,
                items: items.filter(item => item.content.trim()),
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
        <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
            <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
                <h1 className="text-3xl font-bold text-center mb-8">Create a Shareable Todo List</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Expiration Time</label>
                    <select
                        value={expirationHours}
                        onChange={(e) => setExpirationHours(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={1}>1 hour</option>
                        <option value={24}>1 day</option>
                        <option value={168}>1 week</option>
                    </select>
                </div>
                
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Tasks</label>
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => handleToggleComplete(index)}
                                className="mr-2"
                            />
                            <input
                                type="text"
                                value={item.content}
                                onChange={(e) => handleItemChange(index, e.target.value)}
                                placeholder="Enter a task..."
                                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => handleRemoveItem(index)}
                                className="ml-2 text-red-500"
                                disabled={items.length <= 1}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                    
                    <button
                        onClick={handleAddItem}
                        className="w-full mt-2 p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        + Add Task
                    </button>
                </div>
                
                <button
                    onClick={handleCreateTodoList}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Creating...' : 'Create Todo List'}
                </button>
            </div>
        </main>
    );
} 