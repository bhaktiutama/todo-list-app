-- Add title column to todo_lists table
ALTER TABLE todo_lists
ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled List';

-- Add indexes to improve timeline query performance
CREATE INDEX idx_todo_lists_created_at ON todo_lists(created_at DESC);
CREATE INDEX idx_todo_lists_title_trgm ON todo_lists USING gin(title gin_trgm_ops);
CREATE INDEX idx_todo_items_content_trgm ON todo_items USING gin(content gin_trgm_ops);

-- Enable pg_trgm extension for better text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create materialized view for trending tags
CREATE MATERIALIZED VIEW trending_tags AS
SELECT 
    t.name,
    COUNT(*) as usage_count,
    MAX(tl.created_at) as last_used_at
FROM tags t
JOIN todolist_tags tt ON tt.tag_id = t.id
JOIN todo_lists tl ON tl.id = tt.todolist_id
WHERE tl.created_at > NOW() - INTERVAL '7 days'
GROUP BY t.name
ORDER BY usage_count DESC, last_used_at DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_trending_tags_name ON trending_tags(name);
CREATE INDEX idx_trending_tags_count ON trending_tags(usage_count DESC, last_used_at DESC);

-- Create function to refresh trending tags with SECURITY DEFINER
CREATE OR REPLACE FUNCTION refresh_trending_tags()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY trending_tags;
    RETURN NULL;
END;
$$;

-- Create function to get trending tags with SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_trending_tags(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (name TEXT, usage_count BIGINT)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT tt.name::TEXT, tt.usage_count::BIGINT
    FROM trending_tags tt
    ORDER BY tt.usage_count DESC, tt.last_used_at DESC
    LIMIT p_limit;
END;
$$;

-- Create trigger to refresh trending tags
CREATE TRIGGER refresh_trending_tags_trigger
AFTER INSERT OR DELETE OR UPDATE ON todolist_tags
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_trending_tags();

-- Grant necessary permissions
GRANT SELECT ON trending_tags TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_tags(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_trending_tags() TO authenticated;

-- Initial refresh of the materialized view
REFRESH MATERIALIZED VIEW trending_tags;

-- Function to search todo lists with pagination
CREATE OR REPLACE FUNCTION search_todo_lists(
    p_search TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_cursor TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER,
    like_count INTEGER,
    items JSON,
    tags JSON
) AS $$
DECLARE
    v_query TEXT;
BEGIN
    v_query := '
    WITH filtered_lists AS (
        SELECT DISTINCT tl.*
        FROM todo_lists tl
        LEFT JOIN todo_items ti ON ti.todo_list_id = tl.id
        LEFT JOIN todolist_tags tt ON tt.todolist_id = tl.id
        LEFT JOIN tags t ON t.id = tt.tag_id
        WHERE 1=1
    ';

    -- Add search condition if provided
    IF p_search IS NOT NULL AND p_search != '' THEN
        v_query := v_query || '
        AND (
            tl.title ILIKE ''%'' || $1 || ''%''
            OR EXISTS (
                SELECT 1 FROM todo_items 
                WHERE todo_list_id = tl.id 
                AND content ILIKE ''%'' || $1 || ''%''
            )
        )';
    END IF;

    -- Add tags condition if provided
    IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
        v_query := v_query || '
        AND EXISTS (
            SELECT 1 FROM todolist_tags tt2
            JOIN tags t2 ON t2.id = tt2.tag_id
            WHERE tt2.todolist_id = tl.id
            AND t2.name = ANY($2)
        )';
    END IF;

    -- Add cursor condition if provided
    IF p_cursor IS NOT NULL THEN
        v_query := v_query || '
        AND tl.created_at < $3';
    END IF;

    -- Complete the query with JSON aggregation
    v_query := v_query || '
    )
    SELECT 
        fl.id,
        fl.title,
        fl.created_at,
        fl.expires_at,
        fl.view_count,
        fl.like_count,
        COALESCE(
            (
                SELECT json_agg(json_build_object(
                    ''id'', ti.id,
                    ''content'', ti.content,
                    ''completed'', ti.completed,
                    ''order'', ti.order,
                    ''priority'', ti.priority
                ) ORDER BY ti.order)
                FROM todo_items ti
                WHERE ti.todo_list_id = fl.id
            ),
            ''[]''::json
        ) as items,
        COALESCE(
            (
                SELECT json_agg(json_build_object(
                    ''id'', t.id,
                    ''name'', t.name,
                    ''created_at'', t.created_at,
                    ''updated_at'', t.updated_at
                ))
                FROM todolist_tags tt
                JOIN tags t ON t.id = tt.tag_id
                WHERE tt.todolist_id = fl.id
            ),
            ''[]''::json
        ) as tags
    FROM filtered_lists fl
    ORDER BY fl.created_at DESC
    LIMIT $4';

    -- Execute the query with appropriate parameters
    RETURN QUERY EXECUTE v_query
    USING 
        CASE WHEN p_search IS NULL OR p_search = '' THEN NULL ELSE p_search END,
        p_tags,
        p_cursor,
        p_limit;
END;
$$ LANGUAGE plpgsql; 