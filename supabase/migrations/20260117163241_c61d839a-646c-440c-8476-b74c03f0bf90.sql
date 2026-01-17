-- Drop the foreign key constraint on searches to allow demo data
ALTER TABLE searches DROP CONSTRAINT IF EXISTS searches_user_id_fkey;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id);
