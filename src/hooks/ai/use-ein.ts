import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export const useEIN = () => {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;
  const industry = (profile as any)?.industry || "Varejo"; 

  // 1. Benchmarks Setoriais (Anonimizados)
  const { data: benchmarks, isLoading: isLoadingBenchmarks } = useQuery({
    queryKey: ["ein-benchmarks-v2", industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ein_industry_benchmarks_v2")
        .select("*")
        .eq("industry", industry)
        .order("measured_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // 2. Recomendações do CEO Advisor (Personalizado por Tenant)
  const { data: advisorLogs, isLoading: isLoadingAdvisor } = useQuery({
    queryKey: ["ein-advisor-logs-v2", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ein_advisor_logs_v2")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  // 3. Melhores Práticas & Tendências
  const { data: sectorTrends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ["ein-sector-trends-v2", industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ein_sector_trends_v2")
        .select("*")
        .eq("industry", industry)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: bestPractices, isLoading: isLoadingPractices } = useQuery({
    queryKey: ["ein-best-practices-v2", industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ein_best_practices_v2")
        .select("*")
        .eq("industry", industry)
        .eq("is_verified", true);
      
      if (error) throw error;
      return data;
    },
  });

  // Mapeamento de compatibilidade para a UI
  const insights = advisorLogs?.map(log => ({
    type: log.insight_type,
    title: log.message,
    content: log.recommendation,
    priority: log.insight_type === 'risk' ? 'high' : 'medium'
  })) || [];

  return {
    benchmarks,
    insights,
    advisorLogs,
    sectorTrends,
    bestPractices,
    industry,
    isLoading: isLoadingBenchmarks || isLoadingAdvisor || isLoadingTrends || isLoadingPractices,
  };
};
