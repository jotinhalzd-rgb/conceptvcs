-- Ajustar a restrição de tipo de pipeline para suportar os novos modelos de negócio
ALTER TABLE public.pipelines DROP CONSTRAINT IF EXISTS pipelines_type_check;
ALTER TABLE public.pipelines ADD CONSTRAINT pipelines_type_check 
CHECK (type IN ('sales', 'support', 'custom', 'crm'));

-- Repetir a criação de tabelas da Fase 4 (caso tenha falhado parcialmente)
-- Extensão de contatos para suporte a CRM
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS is_lead BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'subscriber',
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;

-- Tabela de Negócios (Deals)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    value DECIMAL(12,2) DEFAULT 0,
    probability INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    pipeline_id UUID NOT NULL REFERENCES public.pipelines(id),
    stage_id UUID NOT NULL REFERENCES public.stages(id),
    responsible_id UUID REFERENCES auth.users(id),
    origin_conversation_id UUID REFERENCES public.conversations(id),
    expected_close_date DATE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage deals within their organization') THEN
        CREATE POLICY "Users can manage deals within their organization" ON public.deals
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.organization_id = deals.organization_id
                )
            );
    END IF;
END $$;

-- Tabela de Metas de Vendas (Sales Goals)
CREATE TABLE IF NOT EXISTS public.sales_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    responsible_id UUID REFERENCES auth.users(id),
    target_value DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'individual',
    period TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_goals TO authenticated;
GRANT ALL ON public.sales_goals TO service_role;
ALTER TABLE public.sales_goals ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view sales goals within their organization') THEN
        CREATE POLICY "Users can view sales goals within their organization" ON public.sales_goals
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.organization_id = sales_goals.organization_id
                )
            );
    END IF;
END $$;

-- Auditoria de CRM (Histórico de Negócios)
CREATE TABLE IF NOT EXISTS public.crm_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT ON public.crm_audit TO authenticated;
GRANT ALL ON public.crm_audit TO service_role;
ALTER TABLE public.crm_audit ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view CRM audit logs') THEN
        CREATE POLICY "Users can view CRM audit logs" ON public.crm_audit
            FOR SELECT USING (true);
    END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_deals_organization ON public.deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON public.deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON public.contacts(lead_score);

-- Inserir Pipeline e Stages Padrão
INSERT INTO public.pipelines (organization_id, name, type)
SELECT id, 'Pipeline Comercial', 'sales'
FROM public.organizations
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.stages (pipeline_id, name, order_index)
SELECT id, stage_name, idx
FROM public.pipelines p,
LATERAL unnest(ARRAY['Novo Lead', 'Contato Realizado', 'Qualificado', 'Proposta', 'Negociação', 'Fechado', 'Perdido']) WITH ORDINALITY AS t(stage_name, idx)
WHERE p.name = 'Pipeline Comercial'
ON CONFLICT DO NOTHING;
