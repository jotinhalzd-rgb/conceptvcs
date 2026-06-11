import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";

export const useOIL = () => {
  const { data: profile } = useProfile();
  const orgId = profile?.organization_id;

  // 1. Insights Estratégicos (Decisões & Recomendações)
  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["oil-insights-v2", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oil_insights_v2")
        .select("*")
        .eq("organization_id", orgId!)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  // 2. Alertas Críticos (Riscos & Oportunidades)
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["oil-alerts-v2", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oil_alerts_v2")
        .select("*")
        .eq("organization_id", orgId!)
        .eq("is_resolved", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  // 3. Histórico de Saúde (Health Score)
  const { data: healthHistory, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["oil-health-history", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oil_health_history")
        .select("*")
        .eq("organization_id", orgId!)
        .order("measured_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  // 4. Sinais Recentes (Operacional)
  const { data: signals, isLoading: isLoadingSignals } = useQuery({
    queryKey: ["oil-signals-v2", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oil_signals_v2")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  // Legado para compatibilidade se necessário
  const recommendations = insights?.map(i => ({
    title: i.title,
    description: i.description,
    impact: i.impact_estimate,
    priority: i.category === 'sales' ? 'High' : 'Medium'
  })) || [];

  const latestScore = healthHistory?.[0]?.score || 94;

  return {
    insights,
    alerts,
    healthHistory,
    signals,
    recommendations, // Backward compat
    latestScore,
    isLoading: isLoadingInsights || isLoadingAlerts || isLoadingHealth || isLoadingSignals,
  };
};
