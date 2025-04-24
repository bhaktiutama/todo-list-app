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
      const { data: insertedItems, error: itemsError } = await supabase
        .from('todo_items')
        .insert(
          request.items.map((item) => ({
            todo_list_id: todoList.id,
            content: item.content,
            completed: item.completed,
            order: item.order,
            priority: item.priority || 'medium',
          }))
        )
        .select();

      if (itemsError) throw new Error('Failed to create todo items');

      // Add tags if provided
      if (request.tags && request.tags.length > 0) {
        const { error: tagError } = await supabase.rpc('manage_todolist_tags', {
          p_todolist_id: todoList.id,
          p_tag_names: request.tags.map((tag) => tag.name),
        });

        if (tagError) {
          console.error('Tag creation error:', tagError);
          throw new Error('Failed to add tags to todo list');
        }
      }

      return {
        id: todoList.id,
        edit_token: todoList.edit_token,
        todo_list: {
          id: todoList.id,
          created_at: todoList.created_at,
          expires_at: todoList.expires_at,
          items: insertedItems || [],
          tags: [], // Tags will be fetched in the next request
        },
      };
    }

    return {
      id: todoList.id,
      edit_token: todoList.edit_token,
      todo_list: {
        id: todoList.id,
        created_at: todoList.created_at,
        expires_at: todoList.expires_at,
        items: [],
        tags: [], // Tags will be fetched in the next request
      },
    };
  }

  async getTodoList(id: string): Promise<TodoList> {
    // Get todo list with its tags
    const { data: todoList, error: todoListError } = await supabase
      .from('todo_lists')
      .select(
        `
        *,
        tags:todolist_tags(
          tag:tags(*)
        )
      `
      )
      .eq('id', id)
      .single();

    if (todoListError || !todoList) throw new Error('Failed to get todo list');

    // Get items
    const { data: items, error: itemsError } = await supabase.from('todo_items').select('*').eq('todo_list_id', id).order('order', { ascending: true });

    if (itemsError) throw new Error('Failed to get todo items');

    // Transform the todo list to match the expected format
    return {
      id: todoList.id,
      created_at: todoList.created_at,
      expires_at: todoList.expires_at,
      items: items || [],
      tags: todoList.tags?.map((t: any) => t.tag) || [],
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
            priority: item.priority || 'medium',
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
            priority: item.priority || 'medium',
          }))
        );

        if (error) {
          console.error('Insert error:', error);
          throw new Error('Failed to create items');
        }
      }
    }

    // Update tags if provided
    if (request.tags !== undefined) {
      const { error: tagError } = await supabase.rpc('manage_todolist_tags', {
        p_todolist_id: id,
        p_tag_names: request.tags,
      });

      if (tagError) {
        console.error('Tag update error:', tagError);
        throw new Error('Failed to update tags');
      }
    }

    // Return updated todo list
    return this.getTodoList(id);
  }

  async duplicateTodoList(id: string): Promise<CreateTodoListResponse> {
    // Get original todolist first to copy its data
    const originalList = await this.getTodoList(id);

    // Create new todolist with 24 hours expiration
    return this.createTodoList({
      expiration_hours: 24, // Always set to 24 hours
      items: originalList.items.map((item) => ({
        content: item.content,
        completed: false, // Set all items as uncompleted
        order: item.order,
        priority: item.priority,
      })),
      tags: originalList.tags,
    });
  }
}
