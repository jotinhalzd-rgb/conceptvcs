import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Play, Copy, Pencil, Trash2, Zap } from "lucide-react";
import {
  useAutomations,
  useAutomationMutations,
  type Automation,
} from "@/hooks/automation/use-automations";
import { useAutomationLogs } from "@/hooks/automation/use-automation-logs";
import { AutomationEditorDrawer, TRIGGER_OPTIONS } from "./automation-editor-drawer";
import { AutomationTestDialog } from "./automation-test-dialog";
import { AutomationDeleteDialog } from "./automation-delete-dialog";
import { AutomationLogsPanel } from "./automation-logs-panel";

export function AutomationList() {
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [trigger, setTrigger] = useState<string>("all");
  const { data: automations, isLoading } = useAutomations({ status, trigger });
  const { data: recentLogs } = useAutomationLogs({}, 200);
  const { toggle, remove, duplicate } = useAutomationMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [testing, setTesting] = useState<Automation | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Automation | null>(null);

  const lastRunByWorkflow = useMemo(() => {
    const map = new Map<string, string>();
    (recentLogs ?? []).forEach((l) => {
      if (l.created_at && !map.has(l.workflow_id)) {
        map.set(l.workflow_id, l.created_at);
      }
    });
    return map;
  }, [recentLogs]);

  const openCreate = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (a: Automation) => { setEditing(a); setEditorOpen(true); };
  const openTest = (a: Automation) => { setTesting(a); setTestOpen(true); };
  const openDelete = (a: Automation) => { setDeleting(a); setDeleteOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-5 h-5" /> Automações</h1>
          <p className="text-sm text-muted-foreground">
            Gatilho <strong>conversation_created</strong> está conectado via trigger do banco. Demais gatilhos disponíveis para teste manual nesta versão.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Criar automação</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={trigger} onValueChange={setTrigger}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos gatilhos</SelectItem>
            {TRIGGER_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-sm text-muted-foreground">Carregando automações...</div>
        ) : !automations || automations.length === 0 ? (
          <div className="p-10 text-center">
            <Zap className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-semibold">Nenhuma automação ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">Crie sua primeira regra para reagir a eventos.</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Criar automação</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Gatilho</th>
                <th className="text-left p-3">Ações</th>
                <th className="text-left p-3">Última exec.</th>
                <th className="text-left p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {automations.map((a) => {
                const actionCount = Array.isArray(a.nodes?.actions) ? a.nodes!.actions!.length : 0;
                const last = lastRunByWorkflow.get(a.id);
                const triggerMeta = TRIGGER_OPTIONS.find((t) => t.value === a.trigger_event);
                return (
                  <tr key={a.id} className="border-t hover:bg-muted/20">
                    <td className="p-3">
                      <div className="font-medium">{a.name}</div>
                      {a.nodes?.description && (
                        <div className="text-xs text-muted-foreground">{a.nodes.description}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{triggerMeta?.label ?? a.trigger_event}</Badge>
                      {triggerMeta && !triggerMeta.connected && (
                        <div className="text-[10px] text-muted-foreground mt-1">Teste manual</div>
                      )}
                    </td>
                    <td className="p-3">{actionCount}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {last ? new Date(last).toLocaleString() : "—"}
                    </td>
                    <td className="p-3">
                      <Switch
                        checked={!!a.is_active}
                        onCheckedChange={(v) => toggle.mutate({ id: a.id, is_active: v })}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openTest(a)} title="Testar regra">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="Editar">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => duplicate.mutate(a)} title="Duplicar">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDelete(a)} title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <AutomationLogsPanel automations={automations ?? []} />

      <AutomationEditorDrawer
        open={editorOpen}
        onOpenChange={setEditorOpen}
        automation={editing}
      />
      <AutomationTestDialog
        open={testOpen}
        onOpenChange={setTestOpen}
        automation={testing}
      />
      <AutomationDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        name={deleting?.name}
        loading={remove.isPending}
        onConfirm={async () => {
          if (deleting) {
            await remove.mutateAsync(deleting.id);
            setDeleteOpen(false);
          }
        }}
      />
    </div>
  );
}