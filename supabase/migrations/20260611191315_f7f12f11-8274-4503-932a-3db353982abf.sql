-- 1. Definição do Workflow (Grafo Raiz)
CREATE TABLE IF NOT EXISTS public.automation_workflows_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    trigger_type_code TEXT NOT NULL, -- contact_created, deal_moved, webhook, etc.
    trigger_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    version_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Nós do Fluxo (Blocos de Construção)
CREATE TABLE IF NOT EXISTS public.automation_nodes_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES public.automation_workflows_v2(id) ON DELETE CASCADE,
    node_type TEXT NOT NULL, -- action, condition, delay, split
    node_title TEXT,
    config JSONB DEFAULT '{}'::jsonb, -- Regras da condição ou corpo do e-mail
    parent_node_id UUID REFERENCES public.automation_nodes_v2(id),
    branch_name TEXT, -- 'true', 'false', or NULL for linear actions
    ui_position JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Registro de Execução (Jornada do Contato)
CREATE TABLE IF NOT EXISTS public.automation_executions_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES public.automation_workflows_v2(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    current_node_id UUID REFERENCES public.automation_nodes_v2(id),
    execution_status TEXT DEFAULT 'running', -- running, completed, paused, failed
    variables_context JSONB DEFAULT '{}'::jsonb, -- Dados capturados durante a jornada
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    finished_at TIMESTAMP WITH TIME ZONE
);

-- 4. Logs de Passos (Auditoria Forense)
CREATE TABLE IF NOT EXISTS public.automation_step_logs_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES public.automation_executions_v2(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES public.automation_nodes_v2(id),
    step_result TEXT, -- success, error
    log_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Repositório de Templates
CREATE TABLE IF NOT EXISTS public.marketing_templates_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    channel_type TEXT NOT NULL, -- email, whatsapp, sms
    content_body TEXT, -- HTML ou JSON do WhatsApp
    subject_line TEXT, -- Apenas para e-mail
    category_code TEXT, -- onboarding, recovery, upsell
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Campanhas (Agrupadores de ROI)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    campaign_name TEXT NOT NULL,
    budget NUMERIC(15,2) DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status_code TEXT DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.automation_workflows_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_nodes_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_step_logs_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_templates_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns_v2 ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_workflows_v2 TO authenticated;
GRANT ALL ON public.automation_workflows_v2 TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_nodes_v2 TO authenticated;
GRANT ALL ON public.automation_nodes_v2 TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_executions_v2 TO authenticated;
GRANT ALL ON public.automation_executions_v2 TO service_role;

GRANT SELECT ON public.automation_step_logs_v2 TO authenticated;
GRANT ALL ON public.automation_step_logs_v2 TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_templates_v2 TO authenticated;
GRANT ALL ON public.marketing_templates_v2 TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_campaigns_v2 TO authenticated;
GRANT ALL ON public.marketing_campaigns_v2 TO service_role;

-- Políticas de RLS (Isolamento por Tenant)
CREATE POLICY "Manage organization workflows" ON public.automation_workflows_v2
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Manage organization nodes" ON public.automation_nodes_v2
    FOR ALL TO authenticated USING (workflow_id IN (SELECT id FROM public.automation_workflows_v2));

CREATE POLICY "Manage organization executions" ON public.automation_executions_v2
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Read organization step logs" ON public.automation_step_logs_v2
    FOR SELECT TO authenticated USING (execution_id IN (SELECT id FROM public.automation_executions_v2));

CREATE POLICY "Manage organization templates" ON public.marketing_templates_v2
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Manage organization campaigns" ON public.marketing_campaigns_v2
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices Performance
CREATE INDEX IF NOT EXISTS idx_aut_exec_contact ON public.automation_executions_v2(contact_id);
CREATE INDEX IF NOT EXISTS idx_aut_nodes_workflow ON public.automation_nodes_v2(workflow_id);
CREATE INDEX IF NOT EXISTS idx_aut_steps_exec ON public.automation_step_logs_v2(execution_id);

-- Trigger de timestamp
CREATE TRIGGER update_aut_workflows_v2_updated_at BEFORE UPDATE ON public.automation_workflows_v2 FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_mkt_templates_v2_updated_at BEFORE UPDATE ON public.marketing_templates_v2 FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
