import { CreateTodoListRequest, CreateTodoListResponse, TodoList, UpdateTodoListRequest, ViewStatus, LikeStatus } from '../types/todo';

export interface TimelineOptions {
  cursor?: string; // Timestamp of last item for cursor-based pagination
  limit?: number;
  tags?: string[];
  search?: string;
}

export interface TimelineResponse {
  data: TodoList[];
  nextCursor?: string; // Next cursor for fetching more data
  hasMore: boolean;
  total: number;
}

export interface TodoApiService {
  createTodoList(request: CreateTodoListRequest): Promise<CreateTodoListResponse>;
  getTodoList(id: string): Promise<TodoList>;
  updateTodoList(id: string, editToken: string, request: UpdateTodoListRequest): Promise<TodoList>;
  duplicateTodoList(id: string): Promise<CreateTodoListResponse>;
  recordView(id: string, fingerprint: string): Promise<void>;
  toggleLike(id: string, fingerprint: string): Promise<LikeStatus>;
  checkViewStatus(id: string, fingerprint: string): Promise<ViewStatus>;
  checkLikeStatus(id: string, fingerprint: string): Promise<LikeStatus>;

  // New methods for timeline and trending
  getTimelineTodoLists(options?: TimelineOptions): Promise<TimelineResponse>;
  getTrendingTags(limit?: number): Promise<string[]>;
}
