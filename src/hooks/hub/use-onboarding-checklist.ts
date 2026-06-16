import { useMemo } from "react";
import { useHubStatus } from "./use-hub-status";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  route: string;
}

export function useOnboardingChecklist() {
  const { data: s, isLoading, error } = useHubStatus();

  const items = useMemo<ChecklistItem[]>(() => {
    if (!s) return [];
    const cvAnswered = s.conversations.open - s.conversations.unassigned;
    return [
      { id: "channel", label: "Configurar um canal", done: s.channels.connected > 0, route: "/admin/channels" },
      { id: "queue", label: "Criar uma fila", done: s.queues.total > 0, route: "/queues" },
      { id: "queue-member", label: "Adicionar membro à fila", done: s.queues.total > 0 && s.queues.withoutMembers < s.queues.total, route: "/queues" },
      { id: "routing", label: "Criar regra de roteamento", done: s.queues.routingRulesActive > 0, route: "/queues" },
      { id: "inbound-test", label: "Testar endpoint inbound", done: s.conversations.open > 0, route: "/settings/developer" },
      { id: "respond", label: "Responder uma conversa", done: cvAnswered > 0, route: "/inbox" },
      { id: "deal", label: "Criar uma oportunidade", done: s.deals.open > 0, route: "/crm" },
      { id: "campaign", label: "Criar uma campanha", done: s.campaigns.total > 0, route: "/campaigns" },
      { id: "report", label: "Abrir um relatório", done: s.conversations.open > 0 || s.deals.open > 0, route: "/reports" },
      { id: "ai-agent", label: "Configurar um agente IA", done: s.agents.active > 0, route: "/dashboard/ai-studio" },
    ];
  }, [s]);

  return { items, isLoading, error, completed: items.filter((i) => i.done).length, total: items.length };
}