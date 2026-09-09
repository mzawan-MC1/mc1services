-- Core Tasks table (created only if not exists)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'normal',
  due_date date,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- New relation: task_assignees
CREATE TABLE IF NOT EXISTS public.task_assignees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, user_id)
);
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- New entity: task_subtasks
CREATE TABLE IF NOT EXISTS public.task_subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  due_date date,
  assignee uuid REFERENCES auth.users(id),
  attachment_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

-- Timeline events
CREATE TABLE IF NOT EXISTS public.task_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.task_timeline ENABLE ROW LEVEL SECURITY;

-- Policies: admin-only writes via admin_users; authenticated can read
-- tasks
DROP POLICY IF EXISTS tasks_select_all ON public.tasks;
CREATE POLICY tasks_select_all ON public.tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS tasks_write_admin ON public.tasks;
CREATE POLICY tasks_write_admin ON public.tasks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- task_assignees
DROP POLICY IF EXISTS task_assignees_select_all ON public.task_assignees;
CREATE POLICY task_assignees_select_all ON public.task_assignees FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS task_assignees_write_admin ON public.task_assignees;
CREATE POLICY task_assignees_write_admin ON public.task_assignees FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- task_subtasks
DROP POLICY IF EXISTS task_subtasks_select_all ON public.task_subtasks;
CREATE POLICY task_subtasks_select_all ON public.task_subtasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS task_subtasks_write_admin_or_assignee ON public.task_subtasks;
CREATE POLICY task_subtasks_write_admin_or_assignee ON public.task_subtasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
  OR assignee = auth.uid()
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
  OR assignee = auth.uid()
);

-- task_timeline
DROP POLICY IF EXISTS task_timeline_select_all ON public.task_timeline;
CREATE POLICY task_timeline_select_all ON public.task_timeline FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS task_timeline_insert_admin_or_assignee ON public.task_timeline;
CREATE POLICY task_timeline_insert_admin_or_assignee ON public.task_timeline FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()) OR TRUE
);

-- Views for optimized list queries
CREATE OR REPLACE VIEW public.v_task_stats AS
SELECT t.id as task_id,
       COUNT(st.id) FILTER (WHERE st.id IS NOT NULL) AS total_subtasks,
       COUNT(st.id) FILTER (WHERE st.status = 'completed') AS completed_subtasks,
       GREATEST( COALESCE(MAX(tt.created_at), t.updated_at), t.created_at ) AS last_activity
FROM public.tasks t
LEFT JOIN public.task_subtasks st ON st.task_id = t.id
LEFT JOIN public.task_timeline tt ON tt.task_id = t.id
GROUP BY t.id;

NOTIFY pgrst, 'reload schema';
