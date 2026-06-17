import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSlaState, slaBadgeClass, slaLabel } from "./sla";

describe("sla / getSlaState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns 'none' when no due date is provided", () => {
    expect(getSlaState(null)).toBe("none");
    expect(getSlaState(undefined)).toBe("none");
  });

  it("returns 'breached' when due date is in the past", () => {
    expect(getSlaState("2026-06-17T11:00:00Z")).toBe("breached");
  });

  it("returns 'ok' when plenty of time remains relative to total window", () => {
    // created 1h ago, due in 2h → remaining=2h, total=3h → 0.66 > 0.2 → ok
    expect(
      getSlaState("2026-06-17T14:00:00Z", "2026-06-17T11:00:00Z"),
    ).toBe("ok");
  });

  it("returns 'warning' when remaining time is below 20% of window", () => {
    // created 50min ago, due in 10min → remaining/total = 10/60 = 0.16 < 0.2
    expect(
      getSlaState("2026-06-17T12:10:00Z", "2026-06-17T11:10:00Z"),
    ).toBe("warning");
  });

  it("falls back to 1h window when createdAt missing", () => {
    // due in 30min, fallback window = 1h → remaining/total = 0.5 → ok
    expect(getSlaState("2026-06-17T12:30:00Z")).toBe("ok");
  });

  it("accepts Date objects", () => {
    expect(getSlaState(new Date("2026-06-17T11:00:00Z"))).toBe("breached");
  });
});

describe("sla / slaBadgeClass + slaLabel", () => {
  it.each([
    ["breached", "rose"],
    ["warning", "amber"],
    ["ok", "emerald"],
    ["none", "slate"],
  ] as const)("returns a class containing %s -> %s", (state, color) => {
    expect(slaBadgeClass(state)).toContain(color);
  });

  it("maps every state to a human label", () => {
    expect(slaLabel("breached")).toMatch(/vencido/i);
    expect(slaLabel("warning")).toMatch(/risco/i);
    expect(slaLabel("ok")).toMatch(/dentro/i);
    expect(slaLabel("none")).toMatch(/sem sla/i);
  });
});