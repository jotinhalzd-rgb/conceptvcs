-- 1. Sinais de Inteligência (Captura de Eventos de Sistema)
CREATE TABLE IF NOT EXISTS public.oil_signals_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- crm, inbox, support, billing, system
    event_type TEXT NOT NULL, -- deal_stagnated, sla_breached, churn_signal, peak_demand
    severity TEXT NOT NULL DEFAULT 'info', -- info, low, medium, high, critical
    payload JSONB DEFAULT '{}'::jsonb,
    inference TEXT, -- Dedução inicial da IA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Insights Estratégicos (Decisões & Recomendações)
CREATE TABLE IF NOT EXISTS public.oil_insights_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- sales, operation, customer, finance
    title TEXT NOT NULL,
    description TEXT,
    action_suggestion TEXT,
    impact_estimate TEXT,
    status TEXT DEFAULT 'active', -- active, archived, implemented
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Histórico de Scores (Saúde Global)
CREATE TABLE IF NOT EXISTS public.oil_health_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- organization, team, customer
    entity_id UUID, -- Opcional se for global da organização
    score DOUBLE PRECISION NOT NULL,
    dimension_scores JSONB DEFAULT '{}'::jsonb, -- Detalhamento (Vendas: 80, Atendimento: 60...)
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Central de Alertas Inteligentes
CREATE TABLE IF NOT EXISTS public.oil_alerts_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- risk, opportunity, warning
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.oil_signals_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_insights_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_health_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_alerts_v2 ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oil_signals_v2 TO authenticated;
GRANT ALL ON public.oil_signals_v2 TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.oil_insights_v2 TO authenticated;
GRANT ALL ON public.oil_insights_v2 TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.oil_health_history TO authenticated;
GRANT ALL ON public.oil_health_history TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.oil_alerts_v2 TO authenticated;
GRANT ALL ON public.oil_alerts_v2 TO service_role;

-- Políticas de RLS (Isolamento por Tenant)
CREATE POLICY "Tenant isolation for oil_signals_v2" ON public.oil_signals_v2
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for oil_insights_v2" ON public.oil_insights_v2
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for oil_health_history" ON public.oil_health_history
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for oil_alerts_v2" ON public.oil_alerts_v2
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices para Análise Temporal
CREATE INDEX IF NOT EXISTS idx_oil_signals_created ON public.oil_signals_v2(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oil_insights_cat ON public.oil_insights_v2(category);

-- Triggers de Auditoria
CREATE TRIGGER update_oil_insights_v2_updated_at BEFORE UPDATE ON public.oil_insights_v2 FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
