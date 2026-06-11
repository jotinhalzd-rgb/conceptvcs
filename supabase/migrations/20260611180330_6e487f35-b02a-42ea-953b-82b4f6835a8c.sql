-- Criar política de visualização para logs de webhooks
CREATE POLICY "Users can view webhook logs of their organization" ON public.channel_webhooks_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.profiles p ON p.organization_id = c.organization_id
            WHERE c.id = channel_id AND p.id = auth.uid()
        )
    );
