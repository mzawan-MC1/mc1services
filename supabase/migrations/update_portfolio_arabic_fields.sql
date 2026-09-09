-- Add missing Arabic-specific fields used by the AdminPortfolioEdit UI
ALTER TABLE public.portfolio
  ADD COLUMN IF NOT EXISTS short_description_ar text,
  ADD COLUMN IF NOT EXISTS long_description_ar text,
  ADD COLUMN IF NOT EXISTS project_overview_ar text;

-- Ensure complementary English fields exist (defensive)
ALTER TABLE public.portfolio
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS project_overview text;
