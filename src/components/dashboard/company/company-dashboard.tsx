import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, Users, Target, Activity, Star, Rocket, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsBox } from "../widgets/stats-box";


export function CompanyDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsBox icon={MessageSquare} label="Conversas Abertas" value="142" color="bg-indigo-500/10 text-indigo-400" />
        <StatsBox icon={Clock} label="Aguardando Resposta" value="12" color="bg-amber-500/10 text-amber-400" />
        <StatsBox icon={DollarSign} label="Vendas Hoje" value="R$ 12.4k" color="bg-emerald-500/10 text-emerald-400" trend={{ value: "+8%", positive: true }} />
        <StatsBox icon={Activity} label="SLA em Risco" value="3" color="bg-rose-500/10 text-rose-400" />
        <StatsBox icon={Star} label="Avaliação Média" value="4.9" color="bg-purple-500/10 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-indigo-400" />
              Necessita Atenção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "4 clientes VIP aguardando resposta", type: "urgent" },
              { label: "2 filas congestionadas (Suporte)", type: "warning" },
              { label: "7 oportunidades sem retorno há +24h", type: "info" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  item.type === 'urgent' ? 'bg-rose-500/10 text-rose-400' : 
                  item.type === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                )}>
                  {item.type}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Time Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Atendentes</span>
                <span className="text-emerald-400 font-bold">12 / 15</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[80%]" />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Gerentes</span>
                <span className="text-emerald-400 font-bold">2 / 2</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[100%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
