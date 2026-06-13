/**
 * Developer Mode utilities.
 *
 * Dev mode is enabled ONLY in non-production hosting environments:
 *  - localhost / 127.0.0.1
 *  - *.lovable.app preview/staging subdomains (id-preview--*, *-dev, *--*)
 *
 * It is NEVER enabled on custom production domains. All security
 * (RLS, Supabase Auth, webhooks, policies) remains fully active —
 * dev mode is a UI-only convenience that overlays a role on the
 * current authenticated profile for testing.
 */

export type DevRole =
  | "ceo_master"
  | "ceo"
  | "admin"
  | "manager"
  | "agent"
  | "supervisor";

export interface DevPersona {
  id: DevRole;
  label: string;
  description: string;
}

export const DEV_PERSONAS: DevPersona[] = [
  { id: "ceo_master", label: "CEO Master", description: "Acesso total / governança global" },
  { id: "ceo", label: "Empresa Demo", description: "CEO de organização" },
  { id: "manager", label: "Gerente Demo", description: "Gestão de equipe e filas" },
  { id: "agent", label: "Atendente Demo", description: "Operação no inbox" },
  { id: "supervisor", label: "Suporte / Supervisor Demo", description: "Monitoramento e supervisão" },
  { id: "admin", label: "Consultor Demo", description: "Admin / consultor técnico" },
];

const STORAGE_KEY = "onecontact_dev_role";

export function isDevEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return true;
  // Lovable preview / staging surfaces
  if (host.endsWith(".lovable.app")) {
    if (host.startsWith("id-preview--")) return true;
    if (host.includes("-dev.")) return true;
    if (host.includes("--")) return true; // preview subdomains
  }
  return false;
}

export function getDevRoleOverride(): DevRole | null {
  if (!isDevEnvironment()) return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return null;
    if (DEV_PERSONAS.some((p) => p.id === v)) return v as DevRole;
    return null;
  } catch {
    return null;
  }
}

export function setDevRoleOverride(role: DevRole | null) {
  if (!isDevEnvironment()) return;
  try {
    if (role) localStorage.setItem(STORAGE_KEY, role);
    else localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("onecontact:dev-role-change"));
  } catch {}
}