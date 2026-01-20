-- Add position column to todos table for drag-and-drop ordering
ALTER TABLE todos ADD COLUMN IF NOT EXISTS position INTEGER;

-- Set default position based on created_at for existing records
-- Lower position = appears first (newest at top)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, target_date ORDER BY created_at DESC) - 1 as rn
  FROM todos
)
UPDATE todos
SET position = numbered.rn
FROM numbered
WHERE todos.id = numbered.id AND todos.position IS NULL;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_todos_position ON todos (user_id, target_date, position);

-- Add comment for documentation
COMMENT ON COLUMN todos.position IS 'Order position for drag-and-drop sorting. Lower numbers appear first.';

-- Function to increment positions when adding a new todo at the top
CREATE OR REPLACE FUNCTION increment_todo_positions(p_user_id UUID, p_target_date DATE)
RETURNS void AS $$
BEGIN
  UPDATE todos
  SET position = position + 1
  WHERE user_id = p_user_id
    AND target_date = p_target_date
    AND position IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
