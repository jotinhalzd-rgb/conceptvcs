import type { AppNotification } from "@/hooks/notifications/use-notifications";

export type ResolvedLink = { to: string; label: string } | null;

export function resolveNotificationLink(n: AppNotification): ResolvedLink {
  const p = (n.payload ?? {}) as Record<string, unknown>;
  if (typeof p.conversation_id === "string") return { to: "/inbox", label: "Abrir no Inbox" };
  if (typeof p.contact_id === "string") return { to: "/customers", label: "Ver cliente" };
  if (typeof p.deal_id === "string") return { to: "/crm", label: "Ver oportunidade" };
  if (typeof p.campaign_id === "string") return { to: "/campaigns", label: "Ver campanha" };
  if (typeof p.channel_id === "string") return { to: "/admin/channels", label: "Ver canal" };
  if (typeof p.queue_id === "string") return { to: "/queues", label: "Ver fila" };
  if (typeof p.report_id === "string" || n.type.startsWith("report")) return { to: "/reports", label: "Ver relatório" };
  return null;
}