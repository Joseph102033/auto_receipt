-- ============================================
-- Migration: Add Amount Fields and Budget Code
-- Date: 2025-11-07
-- Description:
--   - Add amount fields to submissions table (transport, accommodation, etc)
--   - Add budget_code to rounds table for admin management
-- ============================================

-- Add amount fields to submissions table
ALTER TABLE public.submissions
  ADD COLUMN amount_transport INTEGER,
  ADD COLUMN amount_accommodation INTEGER,
  ADD COLUMN amount_etc INTEGER DEFAULT 0,
  ADD COLUMN amount_note TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.submissions.amount_transport IS '운임 (필수)';
COMMENT ON COLUMN public.submissions.amount_accommodation IS '숙박비 (필수)';
COMMENT ON COLUMN public.submissions.amount_etc IS '기타 금액 (선택)';
COMMENT ON COLUMN public.submissions.amount_note IS '금액 관련 메모';

-- Add budget code to rounds table
ALTER TABLE public.rounds
  ADD COLUMN budget_code TEXT;

COMMENT ON COLUMN public.rounds.budget_code IS '예산 코드 (관리자 전용)';

-- Create index for performance on amount queries
CREATE INDEX idx_submissions_amounts ON public.submissions(round_id, amount_transport, amount_accommodation);

-- Add validation function for amounts
CREATE OR REPLACE FUNCTION public.validate_submission_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is 'submitted', amounts must be provided
  IF NEW.status = 'submitted' THEN
    IF NEW.amount_transport IS NULL OR NEW.amount_accommodation IS NULL THEN
      RAISE EXCEPTION 'amount_transport and amount_accommodation are required when status is submitted';
    END IF;

    -- Amounts must be non-negative
    IF NEW.amount_transport < 0 OR NEW.amount_accommodation < 0 OR (NEW.amount_etc IS NOT NULL AND NEW.amount_etc < 0) THEN
      RAISE EXCEPTION 'amounts must be non-negative';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER validate_amounts_on_submit
  BEFORE INSERT OR UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_submission_amounts();
