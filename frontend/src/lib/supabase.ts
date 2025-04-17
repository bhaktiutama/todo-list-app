import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      todo_lists: {
        Row: {
          id: string;
          created_at: string;
          expires_at: string;
          edit_token: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          expires_at: string;
          edit_token: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          expires_at?: string;
          edit_token?: string;
        };
      };
      todo_items: {
        Row: {
          id: string;
          todo_list_id: string;
          content: string;
          completed: boolean;
          order: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          todo_list_id: string;
          content: string;
          completed?: boolean;
          order: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          todo_list_id?: string;
          content?: string;
          completed?: boolean;
          order?: number;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
