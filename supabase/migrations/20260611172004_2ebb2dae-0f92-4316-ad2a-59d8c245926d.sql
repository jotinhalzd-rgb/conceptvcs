-- Extensão da tabela queues para suporte Enterprise
ALTER TABLE public.queues 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'support',
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sla_threshold INTERVAL DEFAULT '15 minutes',
ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Comentários para documentação do esquema
COMMENT ON COLUMN public.queues.department IS 'Departamento raiz: sales, billing, support, success, hr, legal, etc';
COMMENT ON COLUMN public.queues.priority_level IS 'Nível de prioridade global da fila (1-10)';

-- Tabela de Scores de Inteligência para o Customer 360
CREATE TABLE IF NOT EXISTS public.customer_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    health_score INTEGER DEFAULT 100,
    churn_risk TEXT DEFAULT 'low',
    potential_purchase_score INTEGER DEFAULT 0,
    ltv_estimated DECIMAL(12,2) DEFAULT 0,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Insights do CommandCenter Engine
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- risk, opportunity, bottleneck, kpi
    level TEXT NOT NULL, -- low, medium, high, critical
    title TEXT NOT NULL,
    description TEXT,
    action_label TEXT,
    is_resolved BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adição de campos de governança em companies
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS global_kpis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_config JSONB DEFAULT '{}'::jsonb;

-- Configuração de RLS e Permissões
ALTER TABLE public.customer_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.customer_scores TO service_role;
GRANT ALL ON public.ai_insights TO service_role;
GRANT SELECT ON public.customer_scores TO authenticated;
GRANT SELECT ON public.ai_insights TO authenticated;

-- Políticas de Acesso
CREATE POLICY "Users can view scores for their organization" ON public.customer_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts c
            JOIN public.profiles p ON p.organization_id = c.organization_id
            WHERE c.id = customer_scores.customer_id AND p.id = auth.uid()
        )
    );

CREATE POLICY "Users can view insights for their company" ON public.ai_insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.company_id = ai_insights.company_id AND p.id = auth.uid()
        )
    );

-- Trigger para updated_at em ai_insights
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON public.ai_insights
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
