-- Criar política de visualização para logs de automação
CREATE POLICY "Users can view automation logs of their organization" ON public.automation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.automation_workflows w
            JOIN public.profiles p ON p.organization_id = w.organization_id
            WHERE w.id = workflow_id AND p.id = auth.uid()
        )
    );
