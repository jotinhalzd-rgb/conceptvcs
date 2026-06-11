-- 1. Catálogo do Marketplace (Assets)
CREATE TABLE IF NOT EXISTS public.hub_assets_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publisher_org_id UUID REFERENCES public.organizations(id),
    asset_title TEXT NOT NULL,
    asset_description TEXT,
    asset_type_code TEXT NOT NULL, -- app, bot, ai_agent, template, workflow
    asset_category_code TEXT NOT NULL, -- crm, marketing, support, finance
    asset_pricing_model TEXT NOT NULL DEFAULT 'free',
    asset_price NUMERIC(15,2) DEFAULT 0,
    asset_icon_url TEXT,
    asset_status_code TEXT DEFAULT 'pending_review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Registro de Instalações
CREATE TABLE IF NOT EXISTS public.hub_installs_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.hub_assets_marketplace(id) ON DELETE CASCADE,
    installed_by_profile_id UUID REFERENCES public.profiles(id),
    current_install_status TEXT DEFAULT 'active',
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(organization_id, asset_id)
);

-- 3. Perfis de Parceiros
CREATE TABLE IF NOT EXISTS public.hub_partners_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    partner_display_name TEXT NOT NULL,
    partner_bio TEXT,
    partner_certification_level TEXT DEFAULT 'partner',
    is_partner_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Ofertas de Serviços
CREATE TABLE IF NOT EXISTS public.hub_services_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES public.hub_partners_marketplace(id) ON DELETE CASCADE,
    service_title TEXT NOT NULL,
    service_type_code TEXT NOT NULL,
    service_price NUMERIC(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Sistema de Avaliações
CREATE TABLE IF NOT EXISTS public.hub_reviews_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    asset_id UUID REFERENCES public.hub_assets_marketplace(id),
    partner_id UUID REFERENCES public.hub_partners_marketplace(id),
    rating_score INTEGER CHECK (rating_score >= 1 AND rating_score <= 5),
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK ( (asset_id IS NOT NULL AND partner_id IS NULL) OR (asset_id IS NULL AND partner_id IS NOT NULL) )
);

-- 6. Gestão de Receita
CREATE TABLE IF NOT EXISTS public.hub_revenue_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    asset_id UUID REFERENCES public.hub_assets_marketplace(id),
    total_transaction_amount NUMERIC(15,2) NOT NULL,
    revenue_share_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.hub_assets_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_installs_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_partners_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_services_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_reviews_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_revenue_marketplace ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.hub_assets_marketplace TO authenticated;
GRANT ALL ON public.hub_assets_marketplace TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hub_installs_marketplace TO authenticated;
GRANT ALL ON public.hub_installs_marketplace TO service_role;

GRANT SELECT ON public.hub_partners_marketplace TO authenticated;
GRANT ALL ON public.hub_partners_marketplace TO service_role;

GRANT SELECT ON public.hub_services_marketplace TO authenticated;
GRANT ALL ON public.hub_services_marketplace TO service_role;

GRANT SELECT, INSERT ON public.hub_reviews_marketplace TO authenticated;
GRANT ALL ON public.hub_reviews_marketplace TO service_role;

GRANT SELECT ON public.hub_revenue_marketplace TO authenticated;
GRANT ALL ON public.hub_revenue_marketplace TO service_role;

-- Políticas de RLS
CREATE POLICY "Public read for published assets" ON public.hub_assets_marketplace
    FOR SELECT TO authenticated USING (asset_status_code = 'published' OR publisher_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for installs" ON public.hub_installs_marketplace
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Public read for partners" ON public.hub_partners_marketplace
    FOR SELECT TO authenticated USING (is_partner_public = true OR organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for revenue" ON public.hub_revenue_marketplace
    FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices
CREATE INDEX IF NOT EXISTS idx_hub_assets_v3_type ON public.hub_assets_marketplace(asset_type_code);
CREATE INDEX IF NOT EXISTS idx_hub_installs_v3_org ON public.hub_installs_marketplace(organization_id);

-- Triggers de timestamp
CREATE TRIGGER update_hub_assets_v3_updated_at BEFORE UPDATE ON public.hub_assets_marketplace FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_hub_partners_v3_updated_at BEFORE UPDATE ON public.hub_partners_marketplace FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
