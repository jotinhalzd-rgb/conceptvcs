import { useState } from "react";
import { useAutomationLogs } from "@/hooks/automation/use-automation-logs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Automation } from "@/hooks/automation/use-automations";

export function AutomationLogsPanel({ automations }: { automations: Automation[] }) {
  const [workflowId, setWorkflowId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const { data: logs, isLoading } = useAutomationLogs({
    workflow_id: workflowId === "all" ? undefined : workflowId,
    status,
  });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<any>(null);

  const nameById = new Map(automations.map((a) => [a.id, a.name]));

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold">Logs de execução</h3>
        <div className="flex gap-2">
          <Select value={workflowId} onValueChange={setWorkflowId}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as automações</SelectItem>
              {automations.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando logs...</p>
      ) : !logs || logs.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum log ainda. Execute uma automação ou use "Testar" para gerar logs reais.</p>
      ) : (
        <ul className="divide-y">
          {logs.map((l) => (
            <li
              key={l.id}
              className="py-2 flex items-center justify-between cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded"
              onClick={() => { setActive(l); setOpen(true); }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={l.status === "success" ? "default" : l.status === "error" ? "destructive" : "secondary"}>
                    {l.status ?? "—"}
                  </Badge>
                  <span className="text-sm truncate">{nameById.get(l.workflow_id) ?? l.workflow_id}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {l.trigger_event ?? "—"} · {l.created_at ? new Date(l.created_at).toLocaleString() : ""}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>Detalhe do log</SheetTitle></SheetHeader>
          {active && (
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <div className="text-muted-foreground">Status</div>
                <Badge variant={active.status === "success" ? "default" : "destructive"}>{active.status}</Badge>
              </div>
              <div>
                <div className="text-muted-foreground">Gatilho</div>
                <div>{active.trigger_event ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Input</div>
                <pre className="rounded bg-muted p-2 overflow-auto">{JSON.stringify(active.input, null, 2)}</pre>
              </div>
              <div>
                <div className="text-muted-foreground">Output</div>
                <pre className="rounded bg-muted p-2 overflow-auto">{JSON.stringify(active.output, null, 2)}</pre>
              </div>
              {active.error_message && (
                <div>
                  <div className="text-muted-foreground">Erro</div>
                  <pre className="rounded bg-destructive/10 p-2 text-destructive overflow-auto">{active.error_message}</pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}