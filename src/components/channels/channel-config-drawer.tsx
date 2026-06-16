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
import { Copy, PlugZap, ShieldCheck, AlertTriangle, Trash2, Eye, EyeOff, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { ProviderFields } from "./provider-fields";
import {
  useUpsertChannel,
  useTestChannel,
  useDisconnectChannel,
} from "@/hooks/channels/use-channels";
import { useQueues } from "@/hooks/queues/use-queues";
import { getProvider, type ProviderDef } from "@/lib/channels/providers";
import { mapLegacyProvider } from "@/lib/channels/legacy-map";
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
  const provider: ProviderDef | undefined = useMemo(() => {
    const raw = channel?.provider ?? providerId;
    return getProvider(raw) ?? getProvider(mapLegacyProvider(raw) ?? undefined);
  }, [providerId, channel?.provider]);

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [defaultQueueId, setDefaultQueueId] = useState<string | null>(null);

  const upsert = useUpsertChannel();
  const testConn = useTestChannel();
  const disconnect = useDisconnectChannel();
  const { data: queues } = useQueues();

  const [webhookSecret, setWebhookSecret] = useState<string>("");
  const [showSecret, setShowSecret] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [testing, setTesting] = useState(false);

  const secretsAlreadyStored = !!(channel?.credentials && Object.keys(channel.credentials).length > 0);

  useEffect(() => {
    if (!open) return;
    setName(channel?.name ?? "");
    setIdentifier(channel?.identifier ?? "");
    setConfig((channel?.settings as any)?.config ?? {});
    setCredentials({});
    setDefaultQueueId((channel?.settings as any)?.default_queue_id ?? null);
    setWebhookSecret((channel?.credentials as any)?.webhook_secret ?? "");
    setTestResult("");
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

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://conceptvcs.lovable.app";
  const inboundUrl = channel?.id ? `${origin}/api/public/channels/${channel.id}/inbound` : null;

  const saveWebhookSecret = async (secret: string) => {
    if (!channel?.id) return;
    await upsert.mutateAsync({
      id: channel.id,
      provider: provider.id,
      name: name.trim() || channel.name,
      identifier: identifier.trim() || null,
      default_queue_id: defaultQueueId,
      config,
      credentials: { ...(channel.credentials ?? {}), webhook_secret: secret },
    });
    setWebhookSecret(secret);
  };

  const runInboundTest = async () => {
    if (!inboundUrl) return;
    setTesting(true);
    setTestResult("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (webhookSecret) headers["x-webhook-token"] = webhookSecret;
      const res = await fetch(inboundUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone: "+5511999990000",
          sender_name: "Teste Endpoint",
          text: "quero falar com o financeiro",
          provider: "inbound_api_test",
        }),
      });
      const txt = await res.text();
      setTestResult(`HTTP ${res.status}\n${txt}`);
    } catch (e: any) {
      setTestResult(`Erro: ${e?.message ?? e}`);
    } finally {
      setTesting(false);
    }
  };

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
            {inboundUrl ? (
              <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-200">
                    Endpoint Inbound
                  </p>
                  <Badge className="border-none bg-emerald-500/15 text-emerald-300">
                    {webhookSecret ? "Endpoint técnico ativo" : "Aguardando token"}
                  </Badge>
                </div>
                <CopyRow label="URL" value={inboundUrl} />
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Webhook Token
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      type={showSecret ? "text" : "password"}
                      value={webhookSecret}
                      placeholder="Sem token — gere um para liberar o endpoint."
                      className="bg-white/[0.03] border-white/10 text-slate-100 font-mono text-[11px]"
                    />
                    <Button type="button" variant="ghost" onClick={() => setShowSecret((v) => !v)} className="text-slate-300">
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        if (!webhookSecret) return;
                        navigator.clipboard.writeText(webhookSecret);
                        toast.success("Token copiado");
                      }}
                      className="text-slate-300"
                      disabled={!webhookSecret}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => saveWebhookSecret(crypto.randomUUID().replace(/-/g, ""))}
                      disabled={upsert.isPending}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {webhookSecret ? "Rotacionar" : "Gerar"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Envie no header <code>x-webhook-token</code>. Endpoint técnico ativo — provider externo (Meta/Twilio/etc.) ainda exige credenciais reais.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Testar endpoint</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={runInboundTest}
                      disabled={testing || !inboundUrl}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {testing ? "Enviando..." : "Enviar payload de teste"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Envia <code>"quero falar com o financeiro"</code> ao endpoint usando o token atual.
                  </p>
                  {testResult && (
                    <pre className="text-[10px] font-mono whitespace-pre-wrap bg-black/30 border border-white/5 rounded p-2 text-slate-300 max-h-48 overflow-auto">
{testResult}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">Salve o canal para gerar o endpoint inbound.</p>
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