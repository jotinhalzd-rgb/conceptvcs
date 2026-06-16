export type SlaState = "none" | "ok" | "warning" | "breached";

export function getSlaState(
  due: string | Date | null | undefined,
  createdAt?: string | Date | null,
): SlaState {
  if (!due) return "none";
  const dueMs = new Date(due).getTime();
  const now = Date.now();
  if (now > dueMs) return "breached";
  const start = createdAt ? new Date(createdAt).getTime() : dueMs - 60 * 60 * 1000;
  const total = Math.max(1, dueMs - start);
  const remaining = dueMs - now;
  return remaining / total < 0.2 ? "warning" : "ok";
}

export function slaBadgeClass(state: SlaState): string {
  switch (state) {
    case "breached":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    case "warning":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "ok":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    default:
      return "bg-white/5 text-slate-400 border-white/10";
  }
}

export function slaLabel(state: SlaState): string {
  switch (state) {
    case "breached": return "SLA vencido";
    case "warning": return "SLA em risco";
    case "ok": return "Dentro do SLA";
    default: return "Sem SLA";
  }
}