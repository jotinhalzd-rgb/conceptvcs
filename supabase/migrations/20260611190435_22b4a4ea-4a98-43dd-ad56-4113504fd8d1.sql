-- 1. Benchmarks Setoriais (Dados Agregados e Anonimizados)
CREATE TABLE IF NOT EXISTS public.ein_industry_benchmarks_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry TEXT NOT NULL, -- Farmácias, Clínicas, etc.
    size_category TEXT NOT NULL, -- Pequena, Média, Grande
    region TEXT,
    metric_name TEXT NOT NULL, -- sla_avg, conversion_rate, ltv_avg
    metric_value DOUBLE PRECISION NOT NULL,
    sample_size INTEGER NOT NULL, -- Garantir K-Anonymity (ex: min 10 empresas)
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tendências Setoriais (Macro Insights)
CREATE TABLE IF NOT EXISTS public.ein_sector_trends_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    impact_level TEXT, -- positive, negative, neutral
    confidence_score DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Repositório de Melhores Práticas (Validadas Estatisticamente)
CREATE TABLE IF NOT EXISTS public.ein_best_practices_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    expected_gain TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Log do CEO Advisor (Conselhos Personalizados por Tenant)
CREATE TABLE IF NOT EXISTS public.ein_advisor_logs_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- benchmark, opportunity, risk
    message TEXT NOT NULL,
    comparison_data JSONB DEFAULT '{}'::jsonb, -- Dados comparativos (Sua vs Mercado)
    recommendation TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ein_industry_benchmarks_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ein_sector_trends_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ein_best_practices_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ein_advisor_logs_v2 ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.ein_industry_benchmarks_v2 TO authenticated;
GRANT ALL ON public.ein_industry_benchmarks_v2 TO service_role;

GRANT SELECT ON public.ein_sector_trends_v2 TO authenticated;
GRANT ALL ON public.ein_sector_trends_v2 TO service_role;

GRANT SELECT ON public.ein_best_practices_v2 TO authenticated;
GRANT ALL ON public.ein_best_practices_v2 TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ein_advisor_logs_v2 TO authenticated;
GRANT ALL ON public.ein_advisor_logs_v2 TO service_role;

-- Políticas de RLS
-- Benchmarks: Acesso de leitura para todos os autenticados (dados já anonimizados por design)
CREATE POLICY "Public read for ein_industry_benchmarks" ON public.ein_industry_benchmarks_v2
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read for ein_sector_trends" ON public.ein_sector_trends_v2
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read for ein_best_practices" ON public.ein_best_practices_v2
    FOR SELECT TO authenticated USING (true);

-- Advisor Logs: Acesso estritamente isolado por tenant
CREATE POLICY "Tenant isolation for ein_advisor_logs" ON public.ein_advisor_logs_v2
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices
CREATE INDEX IF NOT EXISTS idx_ein_bench_ind ON public.ein_industry_benchmarks_v2(industry, metric_name);
CREATE INDEX IF NOT EXISTS idx_ein_adv_org ON public.ein_advisor_logs_v2(organization_id);
