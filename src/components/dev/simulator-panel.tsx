import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isDevEnvironment } from "@/lib/dev-mode";

const SIM_CHANNEL_IDENTIFIER = "demo-sim-wa";

const PRESETS: { sector: string; label: string; messages: string[] }[] = [
  { sector: "Financeiro", label: "Financeiro", messages: [
    "Quero falar com o financeiro",
    "Preciso da segunda via do boleto",
    "Minha fatura esta errada",
  ]},
  { sector: "Suporte", label: "Suporte", messages: [
    "Estou com problema no sistema",
    "Preciso de ajuda",
    "O sistema nao funciona",
  ]},
  { sector: "Vendas", label: "Vendas", messages: [
    "Quero comprar um plano",
    "Qual o preco?",
    "Quero uma proposta",
  ]},
  { sector: "Geral", label: "Atendimento Geral", messages: [
    "Ola, preciso de atendimento",
  ]},
];

export function SimulatorPanel() {
  const enabled = isDevEnvironment();
  const qc = useQueryClient();
  const [body, setBody] = useState("Olá, preciso de ajuda agora.");
  const [pickedPhone, setPickedPhone] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [sector, setSector] = useState<string>("Geral");

  const { data: channel } = useQuery({
    enabled,
    queryKey: ["sim-channel", SIM_CHANNEL_IDENTIFIER],
    queryFn: async () => {
      const { data } = await supabase
        .from("channels")
        .select("id, identifier, organization_id, is_demo")
        .eq("identifier", SIM_CHANNEL_IDENTIFIER)
        .maybeSingle();
      return data;
    },
  });

  const { data: contacts } = useQuery({
    enabled: enabled && !!channel?.organization_id,
    queryKey: ["sim-contacts", channel?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("contacts")
        .select("id, name, phone")
        .eq("organization_id", channel!.organization_id)
        .eq("is_demo", true)
        .not("phone", "is", null)
        .order("name");
      return data ?? [];
    },
  });

  const phones = useMemo(() => contacts ?? [], [contacts]);

  if (!enabled) return null;

  const send = async () => {
    if (!channel) {
      toast.error("Canal demo não encontrado. Faça login como usuário demo para semear.");
      return;
    }
    const from = pickedPhone || phones[0]?.phone;
    if (!from) {
      toast.error("Nenhum contato demo disponível.");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("sim-webhook", {
        body: {
          channelIdentifier: channel.identifier,
          from,
          body,
        },
      });
      if (error) throw error;
      toast.success(data?.deduped ? "Mensagem já existia (idempotente)" : "Mensagem simulada recebida");
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    } catch (e: any) {
      toast.error(`Falha no simulador: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-3 py-3 border-t border-white/5 bg-amber-500/5 space-y-2">
      <div className="px-1 text-[10px] font-bold text-amber-300/80 uppercase tracking-widest flex items-center justify-between">
        <span>Simulador de Webhook</span>
        <span className="text-amber-400/70">DEMO</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.sector}
            onClick={() => setSector(p.sector)}
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${sector === p.sector ? "bg-amber-500/30 text-amber-100 border-amber-500/40" : "bg-white/5 text-slate-300 border-white/10"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <select
        onChange={(e) => { if (e.target.value) setBody(e.target.value); }}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
        defaultValue=""
      >
        <option value="">Mensagens prontas ({sector})</option>
        {(PRESETS.find((p) => p.sector === sector)?.messages ?? []).map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        value={pickedPhone}
        onChange={(e) => setPickedPhone(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
      >
        <option value="">Auto (primeiro contato demo)</option>
        {phones.map((c) => (
          <option key={c.id} value={c.phone!}>{c.name} — {c.phone}</option>
        ))}
      </select>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white resize-none"
        placeholder="Texto da mensagem simulada"
      />
      <button
        onClick={send}
        disabled={sending || !body.trim()}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border border-amber-500/30 disabled:opacity-50"
      >
        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        Simular mensagem recebida
      </button>
      {!channel && (
        <p className="text-[10px] text-amber-300/60 px-1">
          Faça login com um perfil demo para criar o canal automaticamente.
        </p>
      )}
    </div>
  );
}