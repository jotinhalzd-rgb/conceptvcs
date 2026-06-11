-- 1. Colunas de rastreamento em mensagens
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS provider_message_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 2. Adicionar identificador único ao canal (ex: +5511... para WhatsApp)
-- Se não existir, criamos para permitir o roteamento do webhook
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS identifier TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS channels_identifier_idx ON public.channels (identifier) WHERE (identifier IS NOT NULL);

-- 3. Função para roteamento multi-tenant seguro
CREATE OR REPLACE FUNCTION public.get_org_by_channel_identifier(p_identifier TEXT)
RETURNS UUID AS $$
  SELECT organization_id FROM public.channels WHERE identifier = p_identifier LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_org_by_channel_identifier(TEXT) TO service_role;

-- 4. RLS para o Bucket de Anexos
-- Permitir que usuários autenticados vejam anexos de sua própria organização
-- (Considerando que o caminho do arquivo incluirá o organization_id)
CREATE POLICY "Organizational Access to Attachments" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'message-attachments' 
  AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Service Role full access to Attachments" 
ON storage.objects FOR ALL 
TO service_role
USING (bucket_id = 'message-attachments')
WITH CHECK (bucket_id = 'message-attachments');
