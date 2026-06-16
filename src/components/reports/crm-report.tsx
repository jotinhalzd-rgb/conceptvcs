import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useReportFilters } from "@/hooks/reports/use-report-filters";
import { useDealsReport } from "@/hooks/reports/use-crm-metrics";
import { useOrgUsers } from "@/hooks/crm/use-org-users";
import { ReportKpiCard } from "./report-kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { csvFilename, downloadCSV, toCSV } from "@/lib/reports/csv";
import { Download, Target } from "lucide-react";
import { toast } from "sonner";

export function CrmReport() {
  const navigate = useNavigate();
  const { filters, clear } = useReportFilters();
  const dealsQ = useDealsReport(filters);
  const { data: users = [] } = useOrgUsers();
  const deals = dealsQ.data ?? [];

  const userName = (id?: string | null) =>
    users.find((u: any) => u.id === id)?.full_name ?? (id ? "—" : "Sem responsável");

  const stats = useMemo(() => {
    const total = deals.length;
    const open = deals.filter((d: any) => d.status === "open" || !d.status).length;
    const won = deals.filter((d: any) => d.status === "won").length;
    const lost = deals.filter((d: any) => d.status === "lost").length;
    const value = deals.reduce((acc: number, d: any) => acc + Number(d.value || 0), 0);
    return { total, open, won, lost, value };
  }, [deals]);

  const byStage = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    for (const d of deals as any[]) {
      const k = d.stages?.name ?? "Sem etapa";
      const cur = map.get(k) ?? { count: 0, value: 0 };
      cur.count += 1;
      cur.value += Number(d.value || 0);
      map.set(k, cur);
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
  }, [deals]);

  const byOwner = useMemo(() => {
    const map = new Map<string | null, { count: number; value: number }>();
    for (const d of deals as any[]) {
      const k = d.responsible_id ?? null;
      const cur = map.get(k) ?? { count: 0, value: 0 };
      cur.count += 1;
      cur.value += Number(d.value || 0);
      map.set(k, cur);
    }
    return Array.from(map.entries()).map(([id, v]) => ({ owner: userName(id), ...v }));
  }, [deals, users]);

  const exportCSV = () => {
    try {
      const rows = (deals as any[]).map((d) => ({
        id: d.id,
        titulo: d.title,
        status: d.status,
        valor: d.value,
        etapa: d.stages?.name ?? "",
        responsavel: userName(d.responsible_id),
        contato_id: d.contact_id ?? "",
        criado_em: d.created_at,
      }));
      downloadCSV(csvFilename("crm"), toCSV(rows, [
        { key: "id", label: "ID" }, { key: "titulo", label: "Título" }, { key: "status", label: "Status" },
        { key: "valor", label: "Valor" }, { key: "etapa", label: "Etapa" }, { key: "responsavel", label: "Responsável" },
        { key: "contato_id", label: "Contato" }, { key: "criado_em", label: "Criado em" },
      ]));
      toast.success(`${rows.length} oportunidades exportadas.`);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao exportar CSV");
    }
  };

  if (dealsQ.isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>;

  if (deals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Sem oportunidades no período/filtro"
        action={{ label: "Limpar filtros", onClick: clear }}
        secondaryAction={{ label: "Abrir CRM", onClick: () => navigate({ to: "/crm" }) }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">CRM</h2>
        <Button onClick={exportCSV} disabled={deals.length === 0} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpiCard label="Total" value={stats.total} icon={Target} />
        <ReportKpiCard label="Abertos" value={stats.open} />
        <ReportKpiCard label="Ganhos" value={stats.won} />
        <ReportKpiCard label="Perdidos" value={stats.lost} />
        <ReportKpiCard label="Valor total" value={stats.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
      </div>

      <Card className="bg-white/[0.02] border-white/[0.08]">
        <CardContent className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Por etapa</h3>
          <div className="space-y-2">
            {byStage.map((s) => (
              <div key={s.name} className="flex justify-between text-sm">
                <span className="text-slate-300">{s.name}</span>
                <span className="text-white font-black">{s.count} · {s.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/[0.02] border-white/[0.08]">
        <CardContent className="p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Por responsável</h3>
          <div className="space-y-2">
            {byOwner.map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-300">{s.owner}</span>
                <span className="text-white font-black">{s.count} · {s.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}