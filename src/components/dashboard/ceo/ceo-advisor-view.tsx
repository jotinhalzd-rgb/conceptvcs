import React from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowUpRight, ShieldCheck, RefreshCw, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealAlerts } from "@/hooks/dashboard/use-real-alerts";

export const CEOAdvisorView = () => {
  const { alerts, recommendations, isLoading, refetch, status } = useRealAlerts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl bg-white/[0.03]" />
        <Skeleton className="h-64 rounded-3xl bg-white/[0.03]" />
      </div>
    );
  }

  const critical = alerts.filter((a) => a.severity === "critical");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
              CEO Advisor
              <Badge className="bg-indigo-600/10 text-indigo-400 border-none font-black text-[10px] uppercase h-5">Live</Badge>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Recomendações baseadas no estado real da operação</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl border-white/10 bg-white/5 gap-2 text-[10px] font-black uppercase tracking-widest">
          <RefreshCw className="w-3 h-3" /> Atualizar
        </Button>
      </div>

      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Alertas críticos", value: critical.length },
            { label: "Conversas sem agente", value: status.conversations.unassigned },
            { label: "Oportunidades sem dono", value: status.deals.unassigned },
            { label: "Canais pendentes", value: status.channels.pending },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{s.label}</p>
              <p className="text-2xl font-black text-white tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <section>
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-indigo-400" /> Recomendações
        </h3>
        {recommendations.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-3xl p-10 text-center">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
            <p className="text-xs font-black text-white uppercase tracking-widest">Sem alertas críticos com os dados atuais.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((r) => (
              <Link
                key={r.id}
                to={r.action.route}
                className="flex items-center justify-between gap-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 hover:border-indigo-500/40 transition"
              >
                <span className="text-sm text-slate-200">{r.text}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1 shrink-0">
                  {r.action.label} <ArrowUpRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};