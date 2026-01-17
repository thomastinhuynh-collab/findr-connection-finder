-- Drop the foreign key constraint on evaluations to allow demo data
ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_from_user_id_fkey;
ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_to_user_id_fkey;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_evaluations_from_user_id ON evaluations(from_user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_to_user_id ON evaluations(to_user_id);
