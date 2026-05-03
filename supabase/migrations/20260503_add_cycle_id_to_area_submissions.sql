-- Add cycle_id column to area_submissions to track which ranking cycle each submission belongs to
-- This allows submissions to be scoped to a specific cycle (1st sem, 2nd sem, etc.)

ALTER TABLE public.area_submissions
ADD COLUMN cycle_id bigint NULL;

-- Add foreign key constraint to ranking_cycles
ALTER TABLE public.area_submissions
ADD CONSTRAINT area_submissions_cycle_id_fkey 
  FOREIGN KEY (cycle_id) 
  REFERENCES public.ranking_cycles(cycle_id) 
  ON DELETE CASCADE;

-- Create index for faster queries by cycle
CREATE INDEX idx_area_submissions_cycle_id 
  ON public.area_submissions(cycle_id);

-- Create composite index for common queries (find submissions for a user in a specific cycle)
CREATE INDEX idx_area_submissions_cycle_user 
  ON public.area_submissions(cycle_id, user_id);

-- Create composite index for area + cycle queries
CREATE INDEX idx_area_submissions_cycle_area 
  ON public.area_submissions(cycle_id, area_id);

-- Note: Existing submissions will have cycle_id = NULL
-- They should be populated with the current cycle_id during data migration
-- or treated as "legacy submissions" not tied to any specific cycle
