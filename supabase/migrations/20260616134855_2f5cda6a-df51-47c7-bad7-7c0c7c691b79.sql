
-- 1) Channels: marketplace link + channel_type
ALTER TABLE public.channels
  ADD COLUMN IF NOT EXISTS marketplace_install_id uuid,
  ADD COLUMN IF NOT EXISTS channel_type text;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'channels_marketplace_install_fk'
  ) THEN
    ALTER TABLE public.channels
      ADD CONSTRAINT channels_marketplace_install_fk
      FOREIGN KEY (marketplace_install_id)
      REFERENCES public.hub_installs_marketplace(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS channels_marketplace_install_idx
  ON public.channels(marketplace_install_id);

-- 2) Marketplace installs: channel link + config jsonb
ALTER TABLE public.hub_installs_marketplace
  ADD COLUMN IF NOT EXISTS channel_id uuid,
  ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hub_installs_channel_fk'
  ) THEN
    ALTER TABLE public.hub_installs_marketplace
      ADD CONSTRAINT hub_installs_channel_fk
      FOREIGN KEY (channel_id)
      REFERENCES public.channels(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS hub_installs_channel_idx
  ON public.hub_installs_marketplace(channel_id);

-- 3) Queue routing rules (org-scoped, keywords array)
CREATE TABLE IF NOT EXISTS public.queue_routing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}'::text[],
  queue_id uuid NOT NULL REFERENCES public.queues(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE,
  priority integer NOT NULL DEFAULT 0,
  is_fallback boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.queue_routing_rules TO authenticated;
GRANT ALL ON public.queue_routing_rules TO service_role;

ALTER TABLE public.queue_routing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routing_rules_org_select" ON public.queue_routing_rules;
CREATE POLICY "routing_rules_org_select"
  ON public.queue_routing_rules FOR SELECT TO authenticated
  USING (organization_id = current_user_org());

DROP POLICY IF EXISTS "routing_rules_admin_write" ON public.queue_routing_rules;
CREATE POLICY "routing_rules_admin_write"
  ON public.queue_routing_rules FOR INSERT TO authenticated
  WITH CHECK (organization_id = current_user_org() AND is_org_admin());

DROP POLICY IF EXISTS "routing_rules_admin_update" ON public.queue_routing_rules;
CREATE POLICY "routing_rules_admin_update"
  ON public.queue_routing_rules FOR UPDATE TO authenticated
  USING (organization_id = current_user_org() AND is_org_admin())
  WITH CHECK (organization_id = current_user_org() AND is_org_admin());

DROP POLICY IF EXISTS "routing_rules_admin_delete" ON public.queue_routing_rules;
CREATE POLICY "routing_rules_admin_delete"
  ON public.queue_routing_rules FOR DELETE TO authenticated
  USING (organization_id = current_user_org() AND is_org_admin());

CREATE INDEX IF NOT EXISTS queue_routing_rules_org_idx
  ON public.queue_routing_rules(organization_id, is_active, priority DESC);

DROP TRIGGER IF EXISTS update_queue_routing_rules_updated_at ON public.queue_routing_rules;
CREATE TRIGGER update_queue_routing_rules_updated_at
  BEFORE UPDATE ON public.queue_routing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Realtime for channels (best-effort)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='channels'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.channels';
  END IF;
END $$;
