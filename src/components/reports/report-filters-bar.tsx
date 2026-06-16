import { useChannels } from "@/hooks/channels/use-channels";
import { useQueues } from "@/hooks/queues/use-queues";
import { useOrgUsers } from "@/hooks/crm/use-org-users";
import { useReportFilters } from "@/hooks/reports/use-report-filters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const ALL = "__all__";

function toDateInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ReportFiltersBar() {
  const { filters, setFilter, clear } = useReportFilters();
  const { data: channels = [] } = useChannels();
  const { data: queues = [] } = useQueues();
  const { data: users = [] } = useOrgUsers();

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">De</label>
        <Input
          type="date"
          className="h-9 w-[140px] bg-slate-900/40 border-white/10 text-slate-200"
          value={toDateInput(filters.from)}
          onChange={(e) => setFilter("from", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Até</label>
        <Input
          type="date"
          className="h-9 w-[140px] bg-slate-900/40 border-white/10 text-slate-200"
          value={toDateInput(filters.to)}
          onChange={(e) => {
            if (!e.target.value) return setFilter("to", undefined);
            const d = new Date(e.target.value);
            d.setHours(23, 59, 59, 999);
            setFilter("to", d.toISOString());
          }}
        />
      </div>

      <FilterSelect
        label="Canal"
        value={filters.channelId}
        onChange={(v) => setFilter("channelId", v)}
        options={(channels ?? []).map((c: any) => ({ value: c.id, label: c.name || c.identifier || c.id }))}
      />
      <FilterSelect
        label="Fila"
        value={filters.queueId}
        onChange={(v) => setFilter("queueId", v)}
        options={(queues ?? []).map((q: any) => ({ value: q.id, label: q.name }))}
      />
      <FilterSelect
        label="Atendente"
        value={filters.agentId}
        onChange={(v) => setFilter("agentId", v)}
        options={(users ?? []).map((u: any) => ({ value: u.id, label: u.full_name || u.id }))}
      />
      <FilterSelect
        label="Status conversa"
        value={filters.convStatus}
        onChange={(v) => setFilter("convStatus", v)}
        options={[
          { value: "open", label: "Abertas" },
          { value: "pending", label: "Pendentes" },
          { value: "closed", label: "Fechadas" },
          { value: "resolved", label: "Resolvidas" },
        ]}
      />
      <FilterSelect
        label="Status CRM"
        value={filters.dealStatus}
        onChange={(v) => setFilter("dealStatus", v)}
        options={[
          { value: "open", label: "Aberto" },
          { value: "won", label: "Ganho" },
          { value: "lost", label: "Perdido" },
        ]}
      />
      <FilterSelect
        label="Status campanha"
        value={filters.campaignStatus}
        onChange={(v) => setFilter("campaignStatus", v)}
        options={[
          { value: "draft", label: "Rascunho" },
          { value: "scheduled", label: "Agendada" },
          { value: "pending_configuration", label: "Pendente config." },
          { value: "ready", label: "Pronta" },
          { value: "completed", label: "Concluída" },
          { value: "archived", label: "Arquivada" },
          { value: "error", label: "Erro" },
        ]}
      />

      <Button
        variant="ghost"
        onClick={clear}
        className="h-9 gap-2 text-slate-300 hover:text-white hover:bg-white/5"
      >
        <X className="w-4 h-4" /> Limpar
      </Button>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <Select
        value={value ?? ALL}
        onValueChange={(v) => onChange(v === ALL ? undefined : v)}
      >
        <SelectTrigger className="h-9 w-[180px] bg-slate-900/40 border-white/10 text-slate-200">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}