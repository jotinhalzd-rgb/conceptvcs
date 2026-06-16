import { cn } from "@/lib/utils";

interface DemoBadgeProps {
  variant?: "demo" | "simulated";
  className?: string;
}

export function DemoBadge({ variant = "demo", className }: DemoBadgeProps) {
  const label = variant === "simulated" ? "SIMULADO" : "DEMO";
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-[0.15em]",
        "bg-amber-500/10 border-amber-500/30 text-amber-300",
        className,
      )}
    >
      {label}
    </span>
  );
}

const DEMO_DOMAIN = "@onecontact.dev";
const DEMO_ORG_SLUG = "onecontact-demo-corp";

/** Heurística leve para detectar registros demo no piloto. */
export function isDemoRecord(input: {
  email?: string | null;
  organization_slug?: string | null;
  organization_id?: string | null;
  metadata?: Record<string, any> | null;
  is_demo?: boolean | null;
}) {
  if (!input) return false;
  if (input.is_demo) return true;
  if (input.metadata?.demo === true || input.metadata?.simulated === true) return true;
  if (input.email?.endsWith(DEMO_DOMAIN)) return true;
  if (input.organization_slug === DEMO_ORG_SLUG) return true;
  return false;
}