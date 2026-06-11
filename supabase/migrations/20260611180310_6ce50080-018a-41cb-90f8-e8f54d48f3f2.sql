-- Tabela para mapeamento de identidades externas ao contato único
CREATE TABLE IF NOT EXISTS public.customer_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'whatsapp', 'instagram', 'email', 'telegram', 'webchat'
    external_id TEXT NOT NULL, -- Ex: número de telefone, handle do IG, endereço de email
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(provider, external_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_identities TO authenticated;
GRANT ALL ON public.customer_identities TO service_role;
ALTER TABLE public.customer_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage identities of their organization contacts" ON public.customer_identities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contacts c
            WHERE c.id = contact_id AND c.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
        )
    );

-- Log de Webhooks para auditoria e debug de integrações
CREATE TABLE IF NOT EXISTS public.channel_webhooks_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'processed', -- 'processed', 'error', 'retrying'
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT ON public.channel_webhooks_log TO authenticated;
GRANT ALL ON public.channel_webhooks_log TO service_role;
ALTER TABLE public.channel_webhooks_log ENABLE ROW LEVEL SECURITY;

-- Adicionar campos de status e monitoramento na tabela de canais
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline', -- 'online', 'offline', 'error', 'maintenance'
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_log TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Índices para busca rápida de identidade
CREATE INDEX IF NOT EXISTS idx_customer_identities_external ON public.customer_identities(external_id);
CREATE INDEX IF NOT EXISTS idx_customer_identities_contact ON public.customer_identities(contact_id);

-- Inserir alguns canais demo
INSERT INTO public.channels (organization_id, name, provider, is_active, status)
SELECT id, 'WhatsApp Principal', 'whatsapp', true, 'online'
FROM public.organizations LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.channels (organization_id, name, provider, is_active, status)
SELECT id, 'Instagram Direct', 'instagram', true, 'online'
FROM public.organizations LIMIT 1
ON CONFLICT DO NOTHING;
