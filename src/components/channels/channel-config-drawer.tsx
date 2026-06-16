import React, { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Copy, PlugZap, ShieldCheck, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProviderFields } from "./provider-fields";
import {
  useUpsertChannel,
  useTestChannel,
  useDisconnectChannel,
} from "@/hooks/channels/use-channels";
import { useQueues } from "@/hooks/queues/use-queues";
import { getProvider, type ProviderDef } from "@/lib/channels/providers";
import {
  normalizeStatus,
  statusColor,
  statusLabel,
  type ChannelStatus,
} from "@/lib/channels/status";

interface ChannelConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId?: string;
  channel?: any | null;
}

export function ChannelConfigDrawer({
  open,
  onOpenChange,
  providerId,
  channel,
}: ChannelConfigDrawerProps) {
  const provider: ProviderDef | undefined = useMemo(
    () => getProvider(channel?.provider ?? providerId),
    [providerId, channel?.provider],
  );

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [defaultQueueId, setDefaultQueueId] = useState<string | null>(null);

  const upsert = useUpsertChannel();
  const testConn = useTestChannel();
  const disconnect = useDisconnectChannel();
  const { data: queues } = useQueues();

  const secretsAlreadyStored = !!(channel?.credentials && Object.keys(channel.credentials).length > 0);

  useEffect(() => {
    if (!open) return;
    setName(channel?.name ?? "");
    setIdentifier(channel?.identifier ?? "");
    setConfig((channel?.settings as any)?.config ?? {});
    setCredentials({});
    setDefaultQueueId((channel?.settings as any)?.default_queue_id ?? null);
  }, [open, channel?.id]);

  if (!provider) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="bg-[#020817] border-white/10 text-white w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Provedor não encontrado</SheetTitle>
            <SheetDescription>
              O canal selecionado usa um provedor não suportado pela tela. Edite via banco ou recadastre.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const status: ChannelStatus = normalizeStatus(channel?.status);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Informe um nome para o canal.");
      return;
    }
    const saved = await upsert.mutateAsync({
      id: channel?.id,
      provider: provider.id,
      name: name.trim(),
      identifier: identifier.trim() || null,
      default_queue_id: defaultQueueId,
      config,
      credentials,
    });
    // Keep drawer open with latest data
    if (saved) {
      setCredentials({});
    }
  };

  const handleTest = async () => {
    if (!channel?.id) {
      toast.error("Salve o canal antes de testar.");
      return;
    }
    try {
      await testConn.mutateAsync(channel.id);
    } catch {
      // toast handled inside hook
    }
  };

  const handleDisconnect = async () => {
    if (!channel?.id) return;
    await disconnect.mutateAsync(channel.id);
    onOpenChange(false);
  };

  const snippet =
    provider.channelType === "webchat" && channel?.id
      ? `<script async src="https://widget.onecontact.app/v1.js" data-channel="${channel.id}"></script>`
      : null;

  const webhookUrl = channel?.id
    ? `https://conceptvcs.lovable.app/api/public/channels/${channel.id}/webhook`
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-[#020817] border-white/10 text-white w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader className="text-left space-y-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-black uppercase tracking-tight">
              {provider.label}
            </SheetTitle>
            <Badge className="border-none bg-white/[0.04] text-slate-200">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${statusColor(status)}`} />
              {statusLabel(status)}
            </Badge>
          </div>
          <SheetDescription className="text-slate-400 text-[11px]">
            {provider.description}
            {provider.externalDependency && (
              <span className="block mt-1 text-amber-400/80">
                <AlertTriangle className="inline w-3 h-3 mr-1" />
                {provider.externalDependency}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="config" className="mt-6">
          <TabsList className="bg-white/[0.03] border border-white/5">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="credentials">Credenciais</TabsTrigger>
            <TabsTrigger value="routing">Roteamento</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Nome interno <span className="text-rose-400">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: WhatsApp Suporte"
                className="bg-white/[0.03] border-white/10 text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Identificador externo (opcional)
              </Label>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: whatsapp:+5511999999999"
                className="bg-white/[0.03] border-white/10 text-slate-100"
              />
            </div>
            <ProviderFields
              fields={provider.fields}
              values={config}
              onChange={(k, v) => setConfig((prev) => ({ ...prev, [k]: v }))}
            />
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4 pt-4">
            {provider.secretFields.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                Este provedor não exige credenciais secretas.
              </p>
            ) : (
              <>
                {secretsAlreadyStored && (
                  <div className="text-[11px] text-emerald-300/90 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                    Credenciais já salvas. Preencha apenas para substituir.
                  </div>
                )}
                <ProviderFields
                  fields={provider.secretFields}
                  values={credentials}
                  onChange={(k, v) =>
                    setCredentials((prev) => ({ ...prev, [k]: v }))
                  }
                  secretsAlreadyStored={secretsAlreadyStored}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="routing" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Fila padrão
              </Label>
              <Select
                value={defaultQueueId ?? "__none__"}
                onValueChange={(v) => setDefaultQueueId(v === "__none__" ? null : v)}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-slate-100">
                  <SelectValue placeholder="Sem fila padrão" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                  <SelectItem value="__none__">Sem fila padrão</SelectItem>
                  {(queues ?? []).map((q: any) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500">
                Mensagens recebidas por este canal entram nesta fila por padrão.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            {webhookUrl && (
              <CopyRow
                label="Webhook URL"
                value={webhookUrl}
                helper="Configure este endpoint no painel do provedor."
              />
            )}
            {snippet && (
              <CopyRow
                label="Snippet do widget"
                value={snippet}
                helper="Cole no <head> do site para ativar o webchat."
              />
            )}
            {channel?.id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Desconectar canal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#020817] border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Desconectar este canal?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      O canal ficará inativo e novas mensagens deixarão de ser recebidas.
                      O histórico de conversas é preservado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/[0.04] border-white/10 text-slate-200">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisconnect}
                      className="bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      Desconectar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={handleTest}
            disabled={!channel?.id || testConn.isPending}
            className="gap-2 text-slate-300"
          >
            <PlugZap className="w-4 h-4" />
            {testConn.isPending ? "Testando..." : "Testar conexão"}
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={upsert.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {upsert.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CopyRow({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          readOnly
          value={value}
          className="bg-white/[0.03] border-white/10 text-slate-100 font-mono text-[11px]"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copiado para a área de transferência");
          }}
          className="text-slate-300"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      {helper && <p className="text-[10px] text-slate-500">{helper}</p>}
    </div>
  );
}