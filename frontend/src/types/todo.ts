import { Priority } from './priority';

export interface Tag {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TodoItem {
  id?: string;
  todo_list_id?: string;
  content: string;
  completed: boolean;
  order: number;
  created_at?: string;
  completed_at?: string | null;
  priority: Priority;
}

export interface TodoList {
  id: string;
  created_at: string;
  expires_at: string;
  edit_token?: string;
  items: TodoItem[];
  tags?: Tag[];
  view_count: number;
  like_count: number;
}

export interface TodoListView {
  id: string;
  todo_list_id: string;
  fingerprint: string;
  created_at: string;
}

export interface TodoListLike {
  id: string;
  todo_list_id: string;
  fingerprint: string;
  created_at: string;
}

export interface ViewStatus {
  hasViewed: boolean;
  viewCount: number;
}

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}

export interface CreateTodoListRequest {
  title: string;
  expiration_hours: number;
  edit_token?: string;
  items: Omit<TodoItem, 'id' | 'created_at' | 'completed_at'>[];
  tags?: { name: string }[];
}

export interface UpdateTodoListRequest {
  items?: TodoItem[];
  tags?: string[]; // Array of tag names
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
