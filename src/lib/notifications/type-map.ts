import {
  Inbox,
  AlertTriangle,
  Briefcase,
  Rocket,
  Sparkles,
  Settings as SettingsIcon,
  Globe,
  Users,
  type LucideIcon,
} from "lucide-react";

export type PrefKey =
  | "inbox_messages"
  | "sla_alerts"
  | "crm_deals"
  | "marketing_campaigns"
  | "business_ai_insights"
  | "system_alerts";

export type NotificationMeta = {
  prefKey: PrefKey;
  label: string;
  icon: LucideIcon;
  color: string;
};

const MAP: Record<string, NotificationMeta> = {
  new_conversation:         { prefKey: "inbox_messages",       label: "Nova conversa",        icon: Inbox,          color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  conversation_created:     { prefKey: "inbox_messages",       label: "Nova conversa",        icon: Inbox,          color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  conversation_assigned:    { prefKey: "inbox_messages",       label: "Conversa atribuída",   icon: Inbox,          color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  conversation_transferred: { prefKey: "inbox_messages",       label: "Conversa transferida", icon: Inbox,          color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  sla_risk:                 { prefKey: "sla_alerts",           label: "Risco de SLA",         icon: AlertTriangle,  color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  sla_breach:               { prefKey: "sla_alerts",           label: "SLA violado",          icon: AlertTriangle,  color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  deal_created:             { prefKey: "crm_deals",            label: "Nova oportunidade",    icon: Briefcase,      color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  deal_won:                 { prefKey: "crm_deals",            label: "Negócio ganho",        icon: Briefcase,      color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  deal_lost:                { prefKey: "crm_deals",            label: "Negócio perdido",      icon: Briefcase,      color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  campaign_status:          { prefKey: "marketing_campaigns",  label: "Campanha",             icon: Rocket,         color: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  campaign_completed:       { prefKey: "marketing_campaigns",  label: "Campanha concluída",   icon: Rocket,         color: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  channel_error:            { prefKey: "system_alerts",        label: "Erro de canal",        icon: Globe,          color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  system_alert:             { prefKey: "system_alerts",        label: "Sistema",              icon: SettingsIcon,   color: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  ai_insight:               { prefKey: "business_ai_insights", label: "Insight de IA",        icon: Sparkles,       color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
  ein_suggestion:           { prefKey: "business_ai_insights", label: "Sugestão EIN",         icon: Sparkles,       color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
};

const FALLBACK: NotificationMeta = {
  prefKey: "system_alerts",
  label: "Notificação",
  icon: Users,
  color: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export function notificationMeta(type: string): NotificationMeta {
  return MAP[type] ?? FALLBACK;
}

export const NOTIFICATION_TYPE_OPTIONS = Object.entries(MAP).map(([type, meta]) => ({
  value: type,
  label: meta.label,
}));

export const PREF_ROWS: { key: PrefKey; title: string; desc: string; types: string[] }[] = [
  { key: "inbox_messages",       title: "Conversas",        desc: "Novas conversas, atribuições e transferências.", types: ["new_conversation", "conversation_created", "conversation_assigned", "conversation_transferred"] },
  { key: "sla_alerts",           title: "SLA",              desc: "Conversas em risco ou já vencidas.",             types: ["sla_risk", "sla_breach"] },
  { key: "crm_deals",            title: "CRM / Negócios",   desc: "Novas oportunidades, ganhos e perdas.",          types: ["deal_created", "deal_won", "deal_lost"] },
  { key: "marketing_campaigns",  title: "Campanhas",        desc: "Disparos, status e conclusões.",                 types: ["campaign_status", "campaign_completed"] },
  { key: "business_ai_insights", title: "Insights de IA",   desc: "Sinais e recomendações da OneContact AI.",       types: ["ai_insight", "ein_suggestion"] },
  { key: "system_alerts",        title: "Sistema / Canais", desc: "Eventos administrativos e erros de canal.",       types: ["channel_error", "system_alert"] },
];