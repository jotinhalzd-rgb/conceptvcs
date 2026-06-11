-- Hub Profiles: Perfis das empresas no ecossistema (visão pública controlada)
CREATE TABLE public.hub_profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    specialties TEXT[],
    website_url TEXT,
    is_public BOOLEAN DEFAULT false,
    verified_badge BOOLEAN DEFAULT false,
    reputation_score FLOAT DEFAULT 100.0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hub Connections: Relacionamentos entre empresas
CREATE TABLE public.hub_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    target_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- 'partner', 'vendor', 'franchisee', 'subsidiary', 'client'
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'rejected', 'archived'
    commission_rate FLOAT DEFAULT 0.0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_hub_connection UNIQUE (source_org_id, target_org_id, relationship_type)
);

-- Hub Marketplace Assets: Templates, Agentes, Automações compartilháveis
CREATE TABLE public.hub_marketplace_assets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    asset_type TEXT NOT NULL, -- 'automation_workflow', 'ai_agent_prompt', 'message_template', 'bi_report'
    content JSONB NOT NULL, -- O payload do ativo
    price DECIMAL(12,2) DEFAULT 0.00,
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    rating FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hub_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hub_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hub_marketplace_assets TO authenticated;

GRANT ALL ON public.hub_profiles TO service_role;
GRANT ALL ON public.hub_connections TO service_role;
GRANT ALL ON public.hub_marketplace_assets TO service_role;

-- RLS
ALTER TABLE public.hub_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_marketplace_assets ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Public hub profiles are viewable by all authenticated users" 
    ON public.hub_profiles FOR SELECT USING (is_public = true OR id IN (SELECT id FROM public.organizations));

CREATE POLICY "Users can manage their own hub profile" 
    ON public.hub_profiles FOR ALL USING (id IN (SELECT id FROM public.organizations));

CREATE POLICY "Users can view connections related to their organization" 
    ON public.hub_connections FOR SELECT USING (source_org_id IN (SELECT id FROM public.organizations) OR target_org_id IN (SELECT id FROM public.organizations));

CREATE POLICY "Users can manage connections from their organization" 
    ON public.hub_connections FOR ALL USING (source_org_id IN (SELECT id FROM public.organizations));

CREATE POLICY "Public assets are viewable by all" 
    ON public.hub_marketplace_assets FOR SELECT USING (is_public = true OR organization_id IN (SELECT id FROM public.organizations));

CREATE POLICY "Users can manage their own assets" 
    ON public.hub_marketplace_assets FOR ALL USING (organization_id IN (SELECT id FROM public.organizations));

-- Triggers
CREATE TRIGGER update_hub_profiles_updated_at BEFORE UPDATE ON public.hub_profiles 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hub_connections_updated_at BEFORE UPDATE ON public.hub_connections 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hub_marketplace_assets_updated_at BEFORE UPDATE ON public.hub_marketplace_assets 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();