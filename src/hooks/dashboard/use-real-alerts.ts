import { useMemo } from "react";
import { useHubStatus } from "@/hooks/hub/use-hub-status";

export type AlertSeverity = "critical" | "warning" | "info";

export interface RealAlert {
  id: string;
  severity: AlertSeverity;
  category: "sla" | "channels" | "campaigns" | "crm" | "ai" | "automation";
  title: string;
  description: string;
  count: number;
  action: { label: string; route: string };
}

export interface RealRecommendation {
  id: string;
  text: string;
  action: { label: string; route: string };
}

export function useRealAlerts() {
  const { data: s, isLoading, error, refetch } = useHubStatus();

  const { alerts, recommendations } = useMemo(() => {
    const a: RealAlert[] = [];
    const r: RealRecommendation[] = [];
    if (!s) return { alerts: a, recommendations: r };

    if (s.conversations.slaOverdue > 0) {
      a.push({ id: "sla-overdue", severity: "critical", category: "sla", title: "SLA vencido", description: "Conversas abertas com SLA já estourado.", count: s.conversations.slaOverdue, action: { label: "Abrir Inbox", route: "/inbox" } });
      r.push({ id: "rec-sla", text: `Há ${s.conversations.slaOverdue} conversa(s) com SLA vencido. Abrir Inbox.`, action: { label: "Abrir Inbox", route: "/inbox" } });
    }
    if (s.conversations.slaAtRisk > 0) {
      a.push({ id: "sla-risk", severity: "warning", category: "sla", title: "SLA em risco", description: "Conversas próximas de estourar SLA nos próximos 30 min.", count: s.conversations.slaAtRisk, action: { label: "Abrir Relatórios", route: "/reports" } });
    }
    if (s.conversations.unassigned > 0) {
      a.push({ id: "cv-unassigned", severity: "warning", category: "sla", title: "Conversas sem agente", description: "Conversas abertas aguardando atribuição.", count: s.conversations.unassigned, action: { label: "Abrir Inbox", route: "/inbox" } });
      r.push({ id: "rec-unassigned", text: `Há ${s.conversations.unassigned} conversa(s) sem responsável. Abrir Inbox.`, action: { label: "Abrir Inbox", route: "/inbox" } });
    }
    if (s.queues.withoutMembers > 0) {
      a.push({ id: "q-empty", severity: "warning", category: "sla", title: "Filas sem membros", description: "Filas sem agentes ativos para receber atendimentos.", count: s.queues.withoutMembers, action: { label: "Abrir Filas", route: "/queues" } });
    }

    if (s.channels.pending > 0) {
      a.push({ id: "ch-pending", severity: "warning", category: "channels", title: "Canais pendentes", description: "Canais aguardando configuração.", count: s.channels.pending, action: { label: "Abrir Canais", route: "/admin/channels" } });
      r.push({ id: "rec-ch-pending", text: "Há canais pendentes de configuração. Abrir Canais.", action: { label: "Abrir Canais", route: "/admin/channels" } });
    }
    if (s.channels.disconnected > 0) {
      a.push({ id: "ch-disc", severity: "critical", category: "channels", title: "Canais desconectados", description: "Canais offline/desconectados.", count: s.channels.disconnected, action: { label: "Abrir Canais", route: "/admin/channels" } });
    }
    if (s.channels.error > 0) {
      a.push({ id: "ch-error", severity: "critical", category: "channels", title: "Canais com erro", description: "Canais com falha reportada.", count: s.channels.error, action: { label: "Abrir Canais", route: "/admin/channels" } });
    }

    if (s.campaigns.pending > 0) {
      a.push({ id: "camp-pending", severity: "warning", category: "campaigns", title: "Campanhas pendentes", description: "Campanhas aguardando configuração.", count: s.campaigns.pending, action: { label: "Abrir Campanhas", route: "/campaigns" } });
      r.push({ id: "rec-camp", text: "Há campanhas pendentes. Abrir Campanhas.", action: { label: "Abrir Campanhas", route: "/campaigns" } });
    }
    if (s.campaigns.scheduled > 0) {
      a.push({ id: "camp-sched", severity: "info", category: "campaigns", title: "Campanhas agendadas", description: "Campanhas com disparo programado.", count: s.campaigns.scheduled, action: { label: "Abrir Campanhas", route: "/campaigns" } });
    }
    if (s.campaigns.error > 0) {
      a.push({ id: "camp-error", severity: "critical", category: "campaigns", title: "Campanhas com erro", description: "Campanhas com falha de envio.", count: s.campaigns.error, action: { label: "Abrir Campanhas", route: "/campaigns" } });
    }

    if (s.deals.unassigned > 0) {
      a.push({ id: "deals-noassign", severity: "warning", category: "crm", title: "Oportunidades sem responsável", description: "Negócios abertos sem responsável atribuído.", count: s.deals.unassigned, action: { label: "Abrir CRM", route: "/crm" } });
      r.push({ id: "rec-deals", text: `Há ${s.deals.unassigned} oportunidade(s) sem responsável. Abrir CRM.`, action: { label: "Abrir CRM", route: "/crm" } });
    }
    if (s.deals.stale > 0) {
      a.push({ id: "deals-stale", severity: "info", category: "crm", title: "Oportunidades paradas", description: "Negócios abertos sem atualização há mais de 14 dias.", count: s.deals.stale, action: { label: "Abrir CRM", route: "/crm" } });
    }

    if (s.agents.total > 0 && s.agents.active === 0) {
      a.push({ id: "ai-inactive", severity: "warning", category: "ai", title: "Agentes IA inativos", description: "Nenhum agente IA ativo no momento.", count: s.agents.total, action: { label: "Abrir AI Studio", route: "/dashboard/ai-studio" } });
    }
    if (s.agents.pending > 0) {
      a.push({ id: "ai-pending", severity: "info", category: "ai", title: "Agentes IA pendentes", description: "Agentes aguardando configuração.", count: s.agents.pending, action: { label: "Abrir AI Studio", route: "/dashboard/ai-studio" } });
    }
    if (s.automations.total > 0 && s.automations.active === 0) {
      a.push({ id: "auto-off", severity: "info", category: "automation", title: "Automações inativas", description: "Nenhuma automação ativa.", count: s.automations.total, action: { label: "Abrir Automação", route: "/dashboard/automation" } });
    }

    return { alerts: a, recommendations: r };
  }, [s]);

  return { alerts, recommendations, isLoading, error, refetch, status: s };
}