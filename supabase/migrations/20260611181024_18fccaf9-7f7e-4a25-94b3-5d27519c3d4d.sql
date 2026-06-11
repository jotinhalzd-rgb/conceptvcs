-- Criar política de visualização e gerenciamento para fluxos de URA
CREATE POLICY "Users can manage ivr flows of their organization" ON public.ivr_flows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = ivr_flows.organization_id
        )
    );
