-- Add view_count and like_count columns to todo_lists table
ALTER TABLE todo_lists
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN like_count INTEGER DEFAULT 0;

-- Create table for tracking views
CREATE TABLE todo_list_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    todo_list_id UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
    fingerprint TEXT NOT NULL, -- Browser/client fingerprint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(todo_list_id, fingerprint)
);

-- Create table for tracking likes
CREATE TABLE todo_list_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    todo_list_id UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
    fingerprint TEXT NOT NULL, -- Browser/client fingerprint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(todo_list_id, fingerprint)
);

-- Create function to update view count
CREATE OR REPLACE FUNCTION update_todo_list_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE todo_lists
    SET view_count = (
        SELECT COUNT(*)
        FROM todo_list_views
        WHERE todo_list_id = NEW.todo_list_id
    )
    WHERE id = NEW.todo_list_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update like count
CREATE OR REPLACE FUNCTION update_todo_list_like_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE todo_lists
    SET like_count = (
        SELECT COUNT(*)
        FROM todo_list_likes
        WHERE todo_list_id = OLD.todo_list_id OR todo_list_id = NEW.todo_list_id
    )
    WHERE id = COALESCE(NEW.todo_list_id, OLD.todo_list_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update counts
CREATE TRIGGER update_view_count
AFTER INSERT ON todo_list_views
FOR EACH ROW
EXECUTE FUNCTION update_todo_list_view_count();

CREATE TRIGGER update_like_count
AFTER INSERT OR DELETE ON todo_list_likes
FOR EACH ROW
EXECUTE FUNCTION update_todo_list_like_count(); 