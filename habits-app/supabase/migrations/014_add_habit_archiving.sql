-- Add archived column to habits table
ALTER TABLE habits 
ADD COLUMN archived BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX idx_habits_archived ON habits(archived);

