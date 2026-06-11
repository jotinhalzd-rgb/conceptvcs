import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, DollarSign, Zap, Target, BarChart3, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const ActionItem = ({ label, description, urgency }: { label: string, description: string, urgency: 'high' | 'medium' }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
    <div className={cn("p-2 rounded-lg", urgency === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400')}>
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-white">{label}</h4>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </div>
  </div>
);

export function CEODashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-900/5 p-6 rounded-3xl border border-indigo-500/20">
          <DollarSign className="w-8 h-8 text-indigo-400 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Receita Total</p>
          <h2 className="text-3xl font-black text-white mt-1">R$ 2.4M</h2>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 p-6 rounded-3xl border border-emerald-500/20">
          <Briefcase className="w-8 h-8 text-emerald-400 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Empresas Ativas</p>
          <h2 className="text-3xl font-black text-white mt-1">1,240</h2>
        </div>
        <div className="bg-gradient-to-br from-amber-900/20 to-amber-900/5 p-6 rounded-3xl border border-amber-500/20">
          <Zap className="w-8 h-8 text-amber-400 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Consumo IA</p>
          <h2 className="text-3xl font-black text-white mt-1">85%</h2>
        </div>
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/5 p-6 rounded-3xl border border-purple-500/20">
          <Target className="w-8 h-8 text-purple-400 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Growth Mensal</p>
          <h2 className="text-3xl font-black text-white mt-1">+32%</h2>
        </div>
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
