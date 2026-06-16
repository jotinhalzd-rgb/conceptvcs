import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useChannels } from "@/hooks/channels/use-channels";
import { useOrgUsers } from "@/hooks/crm/use-org-users";
import { useProfile } from "@/hooks/auth/use-auth";
import {
  useCreateCampaign,
  useUpdateCampaign,
} from "@/hooks/campaigns/use-campaigns";
import {
  useEstimateRecipients,
  useMaterializeRecipients,
  type SegmentFilters,
} from "@/hooks/campaigns/use-campaign-recipients";
import { evaluateChannelForDispatch, STATUS_LABEL } from "@/lib/campaigns/dispatch";
import { Users, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  campaign?: any | null;
}

export function CampaignEditorDrawer({ open, onOpenChange, campaign }: Props) {
  const isEdit = !!campaign?.id;
  const { data: channels } = useChannels();
  const { data: orgUsers } = useOrgUsers();
  const { data: profile } = useProfile();
  const createMut = useCreateCampaign();
  const updateMut = useUpdateCampaign();
  const materialize = useMaterializeRecipients();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [channelId, setChannelId] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [filters, setFilters] = useState<SegmentFilters>({});

  useEffect(() => {
    if (!open) return;
    setName(campaign?.name ?? "");
    setDescription(campaign?.description ?? "");
    setChannelId(campaign?.channel_id ?? "");
    setAssignedTo(campaign?.assigned_to ?? "");
    setMessage(campaign?.message_content ?? "");
    setScheduledAt(campaign?.scheduled_at ? String(campaign.scheduled_at).slice(0, 16) : "");
    setFilters((campaign?.segment_filters as SegmentFilters) ?? {});
  }, [open, campaign]);

  const channel = useMemo(
    () => channels?.find((c: any) => c.id === channelId) ?? null,
    [channels, channelId],
  );
  const dispatchEval = evaluateChannelForDispatch(channel as any, scheduledAt || null);
  const estimate = useEstimateRecipients(filters);

  const preview = useMemo(
    () => message.replace(/\{\{\s*nome\s*\}\}/gi, "João da Silva"),
    [message],
  );

  const validate = (forStatus: "draft" | "ready" | "scheduled") => {
    if (!name.trim()) return "Informe um nome para a campanha.";
    if (forStatus !== "draft") {
      if (!channelId) return "Selecione um canal.";
      if (!message.trim()) return "Escreva a mensagem.";
      if (forStatus === "scheduled" && !scheduledAt) return "Defina a data de agendamento.";
    }
    return null;
  };

  const buildPayload = (status: string) => ({
    name: name.trim(),
    description: description.trim() || null,
    channel_id: channelId || null,
      channel: channel?.channel_type ?? "whatsapp",
    type: campaign?.type ?? "outbound",
    message_content: message,
    segment_filters: filters as any,
    assigned_to: assignedTo || null,
    scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    status,
    error_message: null,
  });

  const save = async (target: "draft" | "ready" | "scheduled") => {
    const err = validate(target);
    if (err) {
      toast.error(err);
      return;
    }
    let finalStatus: string = target;
    if (target !== "draft") {
      if (!dispatchEval.ok) {
        finalStatus = dispatchEval.status;
        toast.message(dispatchEval.reason);
      }
    }
    try {
      const payload = buildPayload(finalStatus);
      let saved: any;
      if (isEdit) {
        saved = await updateMut.mutateAsync({ id: campaign.id, updates: payload });
      } else {
        saved = await createMut.mutateAsync(payload);
      }
      if (target !== "draft" && saved?.id && profile?.organization_id) {
        await materialize.mutateAsync({
          campaignId: saved.id,
          organizationId: profile.organization_id,
          filters,
        });
      }
      onOpenChange(false);
    } catch {
      /* erros já tratados nas mutations */
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-[#030712] border-white/10">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isEdit ? "Editar campanha" : "Nova campanha"}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Configure conteúdo, público, canal e agendamento. Tudo é salvo no banco.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="content" className="mt-6">
          <TabsList className="bg-white/5">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="audience">Público</TabsTrigger>
            <TabsTrigger value="channel">Canal</TabsTrigger>
            <TabsTrigger value="schedule">Agendamento</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div>
              <Label>Nome *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Black Friday 2026" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Mensagem *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Olá {{nome}}, ..."
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Variáveis suportadas: <code>{"{{nome}}"}</code>
              </p>
            </div>
            {message && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Preview</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{preview}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="audience" className="space-y-4 mt-4">
            <div>
              <Label>Busca (nome/email/telefone)</Label>
              <Input
                value={filters.search ?? ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Canal de origem</Label>
                <Input
                  placeholder="ex: whatsapp"
                  value={filters.mainChannel ?? ""}
                  onChange={(e) =>
                    setFilters({ ...filters, mainChannel: e.target.value || undefined })
                  }
                />
              </div>
              <div>
                <Label>Status do contato</Label>
                <Input
                  placeholder="ex: active"
                  value={filters.status ?? ""}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                />
              </div>
              <div>
                <Label>Tag</Label>
                <Input
                  value={filters.tag ?? ""}
                  onChange={(e) => setFilters({ ...filters, tag: e.target.value || undefined })}
                />
              </div>
              <div>
                <Label>Criados a partir de</Label>
                <Input
                  type="date"
                  value={filters.fromDate ?? ""}
                  onChange={(e) =>
                    setFilters({ ...filters, fromDate: e.target.value || undefined })
                  }
                />
              </div>
            </div>

            <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/20 p-3 flex items-center gap-3">
              <Users className="w-4 h-4 text-indigo-400" />
              <p className="text-sm text-slate-200">
                Contatos estimados:{" "}
                <span className="font-bold text-white">
                  {estimate.isLoading ? "..." : estimate.data ?? 0}
                </span>
              </p>
            </div>
            {!estimate.isLoading && (estimate.data ?? 0) === 0 && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 text-sm text-slate-300">
                Nenhum contato encontrado para esses filtros.{" "}
                <Link to="/customers" className="text-indigo-400 underline">
                  Abrir Contatos
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="channel" className="space-y-4 mt-4">
            <div>
              <Label>Canal</Label>
              <Select value={channelId} onValueChange={setChannelId}>
                <SelectTrigger><SelectValue placeholder="Selecionar canal" /></SelectTrigger>
                <SelectContent>
                  {(channels ?? []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Responsável</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue placeholder="Sem responsável" /></SelectTrigger>
                <SelectContent>
                  {(orgUsers ?? []).map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name ?? u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {channel && (
              <div
                className={
                  dispatchEval.ok
                    ? "rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 flex gap-3 text-sm text-slate-200"
                    : "rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 flex gap-3 text-sm text-slate-200"
                }
              >
                {dispatchEval.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                )}
                <span>
                  {dispatchEval.ok
                    ? "Canal pronto para disparo técnico."
                    : dispatchEval.reason}
                </span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div>
              <Label>Agendar para</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Deixe vazio para preparar como pronta sem data fixa.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-slate-400">
              Métricas de envio (abertura, clique, resposta) serão calculadas quando o provedor
              externo do canal estiver conectado e iniciar a transmissão real.
            </div>
            {campaign?.status && (
              <Badge variant="outline" className="text-[10px]">
                Status atual: {STATUS_LABEL[campaign.status] ?? campaign.status}
              </Badge>
            )}
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6 flex-row gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="outline" onClick={() => save("draft")}>Salvar rascunho</Button>
          <Button variant="outline" onClick={() => save("ready")}>Marcar como pronta</Button>
          <Button onClick={() => save("scheduled")} className="bg-indigo-600 hover:bg-indigo-500">
            {scheduledAt ? "Agendar" : "Preparar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}