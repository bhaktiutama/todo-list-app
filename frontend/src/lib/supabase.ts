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
          priority: string;
        };
        Insert: {
          id?: string;
          todo_list_id: string;
          content: string;
          completed?: boolean;
          order: number;
          created_at?: string;
          completed_at?: string | null;
          priority?: string;
        };
        Update: {
          id?: string;
          todo_list_id?: string;
          content?: string;
          completed?: boolean;
          order?: number;
          created_at?: string;
          completed_at?: string | null;
          priority?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          updated_at?: string;
        };
      };
      todolist_tags: {
        Row: {
          todolist_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          todolist_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          todolist_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      manage_todolist_tags: {
        Args: {
          p_todolist_id: string;
          p_tag_names: string[];
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
