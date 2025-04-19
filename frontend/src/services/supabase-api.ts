import { CreateTodoListRequest, CreateTodoListResponse, TodoList, UpdateTodoListRequest } from '../types/todo';
import { TodoApiService } from './types';
import { supabase } from '../lib/supabase';

export class SupabaseTodoApi implements TodoApiService {
  async createTodoList(request: CreateTodoListRequest): Promise<CreateTodoListResponse> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + request.expiration_hours);

    const { data: todoList, error } = await supabase
      .from('todo_lists')
      .insert({
        expires_at: expiresAt.toISOString(),
        edit_token: request.edit_token || Math.random().toString(36).substring(2, 15),
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create todo list');
    if (!todoList) throw new Error('No todo list created');

    // Create initial items if provided
    if (request.items && request.items.length > 0) {
      const { error: itemsError } = await supabase.from('todo_items').insert(
        request.items.map((item) => ({
          todo_list_id: todoList.id,
          content: item.content,
          completed: item.completed,
          order: item.order,
          priority: item.priority || 'medium', // Add default priority if not provided
        }))
      );

      if (itemsError) throw new Error('Failed to create todo items');
    }

    return {
      id: todoList.id,
      edit_token: todoList.edit_token,
      todo_list: {
        id: todoList.id,
        created_at: todoList.created_at,
        expires_at: todoList.expires_at,
        items: request.items || [],
      },
    };
  }

  async getTodoList(id: string): Promise<TodoList> {
    const { data: todoList, error: todoListError } = await supabase.from('todo_lists').select('*').eq('id', id).single();

    if (todoListError || !todoList) throw new Error('Failed to get todo list');

    const { data: items, error: itemsError } = await supabase.from('todo_items').select('*').eq('todo_list_id', id).order('order', { ascending: true });

    if (itemsError) throw new Error('Failed to get todo items');

    return {
      id: todoList.id,
      created_at: todoList.created_at,
      expires_at: todoList.expires_at,
      items: items || [],
    };
  }

  async updateTodoList(id: string, editToken: string, request: UpdateTodoListRequest): Promise<TodoList> {
    console.log('Updating todo list:', { id, editToken, request });

    // Verify edit token
    const { data: todoList, error: verifyError } = await supabase.from('todo_lists').select().eq('id', id).eq('edit_token', editToken).single();

    if (verifyError || !todoList) throw new Error('Invalid edit token');

    // Update items
    if (request.items) {
      // Get current items to compare
      const { data: currentItems } = await supabase.from('todo_items').select('id').eq('todo_list_id', id);

      console.log('Current items:', currentItems);

      // Separate items into existing (with valid UUID) and new items (with temp id)
      const existingItems = request.items.filter((item) => item.id && !item.id.startsWith('temp-'));
      const newItems = request.items.filter((item) => !item.id || item.id.startsWith('temp-'));

      console.log('Existing items:', existingItems);
      console.log('New items:', newItems);

      const existingItemIds = existingItems.map((item) => item.id).filter(Boolean) as string[];

      // Only delete if there are actually removed items
      if (currentItems && existingItemIds.length > 0) {
        const itemsToDelete = currentItems.filter((item) => !existingItemIds.includes(item.id)).map((item) => item.id);

        console.log('Items to delete:', itemsToDelete);

        if (itemsToDelete.length > 0) {
          const { error: deleteError } = await supabase.from('todo_items').delete().eq('todo_list_id', id).in('id', itemsToDelete);

          if (deleteError) {
            console.error('Delete error:', deleteError);
            throw new Error('Failed to delete items');
          }
        }
      }

      // Update existing items
      for (const item of existingItems) {
        if (!item.id) continue; // Skip if somehow no id

        console.log('Updating existing item:', item);

        const { error } = await supabase
          .from('todo_items')
          .update({
            content: item.content,
            completed: item.completed,
            order: item.order,
            completed_at: item.completed ? new Date().toISOString() : null,
            priority: item.priority || 'medium', // Add priority field with default
          })
          .eq('id', item.id);

        if (error) {
          console.error('Update error:', error);
          throw new Error('Failed to update item');
        }
      }

      // Insert new items
      if (newItems.length > 0) {
        console.log('Inserting new items:', newItems);

        const { error } = await supabase.from('todo_items').insert(
          newItems.map((item) => ({
            todo_list_id: id,
            content: item.content,
            completed: item.completed,
            order: item.order,
            priority: item.priority || 'medium', // Add priority field with default
          }))
        );

        if (error) {
          console.error('Insert error:', error);
          throw new Error('Failed to create items');
        }
      }
    }

    // Return updated todo list
    return this.getTodoList(id);
  }
}
