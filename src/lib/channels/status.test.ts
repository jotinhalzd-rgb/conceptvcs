import { describe, it, expect } from "vitest";
import {
  normalizeStatus,
  statusLabel,
  statusColor,
  checkMissingFields,
  computeStatus,
} from "./status";
import type { ProviderDef } from "./providers";

const fakeProvider = {
  id: "fake",
  channelType: "whatsapp",
  label: "Fake",
  description: "",
  fields: [
    { key: "phone", label: "Telefone", type: "text", required: true },
    { key: "note", label: "Nota", type: "text", required: false },
  ],
  secretFields: [
    { key: "token", label: "Token", type: "password", required: true, secret: true },
  ],
  schema: { parse: (x: unknown) => x } as never,
} as unknown as ProviderDef;

describe("channels/status / normalizeStatus", () => {
  it.each([
    ["connected", "connected"],
    ["online", "connected"],
    ["configured", "configured"],
    ["pending", "pending_configuration"],
    ["pending_configuration", "pending_configuration"],
    ["error", "error"],
    ["disconnected", "disconnected"],
    ["offline", "disconnected"],
  ])("maps %s -> %s", (input, expected) => {
    expect(normalizeStatus(input)).toBe(expected);
  });

  it("falls back to disconnected when nullish", () => {
    expect(normalizeStatus(null)).toBe("disconnected");
    expect(normalizeStatus(undefined)).toBe("disconnected");
    expect(normalizeStatus("")).toBe("disconnected");
  });

  it("treats unknown non-empty string as pending_configuration", () => {
    expect(normalizeStatus("weird")).toBe("pending_configuration");
  });
});

describe("channels/status / labels & colors", () => {
  it("returns Portuguese labels for every status", () => {
    expect(statusLabel("connected")).toBe("Conectado");
    expect(statusLabel("configured")).toBe("Configurado");
    expect(statusLabel("pending_configuration")).toMatch(/aguardando/i);
    expect(statusLabel("error")).toBe("Erro");
    expect(statusLabel("disconnected")).toBe("Desconectado");
  });

  it("returns a tailwind bg class for every status", () => {
    expect(statusColor("connected")).toMatch(/emerald/);
    expect(statusColor("error")).toMatch(/rose/);
    expect(statusColor("disconnected")).toMatch(/slate/);
  });
});

describe("channels/status / checkMissingFields", () => {
  it("reports OK when all required fields are present", () => {
    const r = checkMissingFields(fakeProvider, { phone: "+5511", note: "" }, { token: "abc" });
    expect(r).toEqual({ missing: [], ok: true });
  });

  it("reports missing required config and secret fields", () => {
    const r = checkMissingFields(fakeProvider, { phone: "  " }, { token: "" });
    expect(r.ok).toBe(false);
    expect(r.missing).toContain("Telefone");
    expect(r.missing).toContain("Token");
  });

  it("ignores optional fields", () => {
    const r = checkMissingFields(fakeProvider, { phone: "+5511" }, { token: "x" });
    expect(r.missing).not.toContain("Nota");
  });
});

describe("channels/status / computeStatus", () => {
  const full = { config: { phone: "+5511" }, creds: { token: "x" } };

  it("returns pending_configuration when fields missing", () => {
    expect(computeStatus(fakeProvider, {}, {})).toBe("pending_configuration");
  });

  it("preserves 'connected' when current is connected and fields complete", () => {
    expect(computeStatus(fakeProvider, full.config, full.creds, "connected")).toBe("connected");
  });

  it("returns 'configured' when fields complete but not yet connected", () => {
    expect(computeStatus(fakeProvider, full.config, full.creds)).toBe("configured");
    expect(computeStatus(fakeProvider, full.config, full.creds, "error")).toBe("configured");
  });
});