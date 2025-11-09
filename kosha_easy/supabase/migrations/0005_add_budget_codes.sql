-- Add budget code fields to rounds table
ALTER TABLE public.rounds
  ADD COLUMN budget_code_transport TEXT,
  ADD COLUMN budget_code_accommodation TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.rounds.budget_code_transport IS 'Budget code for transportation expenses (admin only)';
COMMENT ON COLUMN public.rounds.budget_code_accommodation IS 'Budget code for accommodation expenses (admin only)';
