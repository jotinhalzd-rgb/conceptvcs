import React, { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWebhookLogChannels, useWebhookLogs } from "@/hooks/developer/use-webhook-logs";
import { maskSensitive } from "@/lib/developer/mask";

const PERIODS: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30 };

export const WebhookLogsPanel = () => {
  const { data: channels } = useWebhookLogChannels();
  const [channelId, setChannelId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [period, setPeriod] = useState<string>("7d");
  const [provider, setProvider] = useState("");
  const [open, setOpen] = useState<any | null>(null);

  const fromIso = useMemo(() => {
    const days = PERIODS[period];
    if (!days) return null;
    return new Date(Date.now() - days * 86400000).toISOString();
  }, [period]);

  const { data: logs, isLoading } = useWebhookLogs({
    channelId: channelId === "all" ? null : channelId,
    status: status === "all" ? null : status,
    provider: provider.trim() || null,
    fromIso,
  });

  const channelName = (id: string | null) =>
    channels?.find((c: any) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Logs de Webhooks</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          Eventos do endpoint inbound — payloads exibidos com campos sensíveis mascarados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Select value={channelId} onValueChange={setChannelId}>
          <SelectTrigger className="bg-white/5 border-white/10 text-xs"><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os canais</SelectItem>
            {channels?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-white/5 border-white/10 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="processed">Processado</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="bg-white/5 border-white/10 text-xs"><SelectValue placeholder="Período" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Últimas 24h</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <Input
            placeholder="Provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="pl-8 bg-white/5 border-white/10 text-xs"
          />
        </div>
      </div>

      <div className="bg-[#030712] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading && <div className="p-6 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">Carregando…</div>}
        {!isLoading && (logs?.length ?? 0) === 0 && (
          <div className="p-12 text-center">
            <History className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Nenhum log encontrado.</p>
          </div>
        )}
        {!isLoading && (logs?.length ?? 0) > 0 && (
          <table className="w-full text-left">
            <thead className="bg-white/[0.02]">
              <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Canal</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Erro</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {logs!.map((l: any) => (
                <tr key={l.id} className="border-t border-white/5 text-[11px] text-slate-300 hover:bg-white/[0.02]">
                  <td className="px-3 py-2 font-mono">{l.processed_at ? new Date(l.processed_at).toLocaleString() : "—"}</td>
                  <td className="px-3 py-2">{l.channels?.name ?? channelName(l.channel_id)}</td>
                  <td className="px-3 py-2 font-mono">{l.provider}</td>
                  <td className="px-3 py-2">
                    <Badge className={
                      l.status === "processed" ? "bg-emerald-500/10 text-emerald-400 border-none" :
                      l.status === "error" ? "bg-rose-500/10 text-rose-400 border-none" :
                      "bg-amber-500/10 text-amber-400 border-none"
                    }>{l.status ?? "—"}</Badge>
                  </td>
                  <td className="px-3 py-2 text-rose-300/80 truncate max-w-[200px]">{l.error_message ?? ""}</td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setOpen(l)}>Detalhe</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="bg-[#030712] border-white/10 text-white w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhe do webhook</SheetTitle>
            <SheetDescription className="text-slate-400">
              {open?.processed_at ? new Date(open.processed_at).toLocaleString() : ""}
            </SheetDescription>
          </SheetHeader>
          {open && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-500">Canal:</span> {open.channels?.name ?? channelName(open.channel_id)}</div>
                <div><span className="text-slate-500">Provider:</span> {open.provider}</div>
                <div><span className="text-slate-500">Status:</span> {open.status}</div>
              </div>
              {open.error_message && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Erro</p>
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-2 text-[11px] text-rose-200">{open.error_message}</div>
                </div>
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Payload</p>
                <pre className="bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-[11px] max-h-96 overflow-auto whitespace-pre-wrap break-all text-slate-200">
{JSON.stringify(maskSensitive(open.payload), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};