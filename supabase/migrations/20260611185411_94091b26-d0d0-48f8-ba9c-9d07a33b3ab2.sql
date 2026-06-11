-- 1. Tabela de Tickets (Suporte)
CREATE TABLE IF NOT EXISTS public.customer_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
    priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    assigned_to UUID REFERENCES public.profiles(id),
    sla_due TIMESTAMP WITH TIME ZONE,
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabela de Transações Financeiras (Billing)
CREATE TABLE IF NOT EXISTS public.billing_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT NOT NULL, -- pending, paid, failed, refunded
    payment_method TEXT, -- pix, credit_card, boleto
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela de Eventos (Timeline Unificada)
CREATE TABLE IF NOT EXISTS public.customer_events_unified (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- message, deal, ticket, billing, ai_insight, call
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Tabela de Insights (Cache de IA)
CREATE TABLE IF NOT EXISTS public.customer_insights_enterprise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_id UUID UNIQUE NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    summary TEXT,
    next_best_action TEXT,
    churn_risk_score DOUBLE PRECISION DEFAULT 0,
    purchase_probability DOUBLE PRECISION DEFAULT 0,
    interests TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.customer_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_events_unified ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_insights_enterprise ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_tickets TO authenticated;
GRANT ALL ON public.customer_tickets TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_transactions TO authenticated;
GRANT ALL ON public.billing_transactions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_events_unified TO authenticated;
GRANT ALL ON public.customer_events_unified TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_insights_enterprise TO authenticated;
GRANT ALL ON public.customer_insights_enterprise TO service_role;

-- Políticas de RLS
CREATE POLICY "Users can manage tickets of their organization" ON public.customer_tickets
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage billing of their organization" ON public.billing_transactions
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage events of their organization" ON public.customer_events_unified
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage insights of their organization" ON public.customer_insights_enterprise
    FOR ALL TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices
CREATE INDEX IF NOT EXISTS idx_cust_events_un_contact ON public.customer_events_unified(contact_id);
CREATE INDEX IF NOT EXISTS idx_cust_events_un_created ON public.customer_events_unified(created_at DESC);

-- Trigger de Timeline para Deals
CREATE OR REPLACE FUNCTION public.log_deal_to_timeline()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customer_events_unified (organization_id, contact_id, event_type, title, description, metadata)
    VALUES (NEW.organization_id, NEW.contact_id, 'deal', 'Fase de Negócio Atualizada', 'O negócio foi movido ou atualizado: ' || NEW.title, jsonb_build_object('deal_id', NEW.id, 'status', NEW.status, 'value', NEW.value));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_deal_change_timeline AFTER INSERT OR UPDATE OF stage_id ON public.deals FOR EACH ROW EXECUTE PROCEDURE public.log_deal_to_timeline();
