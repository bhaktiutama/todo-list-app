import { CreateTodoListRequest, CreateTodoListResponse, TodoList, UpdateTodoListRequest } from '../types/todo';

export interface TodoApiService {
  createTodoList(request: CreateTodoListRequest): Promise<CreateTodoListResponse>;
  getTodoList(id: string): Promise<TodoList>;
  updateTodoList(id: string, editToken: string, request: UpdateTodoListRequest): Promise<TodoList>;
  duplicateTodoList(id: string): Promise<CreateTodoListResponse>;
}
