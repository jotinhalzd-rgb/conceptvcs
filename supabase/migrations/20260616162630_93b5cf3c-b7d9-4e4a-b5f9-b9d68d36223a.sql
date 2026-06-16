
ALTER TABLE public.automation_logs ALTER COLUMN contact_id DROP NOT NULL;
ALTER TABLE public.automation_logs ALTER COLUMN node_id DROP NOT NULL;
ALTER TABLE public.automation_logs ALTER COLUMN action_type DROP NOT NULL;

ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS trigger_event text;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS input jsonb;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS output jsonb;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS created_by uuid;

UPDATE public.automation_logs l
   SET organization_id = w.organization_id
  FROM public.automation_workflows w
 WHERE l.workflow_id = w.id AND l.organization_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_automation_logs_org_created ON public.automation_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_workflow_created ON public.automation_logs(workflow_id, created_at DESC);

GRANT SELECT, INSERT ON public.automation_logs TO authenticated;
GRANT ALL ON public.automation_logs TO service_role;

DROP POLICY IF EXISTS "Users can view automation logs of their organization" ON public.automation_logs;

CREATE POLICY "Org members can read automation logs"
  ON public.automation_logs FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());

CREATE POLICY "Org members can insert automation logs"
  ON public.automation_logs FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_user_organization_id());
