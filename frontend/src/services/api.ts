import { CreateTodoListRequest, CreateTodoListResponse, TodoList, UpdateTodoListRequest } from '../types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const todoApi = {
    async createTodoList(request: CreateTodoListRequest): Promise<CreateTodoListResponse> {
        const response = await fetch(`${API_BASE_URL}/api/v1/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error('Failed to create todo list');
        }

        return response.json();
    },

    async getTodoList(id: string): Promise<TodoList> {
        const response = await fetch(`${API_BASE_URL}/api/v1/todos/${id}`);

        if (!response.ok) {
            throw new Error('Failed to get todo list');
        }

        return response.json();
    },

    async updateTodoList(id: string, editToken: string, request: UpdateTodoListRequest): Promise<TodoList> {
        console.log('Updating todo list with token:', editToken);
        const response = await fetch(`${API_BASE_URL}/api/v1/todos/${id}?token=${editToken}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            console.error('Failed to update todo list:', response.status, response.statusText);
            throw new Error('Failed to update todo list');
        }

        return response.json();
    },
}; 