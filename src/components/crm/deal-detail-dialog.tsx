import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateDeal, useDeleteDeal, useDuplicateDeal, usePipelines, useStages, useCRMTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/crm/use-deals";
import { useContacts } from "@/hooks/crm/use-contacts";
import { useOrgUsers } from "@/hooks/crm/use-org-users";
import { Trash2, Copy, Check, Plus, ExternalLink, MessageSquare, User as UserIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

interface Props {
  deal: any | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function DealDetailDialog({ deal, open, onOpenChange }: Props) {
  const update = useUpdateDeal();
  const del = useDeleteDeal();
  const dup = useDuplicateDeal();
  const { data: pipelines } = usePipelines();
  const { contacts } = useContacts();
  const { data: orgUsers } = useOrgUsers();
  const [form, setForm] = useState<any>(null);
  const { data: stages } = useStages(form?.pipeline_id);
  const { data: tasks } = useCRMTasks(deal?.id);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (deal) setForm({
      id: deal.id,
      title: deal.title ?? "",
      value: deal.value ?? 0,
      probability: deal.probability ?? 50,
      status: deal.status ?? "open",
      contact_id: deal.contact_id ?? "",
      responsible_id: deal.responsible_id ?? "",
      pipeline_id: deal.pipeline_id ?? "",
      stage_id: deal.stage_id ?? "",
      expected_close_date: deal.expected_close_date ?? "",
    });
  }, [deal]);

  if (!form) return null;

  const save = async () => {
    const payload = {
      id: form.id,
      title: form.title,
      value: Number(form.value) || 0,
      probability: Number(form.probability) || 0,
      status: form.status,
      contact_id: form.contact_id || null,
      responsible_id: form.responsible_id || null,
      pipeline_id: form.pipeline_id || null,
      stage_id: form.stage_id || null,
      expected_close_date: form.expected_close_date || null,
    };
    await update.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#020817] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Editar Negócio</DialogTitle>
        </DialogHeader>

        {/* Vínculos rápidos */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {deal?.contact_id && (
            <Link
              to="/customers"
              search={{ contact: deal.contact_id } as any}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500/20"
            >
              <UserIcon className="w-3 h-3" /> Customer 360
            </Link>
          )}
          {deal?.origin_conversation_id && (
            <Link
              to="/inbox"
              search={{ conversation: deal.origin_conversation_id } as any}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20"
            >
              <MessageSquare className="w-3 h-3" /> Conversa de origem
            </Link>
          )}
          {deal?.origin_conversation_id && (
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase">Origem omnichannel</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">Título</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">Valor</Label>
            <Input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">Probabilidade %</Label>
            <Input type="number" min={0} max={100} value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">Cliente</Label>
            <Select value={form.contact_id} onValueChange={v => setForm({ ...form, contact_id: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Selecionar"/></SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                {contacts?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">Responsável</Label>
            <Select value={form.responsible_id} onValueChange={v => setForm({ ...form, responsible_id: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Sem responsável"/></SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                {(orgUsers ?? []).map((u: any) => <SelectItem key={u.id} value={u.id}>{u.full_name || u.id.slice(0,6)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="won">Ganho</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">Pipeline</Label>
            <Select value={form.pipeline_id} onValueChange={v => setForm({ ...form, pipeline_id: v, stage_id: "" })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                {pipelines?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">Etapa</Label>
            <Select value={form.stage_id} onValueChange={v => setForm({ ...form, stage_id: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                {stages?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">Data Prevista de Fechamento</Label>
            <Input type="date" value={form.expected_close_date || ""} onChange={e => setForm({ ...form, expected_close_date: e.target.value || null })} className="bg-white/5 border-white/10 text-white" />
          </div>
        </div>

        {/* Tasks */}
        <div className="border-t border-white/5 pt-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Tarefas</h3>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Nova tarefa..." value={newTask} onChange={e => setNewTask(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            <Button size="sm" onClick={async () => { if (!newTask) return; await createTask.mutateAsync({ title: newTask, deal_id: deal.id, contact_id: deal.contact_id, status: "pending" }); setNewTask(""); }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {tasks?.map((t: any) => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateTask.mutate({ id: t.id, status: t.status === "done" ? "pending" : "done" })}>
                  <Check className={`w-3.5 h-3.5 ${t.status === "done" ? "text-emerald-400" : "text-slate-600"}`} />
                </Button>
                <span className={`flex-1 text-xs ${t.status === "done" ? "line-through text-slate-600" : "text-slate-300"}`}>{t.title}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-600 hover:text-rose-400" onClick={() => deleteTask.mutate(t.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            {(!tasks || tasks.length === 0) && <p className="text-[10px] text-slate-600 uppercase tracking-widest">Sem tarefas</p>}
          </div>
        </div>

        <DialogFooter className="border-t border-white/5 pt-4 flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5" onClick={async () => { await dup.mutateAsync(deal); onOpenChange(false); }}>
              <Copy className="w-4 h-4 mr-2" /> Duplicar
            </Button>
            <Button variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10" onClick={async () => { if (confirm("Excluir negócio?")) { await del.mutateAsync(deal.id); onOpenChange(false); } }}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </Button>
          </div>
          <Button onClick={save} disabled={update.isPending} className="bg-indigo-600 hover:bg-indigo-500">
            {update.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
