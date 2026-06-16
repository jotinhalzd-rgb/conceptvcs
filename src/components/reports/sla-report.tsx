import { useMemo } from "react";
import { useReportFilters } from "@/hooks/reports/use-report-filters";
import { useConversationsReport } from "@/hooks/reports/use-conversation-metrics";
import { useQueues } from "@/hooks/queues/use-queues";
import { ReportKpiCard } from "./report-kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { csvFilename, downloadCSV, toCSV } from "@/lib/reports/csv";
import { Clock, Download } from "lucide-react";
import { toast } from "sonner";

export function SlaReport() {
  const { filters, clear } = useReportFilters();
  const convQ = useConversationsReport(filters);
  const { data: queues = [] } = useQueues();
  const convs = convQ.data ?? [];

  const queueName = (id?: string | null) => queues.find((q: any) => q.id === id)?.name ?? "—";

  const stats = useMemo(() => {
    const now = Date.now();
    const withSla = convs.filter((c: any) => c.sla_due_at);
    let inSla = 0, outSla = 0;
    for (const c of withSla) {
      const due = new Date(c.sla_due_at as string).getTime();
      const ref = c.closed_at ? new Date(c.closed_at as string).getTime() : now;
      if (ref <= due) inSla++; else outSla++;
    }
    const tmrSamples = convs
      .filter((c: any) => c.first_response_at && c.waiting_since)
      .map((c: any) => (new Date(c.first_response_at as string).getTime() - new Date(c.waiting_since as string).getTime()) / 60000);
    const tmr = tmrSamples.length ? (tmrSamples.reduce((a, b) => a + b, 0) / tmrSamples.length) : null;
    const tmaSamples = convs
      .filter((c: any) => c.closed_at && c.created_at)
      .map((c: any) => (new Date(c.closed_at as string).getTime() - new Date(c.created_at as string).getTime()) / 60000);
    const tma = tmaSamples.length ? (tmaSamples.reduce((a, b) => a + b, 0) / tmaSamples.length) : null;
    return { withSla: withSla.length, inSla, outSla, tmr, tma };
  }, [convs]);

  const riskQueues = useMemo(() => {
    const now = Date.now();
    const map = new Map<string | null, number>();
    for (const c of convs) {
      if (!c.sla_due_at) continue;
      const due = new Date(c.sla_due_at as string).getTime();
      const ref = c.closed_at ? new Date(c.closed_at as string).getTime() : now;
      if (ref > due) map.set(c.queue_id ?? null, (map.get(c.queue_id ?? null) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([id, n]) => ({ fila: queueName(id), violacoes: n }))
      .sort((a, b) => b.violacoes - a.violacoes);
  }, [convs, queues]);

  const oldest = useMemo(() => {
    return convs
      .filter((c: any) => c.status === "open" || c.status === "pending")
      .slice()
      .sort((a: any, b: any) => new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime())
      .slice(0, 10);
  }, [convs]);

  const exportCSV = () => {
    try {
      const now = Date.now();
      const rows = convs.filter((c: any) => c.sla_due_at).map((c: any) => {
        const due = new Date(c.sla_due_at as string).getTime();
        const ref = c.closed_at ? new Date(c.closed_at as string).getTime() : now;
        return {
          id: c.id,
          fila: queueName(c.queue_id),
          status: c.status,
          sla_due_at: c.sla_due_at,
          closed_at: c.closed_at ?? "",
          dentro_sla: ref <= due ? "sim" : "nao",
        };
      });
      downloadCSV(csvFilename("sla"), toCSV(rows, [
        { key: "id", label: "ID" }, { key: "fila", label: "Fila" }, { key: "status", label: "Status" },
        { key: "sla_due_at", label: "SLA até" }, { key: "closed_at", label: "Fechada em" }, { key: "dentro_sla", label: "Dentro do SLA" },
      ]));
      toast.success(`${rows.length} conversas exportadas.`);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao exportar CSV");
    }
  };

  if (convQ.isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>;

  if (convs.length === 0) {
    return <EmptyState icon={Clock} title="Sem conversas no período" action={{ label: "Limpar filtros", onClick: clear }} />;
  }

  const fmtMin = (v: number | null) => v === null ? null : `${v.toFixed(1)} min`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">SLA</h2>
        <Button onClick={exportCSV} disabled={stats.withSla === 0} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpiCard label="Com SLA definido" value={stats.withSla} />
        <ReportKpiCard label="Dentro do SLA" value={stats.inSla} />
        <ReportKpiCard label="Fora do SLA" value={stats.outSla} />
        <ReportKpiCard
          label="TMR médio"
          value={fmtMin(stats.tmr) ?? "—"}
          hint={stats.tmr === null ? "Indisponível: requer first_response_at e waiting_since" : undefined}
        />
        <ReportKpiCard
          label="TMA médio"
          value={fmtMin(stats.tma) ?? "—"}
          hint={stats.tma === null ? "Indisponível: requer closed_at" : undefined}
        />
      </div>

      {riskQueues.length > 0 && (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Filas com mais violações de SLA</h3>
            <div className="space-y-2">
              {riskQueues.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-300">{r.fila}</span>
                  <span className="text-rose-400 font-black">{r.violacoes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {oldest.length > 0 && (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Conversas abertas há mais tempo</h3>
            <div className="space-y-2">
              {oldest.map((c: any) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-slate-300 truncate">{queueName(c.queue_id)} · {c.status}</span>
                  <span className="text-white">{new Date(c.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}