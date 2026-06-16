import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Users } from "lucide-react";
import {
  useUpdateQueue,
  useDeleteQueue,
  useQueueMembers,
  useAddQueueMember,
  useRemoveQueueMember,
} from "@/hooks/queues/use-queues";
import { useOrgUsers } from "@/hooks/crm/use-org-users";
import { useProfile } from "@/hooks/auth/use-auth";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  queue: any | null;
}

export function QueueEditDialog({ open, onOpenChange, queue }: Props) {
  const update = useUpdateQueue();
  const del = useDeleteQueue();
  const { data: profile } = useProfile();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(1);
  const [sla, setSla] = useState<number>(60);
  const [maxCap, setMaxCap] = useState<number>(50);
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!queue) return;
    setName(queue.name ?? "");
    setDepartment(queue.department ?? "");
    setDescription(queue.description ?? "");
    setPriority(queue.priority_level ?? 1);
    setSla(queue.sla_minutes ?? 60);
    setMaxCap(queue.max_capacity ?? 50);
    setMode((queue.assignment_mode as any) ?? "manual");
    setIsDefault(!!queue.is_default);
    setIsActive(queue.is_active !== false);
  }, [queue?.id]);

  if (!queue) return null;

  const save = async () => {
    await update.mutateAsync({
      id: queue.id,
      name: name.trim(),
      department: department.trim() || null,
      description: description.trim() || null,
      priority_level: priority,
      sla_minutes: sla,
      max_capacity: maxCap,
      assignment_mode: mode,
      is_default: isDefault,
      is_active: isActive,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#020817] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-black uppercase tracking-tight">
            Editar fila · {queue.name}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="geral" className="pt-2">
          <TabsList className="bg-white/[0.03] border border-white/10">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="membros">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Membros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-3 pt-4">
            <Field label="Nome">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/[0.03] border-white/10" />
            </Field>
            <Field label="Departamento">
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} className="bg-white/[0.03] border-white/10" />
            </Field>
            <Field label="Descrição">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white/[0.03] border-white/10" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Prioridade (1-5)">
                <Input type="number" min={1} max={5} value={priority} onChange={(e) => setPriority(parseInt(e.target.value) || 1)} className="bg-white/[0.03] border-white/10" />
              </Field>
              <Field label="SLA (min)">
                <Input type="number" min={1} value={sla} onChange={(e) => setSla(parseInt(e.target.value) || 60)} className="bg-white/[0.03] border-white/10" />
              </Field>
              <Field label="Capacidade">
                <Input type="number" min={1} value={maxCap} onChange={(e) => setMaxCap(parseInt(e.target.value) || 50)} className="bg-white/[0.03] border-white/10" />
              </Field>
            </div>
            <Field label="Modo de atribuição">
              <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                <SelectTrigger className="bg-white/[0.03] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                  <SelectItem value="manual">Manual (atendente assume)</SelectItem>
                  <SelectItem value="auto">Automático (menor carga)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-white/10 p-3">
              <div>
                <p className="text-xs font-bold text-white">Fila padrão da organização</p>
                <p className="text-[10px] text-slate-500">Mensagens sem regra de roteamento entram aqui.</p>
              </div>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 p-3">
              <div>
                <p className="text-xs font-bold text-white">Ativa</p>
                <p className="text-[10px] text-slate-500">Filas inativas não recebem novas conversas.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex items-center justify-between pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-2">
                    <Trash2 className="w-4 h-4" /> Excluir fila
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#020817] border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir fila?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Conversas vinculadas ficarão sem fila. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/[0.04] border-white/10 text-slate-200">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await del.mutateAsync(queue.id);
                        onOpenChange(false);
                      }}
                      className="bg-rose-600 hover:bg-rose-500 text-white"
                    >Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">Cancelar</Button>
                <Button onClick={save} disabled={update.isPending || !name.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  {update.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="membros" className="pt-4">
            <MembersPanel queueId={queue.id} organizationId={profile?.organization_id ?? null} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</Label>
      {children}
    </div>
  );
}

function MembersPanel({ queueId, organizationId }: { queueId: string; organizationId: string | null }) {
  const { data: members, isLoading } = useQueueMembers(queueId);
  const { data: orgUsers } = useOrgUsers();
  const add = useAddQueueMember();
  const remove = useRemoveQueueMember(queueId);
  const [selected, setSelected] = useState<string>("");

  const memberIds = new Set((members ?? []).map((m: any) => m.user_id));
  const available = (orgUsers ?? []).filter((u: any) => !memberIds.has(u.id));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="bg-white/[0.03] border-white/10 flex-1">
            <SelectValue placeholder={available.length ? "Selecionar atendente" : "Sem atendentes disponíveis"} />
          </SelectTrigger>
          <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
            {available.map((u: any) => (
              <SelectItem key={u.id} value={u.id}>{u.full_name || u.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={!selected || !organizationId || add.isPending}
          onClick={async () => {
            if (!organizationId) return;
            await add.mutateAsync({ queue_id: queueId, user_id: selected, organization_id: organizationId });
            setSelected("");
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-500">Carregando membros...</p>
      ) : (members?.length ?? 0) === 0 ? (
        <div className="border-2 border-dashed border-white/5 rounded-xl p-8 text-center text-slate-500 text-xs">
          Nenhum atendente nesta fila ainda.
        </div>
      ) : (
        <ul className="space-y-2">
          {(members ?? []).map((m: any) => {
            const profile = m.profiles ?? (orgUsers ?? []).find((u: any) => u.id === m.user_id);
            return (
              <li key={m.id} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-white">{profile?.full_name || m.user_id}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{profile?.role || "atendente"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  onClick={() => remove.mutate(m.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}