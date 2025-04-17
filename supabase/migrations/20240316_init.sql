-- Create todo_lists table
CREATE TABLE todo_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    edit_token TEXT NOT NULL
);

-- Create todo_items table
CREATE TABLE todo_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    todo_list_id UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT todo_items_order_check CHECK ("order" >= 0)
);

-- Create indexes
CREATE INDEX idx_todo_lists_expires_at ON todo_lists(expires_at);
CREATE INDEX idx_todo_lists_edit_token ON todo_lists(edit_token);
CREATE INDEX idx_todo_items_todo_list_id ON todo_items(todo_list_id);
CREATE INDEX idx_todo_items_order ON todo_items("order");

-- Enable Row Level Security (RLS)
ALTER TABLE todo_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON todo_lists
    FOR SELECT
    USING (expires_at > CURRENT_TIMESTAMP);

CREATE POLICY "Enable insert access for all users" ON todo_lists
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update access with edit_token" ON todo_lists
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON todo_items
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM todo_lists
        WHERE todo_lists.id = todo_items.todo_list_id
        AND todo_lists.expires_at > CURRENT_TIMESTAMP
    ));

CREATE POLICY "Enable insert access for all users" ON todo_items
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON todo_items
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON todo_items
    FOR DELETE
    USING (true);

-- Function to clean up expired todo lists
CREATE OR REPLACE FUNCTION cleanup_expired_todos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM todo_lists
    WHERE expires_at <= CURRENT_TIMESTAMP;
END;
$$; 