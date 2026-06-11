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

  return {
    agents,
    isLoading,
    createAgent,
    updateAgent,
  };
};
