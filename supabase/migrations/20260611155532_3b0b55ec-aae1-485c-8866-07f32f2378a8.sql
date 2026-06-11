-- Remover políticas permissivas temporárias
DROP POLICY IF EXISTS "Authenticated users can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can view customer events" ON public.customer_events;
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can view surveys" ON public.satisfaction_surveys;

-- Criar políticas restritivas baseadas no ID do usuário
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns 
FOR ALL TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view relevant events" ON public.customer_events 
FOR SELECT TO authenticated 
USING (true); -- Permitir visualização de eventos para todos autenticados por enquanto (CDP compartilhado)

CREATE POLICY "Users can view audit logs" ON public.audit_logs 
FOR SELECT TO authenticated 
USING (true); -- Permitir visualização de logs (Governança/Auditoria)

CREATE POLICY "Users can view satisfaction surveys" ON public.satisfaction_surveys 
FOR SELECT TO authenticated 
USING (true);
