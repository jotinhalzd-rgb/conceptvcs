-- OIL Events: Log central de tudo que acontece na plataforma
CREATE TABLE public.oil_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'sale', 'churn_risk', 'sla_breach', 'new_lead', 'customer_frustration'
    module TEXT NOT NULL, -- 'crm', 'inbox', 'finance', 'campaigns'
    entity_id UUID, -- ID do cliente, deal, etc
    payload JSONB DEFAULT '{}'::jsonb,
    importance_score FLOAT DEFAULT 0.5, -- 0 to 1
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OIL Entity Graph: O Gêmeo Digital (Relacionamentos entre entidades)
CREATE TABLE public.oil_entity_graph (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    source_id UUID NOT NULL,
    source_type TEXT NOT NULL, -- 'contact', 'agent', 'company', 'deal'
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL,
    relationship_type TEXT NOT NULL, -- 'purchased', 'handled_by', 'belongs_to'
    strength FLOAT DEFAULT 1.0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OIL Recommendations: Saída do Decision Engine
CREATE TABLE public.oil_recommendations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'opportunity', 'risk', 'operational'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    action_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'dismissed', 'executed'
    impact_estimate JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OIL Health Scores: Pontuação global por tenant
CREATE TABLE public.oil_health_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'global', 'crm', 'team', 'financial'
    score FLOAT NOT NULL, -- 0 to 100
    trend TEXT DEFAULT 'stable', -- 'up', 'down', 'stable'
    metrics_breakdown JSONB DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oil_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oil_entity_graph TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oil_recommendations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oil_health_scores TO authenticated;

GRANT ALL ON public.oil_events TO service_role;
GRANT ALL ON public.oil_entity_graph TO service_role;
GRANT ALL ON public.oil_recommendations TO service_role;
GRANT ALL ON public.oil_health_scores TO service_role;

-- RLS
ALTER TABLE public.oil_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_entity_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their organization's oil_events" ON public.oil_events
    FOR ALL USING (organization_id IN (SELECT id FROM public.organizations)) WITH CHECK (organization_id IN (SELECT id FROM public.organizations));

CREATE POLICY "Users can manage their organization's oil_entity_graph" ON public.oil_entity_graph
    FOR ALL USING (organization_id IN (SELECT id FROM public.organizations)) WITH CHECK (organization_id IN (SELECT id FROM public.organizations));

CREATE POLICY "Users can manage their organization's oil_recommendations" ON public.oil_recommendations
    FOR ALL USING (organization_id IN (SELECT id FROM public.organizations)) WITH CHECK (organization_id IN (SELECT id FROM public.organizations));

CREATE POLICY "Users can manage their organization's oil_health_scores" ON public.oil_health_scores
    FOR ALL USING (organization_id IN (SELECT id FROM public.organizations)) WITH CHECK (organization_id IN (SELECT id FROM public.organizations));

-- Triggers para Updated At
CREATE TRIGGER update_oil_entity_graph_updated_at BEFORE UPDATE ON public.oil_entity_graph 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();