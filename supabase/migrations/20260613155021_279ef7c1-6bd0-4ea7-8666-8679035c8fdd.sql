
-- ============================================================
-- Security helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_org()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('ceo_master','ceo','admin')
  )
$$;

-- ============================================================
-- 1. Profile privilege escalation block
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('ceo_master','ceo','admin')
  ) INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Not allowed to change role';
    END IF;
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      RAISE EXCEPTION 'Not allowed to change organization';
    END IF;
    IF NEW.impersonated_by IS DISTINCT FROM OLD.impersonated_by THEN
      RAISE EXCEPTION 'Not allowed to change impersonation';
    END IF;
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Not allowed to change company';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_priv_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_priv_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- ============================================================
-- 2. Add organization scope columns where missing
-- ============================================================
ALTER TABLE public.queues             ADD COLUMN IF NOT EXISTS organization_id uuid;
ALTER TABLE public.tags               ADD COLUMN IF NOT EXISTS organization_id uuid;
ALTER TABLE public.knowledge_base     ADD COLUMN IF NOT EXISTS organization_id uuid;
ALTER TABLE public.omnichannel_events ADD COLUMN IF NOT EXISTS organization_id uuid;
ALTER TABLE public.conversation_tags  ADD COLUMN IF NOT EXISTS organization_id uuid;

-- Backfill conversation_tags from conversations
UPDATE public.conversation_tags ct
SET organization_id = c.organization_id
FROM public.conversations c
WHERE ct.conversation_id = c.id AND ct.organization_id IS NULL;

-- ============================================================
-- Helper to drop all policies on a table
-- ============================================================
DO $outer$
DECLARE
  t text;
  r record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'agent_performance','ai_suggestions_log','audit_logs',
    'automation_nodes_v2','automation_step_logs_v2','channels',
    'connected_integrations','conversation_audit','conversation_tags',
    'crm_audit','customer_events','ein_advisor_logs',
    'ein_industry_benchmarks','global_privacy_consents',
    'hub_profiles','hub_marketplace_assets','hub_connections',
    'internal_notes','knowledge_base','oil_events','oil_entity_graph',
    'oil_recommendations','oil_health_scores','omnichannel_events',
    'queues','satisfaction_surveys','tags','webhook_subscriptions'
  ] LOOP
    FOR r IN SELECT polname FROM pg_policy
             WHERE polrelid = ('public.'||t)::regclass LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.polname, t);
    END LOOP;
  END LOOP;
END
$outer$;

-- ============================================================
-- 3. Recreate scoped policies
-- ============================================================

-- agent_performance: org via ai_agents.agent_id (agent_id refs ai_agents OR profiles - assume profiles)
-- agent_id references profiles in most apps. Use profiles join.
CREATE POLICY agent_perf_org_select ON public.agent_performance
FOR SELECT TO authenticated USING (
  agent_id IN (SELECT id FROM public.profiles WHERE organization_id = public.current_user_org())
);
CREATE POLICY agent_perf_org_write ON public.agent_performance
FOR ALL TO authenticated USING (
  agent_id IN (SELECT id FROM public.profiles WHERE organization_id = public.current_user_org())
) WITH CHECK (
  agent_id IN (SELECT id FROM public.profiles WHERE organization_id = public.current_user_org())
);

-- ai_suggestions_log: scope via conversation
CREATE POLICY ai_sug_org ON public.ai_suggestions_log
FOR ALL TO authenticated USING (
  conversation_id IN (SELECT id FROM public.conversations WHERE organization_id = public.current_user_org())
) WITH CHECK (
  conversation_id IN (SELECT id FROM public.conversations WHERE organization_id = public.current_user_org())
);

-- audit_logs: only admins of the same org may read; only the acting user (or service_role) inserts
CREATE POLICY audit_logs_admin_select ON public.audit_logs
FOR SELECT TO authenticated USING (
  public.is_org_admin() AND user_id IN (
    SELECT id FROM public.profiles WHERE organization_id = public.current_user_org()
  )
);
CREATE POLICY audit_logs_self_insert ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- automation_nodes_v2: scope via workflow.organization
CREATE POLICY auto_nodes_org ON public.automation_nodes_v2
FOR ALL TO authenticated USING (
  workflow_id IN (SELECT id FROM public.automation_workflows_v2 WHERE organization_id = public.current_user_org())
) WITH CHECK (
  workflow_id IN (SELECT id FROM public.automation_workflows_v2 WHERE organization_id = public.current_user_org())
);

-- automation_step_logs_v2: scope via execution.org
CREATE POLICY auto_step_logs_org ON public.automation_step_logs_v2
FOR ALL TO authenticated USING (
  execution_id IN (SELECT id FROM public.automation_executions_v2 WHERE organization_id = public.current_user_org())
) WITH CHECK (
  execution_id IN (SELECT id FROM public.automation_executions_v2 WHERE organization_id = public.current_user_org())
);

-- channels: org-scoped read excluding credentials handled at column-level via view recommendation.
-- Read: any org member, but only admins can read credentials. Enforce admin-only write/manage.
CREATE POLICY channels_org_select ON public.channels
FOR SELECT TO authenticated USING (organization_id = public.current_user_org());
CREATE POLICY channels_admin_write ON public.channels
FOR INSERT TO authenticated WITH CHECK (
  organization_id = public.current_user_org() AND public.is_org_admin()
);
CREATE POLICY channels_admin_update ON public.channels
FOR UPDATE TO authenticated USING (
  organization_id = public.current_user_org() AND public.is_org_admin()
) WITH CHECK (
  organization_id = public.current_user_org() AND public.is_org_admin()
);
CREATE POLICY channels_admin_delete ON public.channels
FOR DELETE TO authenticated USING (
  organization_id = public.current_user_org() AND public.is_org_admin()
);

-- connected_integrations: admin-only
CREATE POLICY conn_integ_admin ON public.connected_integrations
FOR ALL TO authenticated USING (
  organization_id = public.current_user_org() AND public.is_org_admin()
) WITH CHECK (
  organization_id = public.current_user_org() AND public.is_org_admin()
);

-- conversation_audit
CREATE POLICY conv_audit_org ON public.conversation_audit
FOR ALL TO authenticated USING (
  conversation_id IN (SELECT id FROM public.conversations WHERE organization_id = public.current_user_org())
) WITH CHECK (
  conversation_id IN (SELECT id FROM public.conversations WHERE organization_id = public.current_user_org())
);

-- conversation_tags
CREATE POLICY conv_tags_org ON public.conversation_tags
FOR ALL TO authenticated USING (
  conversation_id IN (SELECT id FROM public.conversations WHERE organization_id = public.current_user_org())
) WITH CHECK (
  conversation_id IN (SELECT id FROM public.conversations WHERE organization_id = public.current_user_org())
);

-- crm_audit (scope via deals)
CREATE POLICY crm_audit_org ON public.crm_audit
FOR ALL TO authenticated USING (
  deal_id IN (SELECT id FROM public.deals WHERE organization_id = public.current_user_org())
) WITH CHECK (
  deal_id IN (SELECT id FROM public.deals WHERE organization_id = public.current_user_org())
);

-- customer_events (uses company_id)
CREATE POLICY cust_events_company ON public.customer_events
FOR ALL TO authenticated USING (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
) WITH CHECK (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- ein_advisor_logs
CREATE POLICY ein_advisor_org ON public.ein_advisor_logs
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());

-- ein_industry_benchmarks: authenticated read only (was public.true)
CREATE POLICY ein_bench_auth_read ON public.ein_industry_benchmarks
FOR SELECT TO authenticated USING (true);

-- global_privacy_consents: admin only (contains IPs)
CREATE POLICY priv_consents_admin ON public.global_privacy_consents
FOR ALL TO authenticated USING (
  organization_id = public.current_user_org() AND public.is_org_admin()
) WITH CHECK (
  organization_id = public.current_user_org() AND public.is_org_admin()
);

-- hub_profiles (id is the organization_id semantically)
CREATE POLICY hub_profiles_self ON public.hub_profiles
FOR ALL TO authenticated USING (id = public.current_user_org())
WITH CHECK (id = public.current_user_org());
CREATE POLICY hub_profiles_public_read ON public.hub_profiles
FOR SELECT TO authenticated USING (is_public = true);

-- hub_marketplace_assets (organization_id)
CREATE POLICY hub_assets_own ON public.hub_marketplace_assets
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());
CREATE POLICY hub_assets_public_read ON public.hub_marketplace_assets
FOR SELECT TO authenticated USING (is_public = true);

-- hub_connections (source_org_id or target_org_id)
CREATE POLICY hub_conn_org ON public.hub_connections
FOR ALL TO authenticated USING (
  source_org_id = public.current_user_org() OR target_org_id = public.current_user_org()
) WITH CHECK (
  source_org_id = public.current_user_org() OR target_org_id = public.current_user_org()
);

-- internal_notes
CREATE POLICY internal_notes_org ON public.internal_notes
FOR ALL TO authenticated USING (
  conversation_id IN (SELECT id FROM public.conversations WHERE organization_id = public.current_user_org())
) WITH CHECK (
  conversation_id IN (SELECT id FROM public.conversations WHERE organization_id = public.current_user_org())
);

-- knowledge_base
CREATE POLICY kb_org ON public.knowledge_base
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());

-- oil_events / entity_graph / recommendations / health_scores
CREATE POLICY oil_events_org ON public.oil_events
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());
CREATE POLICY oil_graph_org ON public.oil_entity_graph
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());
CREATE POLICY oil_recs_org ON public.oil_recommendations
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());
CREATE POLICY oil_health_org ON public.oil_health_scores
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());

-- omnichannel_events
CREATE POLICY omni_events_org ON public.omnichannel_events
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());

-- queues
CREATE POLICY queues_org ON public.queues
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());

-- satisfaction_surveys (company_id)
CREATE POLICY satis_company ON public.satisfaction_surveys
FOR ALL TO authenticated USING (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
) WITH CHECK (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- tags
CREATE POLICY tags_org ON public.tags
FOR ALL TO authenticated USING (organization_id = public.current_user_org())
WITH CHECK (organization_id = public.current_user_org());

-- webhook_subscriptions: admin only (contains signing secret)
CREATE POLICY webhook_subs_admin ON public.webhook_subscriptions
FOR ALL TO authenticated USING (
  organization_id = public.current_user_org() AND public.is_org_admin()
) WITH CHECK (
  organization_id = public.current_user_org() AND public.is_org_admin()
);

-- ============================================================
-- 4. Storage policies for message-attachments
-- Path convention: {organization_id}/{conversation_id}/filename
-- ============================================================
DO $outer$
DECLARE r record;
BEGIN
  FOR r IN SELECT polname FROM pg_policy
           WHERE polrelid = 'storage.objects'::regclass
             AND polname LIKE 'msgatt_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.polname);
  END LOOP;
END
$outer$;

CREATE POLICY msgatt_select ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = public.current_user_org()::text
);
CREATE POLICY msgatt_insert ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = public.current_user_org()::text
);
CREATE POLICY msgatt_update ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = public.current_user_org()::text
);
CREATE POLICY msgatt_delete ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = public.current_user_org()::text
);
