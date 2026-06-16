import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { toast } from "sonner";
import { 
  Users, 
  Clock, 
  Activity, 
  Plus, 
  MoreVertical, 
  Settings2, 
  Timer,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatsBox } from "@/components/dashboard/widgets/stats-box";
import { PageHeader } from "@/components/layout/page-header";
import { DemoBadge } from "@/lib/demo-badge";

const QueueCard = ({ name, color, sla, priority, volume, tmr, supervisor }: any) => (
  <Card className="bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] transition-all group shadow-xl">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-10 rounded-full", color)} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{name}</h3>
              <DemoBadge />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className="bg-white/[0.05] text-slate-400 border-none font-black text-[9px] uppercase tracking-widest">{priority}</Badge>
              <Badge className="bg-indigo-600/10 text-indigo-400 border-none font-black text-[9px] uppercase tracking-widest">SLA {sla}</Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-slate-500 hover:text-white hover:bg-white/5 h-10 w-10"
          onClick={() => toast.info("Funcionalidade em preparação para o piloto. Esta fila é demonstrativa.")}
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Volume Atual</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-white italic">{volume}</span>
            <span className="text-[10px] font-black text-emerald-400 uppercase mb-1">Online</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">TMR Médio</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-indigo-400 italic">{tmr}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">Min</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-600/5 border border-indigo-500/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{supervisor}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 gap-1 px-2"
          onClick={() => toast.info("Funcionalidade em preparação para o piloto. Esta fila é demonstrativa.")}
        >
          Gerenciar <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export function QueuesView() {
  return (
    <GlobalErrorBoundary name="QueuesView">
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <PageHeader
          eyebrow="Fluxo Operacional de Distribuição"
          title="Gestão de Filas"
          description="Controle em tempo real da carga de trabalho e eficiência por departamento."
          actions={
            <>
            <Button
              onClick={() => toast.info("Criação de filas em breve — disponível na próxima sprint.")}
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase text-[10px] tracking-widest px-6 h-12 gap-2 shadow-lg shadow-indigo-600/20"
            >
                <Plus className="w-4 h-4" />
                Criar Fila
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsBox icon={Activity} label="Volume Total" value="482" color="bg-indigo-500/10 text-indigo-400" />
          <StatsBox icon={Clock} label="Tempo Espera" value="2m 14s" color="bg-amber-500/10 text-amber-400" />
          <StatsBox icon={Timer} label="Conversões" value="18%" color="bg-emerald-500/10 text-emerald-400" />
          <StatsBox icon={Users} label="Agentes Online" value="42 / 50" color="bg-purple-500/10 text-purple-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <QueueCard 
            name="Comercial" 
            color="bg-indigo-500 shadow-indigo-500/50" 
            priority="Alta" 
            sla="5m" 
            volume="24" 
            tmr="1.2" 
            supervisor="Ricardo Souza"
          />
          <QueueCard 
            name="Suporte Técnico" 
            color="bg-amber-500 shadow-amber-500/50" 
            priority="Crítica" 
            sla="15m" 
            volume="142" 
            tmr="8.4" 
            supervisor="Ana Paula S."
          />
          <QueueCard 
            name="Financeiro" 
            color="bg-emerald-500 shadow-emerald-500/50" 
            priority="Média" 
            sla="30m" 
            volume="12" 
            tmr="4.5" 
            supervisor="Marcos Oliveira"
          />
        </div>
      </div>
    </GlobalErrorBoundary>
  );
}
