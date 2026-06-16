import { useEffect, useState } from "react";
import { Workflow, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useIvrFlows, useUpsertIvrFlow, useDeleteIvrFlow } from "@/hooks/voice/use-voice";
import { toast } from "sonner";

const SAMPLE_NODES = JSON.stringify(
  [
    { id: "start", type: "menu", prompt: "Bem-vindo. Pressione 1 para vendas, 2 para suporte.", options: { "1": "sales", "2": "support" } },
    { id: "sales", type: "transfer", queue: "vendas" },
    { id: "support", type: "transfer", queue: "suporte" },
  ],
  null,
  2,
);

export function IvrBuilder() {
  const { data: flows = [], isLoading } = useIvrFlows();
  const upsert = useUpsertIvrFlow();
  const remove = useDeleteIvrFlow();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Fluxos IVR</h2>
          <p className="text-xs text-slate-500">{flows.length} fluxo(s)</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2"><Plus className="w-4 h-4" /> Novo Fluxo</Button>
      </div>

      {isLoading ? (
        <div className="h-32 animate-pulse bg-white/[0.02] rounded-xl" />
      ) : flows.length === 0 ? (
        <EmptyState icon={Workflow} title="Nenhum fluxo IVR" description="Crie um fluxo para automatizar atendimento por voz." />
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          {flows.map((f: any) => (
            <div key={f.id} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
              <div>
                <p className="text-sm font-bold text-white">{f.name}</p>
                <Badge variant="outline" className="text-[9px] mt-1">{f.is_active ? "ativo" : "inativo"}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(f); setOpen(true); }}>Editar</Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(f.id)}><Trash2 className="w-4 h-4 text-rose-400" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <IvrDialog
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSubmit={async (vals) => { await upsert.mutateAsync({ ...vals, id: editing?.id }); setOpen(false); }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fluxo IVR?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) remove.mutate(deleteId); setDeleteId(null); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IvrDialog({
  open, initial, onClose, onSubmit,
}: {
  open: boolean;
  initial: any | null;
  onClose: () => void;
  onSubmit: (vals: { name: string; nodes: unknown; is_active: boolean }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [json, setJson] = useState(SAMPLE_NODES);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setActive(initial?.is_active ?? true);
    setJson(initial?.nodes ? JSON.stringify(initial.nodes, null, 2) : SAMPLE_NODES);
    setErr(null);
  }, [open, initial]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(json);
      setErr(null);
      await onSubmit({ name: name.trim(), nodes: parsed, is_active: active });
    } catch (e) {
      setErr("JSON inválido");
      toast.error("JSON inválido");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{initial ? "Editar Fluxo IVR" : "Novo Fluxo IVR"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Atendimento Principal" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Ativo</Label>
            <Switch id="active" checked={active} onCheckedChange={setActive} />
          </div>
          <div className="space-y-2">
            <Label>Configuração (JSON)</Label>
            <Textarea value={json} onChange={(e) => setJson(e.target.value)} rows={12} className="font-mono text-xs" />
            {err && <p className="text-xs text-rose-400">{err}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!name.trim()} onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
