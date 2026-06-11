import { MessageSquare, Clock, DollarSign, Activity, Star, Rocket, Users, ShieldAlert } from "lucide-react";
import { ActionItem } from "../widgets/action-item";
import { StatsBox } from "../widgets/stats-box";
import { Card, CardContent } from "@/components/ui/card";
import { useCommandEngine } from "../engine/command-engine";
import { useProfile } from "@/hooks/auth/use-auth";

export function CompanyDashboard() {
  const { data: profile } = useProfile();
  const { signals, loading } = useCommandEngine(profile?.role || 'admin');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsBox icon={MessageSquare} label="Conversas Abertas" value="142" color="bg-indigo-500/10 text-indigo-400" />
        <StatsBox icon={Clock} label="Aguardando Resposta" value="12" color="bg-amber-500/10 text-amber-400" />
        <StatsBox icon={DollarSign} label="Vendas Hoje" value="R$ 12.4k" color="bg-emerald-500/10 text-emerald-400" trend={{ value: "+8%", positive: true }} />
        <StatsBox icon={Activity} label="SLA em Risco" value="3" color="bg-rose-500/10 text-rose-400" />
        <StatsBox icon={Star} label="Avaliação Média" value="4.9" color="bg-purple-500/10 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Centro de Comando (Atenção Imediata)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1,2].map(i => <div key={i} className="h-24 bg-white/[0.02] rounded-xl animate-pulse" />)
            ) : (
              signals.map((signal, index) => (
                <ActionItem 
                  key={index}
                  type={signal.type}
                  level={signal.level}
                  title={signal.title}
                  description={signal.description}
                  actionLabel={signal.action_label}
                />
              ))
            )}
          </div>
        </div>

        <Card className="bg-[#030712] border-white/[0.05] shadow-2xl">
          <div className="p-6 border-b border-white/[0.05]">
            <h3 className="text-xs font-black text-white uppercase italic tracking-widest">Time em Operação</h3>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Atendentes</span>
                <span className="text-emerald-400">12 / 15</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[80%] shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Gerentes Online</span>
                <span className="text-indigo-400">2 / 2</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[100%] shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Geral</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-tight">Canais Conectados (3)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
