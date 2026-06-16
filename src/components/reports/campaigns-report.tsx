import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useReportFilters } from "@/hooks/reports/use-report-filters";
import { useCampaignEvents, useCampaignRecipientsCount, useCampaignsReport } from "@/hooks/reports/use-campaign-metrics";
import { useChannels } from "@/hooks/channels/use-channels";
import { ReportKpiCard } from "./report-kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { csvFilename, downloadCSV, toCSV } from "@/lib/reports/csv";
import { Download, Megaphone } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["draft","scheduled","pending_configuration","ready","completed","archived","error"];

export function CampaignsReport() {
  const navigate = useNavigate();
  const { filters, clear } = useReportFilters();
  const camQ = useCampaignsReport(filters);
  const recipCountQ = useCampaignRecipientsCount(filters);
  const eventsQ = useCampaignEvents(filters);
  const { data: channels = [] } = useChannels();

  const camps = camQ.data ?? [];
  const events = eventsQ.data ?? [];

  const channelName = (id?: string | null) => channels.find((c: any) => c.id === id)?.name ?? "—";

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of STATUSES) map[s] = 0;
    for (const c of camps as any[]) map[c.status] = (map[c.status] ?? 0) + 1;
    return map;
  }, [camps]);

  const estimated = useMemo(
    () => (camps as any[]).reduce((acc, c) => acc + Number(c.estimated_recipients || 0), 0),
    [camps],
  );

  const exportCSV = () => {
    try {
      const rows = (camps as any[]).map((c) => ({
        id: c.id, nome: c.name, status: c.status, canal: channelName(c.channel_id),
        destinatarios_estimados: c.estimated_recipients ?? 0,
        agendada_para: c.scheduled_at ?? "", criada_em: c.created_at,
      }));
      downloadCSV(csvFilename("campanhas"), toCSV(rows, [
        { key: "id", label: "ID" }, { key: "nome", label: "Nome" }, { key: "status", label: "Status" },
        { key: "canal", label: "Canal" }, { key: "destinatarios_estimados", label: "Destinatários est." },
        { key: "agendada_para", label: "Agendada para" }, { key: "criada_em", label: "Criada em" },
      ]));
      toast.success(`${rows.length} campanhas exportadas.`);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao exportar CSV");
    }
  };

  if (camQ.isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>;

  if (camps.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Sem campanhas no período/filtro"
        action={{ label: "Limpar filtros", onClick: clear }}
        secondaryAction={{ label: "Ir para Campanhas", onClick: () => navigate({ to: "/campaigns" }) }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">Campanhas</h2>
        <Button onClick={exportCSV} disabled={camps.length === 0} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpiCard label="Total" value={camps.length} icon={Megaphone} />
        <ReportKpiCard label="Destinatários est." value={estimated} />
        <ReportKpiCard label="Recipients materializados" value={recipCountQ.data ?? 0} />
        <ReportKpiCard label="Eventos recentes" value={events.length} />
        <ReportKpiCard label="Aberturas" value={0} hint="Disponível quando provider externo estiver conectado" />
        <ReportKpiCard label="Cliques" value={0} hint="Disponível quando provider externo estiver conectado" />
        <ReportKpiCard label="Respostas" value={0} hint="Disponível quando provider externo estiver conectado" />
      </div>

      <Card className="bg-white/[0.02] border-white/[0.08]">
        <CardContent className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Por status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATUSES.map((s) => (
              <div key={s} className="flex justify-between text-sm p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-slate-300">{s}</span>
                <span className="text-white font-black">{byStatus[s]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}