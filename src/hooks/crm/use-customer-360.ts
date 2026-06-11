import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export const useCustomer360 = (contactId: string | undefined) => {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;

  // 1. Dados Básicos do Contato
  const { data: contact, isLoading: isLoadingContact } = useQuery({
    queryKey: ["customer-360-contact", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", contactId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
  });

  // 2. Timeline Unificada
  const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["customer-360-timeline", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_events_unified")
        .select("*")
        .eq("contact_id", contactId!)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
  });

  // 3. Negócios (Deals)
  const { data: deals, isLoading: isLoadingDeals } = useQuery({
    queryKey: ["customer-360-deals", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("contact_id", contactId!)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
  });

  // 4. Suporte (Tickets)
  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ["customer-360-tickets", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_tickets")
        .select("*")
        .eq("contact_id", contactId!)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
  });

  // 5. Insights de IA
  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["customer-360-insights", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_insights_enterprise")
        .select("*")
        .eq("contact_id", contactId!)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
  });

  // 6. Financeiro (Transações)
  const { data: transactions, isLoading: isLoadingFinance } = useQuery({
    queryKey: ["customer-360-finance", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_transactions")
        .select("*")
        .eq("contact_id", contactId!)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
  });

  return {
    contact,
    timeline,
    deals,
    tickets,
    insights,
    transactions,
    isLoading: isLoadingContact || isLoadingTimeline || isLoadingDeals || isLoadingTickets || isLoadingInsights || isLoadingFinance,
  };
};
