import { supabase } from './supabase';
import { TodoList, TodoItem } from '../types/todo';

export const supabaseService = {
  // Create a new todo list
  async createTodoList(items: TodoItem[], expirationHours: number): Promise<{ id: string; editToken: string }> {
    const editToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();

    const { data: todoList, error: todoListError } = await supabase
      .from('todo_lists')
      .insert({
        edit_token: editToken,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (todoListError) throw todoListError;
    if (!todoList) throw new Error('Failed to create todo list');

    const todoItems = items.map((item, index) => ({
      todo_list_id: todoList.id,
      content: item.content,
      completed: item.completed,
      order: index,
    }));

    const { error: itemsError } = await supabase.from('todo_items').insert(todoItems);

    if (itemsError) throw itemsError;

    return {
      id: todoList.id,
      editToken: editToken,
    };
  },

  // Get a todo list by ID
  async getTodoList(id: string): Promise<TodoList> {
    const { data: todoList, error: todoListError } = await supabase.from('todo_lists').select('*').eq('id', id).single();

    if (todoListError) throw todoListError;
    if (!todoList) throw new Error('Todo list not found');

    const { data: items, error: itemsError } = await supabase.from('todo_items').select('*').eq('todo_list_id', id).order('order');

    if (itemsError) throw itemsError;

    return {
      id: todoList.id,
      created_at: todoList.created_at,
      expires_at: todoList.expires_at,
      items: items.map((item: TodoItem) => ({
        id: item.id,
        content: item.content,
        completed: item.completed,
        order: item.order,
        created_at: item.created_at,
        completed_at: item.completed_at,
      })),
    };
  },

  // Update a todo list
  async updateTodoList(id: string, editToken: string, items: TodoItem[]): Promise<void> {
    // Verify edit token
    const { data: todoList, error: verifyError } = await supabase.from('todo_lists').select('id').eq('id', id).eq('edit_token', editToken).single();

    if (verifyError || !todoList) throw new Error('Invalid edit token');

    // Delete existing items
    const { error: deleteError } = await supabase.from('todo_items').delete().eq('todo_list_id', id);

    if (deleteError) throw deleteError;

    // Insert new items
    const todoItems = items.map((item, index) => ({
      todo_list_id: id,
      content: item.content,
      completed: item.completed,
      order: index,
      completed_at: item.completed ? new Date().toISOString() : null,
    }));

    const { error: insertError } = await supabase.from('todo_items').insert(todoItems);

    if (insertError) throw insertError;
  },

  // Subscribe to todo list changes
  subscribeToTodoList(id: string, callback: (todoList: TodoList) => void): () => void {
    const channel = supabase
      .channel(`todo_list_${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todo_items',
          filter: `todo_list_id=eq.${id}`,
        },
        async () => {
          try {
            const todoList = await this.getTodoList(id);
            callback(todoList);
          } catch (error) {
            console.error('Error fetching updated todo list:', error);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  },
};
