-- 1. Registro de Visitas de Campo e Geolocalização
CREATE TABLE IF NOT EXISTS public.mobile_field_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    visit_type TEXT DEFAULT 'client_meeting',
    checkin_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    checkout_at TIMESTAMP WITH TIME ZONE,
    location_coords_json JSONB DEFAULT '{}'::jsonb, -- Fallback universal para coordenadas
    location_address TEXT,
    notes TEXT,
    photos_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Gestão de Tokens Push
CREATE TABLE IF NOT EXISTS public.mobile_push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    push_token TEXT NOT NULL,
    device_platform TEXT, -- ios, android, web
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id, device_id)
);

-- 3. Logs de Sincronização (Offline Monitor)
CREATE TABLE IF NOT EXISTS public.mobile_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL, -- full, incremental, upload
    status TEXT DEFAULT 'success',
    records_processed INTEGER DEFAULT 0,
    error_details TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.mobile_field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_sync_logs ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.mobile_field_visits TO authenticated;
GRANT ALL ON public.mobile_field_visits TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_push_tokens TO authenticated;
GRANT ALL ON public.mobile_push_tokens TO service_role;

GRANT SELECT, INSERT ON public.mobile_sync_logs TO authenticated;
GRANT ALL ON public.mobile_sync_logs TO service_role;

-- Políticas de RLS
CREATE POLICY "Manage own organization visits" ON public.mobile_field_visits
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Manage own organization push tokens" ON public.mobile_push_tokens
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Read own organization sync logs" ON public.mobile_sync_logs
    FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices Performance
CREATE INDEX IF NOT EXISTS idx_v4_mob_visits_profile ON public.mobile_field_visits(profile_id);
CREATE INDEX IF NOT EXISTS idx_v4_mob_push_profile ON public.mobile_push_tokens(profile_id);
CREATE INDEX IF NOT EXISTS idx_v4_mob_sync_finished ON public.mobile_sync_logs(finished_at DESC);
