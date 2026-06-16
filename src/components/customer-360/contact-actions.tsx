import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  StickyNote, Plus, MessageSquare, ExternalLink, TrendingUp, Inbox,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useAddContactNote, useCreateOpportunityForContact,
} from "@/hooks/crm/use-customer-360";
import { usePipelines } from "@/hooks/crm/use-pipelines";

export function ConversationsCard({
  contactId, conversations,
}: { contactId: string; conversations: any[] }) {
  const navigate = useNavigate();
  return (
    <Card className="bg-white/[0.02] border-white/[0.08]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <MessageSquare className="w-3 h-3" /> Conversas ({conversations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nenhuma conversa"
            description="Quando este contato iniciar um atendimento, ele aparecerá aqui."
          />
        ) : conversations.slice(0, 8).map((c: any) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-bold truncate">
                {c.last_message_preview || "Sem mensagens"}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">
                {c.channels?.name || c.channels?.type || "Canal"} ·{" "}
                {c.queues?.name || "Sem fila"} ·{" "}
                {c.profiles?.full_name || "Não atribuído"} ·{" "}
                {c.status || "open"}
                {c.last_message_at && (
                  <> · {format(new Date(c.last_message_at), "dd/MM HH:mm", { locale: ptBR })}</>
                )}
              </p>
            </div>
            <Button
              variant="ghost" size="sm"
              className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              onClick={() => navigate({ to: "/inbox", search: { conversation: c.id } as any })}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Abrir
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function NotesCard({
  contactId, notes, hasConversation,
}: { contactId: string; notes: any[]; hasConversation: boolean }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const addNote = useAddContactNote(contactId);

  return (
    <Card className="bg-white/[0.02] border-white/[0.08]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <StickyNote className="w-3 h-3" /> Notas Internas ({notes.length})
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 text-indigo-400 hover:bg-indigo-500/10" disabled={!hasConversation}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#020817] border-white/10 text-white">
            <DialogHeader><DialogTitle>Adicionar Nota Interna</DialogTitle></DialogHeader>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva uma observação visível apenas para a equipe..."
              className="bg-white/[0.03] border-white/10 text-white min-h-32"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button
                disabled={!content.trim() || addNote.isPending}
                onClick={async () => {
                  await addNote.mutateAsync({ content: content.trim() });
                  setContent(""); setOpen(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-500"
              >{addNote.isPending ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {!hasConversation ? (
          <EmptyState
            icon={StickyNote}
            title="Sem conversa para anexar"
            description="Notas internas são salvas em uma conversa do contato. Crie ou aguarde a primeira conversa."
          />
        ) : notes.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title="Sem notas"
            description="Use o botão acima para registrar uma observação interna."
          />
        ) : notes.slice(0, 10).map((n: any) => (
          <div key={n.id} className="p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/10">
            <p className="text-sm text-amber-100/90 whitespace-pre-wrap">{n.content}</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">
              {n.profiles?.full_name || "Sistema"} ·{" "}
              {n.created_at && format(new Date(n.created_at), "dd/MM HH:mm", { locale: ptBR })}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CreateOpportunityCard({ contactId }: { contactId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState<string>("");
  const [pipelineId, setPipelineId] = useState<string | undefined>();
  const [stageId, setStageId] = useState<string | undefined>();
  const { data: pipelines } = usePipelines();
  const create = useCreateOpportunityForContact(contactId);
  const stages = pipelines?.find((p: any) => p.id === pipelineId)?.stages ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl h-11 px-4 w-full">
          <TrendingUp className="w-4 h-4 mr-2" /> Criar oportunidade no CRM
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#020817] border-white/10 text-white">
        <DialogHeader><DialogTitle>Nova oportunidade</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-widest text-slate-400">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Renovação anual" className="bg-white/[0.03] border-white/10" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-widest text-slate-400">Valor (R$)</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)}
              type="number" placeholder="0,00" className="bg-white/[0.03] border-white/10" />
          </div>
          {pipelines && pipelines.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400">Pipeline</Label>
                <Select value={pipelineId} onValueChange={(v) => { setPipelineId(v); setStageId(undefined); }}>
                  <SelectTrigger className="bg-white/[0.03] border-white/10"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                    {pipelines.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400">Etapa</Label>
                <Select value={stageId} onValueChange={setStageId} disabled={!pipelineId}>
                  <SelectTrigger className="bg-white/[0.03] border-white/10"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                    {stages.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            disabled={!title.trim() || create.isPending}
            onClick={async () => {
              await create.mutateAsync({
                title: title.trim(),
                value: value ? Number(value) : 0,
                pipeline_id: pipelineId,
                stage_id: stageId,
              });
              setTitle(""); setValue(""); setPipelineId(undefined); setStageId(undefined);
              setOpen(false);
            }}
            className="bg-indigo-600 hover:bg-indigo-500"
          >{create.isPending ? "Criando..." : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}