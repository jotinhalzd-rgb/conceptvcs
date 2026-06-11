-- Tabela de Pontuação de Saúde do Negócio (Business Health Score)
CREATE TABLE IF NOT EXISTS public.business_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
    category TEXT NOT NULL, -- 'overall', 'sales', 'support', 'operation'
    metrics_breakdown JSONB DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.business_health_scores TO authenticated;
GRANT ALL ON public.business_health_scores TO service_role;
ALTER TABLE public.business_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view health scores of their organization" ON public.business_health_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = business_health_scores.organization_id
        )
    );

-- Tabela de Insights Executivos (Smart Feed)
CREATE TABLE IF NOT EXISTS public.executive_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    insight_type TEXT NOT NULL, -- 'risk', 'opportunity', 'milestone', 'anomaly'
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    suggested_action TEXT,
    is_resolved BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, UPDATE ON public.executive_insights TO authenticated;
GRANT ALL ON public.executive_insights TO service_role;
ALTER TABLE public.executive_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage insights of their organization" ON public.executive_insights
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = executive_insights.organization_id
        )
    );

-- Log de Consultas Analíticas (Ask Business AI)
CREATE TABLE IF NOT EXISTS public.ai_analytical_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    ai_response TEXT,
    data_points_referenced JSONB,
    satisfaction_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT ON public.ai_analytical_logs TO authenticated;
GRANT ALL ON public.ai_analytical_logs TO service_role;
ALTER TABLE public.ai_analytical_logs ENABLE ROW LEVEL SECURITY;

-- Índices para performance executiva
CREATE INDEX IF NOT EXISTS idx_health_scores_org ON public.business_health_scores(organization_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_executive_insights_org ON public.executive_insights(organization_id, created_at DESC);

-- Inserir alguns Insights Demo para o Smart Feed
INSERT INTO public.executive_insights (organization_id, title, description, insight_type, priority, suggested_action)
SELECT id, 'Queda na Conversão Detectada', 'As conversões do canal WhatsApp caíram 18% em relação à média das últimas 4 semanas.', 'risk', 'high', 'Revisar scripts de vendas da equipe comercial.'
FROM public.organizations LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.executive_insights (organization_id, title, description, insight_type, priority, suggested_action)
SELECT id, 'Oportunidade de Upgrade', 'Identificamos 12 clientes VIP com alto engajamento mas no plano básico.', 'opportunity', 'medium', 'Disparar campanha de upgrade para clientes qualificados.'
FROM public.organizations LIMIT 1
ON CONFLICT DO NOTHING;
