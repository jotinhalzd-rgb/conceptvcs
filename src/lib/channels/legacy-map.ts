import { PROVIDERS, type ChannelType } from "./providers";

/**
 * Best-effort mapping of marketplace assets (and legacy provider ids)
 * to the canonical provider catalog from Fase E1.
 * Used when installing a marketplace asset that represents a channel
 * so we can create a paired `channels` row pre-configured for the right drawer.
 */
export interface MappedProvider {
  providerId: string;
  channelType: ChannelType;
}

const TITLE_PATTERNS: Array<{ re: RegExp; providerId: string }> = [
  { re: /whats.*meta|meta.*cloud|whats.*cloud/i, providerId: "whatsapp_meta_cloud" },
  { re: /whats.*twilio|twilio.*whats/i, providerId: "whatsapp_twilio" },
  { re: /360.?dialog/i, providerId: "whatsapp_360dialog" },
  { re: /evolution/i, providerId: "whatsapp_evolution" },
  { re: /instagram/i, providerId: "instagram_meta" },
  { re: /messenger|facebook/i, providerId: "facebook_messenger" },
  { re: /smtp/i, providerId: "email_smtp" },
  { re: /resend|sendgrid|ses|mailgun|email/i, providerId: "email_api" },
  { re: /webchat|widget/i, providerId: "webchat_native" },
  { re: /voz|voice|telefon|sip/i, providerId: "voice_generic" },
];

const LEGACY_PROVIDER_ALIASES: Record<string, string> = {
  meta: "whatsapp_meta_cloud",
  whatsapp: "whatsapp_meta_cloud",
  whatsapp_meta: "whatsapp_meta_cloud",
  twilio: "whatsapp_twilio",
  whatsapp_twilio: "whatsapp_twilio",
  "360dialog": "whatsapp_360dialog",
  evolution: "whatsapp_evolution",
  instagram: "instagram_meta",
  facebook: "facebook_messenger",
  email: "email_api",
  smtp: "email_smtp",
  webchat: "webchat_native",
  voice: "voice_generic",
};

export function mapLegacyProvider(id: string | null | undefined): string | null {
  if (!id) return null;
  const key = id.trim().toLowerCase();
  if (PROVIDERS.some((p) => p.id === key)) return key;
  return LEGACY_PROVIDER_ALIASES[key] ?? null;
}

export function inferProviderFromAsset(asset: any): MappedProvider | null {
  if (!asset) return null;
  const title = `${asset.asset_title ?? ""} ${asset.asset_description ?? ""}`;
  for (const { re, providerId } of TITLE_PATTERNS) {
    if (re.test(title)) {
      const p = PROVIDERS.find((x) => x.id === providerId);
      if (p) return { providerId: p.id, channelType: p.channelType };
    }
  }
  // Category fallback
  const cat = (asset.asset_category_code ?? "").toLowerCase();
  if (cat === "telecom") {
    const p = PROVIDERS.find((x) => x.id === "whatsapp_meta_cloud")!;
    return { providerId: p.id, channelType: p.channelType };
  }
  if (cat === "marketing") {
    const p = PROVIDERS.find((x) => x.id === "email_api")!;
    return { providerId: p.id, channelType: p.channelType };
  }
  return null;
}

export function isChannelAsset(asset: any): boolean {
  if (!asset) return false;
  if (asset.asset_type_code === "channel") return true;
  if (asset.asset_type_code === "integration") {
    return inferProviderFromAsset(asset) !== null;
  }
  return false;
}