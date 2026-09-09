ALTER TABLE public.task_subtasks ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal';
NOTIFY pgrst, 'reload schema';
