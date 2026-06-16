import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";
import { toast } from "sonner";

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

  // 7. Conversas omnichannel ligadas ao contato
  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["customer-360-conversations", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id, status, priority, last_message_preview, last_message_at, created_at,
          channel_id, queue_id, agent_id,
          channels:channel_id ( name, type ),
          queues:queue_id ( name ),
          profiles:agent_id ( full_name )
        `)
        .eq("contact_id", contactId!)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!contactId,
  });

  // 8. Notas internas (via conversas do contato)
  const conversationIds = (conversations ?? []).map((c: any) => c.id);
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["customer-360-notes", contactId, conversationIds.join(",")],
    queryFn: async () => {
      if (conversationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("internal_notes")
        .select(`id, content, created_at, author_id, conversation_id, profiles:author_id ( full_name )`)
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!contactId && conversationIds.length > 0,
  });

  return {
    contact,
    timeline,
    deals,
    tickets,
    insights,
    transactions,
    conversations: conversations ?? [],
    notes: notes ?? [],
    isLoading:
      isLoadingContact || isLoadingTimeline || isLoadingDeals || isLoadingTickets ||
      isLoadingInsights || isLoadingFinance || isLoadingConversations || isLoadingNotes,
  };
};

/** Adiciona nota interna vinculada a uma conversa do contato.
 *  Se o contato não tem conversa ainda, cria uma "nota solta" via conversation_id obrigatório
 *  — então exigimos conversationId; quando ausente, usamos a primeira conversa disponível. */
export function useAddContactNote(contactId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { content: string; conversationId?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      let convId = input.conversationId;
      if (!convId) {
        const { data: convs } = await supabase
          .from("conversations")
          .select("id")
          .eq("contact_id", contactId!)
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .limit(1);
        convId = convs?.[0]?.id;
      }
      if (!convId) throw new Error("Crie ou vincule uma conversa antes de adicionar nota.");
      const { data, error } = await supabase
        .from("internal_notes")
        .insert({ conversation_id: convId, author_id: userData.user.id, content: input.content })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-360-notes", contactId] });
      qc.invalidateQueries({ queryKey: ["internal_notes"] });
      toast.success("Nota adicionada");
    },
    onError: (e: any) => toast.error(`Erro ao adicionar nota: ${e.message}`),
  });
}

/** Cria oportunidade real no CRM a partir do contato. */
export function useCreateOpportunityForContact(contactId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      value?: number;
      pipeline_id?: string;
      stage_id?: string;
      probability?: number;
    }) => {
      if (!contactId) throw new Error("Contato inválido");
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      const { data: profile } = await supabase
        .from("profiles").select("organization_id").eq("id", userData.user.id).single();
      if (!profile?.organization_id) throw new Error("Organização não encontrada");
      const payload: any = {
        organization_id: profile.organization_id,
        contact_id: contactId,
        title: input.title,
        value: input.value ?? 0,
        probability: input.probability ?? 50,
        status: "open",
      };
      if (input.pipeline_id) payload.pipeline_id = input.pipeline_id;
      if (input.stage_id) payload.stage_id = input.stage_id;
      const { data, error } = await supabase.from("deals").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-360-deals", contactId] });
      qc.invalidateQueries({ queryKey: ["customer-360-timeline", contactId] });
      qc.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Oportunidade criada");
    },
    onError: (e: any) => toast.error(`Erro ao criar oportunidade: ${e.message}`),
  });
}
