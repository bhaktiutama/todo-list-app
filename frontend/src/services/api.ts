import { TodoApiService } from './types';
import { GoTodoApi } from './go-api';
import { SupabaseTodoApi } from './supabase-api';

const BACKEND_PROVIDER = process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'go';

function createTodoApi(): TodoApiService {
  switch (BACKEND_PROVIDER) {
    case 'supabase':
      return new SupabaseTodoApi();
    case 'go':
    default:
      return new GoTodoApi();
  }
}

export const todoApi = createTodoApi();
