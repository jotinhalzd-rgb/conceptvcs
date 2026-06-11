import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useStages(pipelineId?: string) {
  return useQuery({
    queryKey: ["stages", pipelineId],
    queryFn: async () => {
      let query = supabase
        .from("stages")
        .select("*")
        .order("order_index", { ascending: true });

      if (pipelineId) {
        query = query.eq("pipeline_id", pipelineId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!pipelineId,
  });
}

export function useDeals(pipelineId?: string) {
  return useQuery({
    queryKey: ["deals", pipelineId],
    queryFn: async () => {
      let query = supabase
        .from("deals")
        .select(`
          *,
          contacts(name, email, phone, lead_score),
          stages(name, order_index)
        `)
        .order("created_at", { ascending: false });

      if (pipelineId) {
        query = query.eq("pipeline_id", pipelineId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCRMTasks(dealId?: string) {
  return useQuery({
    queryKey: ["crm-tasks", dealId],
    queryFn: async () => {
      let query = supabase
        .from("crm_tasks")
        .select("*")
        .order("due_date", { ascending: true });

      if (dealId) {
        query = query.eq("deal_id", dealId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCRMGoals() {
  return useQuery({
    queryKey: ["crm-goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_goals")
        .select("*")
        .order("end_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCRMForecast(pipelineId?: string) {
  return useQuery({
    queryKey: ["crm-forecast", pipelineId],
    queryFn: async () => {
      let query = supabase
        .from("crm_forecast")
        .select("*")
        .order("period", { ascending: false });

      if (pipelineId) {
        query = query.eq("pipeline_id", pipelineId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deal: any) => {
      const { data, error } = await supabase
        .from("deals")
        .insert(deal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Negócio criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar negócio: ${error.message}`);
    }
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string, stageId: string }) => {
      const { data, error } = await supabase
        .from("deals")
        .update({ stage_id: stageId, updated_at: new Date().toISOString() })
        .eq("id", dealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}
