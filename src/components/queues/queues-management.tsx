import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BarChart3,
  Layers,
  Settings2,
  Loader2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueues, useCreateQueue, QueueWithStats } from "@/hooks/queues/use-queues";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

const priorityLabel = (level?: number) =>
  level && level >= 3 ? "Alta" : level === 2 ? "Média" : "Padrão";

const colorClass = (color?: string) => {
  switch (color) {
    case "emerald": return "bg-emerald-500 shadow-emerald-500/50";
    case "amber":   return "bg-amber-500 shadow-amber-500/50";
    case "rose":    return "bg-rose-500 shadow-rose-500/50";
    case "purple":  return "bg-purple-500 shadow-purple-500/50";
    default:        return "bg-indigo-500 shadow-indigo-500/50";
  }
};

const QueueCard = ({ q }: { q: QueueWithStats }) => (
  <Card className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] transition-all group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full shadow-[0_0_8px]", colorClass(q.color))} />
          <h4 className="text-lg font-black text-white">{q.name}</h4>
        </div>
        <div className="flex gap-2">
          <div className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-bold text-slate-400 uppercase">
            Cap: {q.max_capacity ?? "—"}
          </div>
          <div className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
            (q.priority_level ?? 1) >= 3 ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
          )}>Prio: {priorityLabel(q.priority_level)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Volume Atual</p>
          <p className="text-xl font-black text-white tabular-nums">{q.open_count}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Espera Média</p>
          <p className="text-xl font-black text-white tabular-nums">{formatDuration(q.avg_wait_seconds)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.05] pt-4 mt-auto">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-400">{q.agents_count} Atendentes</span>
        </div>
        <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all">
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </CardContent>
  </Card>
);

export function QueuesManagement() {
  const { data: queues, isLoading } = useQueues();
  const createMutation = useCreateQueue();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState(1);

  const totalOpen = queues?.reduce((a, q) => a + q.open_count, 0) || 0;
  const avgWait =
    queues && queues.length > 0
      ? Math.round(queues.reduce((a, q) => a + q.avg_wait_seconds, 0) / queues.length)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
            <Layers className="w-6 h-6 text-indigo-400" />
            Arquitetura de Filas
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {queues?.length || 0} filas · {totalOpen} conversas abertas · espera média {formatDuration(avgWait)}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setOpen(true)}
            className="h-10 bg-white text-[#020617] hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-widest gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Fila
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (queues?.length || 0) === 0 ? (
        <div className="border-2 border-dashed border-white/5 rounded-2xl py-20 flex flex-col items-center gap-4 text-slate-500">
          <Layers className="w-10 h-10" />
          <p className="text-sm font-bold">Nenhuma fila configurada</p>
          <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 gap-2">
            <Plus className="w-4 h-4" /> Criar primeira fila
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues!.map((q) => <QueueCard key={q.id} q={q} />)}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#020817] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <Plus className="w-5 h-5 text-indigo-400" />
              Nova Fila
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/[0.03] border-white/10" placeholder="Comercial" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Departamento</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} className="bg-white/[0.03] border-white/10" placeholder="Vendas" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prioridade (1-5)</Label>
              <Input type="number" min={1} max={5} value={priority} onChange={(e) => setPriority(parseInt(e.target.value) || 1)} className="bg-white/[0.03] border-white/10" />
            </div>
            <Button
              disabled={!name.trim() || createMutation.isPending}
              onClick={() =>
                createMutation.mutate(
                  { name, department: department || undefined, priority_level: priority },
                  { onSuccess: () => { setOpen(false); setName(""); setDepartment(""); setPriority(1); } }
                )
              }
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 rounded-xl"
            >
              {createMutation.isPending ? "Criando..." : "Criar Fila"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
