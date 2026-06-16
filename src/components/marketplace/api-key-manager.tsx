import React, { useState } from 'react';
import { Key, Trash2, Copy, Plus, Lock, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAPIKeys } from "@/hooks/marketplace/use-marketplace";
import { useCreateApiKey, useRevokeApiKey, useRotateApiKey } from "@/hooks/developer/use-api-keys-actions";

const AVAILABLE_SCOPES = ["read", "write", "admin"];

export const APIKeyManager = () => {
  const { data: keys, isLoading } = useAPIKeys();
  const createMut = useCreateApiKey();
  const revokeMut = useRevokeApiKey();
  const rotateMut = useRotateApiKey();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [revealKey, setRevealKey] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null);
  const [rotateTarget, setRotateTarget] = useState<{ id: string; name: string } | null>(null);

  const copy = async (text: string, label = "Copiado!") => {
    try { await navigator.clipboard.writeText(text); toast.success(label); }
    catch { toast.error("Falha ao copiar"); }
  };

  const toggleScope = (s: string) =>
    setScopes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const submitCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Nome obrigatório"); return; }
    if (scopes.length === 0) { toast.error("Selecione ao menos um escopo"); return; }
    try {
      const res = await createMut.mutateAsync({ name: trimmed, scopes });
      setCreateOpen(false);
      setName(""); setScopes(["read"]);
      setRevealKey(res.key);
    } catch (e: any) { toast.error(e?.message ?? "Erro ao criar chave"); }
  };

  const submitRotate = async () => {
    if (!rotateTarget) return;
    try {
      const res = await rotateMut.mutateAsync({ id: rotateTarget.id });
      setRotateTarget(null);
      setRevealKey(res.key);
    } catch (e: any) { toast.error(e?.message ?? "Erro ao rotacionar"); }
  };

  const submitRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await revokeMut.mutateAsync({ id: revokeTarget.id });
      toast.success("Chave revogada");
      setRevokeTarget(null);
    } catch (e: any) { toast.error(e?.message ?? "Erro ao revogar"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Chaves de API</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Tokens para acesso programático — exibidos apenas no momento da criação
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-4 gap-2 text-[10px] uppercase tracking-widest"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Chave
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="p-6 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">Carregando…</div>
        )}
        {!isLoading && keys?.map((key: any) => (
          <div key={key.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-all">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{key.name}</h4>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-500">{key.key_prefix}••••••••••••</span>
                  {(key.scopes ?? []).map((s: string) => (
                    <Badge key={s} variant="outline" className="text-[8px] font-black border-white/5 text-slate-500 uppercase px-1.5 py-0">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden md:block mr-4">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Último Uso</p>
                <p className="text-[9px] font-bold text-slate-400">{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Nunca'}</p>
              </div>
              <Button title="Copiar prefixo" variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" onClick={() => copy(key.key_prefix, "Prefixo copiado")}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button title="Rotacionar" variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-400" onClick={() => setRotateTarget({ id: key.id, name: key.name })}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
              <Button title="Revogar" variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-500" onClick={() => setRevokeTarget({ id: key.id, name: key.name })}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {!isLoading && (keys?.length ?? 0) === 0 && (
          <div className="p-12 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-3xl">
            <Lock className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Nenhuma chave gerada ainda.</p>
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#030712] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Nova chave de API</DialogTitle>
            <DialogDescription className="text-slate-400">
              A chave completa será exibida UMA única vez ao final. Guarde-a em local seguro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-widest text-slate-400">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Integração ERP" className="bg-white/5 border-white/10 mt-1" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-widest text-slate-400">Escopos</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {AVAILABLE_SCOPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleScope(s)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      scopes.includes(s) ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button disabled={createMut.isPending} onClick={submitCreate}>{createMut.isPending ? "Criando…" : "Criar chave"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal dialog (one-time secret) */}
      <Dialog open={!!revealKey} onOpenChange={(open) => !open && setRevealKey(null)}>
        <DialogContent className="bg-[#030712] border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Copie agora — não será mostrada novamente</DialogTitle>
            <DialogDescription className="text-slate-400">
              Esta é a única vez que a chave completa aparece. Após fechar, só o prefixo será visível.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-xs break-all text-emerald-300">
            {revealKey}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => revealKey && copy(revealKey, "Chave copiada")}>Copiar</Button>
            <Button onClick={() => setRevealKey(null)}>Já copiei</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate confirm */}
      <AlertDialog open={!!rotateTarget} onOpenChange={(open) => !open && setRotateTarget(null)}>
        <AlertDialogContent className="bg-[#030712] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Rotacionar chave “{rotateTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Uma nova chave será gerada e a atual será invalidada imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={rotateMut.isPending} onClick={submitRotate}>{rotateMut.isPending ? "Rotacionando…" : "Rotacionar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke confirm */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent className="bg-[#030712] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar chave “{revokeTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              A chave deixará de funcionar imediatamente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={revokeMut.isPending} onClick={submitRevoke} className="bg-rose-600 hover:bg-rose-500">
              {revokeMut.isPending ? "Revogando…" : "Revogar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
