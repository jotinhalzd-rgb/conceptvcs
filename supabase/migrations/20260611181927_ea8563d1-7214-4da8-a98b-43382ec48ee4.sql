-- Catálogo de Aplicativos de Integração
CREATE TABLE IF NOT EXISTS public.integration_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- 'crm', 'erp', 'ecommerce', 'marketing', 'productivity', 'payments'
    description TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.integration_apps TO authenticated;
GRANT ALL ON public.integration_apps TO service_role;
ALTER TABLE public.integration_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active integration apps" ON public.integration_apps
    FOR SELECT USING (is_active = true);

-- Conexões de Empresas com Aplicativos
CREATE TABLE IF NOT EXISTS public.connected_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES public.integration_apps(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
    credentials JSONB DEFAULT '{}'::jsonb, -- Armazenado com criptografia em produção real
    config JSONB DEFAULT '{}'::jsonb,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(organization_id, app_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.connected_integrations TO authenticated;
GRANT ALL ON public.connected_integrations TO service_role;
ALTER TABLE public.connected_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage integrations of their organization" ON public.connected_integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = connected_integrations.organization_id
        )
    );

-- Barramento de Eventos Unificado (Event Bus)
CREATE TABLE IF NOT EXISTS public.integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.connected_integrations(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'order_created', 'lead_converted', 'payment_paid', etc.
    payload JSONB NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT ON public.integration_events TO authenticated;
GRANT ALL ON public.integration_events TO service_role;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events of their organization" ON public.integration_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = integration_events.organization_id
        )
    );

-- Gestão de API Keys (API Pública)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL, -- Ex: 'oc_live_'
    key_hash TEXT NOT NULL UNIQUE, -- Hash da chave real
    scopes TEXT[] DEFAULT '{read,write}',
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage API keys of their organization" ON public.api_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = api_keys.organization_id
        )
    );

-- Webhook Center (Notificações de Saída)
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_url TEXT NOT NULL,
    events TEXT[] DEFAULT '{}', -- ['chat.message', 'lead.created', etc]
    secret TEXT NOT NULL, -- HMAC secret
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_subscriptions TO authenticated;
GRANT ALL ON public.webhook_subscriptions TO service_role;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;

-- Inserir Aplicativos Prioritários no Marketplace
INSERT INTO public.integration_apps (name, slug, category, description, logo_url)
VALUES 
('Shopify', 'shopify', 'ecommerce', 'Conecte sua loja Shopify para centralizar pedidos e clientes.', 'https://cdn.worldvectorlogo.com/logos/shopify.svg'),
('Omie', 'omie', 'erp', 'Sincronize faturamento, estoque e financeiro com o ERP Omie.', 'https://logospng.org/download/omie/logo-omie-1024.png'),
('Bling', 'bling', 'erp', 'Integração completa com Bling para gestão de vendas e logística.', 'https://www.bling.com.br/estilos/images/logo-bling.svg'),
('RD Station', 'rd-station', 'marketing', 'Automação de marketing e sincronização de leads pro RD Station.', 'https://static.rdstation.com.br/assets/logos/logo-rdstation-marketing.svg'),
('Stripe', 'stripe', 'payments', 'Receba pagamentos e gerencie assinaturas com a Stripe.', 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg'),
('Google Calendar', 'google-calendar', 'productivity', 'Sincronize reuniões e agendamentos com seu calendário.', 'https://cdn.worldvectorlogo.com/logos/google-calendar-6.svg')
ON CONFLICT (slug) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_integration_events_org ON public.integration_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON public.api_keys(organization_id);
