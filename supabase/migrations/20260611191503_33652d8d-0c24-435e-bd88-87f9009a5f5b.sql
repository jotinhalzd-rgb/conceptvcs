-- 1. Definição de Planos e Recursos
CREATE TABLE IF NOT EXISTS public.billing_plans_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name TEXT NOT NULL,
    plan_code TEXT UNIQUE NOT NULL, -- starter, professional, business, enterprise
    price_monthly NUMERIC(15,2) NOT NULL,
    price_yearly NUMERIC(15,2) NOT NULL,
    features_config JSONB DEFAULT '{}'::jsonb, -- Limites: {max_users: 10, ai_tokens: 1000, etc}
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Assinaturas Ativas por Organização
CREATE TABLE IF NOT EXISTS public.billing_subscriptions_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.billing_plans_v2(id),
    subscription_status TEXT DEFAULT 'active', -- active, past_due, canceled, trial
    billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    external_customer_id TEXT, -- ID no Stripe, Asaas, etc.
    external_subscription_id TEXT,
    payment_method_type TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Medição de Consumo (Usage Metering)
CREATE TABLE IF NOT EXISTS public.billing_usage_meters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL, -- messages, ai_tokens, storage_bytes, api_calls
    quantity_used NUMERIC(15,4) DEFAULT 0,
    reset_cycle_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(organization_id, resource_type)
);

-- 4. Faturas e Pagamentos
CREATE TABLE IF NOT EXISTS public.billing_invoices_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.billing_subscriptions_v2(id),
    amount_total NUMERIC(15,2) NOT NULL,
    currency_code TEXT DEFAULT 'BRL',
    invoice_status TEXT DEFAULT 'pending', -- pending, paid, void, uncollectible
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    invoice_pdf_url TEXT,
    external_invoice_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Gestão de Comissões e Revenue Share (Parceiros)
CREATE TABLE IF NOT EXISTS public.billing_commissions_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    source_org_id UUID NOT NULL REFERENCES public.organizations(id), -- Quem pagou
    asset_id UUID REFERENCES public.hub_assets_marketplace(id), -- Opcional se for venda de app
    amount_total NUMERIC(15,2) NOT NULL,
    commission_amount NUMERIC(15,2) NOT NULL,
    commission_type TEXT NOT NULL, -- recruitment, marketplace_sale, recurring
    payout_status TEXT DEFAULT 'pending', -- pending, processed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.billing_plans_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_usage_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_commissions_v2 ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.billing_plans_v2 TO authenticated;
GRANT ALL ON public.billing_plans_v2 TO service_role;

GRANT SELECT ON public.billing_subscriptions_v2 TO authenticated;
GRANT ALL ON public.billing_subscriptions_v2 TO service_role;

GRANT SELECT ON public.billing_usage_meters TO authenticated;
GRANT ALL ON public.billing_usage_meters TO service_role;

GRANT SELECT ON public.billing_invoices_v2 TO authenticated;
GRANT ALL ON public.billing_invoices_v2 TO service_role;

GRANT SELECT ON public.billing_commissions_v2 TO authenticated;
GRANT ALL ON public.billing_commissions_v2 TO service_role;

-- Políticas de RLS (Foco em Segurança Extrema)
CREATE POLICY "Anyone can view public plans" ON public.billing_plans_v2
    FOR SELECT TO authenticated USING (is_public = true);

CREATE POLICY "Tenant owner can view own subscription" ON public.billing_subscriptions_v2
    FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant owner can view own usage" ON public.billing_usage_meters
    FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant owner can view own invoices" ON public.billing_invoices_v2
    FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Partners can view own commissions" ON public.billing_commissions_v2
    FOR SELECT TO authenticated USING (partner_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Índices Performance
CREATE INDEX IF NOT EXISTS idx_bill_inv_org ON public.billing_invoices_v2(organization_id);
CREATE INDEX IF NOT EXISTS idx_bill_comm_partner ON public.billing_commissions_v2(partner_org_id);

-- Trigger updated_at
CREATE TRIGGER update_bill_plans_v2_updated_at BEFORE UPDATE ON public.billing_plans_v2 FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_bill_subs_v2_updated_at BEFORE UPDATE ON public.billing_subscriptions_v2 FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
