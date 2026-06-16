import React from 'react';
import { useBusinessHealth } from "@/hooks/core/use-business-ai";
import { Activity, ShieldCheck, Heart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/lib/demo-badge";

export const HealthScoreWidget = () => {
  const { data: health, isLoading } = useBusinessHealth();

  const score = health?.score || 85;
  const status = health?.status || 'healthy';

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'healthy': return "text-emerald-400";
      case 'warning': return "text-amber-400";
      case 'critical': return "text-rose-400";
      default: return "text-indigo-400";
    }
  };

  const getStatusBg = (s: string) => {
    switch (s) {
      case 'healthy': return "bg-emerald-500/10 border-emerald-500/20";
      case 'warning': return "bg-amber-500/10 border-amber-500/20";
      case 'critical': return "bg-rose-500/10 border-rose-500/20";
      default: return "bg-indigo-500/10 border-indigo-500/20";
    }
  };

  return (
    <div className={cn("p-6 rounded-3xl border transition-all h-full flex flex-col justify-between overflow-hidden relative group", getStatusBg(status))}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700" />
      
      <div>
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <Heart className={cn("w-4 h-4", getStatusColor(status))} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Business Health Score</span>
            <DemoBadge />
          </div>
          <div className="px-2 py-0.5 rounded-full bg-black/20 border border-white/5 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-white/40" />
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Real-time Sync</span>
          </div>
        </div>

        <div className="flex items-end gap-3 mb-8 relative z-10">
          <span className="text-6xl font-black text-white tracking-tighter">{score}</span>
          <div className="flex flex-col mb-1.5">
            <span className="text-xs font-black text-white/40 leading-none">/100</span>
            <div className="flex items-center gap-1 text-emerald-400 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span className="text-[10px] font-black">4.2%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nível de Risco</p>
            <span className={cn("text-[10px] font-black uppercase tracking-[0.1em]", getStatusColor(status))}>
              {status === 'healthy' ? 'Excelente' : status === 'warning' ? 'Monitorando' : 'Crítico'}
            </span>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Eficiência Operacional</p>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.1em]">92.4%</span>
          </div>
        </div>

        {/* Mini Mini Progress Bars */}
        <div className="flex gap-1 h-1">
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <div key={i} className={cn("flex-1 rounded-full", i <= score/10 ? (status === 'healthy' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500') : 'bg-white/5')} />
          ))}
        </div>
      </div>
    </div>
  );
};
