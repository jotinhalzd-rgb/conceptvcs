-- 1. Configurações Visuais e White Label
CREATE TABLE IF NOT EXISTS public.white_label_configs_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL DEFAULT 'OneContact OS',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#4f46e5',
    secondary_color TEXT DEFAULT '#0f172a',
    custom_domain TEXT UNIQUE, -- ex: app.minhamarca.com
    support_email TEXT,
    help_center_url TEXT,
    email_template_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Redes de Canais (Grupos de Franquias/Revendas)
CREATE TABLE IF NOT EXISTS public.channel_networks_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_org_id UUID NOT NULL REFERENCES public.organizations(id), -- A dona da rede
    network_name TEXT NOT NULL,
    network_type TEXT NOT NULL, -- franchise, reseller, agency_group
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Hierarquia de Organizações (Relações Parent/Child)
CREATE TABLE IF NOT EXISTS public.channel_hierarchy_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    network_id UUID NOT NULL REFERENCES public.channel_networks_v2(id) ON DELETE CASCADE,
    parent_org_id UUID NOT NULL REFERENCES public.organizations(id),
    child_org_id UUID NOT NULL REFERENCES public.organizations(id),
    hierarchy_level TEXT NOT NULL, -- master, master_franchise, local_unit, sub_partner
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(child_org_id) -- Uma organização só pode pertencer a uma hierarquia em uma rede
);

-- 4. Log de Auditoria de Canal
CREATE TABLE IF NOT EXISTS public.channel_audit_logs_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    network_id UUID NOT NULL REFERENCES public.channel_networks_v2(id),
    actor_org_id UUID NOT NULL REFERENCES public.organizations(id),
    target_org_id UUID NOT NULL REFERENCES public.organizations(id),
    action_type TEXT NOT NULL, -- org_added, plan_changed, config_updated
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.white_label_configs_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_networks_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_hierarchy_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_audit_logs_v2 ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, UPDATE ON public.white_label_configs_v2 TO authenticated;
GRANT ALL ON public.white_label_configs_v2 TO service_role;

GRANT SELECT ON public.channel_networks_v2 TO authenticated;
GRANT ALL ON public.channel_networks_v2 TO service_role;

GRANT SELECT ON public.channel_hierarchy_v2 TO authenticated;
GRANT ALL ON public.channel_hierarchy_v2 TO service_role;

GRANT SELECT ON public.channel_audit_logs_v2 TO authenticated;
GRANT ALL ON public.channel_audit_logs_v2 TO service_role;

-- Políticas de RLS (Isolamento de Marca e Hierarquia)

-- White Label: Usuários vêem apenas a config de sua própria org
CREATE POLICY "Users see own white label config" ON public.white_label_configs_v2
    FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Hierarquia: Ver redes onde sua org é master ou participante
CREATE POLICY "Users view relevant networks" ON public.channel_networks_v2
    FOR SELECT TO authenticated USING (
        master_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
        id IN (SELECT network_id FROM public.channel_hierarchy_v2 WHERE parent_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR child_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
    );

-- Ver apenas a hierarquia pertencente à sua rede
CREATE POLICY "Users view relevant hierarchy" ON public.channel_hierarchy_v2
    FOR SELECT TO authenticated USING (
        network_id IN (SELECT id FROM public.channel_networks_v2 WHERE master_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())) OR
        parent_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
        child_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    );

-- Índices
CREATE INDEX IF NOT EXISTS idx_white_domain ON public.white_label_configs_v2(custom_domain);
CREATE INDEX IF NOT EXISTS idx_hier_parent ON public.channel_hierarchy_v2(parent_org_id);
CREATE INDEX IF NOT EXISTS idx_hier_child ON public.channel_hierarchy_v2(child_org_id);

-- Trigger updated_at
CREATE TRIGGER update_white_label_v2_updated_at BEFORE UPDATE ON public.white_label_configs_v2 FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_chan_networks_v2_updated_at BEFORE UPDATE ON public.channel_networks_v2 FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
