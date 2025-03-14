export interface TodoItem {
    id: string;
    content: string;
    completed: boolean;
    order: number;
    created_at: string;
    completed_at?: string;
}

export interface TodoList {
    id: string;
    items: TodoItem[];
    created_at: string;
    expires_at: string;
}

export interface CreateTodoListRequest {
    expiration_hours: number;
    items: Omit<TodoItem, 'id' | 'created_at' | 'completed_at'>[];
}

export interface UpdateTodoListRequest {
    items: TodoItem[];
}

export interface CreateTodoListResponse {
    id: string;
    edit_token: string;
    todo_list: TodoList;
}

export interface WebSocketMessage {
    type: 'update' | 'connected';
    todo_id: string;
    client_id: string;
    data: TodoList | { status: string };
} 