import { DollarSign, Briefcase, Zap, Target, AlertTriangle, ShieldAlert, BarChart3, TrendingUp } from "lucide-react";
import { ActionItem } from "../widgets/action-item";
import { StatsBox } from "../widgets/stats-box";
import { Card, CardContent } from "@/components/ui/card";
import { useCommandEngine } from "../engine/command-engine";
import { useProfile } from "@/hooks/auth/use-auth";

export function CEODashboard() {
  const { data: profile } = useProfile();
  const { signals, loading } = useCommandEngine(profile?.role || 'ceo');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPIs Principais - Centro de Governança */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsBox icon={DollarSign} label="Receita Plataforma" value="R$ 2.4M" color="bg-indigo-500/10 text-indigo-400" trend={{ value: "+12%", positive: true }} />
        <StatsBox icon={Briefcase} label="Empresas Ativas" value="1,240" color="bg-emerald-500/10 text-emerald-400" trend={{ value: "+3%", positive: true }} />
        <StatsBox icon={Zap} label="Consumo IA" value="85%" color="bg-amber-500/10 text-amber-400" trend={{ value: "+15%", positive: false }} />
        <StatsBox icon={Target} label="Growth Mensal" value="+32%" color="bg-purple-500/10 text-purple-400" trend={{ value: "+5%", positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CommandCenter Engine Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Sinais de Comando (IA Engine)
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tempo Real</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-24 bg-white/[0.02] rounded-xl animate-pulse" />)
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
            
            {/* Fallback mock se a engine estiver vazia */}
            {!loading && signals.length === 0 && (
              <ActionItem 
                type="kpi"
                level="low"
                title="Plataforma Estável"
                description="Todos os indicadores de governança operando dentro da normalidade."
              />
            )}
          </div>
        </div>

        {/* Auditoria & Riscos */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Auditoria & Riscos
          </h3>
          <Card className="bg-[#030712] border-white/[0.05] shadow-2xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-white uppercase italic">SLA Crítico Detectado</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">2 empresas atingiram o limite de resposta. Possível gargalo no Suporte L2.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <BarChart3 className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-white uppercase italic">Anomalia de Consumo</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Empresa Z consumiu 40% da cota mensal de IA em apenas 2 dias.</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/[0.05]">
                <button className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors py-2">
                  Abrir Relatório de Auditoria
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
