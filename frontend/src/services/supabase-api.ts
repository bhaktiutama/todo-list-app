import { CreateTodoListRequest, CreateTodoListResponse, TodoList, UpdateTodoListRequest, ViewStatus, LikeStatus } from '../types/todo';
import { TodoApiService, TimelineOptions, TimelineResponse } from './types';
import { supabase } from '../lib/supabase';

export class SupabaseTodoApi implements TodoApiService {
  async createTodoList(request: CreateTodoListRequest): Promise<CreateTodoListResponse> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + request.expiration_hours);

      const { data: todoList, error } = await supabase
        .from('todo_lists')
        .insert({
          title: request.title,
          expires_at: expiresAt.toISOString(),
          edit_token: request.edit_token || Math.random().toString(36).substring(2, 15),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create todo list:', error);
        throw new Error(`Failed to create todo list: ${error.message}`);
      }
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

        if (itemsError) {
          console.error('Failed to create todo items:', itemsError);
          throw new Error(`Failed to create todo items: ${itemsError.message}`);
        }

        // Add tags if provided
        if (request.tags && request.tags.length > 0) {
          const { error: tagError } = await supabase.rpc('manage_todolist_tags', {
            p_todolist_id: todoList.id,
            p_tag_names: request.tags.map((tag) => tag.name),
          });

          if (tagError) {
            console.error('Tag creation error:', tagError);
            throw new Error(`Failed to add tags to todo list: ${tagError.message}`);
          }
        }

        return {
          id: todoList.id,
          edit_token: todoList.edit_token,
          todo_list: {
            id: todoList.id,
            title: todoList.title,
            created_at: todoList.created_at,
            expires_at: todoList.expires_at,
            items: insertedItems || [],
            tags: [], // Tags will be fetched in the next request
            view_count: 0,
            like_count: 0,
          },
        };
      }

      return {
        id: todoList.id,
        edit_token: todoList.edit_token,
        todo_list: {
          id: todoList.id,
          title: todoList.title,
          created_at: todoList.created_at,
          expires_at: todoList.expires_at,
          items: [],
          tags: [], // Tags will be fetched in the next request
          view_count: 0,
          like_count: 0,
        },
      };
    } catch (error) {
      console.error('Error in createTodoList:', error);
      throw error;
    }
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
      title: todoList.title,
      created_at: todoList.created_at,
      expires_at: todoList.expires_at,
      items: items || [],
      tags: todoList.tags?.map((t: any) => t.tag) || [],
      view_count: todoList.view_count || 0,
      like_count: todoList.like_count || 0,
    };
  }

  async updateTodoList(id: string, editToken: string, request: UpdateTodoListRequest): Promise<TodoList> {
    console.log('Updating todo list:', { id, editToken, request });

    // Verify edit token
    const { data: todoList, error: verifyError } = await supabase.from('todo_lists').select().eq('id', id).eq('edit_token', editToken).single();

    if (verifyError || !todoList) throw new Error('Invalid edit token');

    // Update title if provided
    if (request.title !== undefined) {
      const { error: titleError } = await supabase.from('todo_lists').update({ title: request.title }).eq('id', id);

      if (titleError) {
        console.error('Title update error:', titleError);
        throw new Error('Failed to update title');
      }
    }

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
      title: `Copy of ${originalList.title}`,
      expiration_hours: 24, // Always set to 24 hours
      items: originalList.items.map((item) => ({
        content: item.content,
        completed: false, // Set all items as uncompleted
        order: item.order,
        priority: item.priority,
      })),
      tags: originalList.tags?.map((tag) => ({ name: tag.name })),
    });
  }

  async recordView(id: string, fingerprint: string): Promise<void> {
    try {
      const { error } = await supabase.from('todo_list_views').insert({
        todo_list_id: id,
        fingerprint: fingerprint,
      });

      if (error && error.code !== '23505') {
        // Ignore unique constraint violations
        throw error;
      }
    } catch (error) {
      console.error('Failed to record view:', error);
      throw new Error('Failed to record view');
    }
  }

  async toggleLike(id: string, fingerprint: string): Promise<LikeStatus> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase.from('todo_list_likes').select().eq('todo_list_id', id).eq('fingerprint', fingerprint).single();

      if (existingLike) {
        // Unlike: Remove the like
        const { error: deleteError } = await supabase.from('todo_list_likes').delete().eq('todo_list_id', id).eq('fingerprint', fingerprint);

        if (deleteError) throw deleteError;
      } else {
        // Like: Add new like
        const { error: insertError } = await supabase.from('todo_list_likes').insert({
          todo_list_id: id,
          fingerprint: fingerprint,
        });

        if (insertError) throw insertError;
      }

      // Get updated status
      const { data: todoList } = await supabase.from('todo_lists').select('like_count').eq('id', id).single();

      return {
        isLiked: !existingLike,
        likeCount: todoList?.like_count || 0,
      };
    } catch (error) {
      console.error('Failed to toggle like:', error);
      throw new Error('Failed to toggle like');
    }
  }

  async checkViewStatus(id: string, fingerprint: string): Promise<ViewStatus> {
    try {
      const [viewResult, todoListResult] = await Promise.all([supabase.from('todo_list_views').select().eq('todo_list_id', id).eq('fingerprint', fingerprint).single(), supabase.from('todo_lists').select('view_count').eq('id', id).single()]);

      return {
        hasViewed: !!viewResult.data,
        viewCount: todoListResult.data?.view_count || 0,
      };
    } catch (error) {
      console.error('Failed to check view status:', error);
      throw new Error('Failed to check view status');
    }
  }

  async checkLikeStatus(id: string, fingerprint: string): Promise<LikeStatus> {
    try {
      const [likeResult, todoListResult] = await Promise.all([supabase.from('todo_list_likes').select().eq('todo_list_id', id).eq('fingerprint', fingerprint).single(), supabase.from('todo_lists').select('like_count').eq('id', id).single()]);

      return {
        isLiked: !!likeResult.data,
        likeCount: todoListResult.data?.like_count || 0,
      };
    } catch (error) {
      console.error('Failed to check like status:', error);
      throw new Error('Failed to check like status');
    }
  }

  async getTimelineTodoLists(options: TimelineOptions = {}): Promise<TimelineResponse> {
    const { cursor, limit = 10, tags = [], search = '' } = options;

    let query = supabase
      .from('todo_lists')
      .select(
        `
        *,
        items:todo_items(
          id,
          content,
          completed,
          order,
          priority
        ),
        tags:todolist_tags(
          tag:tags(*)
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(limit + 1); // Get one extra to determine if there are more items

    // Apply cursor if provided
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    // Apply tag filter if provided
    if (tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,items.content.ilike.%${search}%`);
    }

    const { data: todoLists, error, count } = await query;

    if (error) throw new Error('Failed to get timeline todo lists');

    // Remove the extra item we fetched to check for more
    const hasMore = todoLists && todoLists.length > limit;
    const items = todoLists ? todoLists.slice(0, limit) : [];

    // Transform the todo lists to match the expected format
    const transformedLists = items.map((list: any) => ({
      id: list.id,
      title: list.title,
      created_at: list.created_at,
      expires_at: list.expires_at,
      items: list.items || [],
      tags: list.tags?.map((t: any) => t.tag) || [],
      view_count: list.view_count || 0,
      like_count: list.like_count || 0,
    }));

    // Get the cursor for the next page
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].created_at : undefined;

    return {
      data: transformedLists,
      nextCursor,
      hasMore,
      total: count || 0,
    };
  }

  async getTrendingTags(limit: number = 10): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_trending_tags', { p_limit: limit });

    if (error) {
      console.error('Failed to get trending tags:', error);
      throw new Error(`Failed to get trending tags: ${error.message}`);
    }

    // Transform the data to just return the tag names
    return (data || []).map((tag: { name: string; usage_count: number }) => tag.name);
  }
}
