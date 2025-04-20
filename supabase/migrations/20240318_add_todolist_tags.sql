-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT tags_name_unique UNIQUE (name)
);

-- Create todolist_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS todolist_tags (
    todolist_id UUID REFERENCES todo_lists(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (todolist_id, tag_id)
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_todolist_tags_todolist_id ON todolist_tags(todolist_id);
CREATE INDEX IF NOT EXISTS idx_todolist_tags_tag_id ON todolist_tags(tag_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tags table
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to manage todolist tags
CREATE OR REPLACE FUNCTION manage_todolist_tags(
    p_todolist_id UUID,
    p_tag_names TEXT[]
)
RETURNS VOID AS $$
DECLARE
    v_tag_id UUID;
    v_tag_name TEXT;
BEGIN
    -- Delete existing tags for this todolist
    DELETE FROM todolist_tags WHERE todolist_id = p_todolist_id;
    
    -- Process each tag
    FOREACH v_tag_name IN ARRAY p_tag_names
    LOOP
        -- Insert tag if it doesn't exist and get its id
        INSERT INTO tags (name)
        VALUES (v_tag_name)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_tag_id;
        
        -- Create todolist-tag relationship
        INSERT INTO todolist_tags (todolist_id, tag_id)
        VALUES (p_todolist_id, v_tag_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 