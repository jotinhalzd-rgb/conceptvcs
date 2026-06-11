import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck,
  Zap,
  ArrowUpRight,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const MonitoringHub = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Performance da Força Digital</h2>
          <p className="text-slate-500 text-sm mt-1">Impacto real dos seus agentes de IA na operação.</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
            <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9 bg-indigo-600 text-white shadow-lg">Hoje</Button>
            <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9 text-slate-400">7 Dias</Button>
            <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9 text-slate-400">30 Dias</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Tempo Economizado", value: "142h", change: "+12%", icon: Clock, color: "text-indigo-400" },
          { label: "Ações Autônomas", value: "8.4k", change: "+24%", icon: Zap, color: "text-emerald-400" },
          { label: "Resolução em 1ª Resposta", value: "76%", change: "+5%", icon: ShieldCheck, color: "text-amber-400" },
          { label: "Vendas Geradas (IA)", value: "R$ 12.4k", change: "+8%", icon: TrendingUp, color: "text-rose-400" },
        ].map((metric, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl bg-white/5 ${metric.color}`}>
                    <metric.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black">
                    <TrendingUp className="w-3 h-3" />
                    {metric.change}
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{metric.label}</p>
            <p className="text-2xl font-black text-white">{metric.value}</p>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03]">
                <metric.icon className="w-full h-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-500" />
                    Últimas Ações dos Agentes
                </h3>
                <Button variant="link" className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Ver Logs Completos</Button>
            </div>
            <div className="space-y-6">
                {[
                  { agent: "Agente Comercial", action: "Lead Qualificado", target: "João Silva", time: "2 min atrás", status: "executed" },
                  { agent: "Suporte Técnico", action: "Ticket Criado #442", target: "Empresa ABC", time: "15 min atrás", status: "executed" },
                  { agent: "Agente Financeiro", action: "Negociação de Cobrança", target: "Maria Oliveira", time: "1h atrás", status: "pending" },
                ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            <div>
                                <p className="text-sm font-bold text-white">{log.action}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{log.agent} • {log.target}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                            <span className="text-[10px] text-slate-600 font-bold uppercase">{log.time}</span>
                            <Badge className={log.status === 'executed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}>
                                {log.status}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden group">
            <div className="relative z-10">
                <Zap className="w-12 h-12 text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Economia Gerada</h3>
                <p className="text-indigo-200/60 text-sm mb-8 font-medium">Sua força digital evitou o custo operacional de 3 novos funcionários este mês.</p>
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300">
                        <span>Eficiência</span>
                        <span>92%</span>
                    </div>
                    <div className="h-2 bg-indigo-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 w-[92%]" />
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] -mr-32 -mt-32" />
        </div>
      </div>
    </div>
  );
};
