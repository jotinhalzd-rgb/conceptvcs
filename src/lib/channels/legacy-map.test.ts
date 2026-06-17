import { describe, it, expect } from "vitest";
import { mapLegacyProvider, inferProviderFromAsset, isChannelAsset } from "./legacy-map";

describe("channels/legacy-map / mapLegacyProvider", () => {
  it("returns the canonical id when input already canonical", () => {
    expect(mapLegacyProvider("whatsapp_meta_cloud")).toBe("whatsapp_meta_cloud");
  });

  it("resolves legacy aliases (case-insensitive)", () => {
    expect(mapLegacyProvider("META")).toBe("whatsapp_meta_cloud");
    expect(mapLegacyProvider("twilio")).toBe("whatsapp_twilio");
    expect(mapLegacyProvider("360dialog")).toBe("whatsapp_360dialog");
    expect(mapLegacyProvider("evolution")).toBe("whatsapp_evolution");
    expect(mapLegacyProvider("instagram")).toBe("instagram_meta");
    expect(mapLegacyProvider("facebook")).toBe("facebook_messenger");
    expect(mapLegacyProvider("smtp")).toBe("email_smtp");
    expect(mapLegacyProvider("email")).toBe("email_api");
    expect(mapLegacyProvider("webchat")).toBe("webchat_native");
    expect(mapLegacyProvider("voice")).toBe("voice_generic");
  });

  it("returns null for unknown or empty input", () => {
    expect(mapLegacyProvider(null)).toBeNull();
    expect(mapLegacyProvider("")).toBeNull();
    expect(mapLegacyProvider("xyz")).toBeNull();
  });
});

describe("channels/legacy-map / inferProviderFromAsset", () => {
  it("matches WhatsApp Meta Cloud by title", () => {
    const r = inferProviderFromAsset({
      asset_title: "WhatsApp Meta Cloud API",
      asset_description: "Integração oficial",
    });
    expect(r?.providerId).toBe("whatsapp_meta_cloud");
    expect(r?.channelType).toBe("whatsapp");
  });

  it("matches Instagram by title", () => {
    expect(inferProviderFromAsset({ asset_title: "Instagram Direct" })?.providerId).toBe(
      "instagram_meta",
    );
  });

  it("falls back to telecom category", () => {
    const r = inferProviderFromAsset({
      asset_title: "Generic Provider",
      asset_category_code: "telecom",
    });
    expect(r?.providerId).toBe("whatsapp_meta_cloud");
  });

  it("falls back to marketing category", () => {
    const r = inferProviderFromAsset({
      asset_title: "Some Tool",
      asset_category_code: "marketing",
    });
    expect(r?.providerId).toBe("email_api");
  });

  it("returns null when nothing matches", () => {
    expect(inferProviderFromAsset({ asset_title: "Random Tool" })).toBeNull();
    expect(inferProviderFromAsset(null)).toBeNull();
  });
});

describe("channels/legacy-map / isChannelAsset", () => {
  it("recognises explicit channel assets", () => {
    expect(isChannelAsset({ asset_type_code: "channel" })).toBe(true);
  });

  it("recognises integration assets that map to a known provider", () => {
    expect(
      isChannelAsset({ asset_type_code: "integration", asset_title: "WhatsApp Twilio" }),
    ).toBe(true);
  });

  it("rejects integrations that do not match any provider", () => {
    expect(isChannelAsset({ asset_type_code: "integration", asset_title: "Random" })).toBe(false);
  });

  it("rejects unrelated asset types and nullish input", () => {
    expect(isChannelAsset({ asset_type_code: "template" })).toBe(false);
    expect(isChannelAsset(null)).toBe(false);
  });
});