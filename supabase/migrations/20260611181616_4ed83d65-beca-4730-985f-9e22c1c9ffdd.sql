-- Tabela de Planos de Assinatura
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly')),
    features JSONB NOT NULL DEFAULT '{}'::jsonb, -- max_users, max_channels, max_messages, ai_access, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Tabela de Assinaturas (Subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'canceled', 'suspended', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    external_subscription_id TEXT, -- ID do gateway (Stripe/Asaas)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company subscription" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.company_id = subscriptions.company_id
        )
    );

-- Tabela de Faturas (Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id),
    amount DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
    pdf_url TEXT,
    billing_reason TEXT, -- 'subscription_cycle', 'upsell', 'overage'
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Tabela de Log de Uso (Usage Logs)
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL, -- 'message_sent', 'voice_minute', 'ai_token'
    quantity INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT ON public.usage_logs TO authenticated;
GRANT ALL ON public.usage_logs TO service_role;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Comissões de Parceiros
CREATE TABLE IF NOT EXISTS public.partner_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.profiles(id),
    company_id UUID NOT NULL REFERENCES public.companies(id),
    invoice_id UUID REFERENCES public.invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.partner_commissions TO authenticated;
GRANT ALL ON public.partner_commissions TO service_role;
ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;

-- Extensão da tabela de Empresas para White Label e Branding
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4f46e5',
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS support_email TEXT;

-- Inserir Planos Padrão
INSERT INTO public.subscription_plans (name, price, billing_interval, features)
VALUES 
('STARTER', 297.00, 'monthly', '{"max_users": 5, "max_channels": 2, "max_messages": 10000, "ai_enabled": false}'),
('PROFESSIONAL', 597.00, 'monthly', '{"max_users": 15, "max_channels": 5, "max_messages": 50000, "ai_enabled": true}'),
('BUSINESS', 1297.00, 'monthly', '{"max_users": 50, "max_channels": 15, "max_messages": 200000, "ai_enabled": true}'),
('ENTERPRISE', 4997.00, 'monthly', '{"max_users": 999, "max_channels": 99, "max_messages": 1000000, "ai_enabled": true}')
ON CONFLICT DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_company_type ON public.usage_logs(company_id, resource_type);
