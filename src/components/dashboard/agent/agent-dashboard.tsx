import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, CheckCircle2, Calendar, Target, Award, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickActionsBar } from "@/components/dashboard/widgets/quick-actions-bar";

export function AgentDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <QuickActionsBar />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
              <CardContent className="p-6">
                <Inbox className="w-8 h-8 text-indigo-400 mb-3" />
                <h4 className="text-3xl font-black text-white">24</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Minhas Conversas</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
              <CardContent className="p-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
                <h4 className="text-3xl font-black text-white">12</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Tarefas Hoje</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Próximos Compromissos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: "14:30", client: "Eduardo Rocha", action: "Follow-up Proposta Comercial" },
                { time: "16:00", client: "Ana Beatriz", action: "Demonstração de Plataforma" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-sm font-black text-indigo-400 tabular-nums">{item.time}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.client}</p>
                    <p className="text-xs text-slate-500">{item.action}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Minhas Metas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Conversões do Dia</span>
                  <span className="text-white font-bold">8 / 10</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[80%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Avaliações 5 Estrelas</span>
                  <span className="text-white font-bold">15 / 20</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[75%]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-600/5 border-indigo-600/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                Avisos Internos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/10">
                <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                  Novo material de treinamento sobre o CRM Financeiro disponível na base de conhecimento.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Reunião geral às 18:00 no auditório virtual.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
