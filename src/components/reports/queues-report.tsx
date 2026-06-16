import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useConversationsReport } from "@/hooks/reports/use-conversation-metrics";
import { useReportFilters } from "@/hooks/reports/use-report-filters";
import { useQueues } from "@/hooks/queues/use-queues";
import { ReportKpiCard } from "./report-kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { csvFilename, downloadCSV, toCSV } from "@/lib/reports/csv";
import { Download, Users } from "lucide-react";
import { toast } from "sonner";

export function QueuesReport() {
  const navigate = useNavigate();
  const { filters, clear } = useReportFilters();
  const convQ = useConversationsReport(filters);
  const { data: queues = [] } = useQueues();
  const convs = convQ.data ?? [];

  const queueName = (id?: string | null) =>
    queues.find((q: any) => q.id === id)?.name ?? (id ? "—" : "Sem fila");
  const defaultQueueIds = new Set(queues.filter((q: any) => q.is_default).map((q: any) => q.id));

  const perQueue = useMemo(() => {
    const map = new Map<string | null, number>();
    for (const c of convs) {
      map.set(c.queue_id ?? null, (map.get(c.queue_id ?? null) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([id, count]) => ({ id, name: queueName(id), count }))
      .sort((a, b) => b.count - a.count);
  }, [convs, queues]);

  const perReason = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of convs) {
      const r = c.routing_reason ?? "sem motivo";
      map.set(r, (map.get(r) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [convs]);

  const inDefault = convs.filter((c: any) => c.queue_id && defaultQueueIds.has(c.queue_id)).length;
  const waitingAssignment = convs.filter((c: any) => !c.agent_id && (c.status === "open" || c.status === "pending")).length;

  const exportCSV = () => {
    try {
      const rows = perQueue.map((r) => ({ fila: r.name, conversas: r.count }));
      downloadCSV(csvFilename("filas"), toCSV(rows, [
        { key: "fila", label: "Fila" },
        { key: "conversas", label: "Conversas" },
      ]));
      toast.success(`${rows.length} filas exportadas.`);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao exportar CSV");
    }
  };

  if (convQ.isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>;

  if (convs.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sem dados de filas no período"
        action={{ label: "Limpar filtros", onClick: clear }}
        secondaryAction={{ label: "Configurar filas", onClick: () => navigate({ to: "/queues" }) }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">Filas & Roteamento</h2>
        <Button onClick={exportCSV} disabled={perQueue.length === 0} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpiCard label="Total roteado" value={convs.length} icon={Users} />
        <ReportKpiCard label="Em fila default" value={inDefault} />
        <ReportKpiCard label="Aguardando atribuição" value={waitingAssignment} />
        <ReportKpiCard label="Filas com volume" value={perQueue.filter((p) => p.count > 0).length} />
      </div>

      <Card className="bg-white/[0.02] border-white/[0.08]">
        <CardContent className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Top filas</h3>
          <div className="space-y-2">
            {perQueue.slice(0, 12).map((r) => (
              <div key={String(r.id)} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{r.name}</span>
                <span className="text-white font-black">{r.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/[0.02] border-white/[0.08]">
        <CardContent className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Motivo do roteamento</h3>
          <div className="space-y-2">
            {perReason.map(([r, n]) => (
              <div key={r} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{r}</span>
                <span className="text-white font-black">{n}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}