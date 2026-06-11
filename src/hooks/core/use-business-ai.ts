import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useExecutiveInsights() {
  return useQuery({
    queryKey: ["executive-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("executive_insights")
        .select("*")
        .eq("is_resolved", false)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useBusinessHealth() {
  return useQuery({
    queryKey: ["business-health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_health_scores")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
}

export function useResolveInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from("executive_insights")
        .update({ is_resolved: true, updated_at: new Date().toISOString() })
        .eq("id", insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executive-insights"] });
    },
  });
}
