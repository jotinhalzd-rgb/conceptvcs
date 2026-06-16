import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useTestAutomation } from "@/hooks/automation/use-test-automation";
import type { Automation } from "@/hooks/automation/use-automations";

export function AutomationTestDialog({
  open,
  onOpenChange,
  automation,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  automation: Automation | null;
}) {
  const [payload, setPayload] = useState("{}");
  const [parseError, setParseError] = useState<string | null>(null);
  const mutation = useTestAutomation();

  useEffect(() => {
    if (open) {
      setPayload(JSON.stringify({ contact_id: "" }, null, 2));
      setParseError(null);
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, automation?.id]);

  const run = async () => {
    if (!automation) return;
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(payload || "{}");
    } catch (e) {
      setParseError("Payload JSON inválido: " + (e as Error).message);
      return;
    }
    setParseError(null);
    await mutation.mutateAsync({ workflow_id: automation.id, payload: parsed });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Testar automação{automation ? `: ${automation.name}` : ""}</DialogTitle>
          <DialogDescription>
            Execução manual única. Não dispara worker automático nem altera conversas reais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Notificações de teste e tarefas CRM criadas são reais e ficam marcadas como <code>[TESTE]</code>.
            </span>
          </div>
          <div className="grid gap-2">
            <Label>Payload de contexto (JSON)</Label>
            <Textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={6}
              className="font-mono text-xs"
            />
            {parseError && <p className="text-xs text-destructive">{parseError}</p>}
          </div>
          <Button onClick={run} disabled={mutation.isPending || !automation}>
            {mutation.isPending ? "Executando..." : "Executar teste"}
          </Button>

          {mutation.data && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={mutation.data.status === "success" ? "default" : "destructive"}>
                  {mutation.data.status === "success" ? "Sucesso" : "Erro"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {mutation.data.results.length} ações executadas
                </span>
              </div>
              <ul className="space-y-1">
                {mutation.data.results.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 rounded border p-2 text-xs">
                    {r.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    ) : r.status === "error" ? (
                      <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium">{r.type}</div>
                      <div className="text-muted-foreground">{r.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
              {mutation.data.error && (
                <p className="text-xs text-destructive">{mutation.data.error}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}