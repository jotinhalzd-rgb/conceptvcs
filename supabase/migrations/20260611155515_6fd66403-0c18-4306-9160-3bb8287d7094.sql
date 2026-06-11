-- 1. Tabela de Campanhas
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL, -- Referência futura para multi-empresa
    name TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL, -- whatsapp, email, sms, etc.
    type TEXT NOT NULL, -- commercial, promotional, etc.
    objective TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, sending, completed, paused
    priority TEXT DEFAULT 'medium',
    segmentation_filters JSONB DEFAULT '{}',
    content_template JSONB DEFAULT '{}',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Tabela de Eventos CDP (Central de Inteligência)
CREATE TABLE IF NOT EXISTS public.customer_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id),
    event_type TEXT NOT NULL, -- sent, opened, clicked, responded, converted, churned
    channel TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela de Auditoria (Sistema de Auditoria Total)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- create_campaign, export_contacts, delete_message, etc.
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Tabela de Pesquisas de Satisfação (CSAT/NPS)
CREATE TABLE IF NOT EXISTS public.satisfaction_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    conversation_id UUID,
    agent_id UUID REFERENCES auth.users(id),
    score INTEGER NOT NULL,
    type TEXT NOT NULL, -- csat, nps
    comment TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Ajustar conforme multi-empresa no futuro)
CREATE POLICY "Authenticated users can manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can view customer events" ON public.customer_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view surveys" ON public.satisfaction_surveys FOR SELECT TO authenticated USING (true);

-- Índices para Performance
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_customer_events_type ON public.customer_events(event_type);
CREATE INDEX idx_customer_events_customer ON public.customer_events(customer_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Grant permissions
GRANT ALL ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
GRANT ALL ON public.customer_events TO authenticated;
GRANT ALL ON public.customer_events TO service_role;
GRANT ALL ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
GRANT ALL ON public.satisfaction_surveys TO authenticated;
GRANT ALL ON public.satisfaction_surveys TO service_role;
