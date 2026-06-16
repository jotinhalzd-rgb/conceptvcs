import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Loader2, Workflow } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useRoutingRules,
  useUpsertRoutingRule,
  useToggleRoutingRule,
  useDeleteRoutingRule,
  type RoutingRule,
} from "@/hooks/queues/use-routing-rules";
import { useQueues } from "@/hooks/queues/use-queues";
import { useChannels } from "@/hooks/channels/use-channels";

type FormState = {
  id?: string;
  name: string;
  keywords: string;
  queue_id: string;
  channel_id: string;
  priority: number;
  is_fallback: boolean;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  keywords: "",
  queue_id: "",
  channel_id: "",
  priority: 0,
  is_fallback: false,
  is_active: true,
};

export function RoutingRulesTab() {
  const { data: rules, isLoading } = useRoutingRules();
  const { data: queues } = useQueues();
  const { data: channels } = useChannels();
  const upsert = useUpsertRoutingRule();
  const toggle = useToggleRoutingRule();
  const del = useDeleteRoutingRule();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<RoutingRule | null>(null);

  const queueName = useMemo(() => {
    const map: Record<string, string> = {};
    (queues ?? []).forEach((q: any) => (map[q.id] = q.name));
    return map;
  }, [queues]);

  const channelName = useMemo(() => {
    const map: Record<string, string> = {};
    (channels ?? []).forEach((c: any) => (map[c.id] = c.name));
    return map;
  }, [channels]);

  const openCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (r: RoutingRule) => {
    setForm({
      id: r.id,
      name: r.name,
      keywords: (r.keywords ?? []).join(", "),
      queue_id: r.queue_id,
      channel_id: r.channel_id ?? "",
      priority: r.priority ?? 0,
      is_fallback: r.is_fallback,
      is_active: r.is_active,
    });
    setOpen(true);
  };

  const submit = () => {
    const kws = form.keywords
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!form.name.trim() || !form.queue_id) return;
    upsert.mutate(
      {
        id: form.id,
        name: form.name.trim(),
        keywords: kws,
        queue_id: form.queue_id,
        channel_id: form.channel_id || null,
        priority: form.priority,
        is_fallback: form.is_fallback,
        is_active: form.is_active,
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-2">
            <Workflow className="w-5 h-5 text-indigo-400" />
            Regras de Roteamento
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Mapeie palavras-chave para filas. A regra de maior prioridade vence.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 gap-2">
          <Plus className="w-4 h-4" /> Nova regra
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      ) : (rules?.length ?? 0) === 0 ? (
        <div className="border-2 border-dashed border-white/5 rounded-2xl py-16 flex flex-col items-center gap-3 text-slate-500">
          <Workflow className="w-8 h-8" />
          <p className="text-sm font-bold">Nenhuma regra configurada</p>
          <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 gap-2">
            <Plus className="w-4 h-4" /> Criar primeira regra
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {rules!.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]"
            >
              <Switch
                checked={r.is_active}
                onCheckedChange={(v) => toggle.mutate({ id: r.id, is_active: v })}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white truncate">{r.name}</span>
                  {r.is_fallback && (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-300 text-[10px]">
                      fallback
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-[10px]">
                    prio {r.priority}
                  </Badge>
                  {r.channel_id && (
                    <Badge variant="outline" className="border-white/10 text-slate-300 text-[10px]">
                      canal: {channelName[r.channel_id] ?? "—"}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  → <span className="text-emerald-300 font-bold">{queueName[r.queue_id] ?? "—"}</span>
                  {r.keywords.length > 0 && (
                    <span className="text-slate-500"> · {r.keywords.join(", ")}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => openEdit(r)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                aria-label="Editar regra"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setConfirmDelete(r)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5"
                aria-label="Excluir regra"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#020817] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase italic">
              {form.id ? "Editar regra" : "Nova regra de roteamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Financeiro"
                className="bg-white/[0.03] border-white/10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Palavras-chave (separadas por vírgula)
              </Label>
              <Input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="financeiro, boleto, fatura"
                className="bg-white/[0.03] border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fila destino</Label>
                <Select value={form.queue_id} onValueChange={(v) => setForm({ ...form, queue_id: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/10">
                    <SelectValue placeholder="Selecionar fila" />
                  </SelectTrigger>
                  <SelectContent>
                    {(queues ?? []).map((q: any) => (
                      <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Canal (opcional)</Label>
                <Select
                  value={form.channel_id || "__any"}
                  onValueChange={(v) => setForm({ ...form, channel_id: v === "__any" ? "" : v })}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/10">
                    <SelectValue placeholder="Qualquer canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any">Qualquer canal</SelectItem>
                    {(channels ?? []).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prioridade</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                  className="bg-white/[0.03] border-white/10"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 pb-2">
                <Switch
                  checked={form.is_fallback}
                  onCheckedChange={(v) => setForm({ ...form, is_fallback: v })}
                />
                Fallback
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 pb-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                Ativa
              </label>
            </div>

            <Button
              onClick={submit}
              disabled={upsert.isPending || !form.name.trim() || !form.queue_id}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-11 rounded-xl"
            >
              {upsert.isPending ? "Salvando..." : form.id ? "Salvar alterações" : "Criar regra"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent className="bg-[#020817] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação remove permanentemente a regra "{confirmDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) del.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}