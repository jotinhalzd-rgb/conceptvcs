-- Políticas para Planos de Assinatura (Leitura para todos autenticados)
CREATE POLICY "Anyone authenticated can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- Políticas para Faturas (Invoices)
CREATE POLICY "Users can view their own company invoices" ON public.invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.company_id = invoices.company_id
        )
    );

-- Políticas para Log de Uso (Usage Logs)
CREATE POLICY "Users can view their own company usage logs" ON public.usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.company_id = usage_logs.company_id
        )
    );

-- Políticas para Comissões de Parceiros
CREATE POLICY "Partners can view their own commissions" ON public.partner_commissions
    FOR SELECT USING (partner_id = auth.uid());

CREATE POLICY "CEO Master can manage all commissions" ON public.partner_commissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('ceo_master', 'ceo')
        )
    );
