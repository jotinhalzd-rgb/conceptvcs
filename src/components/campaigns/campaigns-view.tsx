import { useMemo, useState } from "react";
import {
  Rocket, Plus, Search, ChevronDown, MoreVertical, Calendar,
  Sparkles, Copy, Pencil, Archive, Trash2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import {
  useCampaigns, useCampaignStats, useDuplicateCampaign,
  useArchiveCampaign, useDeleteCampaign, type CampaignFilters,
} from "@/hooks/campaigns/use-campaigns";
import { useChannels } from "@/hooks/channels/use-channels";
import { useOrgUsers } from "@/hooks/crm/use-org-users";
import { cn } from "@/lib/utils";
import { SmartBackButton } from "@/components/layout/back-button";
import { CampaignEditorDrawer } from "./campaign-editor-drawer";
import { STATUS_LABEL, CAMPAIGN_STATUSES } from "@/lib/campaigns/dispatch";

export const CampaignsView = () => {
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [confirm, setConfirm] = useState<{ kind: "archive" | "delete"; id: string } | null>(null);

  const { data: campaigns, isLoading } = useCampaigns(filters);
  const { data: stats } = useCampaignStats();
  const { data: channels } = useChannels();
  const { data: orgUsers } = useOrgUsers();
  const duplicate = useDuplicateCampaign();
  const archive = useArchiveCampaign();
  const remove = useDeleteCampaign();

  const hasFilters = useMemo(
    () => Object.values(filters).some((v) => v !== undefined && v !== "" && v !== false),
    [filters],
  );

  const openNew = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setEditorOpen(true); };
  const clearFilters = () => setFilters({});

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      draft: "bg-slate-500/10 text-slate-300 border-slate-500/20",
      scheduled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      pending_configuration: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      paused: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      sending: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      archived: "bg-slate-700/30 text-slate-500 border-slate-700/40",
      error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    return map[s] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  return (
    <GlobalErrorBoundary name="Campaigns">
      <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/40 shrink-0">
          <div className="flex items-center gap-6">
            <SmartBackButton />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Growth & Automation Hub</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Campanhas Inteligentes</h1>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="h-10 w-px bg-white/5 mx-2" />
            <div className="flex gap-3">
              {(["draft","ready","scheduled","pending_configuration","completed","error"] as const).map((s) => (
                <div key={s} className="bg-white/[0.02] border border-white/5 px-3 py-2 rounded-xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{STATUS_LABEL[s]}</p>
                  <p className="text-sm font-black text-white leading-none tabular-nums">{stats?.[s] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={openNew} className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Nova Campanha</span>
            </Button>
          </div>
        </header>

        <div className="border-b border-white/5 flex items-center gap-3 px-8 py-3 bg-[#020617] shrink-0 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 h-9 w-64 bg-white/[0.03] border-white/10"
              value={filters.search ?? ""}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            />
          </div>
          <Select value={filters.status ?? "all"} onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {CAMPAIGN_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.channelId ?? "all"} onValueChange={(v) => setFilters({ ...filters, channelId: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Canal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canais</SelectItem>
              {(channels ?? []).map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.assignedTo ?? "all"} onValueChange={(v) => setFilters({ ...filters, assignedTo: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {(orgUsers ?? []).map((u: any) => (
                <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="h-9 w-40 bg-white/[0.03] border-white/10"
            value={filters.fromDate ?? ""}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value || undefined })}
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-400">
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {isLoading ? (
            <div className="text-center text-slate-500 py-20 text-xs uppercase tracking-widest">Carregando...</div>
          ) : (campaigns?.length ?? 0) === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-3">
                {hasFilters ? "Nenhuma campanha corresponde aos filtros." : "Nenhuma campanha ainda."}
              </p>
              {hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>
              ) : (
                <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-500">
                  <Plus className="w-4 h-4 mr-1" /> Criar campanha
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {campaigns!.map((c: any) => {
                const channel = channels?.find((ch: any) => ch.id === c.channel_id);
                return (
                  <div key={c.id} className="bg-[#030712] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                          <Rocket className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <button onClick={() => openEdit(c)} className="text-sm font-bold text-white hover:text-indigo-400 truncate block text-left">
                            {c.name}
                          </button>
                          <p className="text-[10px] text-slate-500 truncate">{c.description ?? "—"}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicate.mutate(c.id)}><Copy className="w-3.5 h-3.5 mr-2" />Duplicar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirm({ kind: "archive", id: c.id })}><Archive className="w-3.5 h-3.5 mr-2" />Arquivar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirm({ kind: "delete", id: c.id })} className="text-rose-400"><Trash2 className="w-3.5 h-3.5 mr-2" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase", statusBadge(c.status))}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </Badge>
                      {channel && (
                        <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-slate-300">
                          {channel.name}
                        </Badge>
                      )}
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                        <p className="text-[9px] uppercase text-slate-500">Destinatários</p>
                        <p className="text-sm font-bold text-white tabular-nums">{c.estimated_recipients ?? 0}</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                        <p className="text-[9px] uppercase text-slate-500">Agendado</p>
                        <p className="text-sm font-bold text-white">{c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : "—"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CampaignEditorDrawer open={editorOpen} onOpenChange={setEditorOpen} campaign={editing} />

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "archive" ? "Arquivar campanha?" : "Excluir campanha?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "archive"
                ? "A campanha sai da lista padrão mas continua acessível."
                : "Esta ação é permanente. Destinatários e eventos relacionados também serão removidos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirm) return;
                if (confirm.kind === "archive") archive.mutate(confirm.id);
                else remove.mutate(confirm.id);
                setConfirm(null);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GlobalErrorBoundary>
  );
};
