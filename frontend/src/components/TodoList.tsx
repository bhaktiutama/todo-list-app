import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TodoItem as TodoItemComponent } from './TodoItem';
import { TodoItem as TodoItemType, TodoList as TodoListType } from '../types/todo';
import { useWebSocket } from '../hooks/useWebSocket';

interface TodoListProps {
    todoList: TodoListType;
    clientId: string;
    canEdit: boolean;
    onUpdate: (todoList: TodoListType) => void;
}

export function TodoList({ todoList: initialTodoList, clientId, canEdit, onUpdate }: TodoListProps) {
    const [todoList, setTodoList] = useState<TodoListType>(initialTodoList);
    const [isPolling, setIsPolling] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const isWebSocketEnabled = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';

    // Calculate completion stats
    const totalItems = todoList.items.length;
    const completedItems = todoList.items.filter(item => item.completed).length;
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Setup WebSocket or polling based on configuration
    const { isConnected } = useWebSocket({
        todoId: todoList.id,
        onUpdate: (updatedTodoList) => {
            setTodoList(updatedTodoList);
            setIsSyncing(false);
        },
    });

    // Polling when WebSocket is disabled
    useEffect(() => {
        if (isWebSocketEnabled) {
            setIsPolling(false);
            return;
        }

        setIsPolling(true);
        console.log('Starting polling (WebSocket disabled)');
        
        const pollInterval = setInterval(async () => {
            try {
                setIsSyncing(true);
                const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/todos/${todoList.id}`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTodoList(data);
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
    }, [isWebSocketEnabled, todoList.id]);

    const handleDragEnd = async (result: any) => {
        if (!result.destination || !canEdit) return;

        const items = Array.from(todoList.items);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order numbers
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index,
        }));

        const updatedTodoList = {
            ...todoList,
            items: updatedItems,
        };

        setIsSyncing(true);
        setTodoList(updatedTodoList);
        onUpdate(updatedTodoList);
    };

    const handleItemUpdate = async (updatedItem: TodoItemType) => {
        if (!canEdit) return;

        const updatedItems = todoList.items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );

        const updatedTodoList = {
            ...todoList,
            items: updatedItems,
        };

        setIsSyncing(true);
        setTodoList(updatedTodoList);
        onUpdate(updatedTodoList);
    };

    const handleAddItem = async () => {
        if (!canEdit) return;

        const newItem: TodoItemType = {
            id: Math.random().toString(36).substr(2, 9),
            content: '',
            completed: false,
            order: todoList.items.length,
            created_at: new Date().toISOString(),
        };

        const updatedTodoList = {
            ...todoList,
            items: [...todoList.items, newItem],
        };

        setIsSyncing(true);
        setTodoList(updatedTodoList);
        onUpdate(updatedTodoList);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!canEdit) return;

        const updatedItems = todoList.items
            .filter(item => item.id !== itemId)
            .map((item, index) => ({
                ...item,
                order: index,
            }));

        const updatedTodoList = {
            ...todoList,
            items: updatedItems,
        };

        setIsSyncing(true);
        setTodoList(updatedTodoList);
        onUpdate(updatedTodoList);
    };

    return (
        <div className="space-y-6 p-6 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Your Tasks
                        </h2>
                        <p className="text-sm text-gray-500">
                            {totalItems === 0 ? 'No tasks yet' : `${completedItems} of ${totalItems} completed`}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {isSyncing && (
                            <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm font-medium">Syncing</span>
                            </div>
                        )}
                        {isPolling && !isSyncing && (
                            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full flex items-center">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                                <span className="text-sm font-medium">Auto-saving</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-4">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                                Task Progress
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                                {Math.round(completionPercentage)}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-blue-50">
                        <div
                            style={{ width: `${completionPercentage}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                        ></div>
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable 
                    droppableId="todo-list" 
                    isDropDisabled={!canEdit}
                    isCombineEnabled={false}
                    ignoreContainerClipping={false}
                >
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-3 min-h-[300px] rounded-xl p-6 transition-all duration-200
                                ${snapshot.isDraggingOver 
                                    ? 'bg-gradient-to-br from-blue-50/50 to-blue-100/50 border-2 border-blue-200 shadow-inner' 
                                    : 'bg-white/50 backdrop-blur-sm border border-gray-100'}`}
                        >
                            {todoList.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25"></div>
                                        <div className="relative bg-white rounded-lg p-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="text-xl font-medium text-gray-700">No tasks yet</p>
                                            {canEdit && (
                                                <p className="text-sm text-gray-500 mt-2">Start by adding your first task below</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                todoList.items
                                    .sort((a, b) => a.order - b.order)
                                    .map((item, index) => (
                                        <Draggable
                                            key={item.id}
                                            draggableId={item.id}
                                            index={index}
                                            isDragDisabled={!canEdit}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <TodoItemComponent
                                                        item={item}
                                                        index={index}
                                                        isEditable={canEdit}
                                                        onToggleComplete={(id) => {
                                                            const updatedItem = todoList.items.find(item => item.id === id);
                                                            if (updatedItem) {
                                                                handleItemUpdate({
                                                                    ...updatedItem,
                                                                    completed: !updatedItem.completed
                                                                });
                                                            }
                                                        }}
                                                        onEdit={(id, content) => {
                                                            const updatedItem = todoList.items.find(item => item.id === id);
                                                            if (updatedItem) {
                                                                handleItemUpdate({
                                                                    ...updatedItem,
                                                                    content
                                                                });
                                                            }
                                                        }}
                                                        onDelete={handleDeleteItem}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {canEdit && (
                <button
                    onClick={handleAddItem}
                    className="group w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                        text-white rounded-xl shadow-lg hover:shadow-blue-500/25
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        transform transition-all duration-200 hover:scale-[1.01] active:scale-100
                        flex items-center justify-center space-x-2"
                >
                    <span className="absolute w-max bg-blue-700/50 backdrop-blur-sm text-white text-sm py-1 px-2 rounded-lg
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-y-10 group-hover:-translate-y-12">
                        Press 'N' to add new task
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Add New Task</span>
                </button>
            )}
        </div>
    );
} 