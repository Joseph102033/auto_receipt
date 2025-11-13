-- Update budget code structure for rounds table
-- Change from separate transport and accommodation codes to unified structure

-- Rename budget_code_accommodation to budget_code_1 (숙박 및 운임)
ALTER TABLE public.rounds
  RENAME COLUMN budget_code_accommodation TO budget_code_1;

-- Drop budget_code_transport as it will be consolidated with accommodation
ALTER TABLE public.rounds
  DROP COLUMN IF EXISTS budget_code_transport;

-- Add budget_code_2 for commission fees (위촉수당)
ALTER TABLE public.rounds
  ADD COLUMN budget_code_2 TEXT;

-- Update comments for documentation
COMMENT ON COLUMN public.rounds.budget_code_1 IS 'Budget code for accommodation and transportation expenses (admin only)';
COMMENT ON COLUMN public.rounds.budget_code_2 IS 'Budget code for commission fees (admin only)';
