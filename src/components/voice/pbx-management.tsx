import { useState } from "react";
import { Phone, Plus, Trash2, Power, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useVoiceExtensions,
  useCreateExtension,
  useUpdateExtension,
  useDeleteExtension,
  useVoiceProviderStatus,
} from "@/hooks/voice/use-voice";

type Row = { id: string; extension_number: string; voicemail_enabled: boolean | null; status: string | null; agent_id: string | null };

export function PbxManagement() {
  const { data: extensions = [], isLoading } = useVoiceExtensions();
  const { data: provider } = useVoiceProviderStatus();
  const create = useCreateExtension();
  const update = useUpdateExtension();
  const remove = useDeleteExtension();

  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {!provider?.configured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
          <div>
            <p className="font-bold text-amber-200">Provider de voz não configurado</p>
            <p className="text-amber-200/70 text-xs mt-1">
              Ramais podem ser cadastrados, mas chamadas reais exigem credenciais Twilio/SIP. Configure em Canais quando estiver disponível.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Ramais</h2>
          <p className="text-xs text-slate-500">{extensions.length} ramal(is) cadastrado(s)</p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Ramal
        </Button>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse bg-white/[0.02] rounded-xl" />
      ) : extensions.length === 0 ? (
        <EmptyState icon={Phone} title="Nenhum ramal cadastrado" description="Crie o primeiro ramal para começar a estruturar seu PBX." />
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          {extensions.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Ramal {e.extension_number}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[9px]">{e.status ?? "offline"}</Badge>
                    {e.voicemail_enabled && <Badge variant="outline" className="text-[9px]">voicemail</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(e)}>Editar</Button>
                <Button variant="ghost" size="icon" onClick={() => update.mutate({ id: e.id, patch: { status: e.status === "available" ? "offline" : "available" } })} title="Alternar status">
                  <Power className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(e.id)} title="Excluir">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ExtensionDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSubmit={async (vals) => {
          if (editing) await update.mutateAsync({ id: editing.id, patch: vals });
          else await create.mutateAsync(vals);
          setCreating(false); setEditing(null);
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ramal?</AlertDialogTitle>
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

function ExtensionDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial: Row | null;
  onClose: () => void;
  onSubmit: (vals: { extension_number: string; voicemail_enabled: boolean }) => Promise<void>;
}) {
  const [num, setNum] = useState(initial?.extension_number ?? "");
  const [vm, setVm] = useState<boolean>(initial?.voicemail_enabled ?? true);

  // Reset when opening
  useStateReset(open, () => {
    setNum(initial?.extension_number ?? "");
    setVm(initial?.voicemail_enabled ?? true);
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Editar Ramal" : "Novo Ramal"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Número do ramal</Label>
            <Input value={num} onChange={(e) => setNum(e.target.value)} placeholder="1001" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="vm">Voicemail habilitado</Label>
            <Switch id="vm" checked={vm} onCheckedChange={setVm} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!num.trim()} onClick={() => onSubmit({ extension_number: num.trim(), voicemail_enabled: vm })}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from "react";
function useStateReset(open: boolean, fn: () => void) {
  useEffect(() => { if (open) fn(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);
}
