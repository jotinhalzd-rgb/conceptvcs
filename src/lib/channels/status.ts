import type { ProviderDef } from "./providers";

export type ChannelStatus =
  | "disconnected"
  | "pending_configuration"
  | "configured"
  | "connected"
  | "error";

export function normalizeStatus(raw: string | null | undefined): ChannelStatus {
  switch (raw) {
    case "connected":
    case "online":
      return "connected";
    case "configured":
      return "configured";
    case "pending_configuration":
    case "pending":
      return "pending_configuration";
    case "error":
      return "error";
    case "disconnected":
    case "offline":
      return "disconnected";
    default:
      return raw ? "pending_configuration" : "disconnected";
  }
}

export function statusLabel(s: ChannelStatus): string {
  switch (s) {
    case "connected": return "Conectado";
    case "configured": return "Configurado";
    case "pending_configuration": return "Aguardando configuração";
    case "error": return "Erro";
    case "disconnected": return "Desconectado";
  }
}

export function statusColor(s: ChannelStatus): string {
  switch (s) {
    case "connected": return "bg-emerald-500";
    case "configured": return "bg-sky-500";
    case "pending_configuration": return "bg-amber-500";
    case "error": return "bg-rose-500";
    case "disconnected": return "bg-slate-500";
  }
}

export interface MissingFields {
  missing: string[];
  ok: boolean;
}

export function checkMissingFields(
  provider: ProviderDef,
  config: Record<string, any>,
  credentials: Record<string, any>,
): MissingFields {
  const missing: string[] = [];
  for (const f of provider.fields) {
    if (f.required && (config?.[f.key] === undefined || config?.[f.key] === null || `${config?.[f.key]}`.trim() === "")) {
      missing.push(f.label);
    }
  }
  for (const f of provider.secretFields) {
    if (f.required && (!credentials || `${credentials?.[f.key] ?? ""}`.trim() === "")) {
      missing.push(f.label);
    }
  }
  return { missing, ok: missing.length === 0 };
}

export function computeStatus(
  provider: ProviderDef,
  config: Record<string, any>,
  credentials: Record<string, any>,
  current?: ChannelStatus,
): ChannelStatus {
  const { ok } = checkMissingFields(provider, config, credentials);
  if (!ok) return "pending_configuration";
  if (current === "connected") return "connected";
  return "configured";
}