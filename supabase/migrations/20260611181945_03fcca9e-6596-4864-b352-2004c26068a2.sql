-- Criar política de gerenciamento para assinaturas de webhook
CREATE POLICY "Users can manage webhooks of their organization" ON public.webhook_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = webhook_subscriptions.organization_id
        )
    );
