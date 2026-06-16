import React, { useMemo, useState } from 'react';
import { Globe, Copy, Activity, Play, KeyRound, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useWebhookLogChannels } from "@/hooks/developer/use-webhook-logs";
import { useRotateWebhookSecret, useTestInbound } from "@/hooks/developer/use-webhook-test";

export const WebhookManager = () => {
  const { data: channels, isLoading } = useWebhookLogChannels();
  const rotateMut = useRotateWebhookSecret();
  const testMut = useTestInbound();

  const [rotateTarget, setRotateTarget] = useState<{ id: string; name: string } | null>(null);
  const [revealSecret, setRevealSecret] = useState<{ name: string; secret: string } | null>(null);
  const [testResult, setTestResult] = useState<{ name: string; status: number; body: any } | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const buildUrl = (id: string) => `${origin}/api/public/channels/${id}/inbound`;

  const buildCurl = (id: string) =>
    [
      `curl -X POST '${buildUrl(id)}' \\`,
      `  -H 'Content-Type: application/json' \\`,
      `  -H 'x-webhook-token: <COLE_SEU_WEBHOOK_SECRET>' \\`,
      `  -d '${JSON.stringify({ phone: "+5511999999999", sender_name: "Cliente Teste", text: "Olá" })}'`,
    ].join("\n");

  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(label); }
    catch { toast.error("Falha ao copiar"); }
  };

  const submitRotate = async () => {
    if (!rotateTarget) return;
    try {
      const res = await rotateMut.mutateAsync({ channelId: rotateTarget.id });
      setRevealSecret({ name: rotateTarget.name, secret: res.secret });
      setRotateTarget(null);
    } catch (e: any) { toast.error(e?.message ?? "Erro ao rotacionar"); }
  };

  const handleTest = async (ch: any) => {
    try {
      const res = await testMut.mutateAsync({ channelId: ch.id });
      setTestResult({ name: ch.name, status: res.status, body: res.body });
    } catch (e: any) { toast.error(e?.message ?? "Erro ao testar"); }
  };

  const list = useMemo(() => channels ?? [], [channels]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Webhooks de Entrada</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          Endpoint inbound real por canal — receba mensagens de provedores externos
        </p>
      </div>

      {isLoading && (
        <div className="p-6 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">Carregando canais…</div>
      )}

      <div className="space-y-3">
        {list.map((ch: any) => {
          const url = buildUrl(ch.id);
          return (
            <div key={ch.id} className="bg-[#030712] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/20 transition-all">
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{ch.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[8px] font-black border-white/5 text-slate-400 uppercase">{ch.provider}</Badge>
                      <span className="text-[10px] font-mono text-slate-500 truncate">{url}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge className={ch.is_active ? "bg-emerald-500/10 text-emerald-400 border-none" : "bg-white/5 text-slate-500 border-none"}>
                    {ch.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge className={ch.has_webhook_secret ? "bg-indigo-500/10 text-indigo-300 border-none" : "bg-amber-500/10 text-amber-400 border-none"}>
                    {ch.has_webhook_secret ? 'Secret configurado' : 'pending_configuration'}
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 text-[9px] font-bold text-slate-600">
                  {ch.last_sync_at && (
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-emerald-500" />
                      Última atividade: {new Date(ch.last_sync_at).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1.5" onClick={() => copy(url, "URL copiada")}>
                    <Copy className="w-3 h-3" /> URL
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1.5" onClick={() => copy(buildCurl(ch.id), "curl copiado")}>
                    <Copy className="w-3 h-3" /> curl
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="h-8 text-[10px] gap-1.5"
                    disabled={testMut.isPending || !ch.has_webhook_secret || !ch.is_active}
                    onClick={() => handleTest(ch)}
                  >
                    <Play className="w-3 h-3" /> Testar
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-[10px] gap-1.5 bg-amber-600 hover:bg-amber-500"
                    onClick={() => setRotateTarget({ id: ch.id, name: ch.name })}
                  >
                    <KeyRound className="w-3 h-3" /> {ch.has_webhook_secret ? "Rotacionar secret" : "Gerar secret"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && list.length === 0 && (
          <div className="p-12 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-3xl">
            <Globe className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Nenhum canal cadastrado.</p>
          </div>
        )}
      </div>

      {/* Rotate confirm */}
      <AlertDialog open={!!rotateTarget} onOpenChange={(open) => !open && setRotateTarget(null)}>
        <AlertDialogContent className="bg-[#030712] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar novo webhook_secret para “{rotateTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              O secret anterior será invalidado imediatamente. Atualize-o no provedor após a rotação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={rotateMut.isPending} onClick={submitRotate}>
              {rotateMut.isPending ? "Gerando…" : "Gerar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reveal secret once */}
      <Dialog open={!!revealSecret} onOpenChange={(o) => !o && setRevealSecret(null)}>
        <DialogContent className="bg-[#030712] border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Secret de {revealSecret?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Copie agora. Após fechar, o secret não será mais exibido.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-xs break-all text-emerald-300">
            {revealSecret?.secret}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => revealSecret && copy(revealSecret.secret, "Secret copiado")}>Copiar</Button>
            <Button onClick={() => setRevealSecret(null)}>Já copiei</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test result */}
      <Dialog open={!!testResult} onOpenChange={(o) => !o && setTestResult(null)}>
        <DialogContent className="bg-[#030712] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teste de inbound — {testResult?.name}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Status HTTP: <span className="font-mono text-white">{testResult?.status}</span>
            </DialogDescription>
          </DialogHeader>
          <pre className="bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-[11px] max-h-80 overflow-auto whitespace-pre-wrap break-all text-slate-200">
{JSON.stringify(testResult?.body ?? {}, null, 2)}
          </pre>
          <DialogFooter>
            <Button onClick={() => setTestResult(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
