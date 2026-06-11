import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  Layers, 
  Shield, 
  Settings2,
  TrendingUp,
  AlertTriangle,
  MoveHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const QueueCard = ({ name, color, sla, priority, agents, volume, avgTime }: any) => (
  <Card className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] transition-all group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full shadow-[0_0_8px]", color)} />
          <h4 className="text-lg font-black text-white">{name}</h4>
        </div>
        <div className="flex gap-2">
          <div className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-bold text-slate-400 uppercase">SLA: {sla}</div>
          <div className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
            priority === 'Alta' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
          )}>Prio: {priority}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Volume Atual</p>
          <p className="text-xl font-black text-white tabular-nums">{volume}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tempo Médio</p>
          <p className="text-xl font-black text-white tabular-nums">{avgTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.05] pt-4 mt-auto">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-400">{agents} Atendentes</span>
        </div>
        <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all">
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </CardContent>
  </Card>
);

export function QueuesManagement() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
            <Layers className="w-6 h-6 text-indigo-400" />
            Arquitetura de Filas
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Gerenciamento inteligente de distribuição de carga</p>
        </div>
        <div className="flex gap-3">
          <button className="h-10 px-4 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-600/20 transition-all">
            Dashboard em Tempo Real
          </button>
          <button className="h-10 px-6 bg-white text-[#020617] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            Criar Fila
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QueueCard name="Comercial" color="bg-emerald-500 shadow-emerald-500/50" sla="5 min" priority="Alta" agents="8" volume="42" avgTime="2m 30s" />
        <QueueCard name="Financeiro" color="bg-indigo-500 shadow-indigo-500/50" sla="15 min" priority="Média" agents="3" volume="12" avgTime="6m 12s" />
        <QueueCard name="Suporte Técnico" color="bg-amber-500 shadow-amber-500/50" sla="10 min" priority="Alta" agents="12" volume="89" avgTime="14m 45s" />
        <QueueCard name="Pós-venda" color="bg-purple-500 shadow-purple-500/50" sla="24h" priority="Média" agents="4" volume="7" avgTime="1h 20m" />
        <QueueCard name="Cobrança" color="bg-rose-500 shadow-rose-500/50" sla="30 min" priority="Alta" agents="2" volume="25" avgTime="8m 10s" />
        <QueueCard name="VIP Direct" color="bg-white shadow-white/50" sla="1 min" priority="CRÍTICA" agents="1" volume="2" avgTime="45s" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <MoveHorizontal className="w-4 h-4 text-indigo-400" />
              Ações de Fluxo (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Fila de Suporte Congestionada</p>
                <p className="text-xs text-slate-500">IA sugere transferir 3 atendentes do Pós-venda para Suporte por 2 horas.</p>
              </div>
              <button className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg">Executar</button>
            </div>
            
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
              <TrendingUp className="w-6 h-6 text-indigo-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Otimização de Escalonamento</p>
                <p className="text-xs text-slate-500">Tickets de faturamento agora são priorizados automaticamente na fila Financeira.</p>
              </div>
              <Shield className="w-5 h-5 text-indigo-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Performance Global das Filas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Conversas em SLA</span>
                <span className="text-emerald-400 font-bold">98.2%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[98.2%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Taxa de Resolução (1º Contato)</span>
                <span className="text-indigo-400 font-bold">74.5%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[74.5%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
