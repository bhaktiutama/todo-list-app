import { TodoApiService } from './types';
import { SupabaseTodoApi } from './supabase-api';

// Langsung gunakan Supabase sebagai backend
export const todoApi = new SupabaseTodoApi();
