import { describe, it, expect } from "vitest";
import { resolveNotificationLink } from "./resolve-link";
import type { AppNotification } from "@/hooks/notifications/use-notifications";

function n(payload: Record<string, unknown>, type = "system_alert"): AppNotification {
  return { type, payload } as unknown as AppNotification;
}

describe("notifications/resolve-link", () => {
  it("routes conversation_id to /inbox", () => {
    expect(resolveNotificationLink(n({ conversation_id: "c1" }))?.to).toBe("/inbox");
  });

  it("routes contact_id to /customers", () => {
    expect(resolveNotificationLink(n({ contact_id: "x" }))?.to).toBe("/customers");
  });

  it("routes deal_id to /crm", () => {
    expect(resolveNotificationLink(n({ deal_id: "d" }))?.to).toBe("/crm");
  });

  it("routes campaign_id to /campaigns", () => {
    expect(resolveNotificationLink(n({ campaign_id: "c" }))?.to).toBe("/campaigns");
  });

  it("routes channel_id to /admin/channels", () => {
    expect(resolveNotificationLink(n({ channel_id: "ch" }))?.to).toBe("/admin/channels");
  });

  it("routes queue_id to /queues", () => {
    expect(resolveNotificationLink(n({ queue_id: "q" }))?.to).toBe("/queues");
  });

  it("routes report payloads (by report_id or report.* type) to /reports", () => {
    expect(resolveNotificationLink(n({ report_id: "r" }))?.to).toBe("/reports");
    expect(resolveNotificationLink(n({}, "report_completed"))?.to).toBe("/reports");
  });

  it("returns null when payload contains nothing actionable", () => {
    expect(resolveNotificationLink(n({}))).toBeNull();
  });

  it("returns null when payload field is not a string", () => {
    expect(resolveNotificationLink(n({ conversation_id: 123 }))).toBeNull();
  });

  it("handles missing payload gracefully", () => {
    expect(resolveNotificationLink({ type: "x" } as unknown as AppNotification)).toBeNull();
  });

  it("prefers conversation over other ids when both present", () => {
    expect(
      resolveNotificationLink(n({ conversation_id: "c", deal_id: "d" }))?.to,
    ).toBe("/inbox");
  });
});