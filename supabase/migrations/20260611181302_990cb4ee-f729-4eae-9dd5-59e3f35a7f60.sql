-- Criar política de visualização e inserção para logs analíticos
CREATE POLICY "Users can manage analytical logs of their organization" ON public.ai_analytical_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.organization_id = ai_analytical_logs.organization_id
        )
    );
