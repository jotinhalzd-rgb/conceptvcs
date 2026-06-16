
-- channel_webhooks_log: add organization_id + metadata, backfill, indexes, RLS
ALTER TABLE public.channel_webhooks_log
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.channel_webhooks_log
  ADD COLUMN IF NOT EXISTS metadata jsonb;

UPDATE public.channel_webhooks_log l
   SET organization_id = c.organization_id
  FROM public.channels c
 WHERE l.organization_id IS NULL
   AND l.channel_id = c.id;

CREATE INDEX IF NOT EXISTS idx_cwl_org_processed ON public.channel_webhooks_log (organization_id, processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cwl_channel_processed ON public.channel_webhooks_log (channel_id, processed_at DESC);

GRANT SELECT, INSERT ON public.channel_webhooks_log TO authenticated;
GRANT ALL ON public.channel_webhooks_log TO service_role;

ALTER TABLE public.channel_webhooks_log ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='channel_webhooks_log'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.channel_webhooks_log', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "cwl_select_org" ON public.channel_webhooks_log
  FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());

CREATE POLICY "cwl_insert_org" ON public.channel_webhooks_log
  FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_user_organization_id());

-- api_keys: grants + RLS scoped to org
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='api_keys'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.api_keys', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "api_keys_select_org" ON public.api_keys
  FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());

CREATE POLICY "api_keys_insert_org" ON public.api_keys
  FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_user_organization_id());

CREATE POLICY "api_keys_update_org" ON public.api_keys
  FOR UPDATE TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());

CREATE POLICY "api_keys_delete_org" ON public.api_keys
  FOR DELETE TO authenticated
  USING (organization_id = public.current_user_organization_id());
