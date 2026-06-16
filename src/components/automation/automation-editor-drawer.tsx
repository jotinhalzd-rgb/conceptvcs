import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  useAutomationMutations,
  type Automation,
  type AutomationNodes,
} from "@/hooks/automation/use-automations";
import { useQueues } from "@/hooks/queues/use-queues";
import { useChannels } from "@/hooks/channels/use-channels";

export const TRIGGER_OPTIONS: Array<{ value: string; label: string; connected: boolean }> = [
  { value: "conversation_created", label: "Nova conversa", connected: true },
  { value: "conversation_routed", label: "Conversa roteada", connected: false },
  { value: "conversation_no_reply", label: "Conversa sem resposta", connected: false },
  { value: "deal_created", label: "Negócio criado", connected: false },
  { value: "campaign_created", label: "Campanha criada", connected: false },
  { value: "sla_risk", label: "Risco de SLA", connected: false },
];

export const ACTION_TYPES = [
  { value: "create_notification", label: "Criar notificação" },
  { value: "assign_queue", label: "Atribuir fila" },
  { value: "create_crm_task", label: "Criar tarefa CRM" },
  { value: "log_event", label: "Registrar evento" },
] as const;

type ActionType = (typeof ACTION_TYPES)[number]["value"];

type ActionRow = { type: ActionType; params: Record<string, string> };
type ConditionRow = { field: string; op: string; value: string };

export function AutomationEditorDrawer({
  open,
  onOpenChange,
  automation,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  automation: Automation | null;
}) {
  const { upsert } = useAutomationMutations();
  const { data: queues } = useQueues();
  const { data: channels } = useChannels();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("conversation_created");
  const [isActive, setIsActive] = useState(false);
  const [queueId, setQueueId] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [conditions, setConditions] = useState<ConditionRow[]>([]);
  const [actions, setActions] = useState<ActionRow[]>([]);

  useEffect(() => {
    if (!open) return;
    if (automation) {
      const n = automation.nodes ?? {};
      setName(automation.name);
      setDescription(n.description ?? "");
      setTrigger(automation.trigger_event);
      setIsActive(!!automation.is_active);
      setQueueId(n.queue_id ?? "");
      setChannelId(n.channel_id ?? "");
      setConditions((n.conditions ?? []) as ConditionRow[]);
      setActions(
        ((n.actions ?? []) as Array<{ type: string; params?: Record<string, unknown> }>).map(
          (a) => ({
            type: (a.type as ActionType) ?? "log_event",
            params: Object.fromEntries(
              Object.entries(a.params ?? {}).map(([k, v]) => [k, String(v ?? "")]),
            ),
          }),
        ),
      );
    } else {
      setName("");
      setDescription("");
      setTrigger("conversation_created");
      setIsActive(false);
      setQueueId("");
      setChannelId("");
      setConditions([]);
      setActions([{ type: "log_event", params: {} }]);
    }
  }, [open, automation]);

  const triggerMeta = TRIGGER_OPTIONS.find((t) => t.value === trigger);

  const handleSave = async () => {
    if (!name.trim()) return;
    const nodes: AutomationNodes = {
      description: description.trim() || undefined,
      queue_id: queueId || null,
      channel_id: channelId || null,
      conditions,
      actions: actions.map((a) => ({ type: a.type, params: a.params })),
    };
    await upsert.mutateAsync({
      id: automation?.id,
      name: name.trim(),
      trigger_event: trigger,
      is_active: isActive,
      nodes,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{automation ? "Editar automação" : "Nova automação"}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="grid gap-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Notificar SLA em risco" />
          </div>

          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Gatilho</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {triggerMeta?.connected
                  ? "Conectado automaticamente via trigger do banco."
                  : "Execução automática não conectada para este gatilho — disponível para teste manual."}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm">{isActive ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Fila (opcional)</Label>
              <Select value={queueId || "none"} onValueChange={(v) => setQueueId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {(queues ?? []).map((q: any) => (
                    <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Canal (opcional)</Label>
              <Select value={channelId || "none"} onValueChange={(v) => setChannelId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {(channels ?? []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name ?? c.identifier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Condições</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setConditions([...conditions, { field: "", op: "equals", value: "" }])}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>
            {conditions.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem condições — a ação roda em todo disparo.</p>
            )}
            {conditions.map((c, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_140px_1fr_auto] gap-2">
                <Input placeholder="campo" value={c.field} onChange={(e) => updateCondition(idx, "field", e.target.value)} />
                <Select value={c.op} onValueChange={(v) => updateCondition(idx, "op", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">igual a</SelectItem>
                    <SelectItem value="not_equals">diferente de</SelectItem>
                    <SelectItem value="contains">contém</SelectItem>
                    <SelectItem value="gt">maior que</SelectItem>
                    <SelectItem value="lt">menor que</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="valor" value={c.value} onChange={(e) => updateCondition(idx, "value", e.target.value)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setConditions(conditions.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ações</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setActions([...actions, { type: "log_event", params: {} }])}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>
            {actions.length === 0 && (
              <p className="text-xs text-muted-foreground">Adicione ao menos uma ação para que a automação tenha efeito.</p>
            )}
            {actions.map((a, idx) => (
              <div key={idx} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Select value={a.type} onValueChange={(v) => updateActionType(idx, v as ActionType)}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setActions(actions.filter((_, i) => i !== idx))}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {renderActionParams(a, (k, v) => updateActionParam(idx, k, v), queues, channels)}
              </div>
            ))}
          </div>

          <details className="rounded-md border p-3 text-xs">
            <summary className="cursor-pointer text-muted-foreground">JSON preview</summary>
            <pre className="mt-2 overflow-auto">{JSON.stringify({ name, trigger_event: trigger, is_active: isActive, nodes: { description, queue_id: queueId || null, channel_id: channelId || null, conditions, actions } }, null, 2)}</pre>
          </details>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={upsert.isPending}>Cancelar</Button>
            <Button onClick={handleSave} disabled={upsert.isPending || !name.trim()}>
              {upsert.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  function updateCondition(idx: number, key: keyof ConditionRow, value: string) {
    setConditions((prev) => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  }
  function updateActionType(idx: number, type: ActionType) {
    setActions((prev) => prev.map((a, i) => (i === idx ? { ...a, type, params: {} } : a)));
  }
  function updateActionParam(idx: number, key: string, value: string) {
    setActions((prev) => prev.map((a, i) => (i === idx ? { ...a, params: { ...a.params, [key]: value } } : a)));
  }
}

function renderActionParams(
  a: ActionRow,
  set: (k: string, v: string) => void,
  queues: any,
  _channels: any,
) {
  if (a.type === "create_notification") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Título" value={a.params.title ?? ""} onChange={(e) => set("title", e.target.value)} />
        <Input placeholder="Mensagem" value={a.params.message ?? ""} onChange={(e) => set("message", e.target.value)} />
      </div>
    );
  }
  if (a.type === "assign_queue") {
    return (
      <Select value={a.params.queue_id ?? ""} onValueChange={(v) => set("queue_id", v)}>
        <SelectTrigger><SelectValue placeholder="Selecione a fila" /></SelectTrigger>
        <SelectContent>
          {(queues ?? []).map((q: any) => (
            <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (a.type === "create_crm_task") {
    return (
      <Input placeholder="Título da tarefa" value={a.params.title ?? ""} onChange={(e) => set("title", e.target.value)} />
    );
  }
  return <p className="text-xs text-muted-foreground">Sem parâmetros adicionais.</p>;
}