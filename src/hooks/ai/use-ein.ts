import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export const useEIN = () => {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id || profile?.company_id;
  const industry = profile?.industry || "Retail"; // Default for demo

  const { data: benchmarks, isLoading: isLoadingBenchmarks } = useQuery({
    queryKey: ["ein-benchmarks", industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ein_industry_benchmarks")
        .select("*")
        .eq("industry", industry);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["ein-insights", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ein_advisor_logs")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: bestPractices, isLoading: isLoadingPractices } = useQuery({
    queryKey: ["ein-best-practices", industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ein_best_practices")
        .select("*")
        .eq("industry", industry)
        .eq("is_verified", true);
      
      if (error) throw error;
      return data;
    },
  });

  return {
    benchmarks,
    insights,
    bestPractices,
    industry,
    isLoading: isLoadingBenchmarks || isLoadingInsights || isLoadingPractices,
  };
};
