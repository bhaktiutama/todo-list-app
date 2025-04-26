import { CreateTodoListRequest, CreateTodoListResponse, TodoList, UpdateTodoListRequest, ViewStatus, LikeStatus } from '../types/todo';

export interface TodoApiService {
  createTodoList(request: CreateTodoListRequest): Promise<CreateTodoListResponse>;
  getTodoList(id: string): Promise<TodoList>;
  updateTodoList(id: string, editToken: string, request: UpdateTodoListRequest): Promise<TodoList>;
  duplicateTodoList(id: string): Promise<CreateTodoListResponse>;
  recordView(id: string, fingerprint: string): Promise<void>;
  toggleLike(id: string, fingerprint: string): Promise<LikeStatus>;
  checkViewStatus(id: string, fingerprint: string): Promise<ViewStatus>;
  checkLikeStatus(id: string, fingerprint: string): Promise<LikeStatus>;
}
