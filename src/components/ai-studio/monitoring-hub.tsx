import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgents } from "@/hooks/ai/use-agents";
import { Activity, Clock, TrendingUp, MessageSquare, BarChart3 } from "lucide-react";

type PerfRow = {
  agent_id: string;
  total_chats: number | null;
  resolved_chats: number | null;
  avg_response_time: number | null;
  csat_score: number | null;
  revenue_generated: number | null;
  conversion_rate: number | null;
};

export const MonitoringHub = () => {
  const { agents } = useAgents();
  const agentIds = (agents ?? []).map((a: any) => a.id);

  const { data: perf, isLoading } = useQuery({
    queryKey: ["agent-performance", agentIds.sort().join(",")],
    enabled: agentIds.length > 0,
    queryFn: async (): Promise<PerfRow[]> => {
      const { data, error } = await supabase
        .from("agent_performance")
        .select("agent_id,total_chats,resolved_chats,avg_response_time,csat_score,revenue_generated,conversion_rate")
        .in("agent_id", agentIds);
      if (error) throw error;
      return (data ?? []) as PerfRow[];
    },
  });

  const rows = perf ?? [];
  const totals = rows.reduce(
    (acc, r) => {
      acc.total += r.total_chats ?? 0;
      acc.resolved += r.resolved_chats ?? 0;
      acc.respCount += r.avg_response_time != null ? 1 : 0;
      acc.respSum += r.avg_response_time ?? 0;
      acc.csatCount += r.csat_score != null ? 1 : 0;
      acc.csatSum += r.csat_score ?? 0;
      acc.revenue += r.revenue_generated ?? 0;
      return acc;
    },
    { total: 0, resolved: 0, respCount: 0, respSum: 0, csatCount: 0, csatSum: 0, revenue: 0 },
  );

  const hasData = rows.length > 0 && totals.total > 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Performance da Força Digital</h2>
        <p className="text-slate-500 text-sm mt-1">
          Dados reais de <code className="font-mono">agent_performance</code>. Métricas aparecem após os agentes operarem.
        </p>
      </div>

      {isLoading && (
        <div className="text-slate-500 text-xs uppercase tracking-widest animate-pulse">Carregando métricas...</div>
      )}

      {!isLoading && !hasData && (
        <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center">
          <BarChart3 className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-bold mb-2">Sem dados de performance ainda</p>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Quando os agentes começarem a atender conversas reais, as métricas aparecerão aqui. Nenhum
            número é estimado ou simulado.
          </p>
        </div>
      )}

      {!isLoading && hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={MessageSquare}
            label="Total de atendimentos"
            value={totals.total.toLocaleString()}
            color="text-indigo-400"
          />
          <MetricCard
            icon={Activity}
            label="Resolvidos"
            value={`${totals.resolved.toLocaleString()} (${totals.total ? Math.round((totals.resolved / totals.total) * 100) : 0}%)`}
            color="text-emerald-400"
          />
          <MetricCard
            icon={Clock}
            label="Tempo médio de resposta"
            value={totals.respCount ? `${Math.round(totals.respSum / totals.respCount)}s` : "—"}
            color="text-amber-400"
          />
          <MetricCard
            icon={TrendingUp}
            label="CSAT médio"
            value={totals.csatCount ? (totals.csatSum / totals.csatCount).toFixed(2) : "—"}
            color="text-rose-400"
          />
        </div>
      )}
    </div>
  );
};

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6">
      <div className={`p-2 rounded-xl bg-white/5 inline-flex ${color} mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}