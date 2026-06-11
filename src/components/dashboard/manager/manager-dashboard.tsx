import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Timer, Star, TrendingUp, AlertCircle, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsBox } from "../widgets/stats-box";

const RankingItem = ({ pos, name, value, color }: any) => (
  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.05] group">
    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] uppercase tracking-tighter", color)}>
      {pos}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{name}</p>
      <div className="w-full h-1 bg-white/[0.05] rounded-full mt-2 overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${value}%` }} />
      </div>
    </div>
    <span className="text-xs font-black text-slate-500 tabular-nums">{value}%</span>
  </div>
);

export function ManagerDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsBox icon={Clock} label="Tempo de Resposta" value="1m 42s" color="bg-indigo-500/10 text-indigo-400" trend={{ value: "-12%", positive: true }} />
        <StatsBox icon={Timer} label="Tempo Atendimento" value="14m 20s" color="bg-emerald-500/10 text-emerald-400" trend={{ value: "+5%", positive: true }} />
        <StatsBox icon={Star} label="Avaliação Equipe" value="4.85" color="bg-amber-500/10 text-amber-400" />
        <StatsBox icon={TrendingUp} label="Conversões" value="24.2%" color="bg-purple-500/10 text-purple-400" trend={{ value: "Meta", positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Ranking da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <RankingItem pos="01" name="Ana Paula Silva" value={98} color="bg-indigo-500/20 text-indigo-400" />
            <RankingItem pos="02" name="Marcos Oliveira" value={92} color="bg-white/5 text-slate-400" />
            <RankingItem pos="03" name="Juliana Costa" value={87} color="bg-white/5 text-slate-400" />
            <RankingItem pos="04" name="Ricardo Souza" value={84} color="bg-white/5 text-slate-400" />
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              Acompanhamento em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { name: "Ana Paula Silva", status: "attending", label: "Em atendimento - Cliente VIP" },
                { name: "Marcos Oliveira", status: "overloaded", label: "Sobrecarregado (4 conversas)" },
                { name: "Juliana Costa", status: "idle", label: "Aguardando novas conversas" },
                { name: "Ricardo Souza", status: "paused", label: "Em pausa (Almoço)" }
              ].map((agent, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className={cn(
                    "w-2 h-2 rounded-full shadow-[0_0_8px]",
                    agent.status === 'attending' ? 'bg-emerald-500 shadow-emerald-500/50' :
                    agent.status === 'overloaded' ? 'bg-rose-500 shadow-rose-500/50' :
                    agent.status === 'idle' ? 'bg-indigo-500 shadow-indigo-500/50' : 'bg-slate-600 shadow-slate-600/50'
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{agent.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{agent.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
