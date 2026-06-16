import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useReportFilters } from "@/hooks/reports/use-report-filters";
import { useConversationsReport, useMessagesReport } from "@/hooks/reports/use-conversation-metrics";
import { useChannels } from "@/hooks/channels/use-channels";
import { useQueues } from "@/hooks/queues/use-queues";
import { useOrgUsers } from "@/hooks/crm/use-org-users";
import { ReportKpiCard } from "./report-kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { csvFilename, downloadCSV, toCSV } from "@/lib/reports/csv";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Download, MessageSquare, Inbox } from "lucide-react";
import { format, eachDayOfInterval } from "date-fns";
import { toast } from "sonner";

export function ConversationsReport() {
  const navigate = useNavigate();
  const { filters, clear } = useReportFilters();
  const convQ = useConversationsReport(filters);
  const msgQ = useMessagesReport(filters);
  const { data: channels = [] } = useChannels();
  const { data: queues = [] } = useQueues();
  const { data: users = [] } = useOrgUsers();

  const convs = convQ.data ?? [];
  const msgs = msgQ.data ?? [];

  const channelName = (id?: string | null) => channels.find((c: any) => c.id === id)?.name ?? "—";
  const queueName = (id?: string | null) => queues.find((q: any) => q.id === id)?.name ?? "—";
  const userName = (id?: string | null) => users.find((u: any) => u.id === id)?.full_name ?? (id ? "—" : "Sem responsável");

  const stats = useMemo(() => {
    const total = convs.length;
    const open = convs.filter((c: any) => c.status === "open").length;
    const pending = convs.filter((c: any) => c.status === "pending").length;
    const resolved = convs.filter((c: any) => c.status === "resolved" || c.status === "closed").length;
    const unassigned = convs.filter((c: any) => !c.agent_id).length;
    const inbound = msgs.filter((m: any) => m.direction === "inbound").length;
    const outbound = msgs.filter((m: any) => m.direction === "outbound").length;
    return { total, open, pending, resolved, unassigned, inbound, outbound };
  }, [convs, msgs]);

  const series = useMemo(() => {
    if (!filters.from) return [];
    const from = new Date(filters.from);
    const to = filters.to ? new Date(filters.to) : new Date();
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || to < from) return [];
    const days = eachDayOfInterval({ start: from, end: to });
    if (days.length > 90) return [];
    return days.map((d) => {
      const key = format(d, "dd/MM");
      const day = format(d, "yyyy-MM-dd");
      return {
        day: key,
        conversas: convs.filter((c: any) => c.created_at?.startsWith(day)).length,
        mensagens: msgs.filter((m: any) => m.created_at?.startsWith(day)).length,
      };
    });
  }, [convs, msgs, filters.from, filters.to]);

  const exportCSV = () => {
    try {
      const rows = convs.map((c: any) => ({
        id: c.id,
        criado_em: c.created_at,
        status: c.status,
        canal: channelName(c.channel_id),
        fila: queueName(c.queue_id),
        atendente: userName(c.agent_id),
        sla_due_at: c.sla_due_at ?? "",
        first_response_at: c.first_response_at ?? "",
        closed_at: c.closed_at ?? "",
        routing_reason: c.routing_reason ?? "",
      }));
      downloadCSV(
        csvFilename("conversas"),
        toCSV(rows, [
          { key: "id", label: "ID" },
          { key: "criado_em", label: "Criado em" },
          { key: "status", label: "Status" },
          { key: "canal", label: "Canal" },
          { key: "fila", label: "Fila" },
          { key: "atendente", label: "Atendente" },
          { key: "sla_due_at", label: "SLA até" },
          { key: "first_response_at", label: "Primeira resposta" },
          { key: "closed_at", label: "Fechada em" },
          { key: "routing_reason", label: "Motivo roteamento" },
        ]),
      );
      toast.success(`${rows.length} conversas exportadas.`);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao exportar CSV");
    }
  };

  if (convQ.isLoading || msgQ.isLoading) {
    return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  if (stats.total === 0 && stats.inbound === 0 && stats.outbound === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Sem conversas no período/filtro"
        description="Ajuste os filtros, configure um canal ou inicie atendimentos para gerar dados."
        action={{ label: "Limpar filtros", onClick: clear }}
        secondaryAction={{ label: "Abrir Inbox", onClick: () => navigate({ to: "/inbox" }) }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">Atendimento</h2>
        <Button onClick={exportCSV} disabled={convs.length === 0} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpiCard label="Total" value={stats.total} icon={MessageSquare} />
        <ReportKpiCard label="Abertas" value={stats.open} />
        <ReportKpiCard label="Pendentes" value={stats.pending} />
        <ReportKpiCard label="Resolvidas/Fechadas" value={stats.resolved} />
        <ReportKpiCard label="Sem responsável" value={stats.unassigned} />
        <ReportKpiCard label="Msg recebidas" value={stats.inbound} />
        <ReportKpiCard label="Msg enviadas" value={stats.outbound} />
        <ReportKpiCard label="Total mensagens" value={msgs.length} />
      </div>

      {series.length > 0 && (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Volume por Dia</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                <Legend />
                <Line type="monotone" dataKey="conversas" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="mensagens" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <BreakdownCard title="Por canal" rows={breakdown(convs, "channel_id", channelName)} />
      <BreakdownCard title="Por fila" rows={breakdown(convs, "queue_id", queueName)} />
      <BreakdownCard title="Por atendente" rows={breakdown(convs, "agent_id", userName)} />
    </div>
  );
}

function breakdown(rows: any[], key: string, nameOf: (id: string | null) => string) {
  const map = new Map<string | null, number>();
  for (const r of rows) {
    const k = r[key] ?? null;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([k, v]) => ({ label: nameOf(k), count: v }))
    .sort((a, b) => b.count - a.count);
}

function BreakdownCard({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <Card className="bg-white/[0.02] border-white/[0.08]">
      <CardContent className="p-6">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">{title}</h3>
        <div className="space-y-2">
          {rows.slice(0, 10).map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-40 truncate">{r.label}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
              <span className="text-xs font-black text-white w-10 text-right">{r.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}