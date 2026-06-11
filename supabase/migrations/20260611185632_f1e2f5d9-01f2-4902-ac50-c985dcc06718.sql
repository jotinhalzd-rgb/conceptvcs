-- 1. Extensão dos Contatos
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS main_channel TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- 2. Trigger para popular timeline a partir de Tickets
CREATE OR REPLACE FUNCTION public.log_ticket_to_timeline()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customer_events_unified (organization_id, contact_id, event_type, title, description, metadata)
    VALUES (NEW.organization_id, NEW.contact_id, 'ticket', 'Novo Ticket: ' || NEW.subject, NEW.description, jsonb_build_object('ticket_id', NEW.id, 'priority', NEW.priority));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_ticket_created_timeline AFTER INSERT ON public.customer_tickets FOR EACH ROW EXECUTE PROCEDURE public.log_ticket_to_timeline();

-- 3. Trigger para popular timeline a partir de Transações Financeiras
CREATE OR REPLACE FUNCTION public.log_billing_to_timeline()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customer_events_unified (organization_id, contact_id, event_type, title, description, metadata)
    VALUES (NEW.organization_id, NEW.contact_id, 'billing', 'Pagamento ' || NEW.status, 'Valor: ' || NEW.amount || ' ' || NEW.currency, jsonb_build_object('transaction_id', NEW.id, 'amount', NEW.amount, 'method', NEW.payment_method));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_billing_created_timeline AFTER INSERT ON public.billing_transactions FOR EACH ROW EXECUTE PROCEDURE public.log_billing_to_timeline();

-- 4. Função para calcular Score de Saúde (IA Mock placeholder)
CREATE OR REPLACE FUNCTION public.refresh_customer_health_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica placeholder para demonstrar atualização de score
    UPDATE public.contacts 
    SET lead_score = LEAST(100, (SELECT count(*) * 10 FROM public.customer_events_unified WHERE contact_id = NEW.contact_id))
    WHERE id = NEW.contact_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_event_refresh_score AFTER INSERT ON public.customer_events_unified FOR EACH ROW EXECUTE PROCEDURE public.refresh_customer_health_score();
