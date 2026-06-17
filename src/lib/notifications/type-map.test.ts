import { describe, it, expect } from "vitest";
import { notificationMeta, NOTIFICATION_TYPE_OPTIONS, PREF_ROWS } from "./type-map";

describe("notifications/type-map", () => {
  it("maps known types to their pref bucket", () => {
    expect(notificationMeta("new_conversation").prefKey).toBe("inbox_messages");
    expect(notificationMeta("sla_breach").prefKey).toBe("sla_alerts");
    expect(notificationMeta("deal_won").prefKey).toBe("crm_deals");
    expect(notificationMeta("campaign_completed").prefKey).toBe("marketing_campaigns");
    expect(notificationMeta("ai_insight").prefKey).toBe("business_ai_insights");
    expect(notificationMeta("channel_error").prefKey).toBe("system_alerts");
  });

  it("returns the fallback for unknown types", () => {
    const meta = notificationMeta("unknown_type_xyz");
    expect(meta.prefKey).toBe("system_alerts");
    expect(meta.label).toBe("Notificação");
  });

  it("NOTIFICATION_TYPE_OPTIONS exposes value/label pairs", () => {
    expect(NOTIFICATION_TYPE_OPTIONS.length).toBeGreaterThan(0);
    for (const opt of NOTIFICATION_TYPE_OPTIONS) {
      expect(typeof opt.value).toBe("string");
      expect(typeof opt.label).toBe("string");
    }
  });

  it("every PREF_ROWS.types entry resolves to its own prefKey", () => {
    for (const row of PREF_ROWS) {
      for (const t of row.types) {
        expect(notificationMeta(t).prefKey).toBe(row.key);
      }
    }
  });
});