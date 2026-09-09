ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.task_subtasks ADD COLUMN IF NOT EXISTS started_at timestamptz;
NOTIFY pgrst, 'reload schema';
