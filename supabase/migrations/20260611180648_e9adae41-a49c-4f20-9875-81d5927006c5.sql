-- Expansão da tabela de campanhas
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS campaign_type TEXT DEFAULT 'commercial', -- 'promo', 'post-sales', 'retention', 'nps', 'birthday'
ADD COLUMN IF NOT EXISTS segmentation_rules JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ab_test_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expected_roi DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost DECIMAL(12,2) DEFAULT 0;

-- Tabela de Workflows de Automação (Jornadas)
CREATE TABLE IF NOT EXISTS public.automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- 'purchase_completed', 'lead_created', 'low_nps', 'inactive_30d'
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_workflows TO authenticated;
GRANT ALL ON public.automation_workflows TO service_role;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage workflows of their organization" ON public.automation_workflows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = automation_workflows.organization_id
        )
    );

-- Tabela de Analytics de Campanhas
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.campaign_analytics TO authenticated;
GRANT ALL ON public.campaign_analytics TO service_role;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics of their organization campaigns" ON public.campaign_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            JOIN public.profiles p ON p.organization_id = c.company_id
            WHERE c.id = campaign_id AND p.id = auth.uid()
        )
    );

-- Log de Execução de Automações
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    status TEXT DEFAULT 'success',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.automation_logs TO authenticated;
GRANT ALL ON public.automation_logs TO service_role;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_workflows_org ON public.automation_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_contact ON public.automation_logs(contact_id);

-- Inserir alguns Workflows padrão
INSERT INTO public.automation_workflows (organization_id, name, trigger_event, is_active)
SELECT id, 'Jornada Pós-Venda Automática', 'purchase_completed', true
FROM public.organizations LIMIT 1
ON CONFLICT DO NOTHING;
