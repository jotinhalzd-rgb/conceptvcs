
-- Bloco 4: Campanhas CRUD real - extensão de schema + novas tabelas

-- 1. Estender public.campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS channel_id uuid REFERENCES public.channels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS message_content text,
  ADD COLUMN IF NOT EXISTS variables jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS segment_filters jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS estimated_recipients integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_message text;

-- Backfill organization_id de profiles quando possível
UPDATE public.campaigns c
   SET organization_id = p.organization_id
  FROM public.profiles p
 WHERE c.organization_id IS NULL
   AND c.created_by = p.id
   AND p.organization_id IS NOT NULL;

-- Tornar company_id opcional (legacy)
ALTER TABLE public.campaigns ALTER COLUMN company_id DROP NOT NULL;

-- Default organization_id via trigger (não-quebra se ausente)
CREATE OR REPLACE FUNCTION public.set_campaign_organization_id()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := public.current_user_organization_id();
  END IF;
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_campaign_org ON public.campaigns;
CREATE TRIGGER trg_set_campaign_org
  BEFORE INSERT ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_campaign_organization_id();

-- updated_at
DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS org-scoped
DROP POLICY IF EXISTS "Authenticated users can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "RLS: Campaigns access by role" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_org_select" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_org_modify" ON public.campaigns;

CREATE POLICY "campaigns_org_select" ON public.campaigns
  FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());

CREATE POLICY "campaigns_org_modify" ON public.campaigns
  FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());

CREATE INDEX IF NOT EXISTS idx_campaigns_org ON public.campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel_id ON public.campaigns(channel_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_assigned ON public.campaigns(assigned_to);

-- 2. campaign_recipients
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, contact_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_recipients TO authenticated;
GRANT ALL ON public.campaign_recipients TO service_role;

ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipients_org_all" ON public.campaign_recipients
  FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());

CREATE INDEX IF NOT EXISTS idx_recipients_campaign ON public.campaign_recipients(campaign_id);

-- 3. campaign_events
CREATE TABLE IF NOT EXISTS public.campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_events TO authenticated;
GRANT ALL ON public.campaign_events TO service_role;

ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_events_org_all" ON public.campaign_events
  FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());

CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign ON public.campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_type ON public.campaign_events(event_type);
