import React from "react";
import { Link } from "@tanstack/react-router";
import { BrainCircuit, AlertTriangle, ShieldCheck, ArrowUpRight, RefreshCw, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealAlerts, type RealAlert } from "@/hooks/dashboard/use-real-alerts";

const sevTone: Record<RealAlert["severity"], string> = {
  critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export const OILCommandCenter = () => {
  const { alerts, recommendations, isLoading, refetch, status } = useRealAlerts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-3xl bg-white/[0.03]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">OIL Command Center</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Alertas operacionais baseados em dados reais</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl border-white/10 bg-white/5 gap-2 text-[10px] font-black uppercase tracking-widest">
          <RefreshCw className="w-3 h-3" /> Atualizar
        </Button>
      </div>

      {/* Snapshot real */}
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Conversas abertas", value: status.conversations.open },
            { label: "SLA vencido", value: status.conversations.slaOverdue },
            { label: "Oportunidades abertas", value: status.deals.open },
            { label: "Canais conectados", value: status.channels.connected },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{s.label}</p>
              <p className="text-2xl font-black text-white tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Alertas */}
      <section>
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" /> Alertas
        </h3>
        {alerts.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-3xl p-10 text-center">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
            <p className="text-xs font-black text-white uppercase tracking-widest">Sem alertas críticos com os dados atuais.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((a) => (
              <div key={a.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest ${sevTone[a.severity]}`}>{a.severity}</Badge>
                  <span className="text-2xl font-black text-white tabular-nums">{a.count}</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{a.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{a.description}</p>
                </div>
                <Link to={a.action.route} className="mt-auto">
                  <Button size="sm" variant="outline" className="w-full rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
                    {a.action.label}
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recomendações */}
      <section>
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> Recomendações
        </h3>
        {recommendations.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-3xl p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
            Nenhuma recomendação no momento.
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((r) => (
              <Link
                key={r.id}
                to={r.action.route}
                className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 hover:border-indigo-500/30 transition"
              >
                <span className="text-sm text-slate-200">{r.text}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1">
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