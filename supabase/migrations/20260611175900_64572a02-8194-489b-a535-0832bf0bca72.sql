-- Habilitar a extensão pgvector para busca semântica
CREATE EXTENSION IF NOT EXISTS vector;

-- Expandir a tabela de base de conhecimento com suporte a vetores
ALTER TABLE public.knowledge_base 
ADD COLUMN IF NOT EXISTS embedding vector(1536); -- Dimensão padrão para modelos da OpenAI

-- Criar tabela de log de sugestões da IA para auditoria e aprendizado
CREATE TABLE IF NOT EXISTS public.ai_suggestions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES auth.users(id),
    suggestion_type TEXT NOT NULL, -- 'reply', 'action', 'insight'
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'edited', 'rejected')),
    applied_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.ai_suggestions_log TO authenticated;
GRANT ALL ON public.ai_suggestions_log TO service_role;
ALTER TABLE public.ai_suggestions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage suggestions for their conversations" ON public.ai_suggestions_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
        )
    );

-- Criar índice vetorial para busca rápida
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx ON public.knowledge_base 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
