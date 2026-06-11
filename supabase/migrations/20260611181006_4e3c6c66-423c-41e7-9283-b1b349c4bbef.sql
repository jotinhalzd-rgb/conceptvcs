-- Tabela de Ramais Virtuais (Voice Extensions)
CREATE TABLE IF NOT EXISTS public.voice_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES auth.users(id),
    extension_number TEXT NOT NULL,
    status TEXT DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'offline', 'ringing', 'on_hold')),
    voicemail_enabled BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(organization_id, extension_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_extensions TO authenticated;
GRANT ALL ON public.voice_extensions TO service_role;
ALTER TABLE public.voice_extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage extensions of their organization" ON public.voice_extensions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = voice_extensions.organization_id
        )
    );

-- Tabela de Registro de Chamadas (Call Logs)
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES auth.users(id),
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    status TEXT NOT NULL, -- 'completed', 'missed', 'busy', 'failed', 'no-answer'
    duration_seconds INTEGER DEFAULT 0,
    recording_url TEXT,
    transcription_text TEXT,
    ai_summary TEXT,
    ai_sentiment TEXT,
    cost DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.call_logs TO authenticated;
GRANT ALL ON public.call_logs TO service_role;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view call logs of their organization" ON public.call_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = call_logs.organization_id
        )
    );

-- Tabela de Fluxos de URA (IVR Flows)
CREATE TABLE IF NOT EXISTS public.ivr_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Estrutura visual da URA
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ivr_flows TO authenticated;
GRANT ALL ON public.ivr_flows TO service_role;
ALTER TABLE public.ivr_flows ENABLE ROW LEVEL SECURITY;

-- Índices para performance de busca de chamadas
CREATE INDEX IF NOT EXISTS idx_call_logs_contact ON public.call_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_org ON public.call_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_voice_extensions_agent ON public.voice_extensions(agent_id);

-- Inserir ramais demo
INSERT INTO public.voice_extensions (organization_id, extension_number, status)
SELECT id, '1001', 'available'
FROM public.organizations LIMIT 1
ON CONFLICT DO NOTHING;
