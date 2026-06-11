import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export const useOIL = () => {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id || profile?.company_id;

  const { data: recommendations, isLoading: isLoadingRecs } = useQuery({
    queryKey: ["oil-recommendations", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oil_recommendations")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: healthScores, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["oil-health-scores", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oil_health_scores")
        .select("*")
        .order("calculated_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  return {
    recommendations,
    healthScores,
    isLoading: isLoadingRecs || isLoadingHealth,
  };
};
