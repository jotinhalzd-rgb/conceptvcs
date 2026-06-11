-- 1. Tarefas vinculadas ao CRM
CREATE TABLE IF NOT EXISTS public.crm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending', -- pending, completed, cancelled
    priority TEXT DEFAULT 'medium', -- low, medium, high
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Metas (Goals)
CREATE TABLE IF NOT EXISTS public.crm_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    team_id UUID, -- Opcional: para metas de equipe
    user_id UUID REFERENCES public.profiles(id), -- Opcional: para metas individuais
    title TEXT NOT NULL,
    target_value NUMERIC(15,2) NOT NULL,
    current_value NUMERIC(15,2) DEFAULT 0,
    target_type TEXT NOT NULL, -- revenue, deals_closed, activities
    period TEXT NOT NULL, -- monthly, quarterly, yearly
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Automações de Pipeline
CREATE TABLE IF NOT EXISTS public.crm_automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.stages(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL, -- on_entry, on_exit
    action_type TEXT NOT NULL, -- create_task, send_message, notify_manager, update_score
    action_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Cache de Forecast (IA)
CREATE TABLE IF NOT EXISTS public.crm_forecast (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE CASCADE,
    period DATE NOT NULL, -- Mês de referência
    predicted_revenue NUMERIC(15,2),
    probable_revenue NUMERIC(15,2),
    actual_revenue NUMERIC(15,2),
    confidence_score DOUBLE PRECISION,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_forecast ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_tasks TO authenticated;
GRANT ALL ON public.crm_tasks TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_goals TO authenticated;
GRANT ALL ON public.crm_goals TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_automation_rules TO authenticated;
GRANT ALL ON public.crm_automation_rules TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_forecast TO authenticated;
GRANT ALL ON public.crm_forecast TO service_role;

-- Políticas de RLS
CREATE POLICY "Users can manage crm_tasks of their organization" ON public.crm_tasks
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage crm_goals of their organization" ON public.crm_goals
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage crm_automation_rules of their organization" ON public.crm_automation_rules
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage crm_forecast of their organization" ON public.crm_forecast
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices
CREATE INDEX IF NOT EXISTS idx_crm_tasks_deal ON public.crm_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_goals_org ON public.crm_goals(organization_id);

-- Trigger de updated_at para novas tabelas
CREATE TRIGGER update_crm_tasks_updated_at BEFORE UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_crm_goals_updated_at BEFORE UPDATE ON public.crm_goals FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_crm_forecast_updated_at BEFORE UPDATE ON public.crm_forecast FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
