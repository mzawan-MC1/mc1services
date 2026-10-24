-- ============================================================================
-- Fix: allow the v29 inquiry statuses in contact_submissions.
-- The 2026-09-09 migration locked status to
-- ('new','contacted','in_progress','closed'); Confirm booking ('confirmed')
-- and Quote Sent ('quote_sent') were rejected with error 23514.
-- Run once in the Supabase SQL Editor.
-- ============================================================================

ALTER TABLE public.contact_submissions
  DROP CONSTRAINT IF EXISTS contact_submission_status_values;

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_submission_status_values
  CHECK (status IN ('new', 'contacted', 'in_progress', 'quote_sent', 'confirmed', 'closed')) NOT VALID;
