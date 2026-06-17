import { describe, it, expect } from "vitest";
import { evaluateChannelForDispatch, STATUS_LABEL, CAMPAIGN_STATUSES } from "./dispatch";
import type { Database } from "@/integrations/supabase/types";

type Channel = Database["public"]["Tables"]["channels"]["Row"];

function ch(status: string | null): Channel {
  return { status } as unknown as Channel;
}

describe("campaigns/dispatch / evaluateChannelForDispatch", () => {
  it("errors when no channel is supplied", () => {
    expect(evaluateChannelForDispatch(null)).toEqual({
      ok: false,
      status: "error",
      reason: expect.stringMatching(/nenhum canal/i),
    });
  });

  it("errors when channel is disconnected", () => {
    const r = evaluateChannelForDispatch(ch("disconnected"));
    expect(r.ok).toBe(false);
    expect(r.status).toBe("error");
  });

  it("marks pending when channel is pending_configuration or pending", () => {
    expect(evaluateChannelForDispatch(ch("pending_configuration")).status).toBe(
      "pending_configuration",
    );
    expect(evaluateChannelForDispatch(ch("pending")).status).toBe("pending_configuration");
  });

  it("returns ready for connected/configured/active without schedule", () => {
    for (const s of ["connected", "configured", "active"]) {
      expect(evaluateChannelForDispatch(ch(s))).toEqual({ ok: true, status: "ready" });
    }
  });

  it("returns scheduled when a schedule timestamp is given", () => {
    expect(evaluateChannelForDispatch(ch("connected"), "2026-12-31T00:00:00Z")).toEqual({
      ok: true,
      status: "scheduled",
    });
  });

  it("treats unknown statuses as pending_configuration", () => {
    const r = evaluateChannelForDispatch(ch("weird"));
    expect(r.ok).toBe(false);
    expect(r.status).toBe("pending_configuration");
    expect(r.ok === false && r.reason).toMatch(/weird/);
  });

  it("status case is normalised", () => {
    expect(evaluateChannelForDispatch(ch("CONNECTED")).ok).toBe(true);
  });
});

describe("campaigns/dispatch / catalog constants", () => {
  it("every CAMPAIGN_STATUS has a Portuguese label", () => {
    for (const s of CAMPAIGN_STATUSES) {
      expect(typeof STATUS_LABEL[s]).toBe("string");
      expect(STATUS_LABEL[s]!.length).toBeGreaterThan(0);
    }
  });
});