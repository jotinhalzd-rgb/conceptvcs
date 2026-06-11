-- Expansão da tabela de conversas para suporte operacional avançado
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS waiting_since TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS sla_status TEXT DEFAULT 'normal' CHECK (sla_status IN ('normal', 'warning', 'breached')),
ADD COLUMN IF NOT EXISTS temperature TEXT DEFAULT 'cold' CHECK (temperature IN ('cold', 'warm', 'hot')),
ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- Tabela para notas internas (comentários de agentes)
CREATE TABLE IF NOT EXISTS public.internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.internal_notes TO authenticated;
GRANT ALL ON public.internal_notes TO service_role;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage internal notes of their conversations" ON public.internal_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
        )
    );

-- Tabela de Auditoria de Conversas (Logs Operacionais)
CREATE TABLE IF NOT EXISTS public.conversation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'transfer', 'status_change', 'queue_change', 'agent_assignment'
    performed_by UUID REFERENCES auth.users(id),
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT ON public.conversation_audit TO authenticated;
GRANT ALL ON public.conversation_audit TO service_role;
ALTER TABLE public.conversation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs" ON public.conversation_audit
    FOR SELECT USING (true);

-- Tabela de Regras de Roteamento Inteligente
CREATE TABLE IF NOT EXISTS public.routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    target_queue_id UUID NOT NULL REFERENCES public.queues(id),
    priority_bonus INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.routing_rules TO authenticated;
GRANT ALL ON public.routing_rules TO service_role;
ALTER TABLE public.routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage routing rules" ON public.routing_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.company_id = routing_rules.company_id
        )
    );

-- Inserir algumas filas padrão se não existirem
INSERT INTO public.queues (name, department, priority_level, color)
VALUES 
('Comercial', 'Sales', 10, '#10b981'),
('Suporte Técnico', 'Support', 5, '#3b82f6'),
('Financeiro', 'Finance', 8, '#f59e0b'),
('Retenção', 'Success', 15, '#ef4444')
ON CONFLICT DO NOTHING;

-- Inserir algumas regras de roteamento de exemplo
INSERT INTO public.routing_rules (company_id, keyword, target_queue_id)
SELECT 
    c.id, 
    'vendas', 
    (SELECT id FROM public.queues WHERE name = 'Comercial' LIMIT 1)
FROM public.companies c
LIMIT 1;
