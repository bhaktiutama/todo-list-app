-- Create enum type for priority levels
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Add priority column to todo_items table
ALTER TABLE todo_items 
ADD COLUMN priority priority_level DEFAULT 'medium' NOT NULL;

-- Create index for priority column to improve query performance
CREATE INDEX idx_todo_items_priority ON todo_items(priority);

-- Update existing records to have default priority
UPDATE todo_items SET priority = 'medium' WHERE priority IS NULL; 