-- 1. Políticas faltantes (Linter Fix)
CREATE POLICY "Tenant isolation for channel audit logs" ON public.channel_audit_logs_v2
    FOR SELECT TO authenticated USING (
        actor_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
        target_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
        network_id IN (SELECT id FROM public.channel_networks_v2 WHERE master_org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
    );

-- 2. Revogação de execução pública (Linter Fix)
ALTER FUNCTION public.log_ticket_to_timeline() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_ticket_to_timeline() FROM authenticated;

ALTER FUNCTION public.log_billing_to_timeline() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_billing_to_timeline() FROM authenticated;

ALTER FUNCTION public.refresh_customer_health_score() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_customer_health_score() FROM authenticated;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;

ALTER FUNCTION public.log_deal_to_timeline() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_deal_to_timeline() FROM authenticated;
