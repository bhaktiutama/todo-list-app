import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export interface Database {
  public: {
    Tables: {
      todo_lists: {
        Row: {
          id: string;
          created_at: string;
          expires_at: string;
          edit_token: string;
          title: string;
          view_count: number;
          like_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          expires_at: string;
          edit_token: string;
          title?: string;
          view_count?: number;
          like_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          expires_at?: string;
          edit_token?: string;
          title?: string;
          view_count?: number;
          like_count?: number;
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
      todo_list_views: {
        Row: {
          id: string;
          todo_list_id: string;
          fingerprint: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          todo_list_id: string;
          fingerprint: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          todo_list_id?: string;
          fingerprint?: string;
          created_at?: string;
        };
      };
      todo_list_likes: {
        Row: {
          id: string;
          todo_list_id: string;
          fingerprint: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          todo_list_id: string;
          fingerprint: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          todo_list_id?: string;
          fingerprint?: string;
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
      get_trending_tags: {
        Args: {
          p_limit: number;
        };
        Returns: { name: string; usage_count: number }[];
      };
      search_todo_lists: {
        Args: {
          p_search: string | null;
          p_tags: string[] | null;
          p_cursor: string | null;
          p_limit: number;
        };
        Returns: {
          id: string;
          title: string;
          created_at: string;
          expires_at: string;
          view_count: number;
          like_count: number;
          items: any[];
          tags: any[];
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
