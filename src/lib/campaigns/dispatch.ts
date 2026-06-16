import type { Database } from "@/integrations/supabase/types";

type Channel = Database["public"]["Tables"]["channels"]["Row"];

export type DispatchEval =
  | { ok: true; status: "ready" | "scheduled" }
  | { ok: false; status: "pending_configuration" | "error"; reason: string };

export function evaluateChannelForDispatch(
  channel: Channel | null | undefined,
  scheduledAt?: string | null,
): DispatchEval {
  if (!channel) {
    return { ok: false, status: "error", reason: "Nenhum canal selecionado." };
  }
  const status = (channel.status ?? "").toLowerCase();
  if (status === "disconnected") {
    return { ok: false, status: "error", reason: "Canal desconectado. Reconecte antes de disparar." };
  }
  if (status === "pending_configuration" || status === "pending") {
    return {
      ok: false,
      status: "pending_configuration",
      reason: "Canal aguarda configuração. A campanha será salva como pendente.",
    };
  }
  if (status === "connected" || status === "configured" || status === "active") {
    return { ok: true, status: scheduledAt ? "scheduled" : "ready" };
  }
  return {
    ok: false,
    status: "pending_configuration",
    reason: `Status do canal "${channel.status ?? "desconhecido"}" não permite disparo agora.`,
  };
}

export const CAMPAIGN_STATUSES = [
  "draft",
  "scheduled",
  "pending_configuration",
  "ready",
  "paused",
  "completed",
  "archived",
  "error",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendada",
  pending_configuration: "Pendente",
  ready: "Pronta",
  paused: "Pausada",
  sending: "Enviando",
  completed: "Concluída",
  archived: "Arquivada",
  error: "Erro",
};