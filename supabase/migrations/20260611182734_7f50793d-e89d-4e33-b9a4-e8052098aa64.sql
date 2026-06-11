-- Tabela de Agentes de IA
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    role_type TEXT NOT NULL, -- 'sales', 'support', 'finance', 'hr', 'marketing', 'manager', 'ceo'
    tone_of_voice TEXT DEFAULT 'professional', -- 'friendly', 'formal', 'technical', 'direct'
    autonomy_level TEXT DEFAULT 'assistant' CHECK (autonomy_level IN ('assistant', 'semi_autonomous', 'autonomous')),
    system_prompt TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_agents TO authenticated;
GRANT ALL ON public.ai_agents TO service_role;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage agents of their organization" ON public.ai_agents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = ai_agents.organization_id
        )
    );

-- Tabela Pivot para Conhecimento Específico (RAG Segmentado)
CREATE TABLE IF NOT EXISTS public.agent_knowledge_base (
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    knowledge_id UUID NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
    PRIMARY KEY (agent_id, knowledge_id)
);

GRANT SELECT, INSERT, DELETE ON public.agent_knowledge_base TO authenticated;
GRANT ALL ON public.agent_knowledge_base TO service_role;
ALTER TABLE public.agent_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Tabela de Memória do Agente (Contexto por Contato)
CREATE TABLE IF NOT EXISTS public.ai_agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    memory_key TEXT NOT NULL,
    memory_value JSONB NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_agent_memory TO authenticated;
GRANT ALL ON public.ai_agent_memory TO service_role;
ALTER TABLE public.ai_agent_memory ENABLE ROW LEVEL SECURITY;

-- Tabela de Auditoria de Ações da IA
CREATE TABLE IF NOT EXISTS public.ai_agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'send_reply', 'create_deal', 'transfer_queue', 'set_tag'
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'rejected', 'failed')),
    input_params JSONB,
    output_result JSONB,
    performed_by UUID REFERENCES auth.users(id), -- Null se for autônomo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.ai_agent_actions TO authenticated;
GRANT ALL ON public.ai_agent_actions TO service_role;
ALTER TABLE public.ai_agent_actions ENABLE ROW LEVEL SECURITY;

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_agents_org ON public.ai_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_contact ON public.ai_agent_memory(contact_id);

-- Inserir Templates no AI Studio Marketplace
INSERT INTO public.ai_agents (organization_id, name, description, role_type, tone_of_voice, autonomy_level, system_prompt)
SELECT 
    id, 
    'Agente de Qualificação Comercial', 
    'Especialista em identificar interesse de compra e coletar dados iniciais do lead.',
    'sales',
    'friendly',
    'semi_autonomous',
    'Você é um assistente comercial focado em qualificação. Seu objetivo é entender a dor do cliente e agendar uma reunião.'
FROM public.organizations LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.ai_agents (organization_id, name, description, role_type, tone_of_voice, autonomy_level, system_prompt)
SELECT 
    id, 
    'Especialista em Suporte Técnico', 
    'Baseado na documentação oficial para resolver dúvidas de uso do sistema.',
    'support',
    'technical',
    'assistant',
    'Você é um técnico de suporte. Use a base de conhecimento para responder de forma clara e objetiva.'
FROM public.organizations LIMIT 1
ON CONFLICT DO NOTHING;
