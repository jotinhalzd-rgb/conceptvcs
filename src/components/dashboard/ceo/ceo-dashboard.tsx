import { AlertTriangle, TrendingUp, DollarSign, Zap, Target, BarChart3, Users, Briefcase } from "lucide-react";
import { ActionItem } from "../widgets/action-item";
import { StatsBox } from "../widgets/stats-box";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export function CEODashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsBox icon={DollarSign} label="Receita Plataforma" value="R$ 2.4M" color="bg-indigo-500/10 text-indigo-400" trend={{ value: "+12%", positive: true }} />
        <StatsBox icon={Briefcase} label="Empresas Ativas" value="1,240" color="bg-emerald-500/10 text-emerald-400" trend={{ value: "+3%", positive: true }} />
        <StatsBox icon={Zap} label="Consumo IA" value="85%" color="bg-amber-500/10 text-amber-400" trend={{ value: "+15%", positive: false }} />
        <StatsBox icon={Target} label="Growth Mensal" value="+32%" color="bg-purple-500/10 text-purple-400" trend={{ value: "+5%", positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ações Recomendadas */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            Ações Recomendadas (IA)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionItem label="Empresa X - Inatividade" description="Sem atividade há 15 dias. Risco de churn elevado." urgency="high" />
            <ActionItem label="Empresa Y - Limite de Plano" description="Atingiu 95% da cota de mensagens." urgency="medium" />
            <ActionItem label="Empresa Z - Volume Alto" description="Volume de leads 300% acima da média." urgency="medium" />
            <ActionItem label="Audit - Falha Crítica" description="Falha de autenticação recorrente detectada." urgency="high" />
          </div>
        </div>

        {/* Alertas Críticos */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Alertas Críticos</h3>
          <Card className="bg-rose-500/5 border-rose-500/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-sm">2 Empresas com SLA em risco</span>
              </div>
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-sm">1 Instabilidade no servidor de rede</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
