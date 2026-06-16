import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";
import { toast } from "sonner";

export const useAgents = () => {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  // @ts-ignore - organization_id exists in the database but might be missing in some profile type branches
  const orgId = profile?.organization_id || profile?.company_id;

  const { data: agents, isLoading } = useQuery({
    queryKey: ["ai-agents", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const createAgent = useMutation({
    mutationFn: async (newAgent: any) => {
      const { data, error } = await supabase
        .from("ai_agents")
        .insert([{ ...newAgent, organization_id: orgId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("Agente criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar agente: " + error.message);
    },
  });

  const updateAgent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("ai_agents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("Agente atualizado!");
    },
  });

  const toggleAgent = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("ai_agents")
        .update({ is_active, status: is_active ? "active" : "inactive" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
    },
    onError: (e: any) => toast.error("Erro ao atualizar status: " + e.message),
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_agents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("Agente excluído.");
    },
    onError: (e: any) => toast.error("Erro ao excluir: " + e.message),
  });

  return {
    agents,
    isLoading,
    createAgent,
    updateAgent,
    toggleAgent,
    deleteAgent,
  };
};

export type AgentTemplate = {
  slug: string;
  name: string;
  description: string;
  role_type: string;
  system_prompt: string;
  sector: string;
};

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    slug: "pharmacy-attendant",
    name: "Atendente Farmácia",
    description: "Tira dúvidas sobre medicamentos, horários e disponibilidade.",
    role_type: "support",
    sector: "Farmácia",
    system_prompt:
      "Você é um atendente de farmácia. Responda com clareza sobre disponibilidade de medicamentos, horários de funcionamento e orientações gerais. Nunca prescreva — oriente buscar profissional.",
  },
  {
    slug: "clinic-scheduler",
    name: "Agendamento Clínica",
    description: "Agenda consultas, confirma horários e tira dúvidas básicas.",
    role_type: "scheduling",
    sector: "Clínica",
    system_prompt:
      "Você é um assistente de agendamento clínico. Confirme dados, sugira horários e registre preferências. Em urgências, oriente procurar pronto-atendimento.",
  },
  {
    slug: "ecommerce-support",
    name: "Suporte E-commerce",
    description: "Acompanha pedidos, trocas, devoluções e dúvidas de produto.",
    role_type: "support",
    sector: "E-commerce",
    system_prompt:
      "Você é um atendente de e-commerce. Ajude com status de pedidos, trocas, devoluções e dúvidas de produto. Seja objetivo e cordial.",
  },
  {
    slug: "sdr-b2b",
    name: "SDR B2B",
    description: "Qualifica leads B2B, coleta BANT e agenda demonstrações.",
    role_type: "sales",
    sector: "Vendas",
    system_prompt:
      "Você é um SDR B2B. Faça perguntas de qualificação (orçamento, autoridade, necessidade, tempo) e proponha agendar uma demo quando o lead estiver qualificado.",
  },
];

export const useInstallAgentTemplate = () => {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  // @ts-ignore
  const orgId = profile?.organization_id || profile?.company_id;

  return useMutation({
    mutationFn: async (template: AgentTemplate) => {
      if (!orgId) throw new Error("Organização não encontrada");
      const { data, error } = await supabase
        .from("ai_agents")
        .insert([
          {
            organization_id: orgId,
            name: template.name,
            description: template.description,
            role_type: template.role_type,
            system_prompt: template.system_prompt,
            is_active: true,
            metadata: { template_slug: template.slug, sector: template.sector },
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("Agente instalado! Refine as instruções no editor.");
    },
    onError: (e: any) => toast.error("Erro ao instalar agente: " + e.message),
  });
};
