-- Filas de Atendimento
CREATE TABLE IF NOT EXISTS public.queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#4f46e5',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Evoluir Conversas (Mestre) - Adicionando colunas de IA se não existirem
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='ai_sentiment') THEN
        ALTER TABLE public.conversations ADD COLUMN ai_sentiment TEXT DEFAULT 'neutral';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='ai_urgency_score') THEN
        ALTER TABLE public.conversations ADD COLUMN ai_urgency_score FLOAT DEFAULT 0.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='ai_intent') THEN
        ALTER TABLE public.conversations ADD COLUMN ai_intent TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='ai_summary') THEN
        ALTER TABLE public.conversations ADD COLUMN ai_summary TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='conversion_probability') THEN
        ALTER TABLE public.conversations ADD COLUMN conversion_probability FLOAT DEFAULT 0.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='churn_risk_probability') THEN
        ALTER TABLE public.conversations ADD COLUMN churn_risk_probability FLOAT DEFAULT 0.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='queue_id') THEN
        ALTER TABLE public.conversations ADD COLUMN queue_id UUID REFERENCES public.queues(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='priority') THEN
        ALTER TABLE public.conversations ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
END $$;

-- Evoluir Mensagens (Histórico Imutável)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_edited') THEN
        ALTER TABLE public.messages ADD COLUMN is_edited BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='original_content') THEN
        ALTER TABLE public.messages ADD COLUMN original_content TEXT;
    END IF;
END $$;

-- Sistema de Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#64748b',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vínculo Tags-Conversas
CREATE TABLE IF NOT EXISTS public.conversation_tags (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, tag_id)
);

-- Knowledge Hub
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Eventos Omnichannel (Timeline)
CREATE TABLE IF NOT EXISTS public.omnichannel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    event_type TEXT NOT NULL, 
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance de Agentes
CREATE TABLE IF NOT EXISTS public.agent_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    total_chats INTEGER DEFAULT 0,
    resolved_chats INTEGER DEFAULT 0,
    avg_response_time FLOAT DEFAULT 0.0,
    conversion_rate FLOAT DEFAULT 0.0,
    csat_score FLOAT DEFAULT 0.0,
    revenue_generated DECIMAL(12,2) DEFAULT 0.0,
    UNIQUE(agent_id, date)
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.omnichannel_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_performance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

GRANT ALL ON public.queues TO service_role;
GRANT ALL ON public.tags TO service_role;
GRANT ALL ON public.conversation_tags TO service_role;
GRANT ALL ON public.knowledge_base TO service_role;
GRANT ALL ON public.omnichannel_events TO service_role;
GRANT ALL ON public.agent_performance TO service_role;
GRANT ALL ON public.conversations TO service_role;
GRANT ALL ON public.messages TO service_role;

-- RLS
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omnichannel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Auth users manage queues" ON public.queues FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users manage tags" ON public.tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users manage conversation_tags" ON public.conversation_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users manage knowledge" ON public.knowledge_base FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users manage events" ON public.omnichannel_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users manage performance" ON public.agent_performance FOR ALL USING (auth.role() = 'authenticated');

-- Functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_queues_updated_at BEFORE UPDATE ON public.queues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
