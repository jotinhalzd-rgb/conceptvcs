-- EIN Industry Benchmarks: Médias e quartis por setor (Anonimizados)
CREATE TABLE public.ein_industry_benchmarks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    industry TEXT NOT NULL, -- 'pharmacy', 'education', 'retail', etc
    metric_name TEXT NOT NULL, -- 'response_time', 'conversion_rate', 'csat'
    avg_value FLOAT NOT NULL,
    p90_value FLOAT, -- Top 10% performance
    p10_value FLOAT, -- Bottom 10% performance
    sample_size INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(industry, metric_name, period_start, period_end)
);

-- EIN Best Practices: Padrões operacionais de alta performance detectados pelo OIL (Anonimizados)
CREATE TABLE public.ein_best_practices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    industry TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    config_payload JSONB NOT NULL, -- Sugestão de fluxos, prompts ou scripts
    impact_metrics JSONB DEFAULT '{}'::jsonb, -- Ex: { "conversion_lift": 15, "cost_reduction": 20 }
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- EIN Advisor Logs: Histórico de insights estratégicos entregues ao CEO de cada empresa
CREATE TABLE public.ein_advisor_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- 'performance_gap', 'strategy_recommendation', 'market_trend'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    impact_estimate FLOAT, -- Score de 0 a 100 do impacto potencial
    status TEXT DEFAULT 'new', -- 'new', 'read', 'applied', 'dismissed'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permissões
GRANT SELECT ON public.ein_industry_benchmarks TO authenticated;
GRANT SELECT ON public.ein_best_practices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ein_advisor_logs TO authenticated;

GRANT ALL ON public.ein_industry_benchmarks TO service_role;
GRANT ALL ON public.ein_best_practices TO service_role;
GRANT ALL ON public.ein_advisor_logs TO service_role;

-- RLS
ALTER TABLE public.ein_industry_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ein_best_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ein_advisor_logs ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anyone can view industry benchmarks" ON public.ein_industry_benchmarks FOR SELECT USING (true);
CREATE POLICY "Anyone can view verified best practices" ON public.ein_best_practices FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can manage advisor logs for their organization" ON public.ein_advisor_logs
    FOR ALL USING (organization_id IN (SELECT id FROM public.organizations)) WITH CHECK (organization_id IN (SELECT id FROM public.organizations));

-- Índices para performance de busca
CREATE INDEX idx_ein_benchmarks_industry ON public.ein_industry_benchmarks(industry);
CREATE INDEX idx_ein_best_practices_industry ON public.ein_best_practices(industry);