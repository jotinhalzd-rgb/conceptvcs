import React from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Inbox,
  Users,
  Briefcase,
  Megaphone,
  BarChart3,
  Sparkles,
  Zap,
  Settings,
  Bell,
  Radio,
  Network,
  AlertTriangle,
  RefreshCw,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartBackButton } from "@/components/layout/back-button";
import { useHubStatus } from "@/hooks/hub/use-hub-status";
import { useOnboardingChecklist } from "@/hooks/hub/use-onboarding-checklist";

const SHORTCUTS = [
  { label: "Canais", route: "/admin/channels", icon: Radio },
  { label: "Filas", route: "/queues", icon: Network },
  { label: "Inbox", route: "/inbox", icon: Inbox },
  { label: "Clientes", route: "/customers", icon: Users },
  { label: "CRM", route: "/crm", icon: Briefcase },
  { label: "Campanhas", route: "/campaigns", icon: Megaphone },
  { label: "Relatórios", route: "/reports", icon: BarChart3 },
  { label: "AI Studio", route: "/dashboard/ai-studio", icon: Sparkles },
  { label: "Automação", route: "/dashboard/automation", icon: Zap },
  { label: "Developer", route: "/settings/developer", icon: Settings },
  { label: "Notificações", route: "/dashboard/notifications", icon: Bell },
] as const;

function StatusBadge({ tone, label }: { tone: "ok" | "warn" | "crit" | "muted"; label: string }) {
  const tones: Record<string, string> = {
    ok: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warn: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    crit: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    muted: "bg-white/5 text-slate-400 border-white/10",
  };
  return <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest ${tones[tone]}`}>{label}</Badge>;
}

function StatusCard({
  title,
  primary,
  primaryLabel,
  rows,
  route,
}: {
  title: string;
  primary: number;
  primaryLabel: string;
  rows: { label: string; value: number; tone?: "ok" | "warn" | "crit" | "muted" }[];
  route: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{primaryLabel}</p>
          <h3 className="text-sm font-black text-white uppercase tracking-tight">{title}</h3>
        </div>
        <span className="text-3xl font-black text-white tabular-nums">{primary}</span>
      </div>
      <div className="space-y-2 border-t border-white/5 pt-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{r.label}</span>
            <StatusBadge tone={r.tone ?? "muted"} label={String(r.value)} />
          </div>
        ))}
      </div>
      <Link to={route} className="w-full">
        <Button variant="outline" size="sm" className="w-full rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest">
          Abrir
        </Button>
      </Link>
    </div>
  );
}

export const BusinessHubView = () => {
  const { data: status, isLoading, isError, refetch } = useHubStatus();
  const checklist = useOnboardingChecklist();

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#030712]/60 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-4">
          <SmartBackButton />
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-[0.1em] italic">Business Hub</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Operação · Onboarding · Atalhos</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 gap-2 text-[10px] font-black uppercase tracking-widest" onClick={() => refetch()}>
          <RefreshCw className="w-3 h-3" /> Atualizar
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {isError && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">Falha ao carregar status. Tente novamente.</span>
              <Button size="sm" variant="outline" className="ml-auto rounded-xl" onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          )}

          {/* Status cards */}
          <section>
            <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4">Status Operacional</h2>
            {isLoading || !status ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-3xl bg-white/[0.03]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <StatusCard
                  title="Canais"
                  primaryLabel="Total"
                  primary={status.channels.total}
                  route="/admin/channels"
                  rows={[
                    { label: "Conectados", value: status.channels.connected, tone: "ok" },
                    { label: "Pendentes", value: status.channels.pending, tone: status.channels.pending ? "warn" : "muted" },
                    { label: "Desconectados", value: status.channels.disconnected, tone: status.channels.disconnected ? "crit" : "muted" },
                    { label: "Sem fila padrão", value: status.channels.withoutDefaultQueue, tone: status.channels.withoutDefaultQueue ? "warn" : "muted" },
                  ]}
                />
                <StatusCard
                  title="Filas"
                  primaryLabel="Total"
                  primary={status.queues.total}
                  route="/queues"
                  rows={[
                    { label: "Sem membros", value: status.queues.withoutMembers, tone: status.queues.withoutMembers ? "warn" : "ok" },
                    { label: "Regras ativas", value: status.queues.routingRulesActive, tone: status.queues.routingRulesActive ? "ok" : "muted" },
                  ]}
                />
                <StatusCard
                  title="Conversas"
                  primaryLabel="Abertas"
                  primary={status.conversations.open}
                  route="/inbox"
                  rows={[
                    { label: "Sem agente", value: status.conversations.unassigned, tone: status.conversations.unassigned ? "warn" : "ok" },
                    { label: "SLA vencido", value: status.conversations.slaOverdue, tone: status.conversations.slaOverdue ? "crit" : "ok" },
                    { label: "SLA em risco", value: status.conversations.slaAtRisk, tone: status.conversations.slaAtRisk ? "warn" : "muted" },
                  ]}
                />
                <StatusCard
                  title="Campanhas"
                  primaryLabel="Total"
                  primary={status.campaigns.total}
                  route="/campaigns"
                  rows={[
                    { label: "Ativas", value: status.campaigns.active, tone: status.campaigns.active ? "ok" : "muted" },
                    { label: "Agendadas", value: status.campaigns.scheduled, tone: status.campaigns.scheduled ? "warn" : "muted" },
                    { label: "Pendentes", value: status.campaigns.pending, tone: status.campaigns.pending ? "warn" : "muted" },
                    { label: "Erro", value: status.campaigns.error, tone: status.campaigns.error ? "crit" : "muted" },
                  ]}
                />
                <StatusCard
                  title="Oportunidades"
                  primaryLabel="Abertas"
                  primary={status.deals.open}
                  route="/crm"
                  rows={[
                    { label: "Sem responsável", value: status.deals.unassigned, tone: status.deals.unassigned ? "warn" : "ok" },
                    { label: "Paradas (>14d)", value: status.deals.stale, tone: status.deals.stale ? "warn" : "ok" },
                  ]}
                />
                <StatusCard
                  title="Agentes IA"
                  primaryLabel="Total"
                  primary={status.agents.total}
                  route="/dashboard/ai-studio"
                  rows={[
                    { label: "Ativos", value: status.agents.active, tone: status.agents.active ? "ok" : "muted" },
                    { label: "Pendentes", value: status.agents.pending, tone: status.agents.pending ? "warn" : "muted" },
                  ]}
                />
                <StatusCard
                  title="Automações"
                  primaryLabel="Total"
                  primary={status.automations.total}
                  route="/dashboard/automation"
                  rows={[
                    { label: "Ativas", value: status.automations.active, tone: status.automations.active ? "ok" : "muted" },
                    { label: "Inativas", value: status.automations.inactive, tone: status.automations.inactive ? "warn" : "muted" },
                  ]}
                />
              </div>
            )}
          </section>

          {/* Checklist */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-white uppercase tracking-widest">Onboarding</h2>
              {!checklist.isLoading && (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {checklist.completed}/{checklist.total} concluídos
                </span>
              )}
            </div>
            {checklist.isLoading ? (
              <Skeleton className="h-64 rounded-3xl bg-white/[0.03]" />
            ) : (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {checklist.items.map((item) => (
                  <Link
                    key={item.id}
                    to={item.route}
                    className="flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-white/[0.04] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                      )}
                      <span className={`text-xs font-bold ${item.done ? "text-slate-400 line-through" : "text-white"}`}>
                        {item.label}
                      </span>
                    </div>
                    <StatusBadge tone={item.done ? "ok" : "warn"} label={item.done ? "OK" : "Pendente"} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Shortcuts */}
          <section>
            <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4">Atalhos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SHORTCUTS.map((s) => (
                <Link
                  key={s.route}
                  to={s.route}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 hover:border-indigo-500/30 hover:bg-white/[0.05] transition"
                >
                  <s.icon className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center">{s.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};