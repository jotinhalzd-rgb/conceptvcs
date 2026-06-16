import { useState } from "react";
import { PhoneCall } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useCallLogs, type CallLogFilters } from "@/hooks/voice/use-voice";

export function CallLogList() {
  const [filters, setFilters] = useState<CallLogFilters>({});
  const { data: logs = [], isLoading } = useCallLogs(filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por número..."
          value={filters.search ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          className="max-w-xs"
        />
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          className="bg-white/[0.03] border border-white/10 rounded-lg px-3 h-10 text-sm text-white"
        >
          <option value="">Todos status</option>
          <option value="completed">Completada</option>
          <option value="missed">Perdida</option>
          <option value="failed">Falhou</option>
          <option value="busy">Ocupado</option>
        </select>
        <Input
          type="date"
          value={filters.from ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
          className="max-w-[160px]"
        />
        <Input
          type="date"
          value={filters.to ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
          className="max-w-[160px]"
        />
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse bg-white/[0.02] rounded-xl" />
      ) : logs.length === 0 ? (
        <EmptyState icon={PhoneCall} title="Nenhuma chamada registrada" description="As chamadas aparecerão aqui quando o provider de voz estiver configurado." />
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="text-left p-3">Direção</th>
                <th className="text-left p-3">De</th>
                <th className="text-left p-3">Para</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Duração</th>
                <th className="text-left p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l: any) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="p-3"><Badge variant="outline" className="text-[9px]">{l.direction}</Badge></td>
                  <td className="p-3 text-slate-300">{l.from_number}</td>
                  <td className="p-3 text-slate-300">{l.to_number}</td>
                  <td className="p-3"><Badge variant="outline" className="text-[9px]">{l.status}</Badge></td>
                  <td className="p-3 text-slate-400">{l.duration_seconds ?? 0}s</td>
                  <td className="p-3 text-slate-500 text-xs">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
