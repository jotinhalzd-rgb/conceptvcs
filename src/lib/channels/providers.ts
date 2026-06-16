import { z } from "zod";

export type ChannelType =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "email"
  | "webchat"
  | "voice";

export type ProviderFieldType = "text" | "password" | "number" | "url" | "email" | "select";

export interface ProviderField {
  key: string;
  label: string;
  type: ProviderFieldType;
  placeholder?: string;
  required?: boolean;
  helper?: string;
  options?: { label: string; value: string }[];
  secret?: boolean;
}

export interface ProviderDef {
  id: string; // saved in channels.provider
  channelType: ChannelType;
  label: string;
  description: string;
  externalDependency?: string;
  fields: ProviderField[]; // non-secret config (saved to settings.config)
  secretFields: ProviderField[]; // saved to credentials
  schema: z.ZodSchema<any>;
}

const required = (label: string) => z.string().trim().min(1, `${label} é obrigatório`).max(2048);
const optional = () => z.string().trim().max(2048).optional().or(z.literal(""));

export const PROVIDERS: ProviderDef[] = [
  {
    id: "whatsapp_meta_cloud",
    channelType: "whatsapp",
    label: "WhatsApp — Meta Cloud API",
    description: "WhatsApp Business API oficial via Meta Cloud.",
    externalDependency: "Requer conta Meta Business verificada e número aprovado.",
    fields: [
      { key: "phone_number_id", label: "Phone Number ID", type: "text", required: true },
      { key: "business_account_id", label: "WhatsApp Business Account ID", type: "text", required: true },
      { key: "verify_token", label: "Webhook Verify Token", type: "text", required: true, helper: "Use o mesmo valor no painel da Meta." },
    ],
    secretFields: [
      { key: "access_token", label: "Access Token", type: "password", required: true, secret: true },
    ],
    schema: z.object({
      phone_number_id: required("Phone Number ID"),
      business_account_id: required("WABA ID"),
      verify_token: required("Verify Token"),
      access_token: required("Access Token"),
    }),
  },
  {
    id: "whatsapp_twilio",
    channelType: "whatsapp",
    label: "WhatsApp — Twilio",
    description: "WhatsApp via Twilio Messaging.",
    fields: [
      { key: "from_number", label: "Número de envio (E.164)", type: "text", required: true, placeholder: "+5511999999999" },
      { key: "account_sid", label: "Account SID", type: "text", required: true },
    ],
    secretFields: [
      { key: "auth_token", label: "Auth Token", type: "password", required: true, secret: true },
    ],
    schema: z.object({
      from_number: required("Número").regex(/^\+?[0-9]{8,15}$/, "Use formato E.164"),
      account_sid: required("Account SID"),
      auth_token: required("Auth Token"),
    }),
  },
  {
    id: "whatsapp_360dialog",
    channelType: "whatsapp",
    label: "WhatsApp — 360Dialog",
    description: "WhatsApp via 360Dialog Cloud API.",
    fields: [],
    secretFields: [
      { key: "api_key", label: "D360 API Key", type: "password", required: true, secret: true },
    ],
    schema: z.object({ api_key: required("API Key") }),
  },
  {
    id: "whatsapp_evolution",
    channelType: "whatsapp",
    label: "WhatsApp — Evolution API",
    description: "WhatsApp via Evolution API self-hosted.",
    externalDependency: "Requer instância Evolution acessível pela internet.",
    fields: [
      { key: "base_url", label: "Base URL", type: "url", required: true, placeholder: "https://evo.exemplo.com" },
      { key: "instance", label: "Instance", type: "text", required: true },
    ],
    secretFields: [
      { key: "api_key", label: "API Key", type: "password", required: true, secret: true },
    ],
    schema: z.object({
      base_url: required("Base URL").url("URL inválida"),
      instance: required("Instance"),
      api_key: required("API Key"),
    }),
  },
  {
    id: "instagram_meta",
    channelType: "instagram",
    label: "Instagram Direct — Meta",
    description: "Mensagens diretas do Instagram via Meta.",
    externalDependency: "Conta Instagram Business vinculada a uma Página do Facebook.",
    fields: [
      { key: "page_id", label: "Page ID", type: "text", required: true },
      { key: "ig_user_id", label: "IG User ID", type: "text", required: true },
    ],
    secretFields: [
      { key: "access_token", label: "Page Access Token", type: "password", required: true, secret: true },
    ],
    schema: z.object({
      page_id: required("Page ID"),
      ig_user_id: required("IG User ID"),
      access_token: required("Access Token"),
    }),
  },
  {
    id: "facebook_messenger",
    channelType: "facebook",
    label: "Facebook Messenger",
    description: "Mensagens via Página do Facebook.",
    fields: [
      { key: "page_id", label: "Page ID", type: "text", required: true },
    ],
    secretFields: [
      { key: "page_access_token", label: "Page Access Token", type: "password", required: true, secret: true },
      { key: "app_secret", label: "App Secret", type: "password", required: true, secret: true },
    ],
    schema: z.object({
      page_id: required("Page ID"),
      page_access_token: required("Page Access Token"),
      app_secret: required("App Secret"),
    }),
  },
  {
    id: "email_smtp",
    channelType: "email",
    label: "E-mail — SMTP",
    description: "Envio via servidor SMTP próprio.",
    fields: [
      { key: "from_email", label: "E-mail remetente", type: "email", required: true },
      { key: "from_name", label: "Nome remetente", type: "text", required: true },
      { key: "host", label: "SMTP host", type: "text", required: true, placeholder: "smtp.exemplo.com" },
      { key: "port", label: "Porta", type: "number", required: true, placeholder: "587" },
      { key: "username", label: "Usuário", type: "text", required: true },
      {
        key: "secure",
        label: "Segurança",
        type: "select",
        required: true,
        options: [
          { label: "STARTTLS", value: "starttls" },
          { label: "TLS/SSL", value: "tls" },
          { label: "Sem criptografia", value: "none" },
        ],
      },
    ],
    secretFields: [
      { key: "password", label: "Senha SMTP", type: "password", required: true, secret: true },
    ],
    schema: z.object({
      from_email: z.string().trim().email("E-mail inválido"),
      from_name: required("Nome"),
      host: required("Host"),
      port: z.coerce.number().int().min(1).max(65535),
      username: required("Usuário"),
      secure: z.enum(["starttls", "tls", "none"]),
      password: required("Senha"),
    }),
  },
  {
    id: "email_api",
    channelType: "email",
    label: "E-mail — API (Resend / SES)",
    description: "Envio via API de provedor (Resend, SES, etc.).",
    fields: [
      { key: "from_email", label: "E-mail remetente", type: "email", required: true },
      { key: "from_name", label: "Nome remetente", type: "text", required: true },
      { key: "region", label: "Região (opcional)", type: "text" },
    ],
    secretFields: [
      { key: "api_key", label: "API Key", type: "password", required: true, secret: true },
    ],
    schema: z.object({
      from_email: z.string().trim().email("E-mail inválido"),
      from_name: required("Nome"),
      region: optional(),
      api_key: required("API Key"),
    }),
  },
  {
    id: "webchat_native",
    channelType: "webchat",
    label: "Webchat — Widget nativo",
    description: "Widget de chat para incorporar no seu site.",
    fields: [
      { key: "widget_name", label: "Nome do widget", type: "text", required: true, placeholder: "Atendimento" },
      { key: "allowed_domain", label: "Domínio permitido", type: "text", required: true, placeholder: "https://www.seusite.com" },
      { key: "theme_color", label: "Cor do tema", type: "text", placeholder: "#6366f1" },
    ],
    secretFields: [],
    schema: z.object({
      widget_name: required("Nome"),
      allowed_domain: required("Domínio").regex(/^https?:\/\//i, "Inclua https://"),
      theme_color: optional(),
    }),
  },
  {
    id: "voice_generic",
    channelType: "voice",
    label: "Voz — Telefonia",
    description: "Canal de voz/telefone genérico.",
    externalDependency: "Depende de provedor SIP/Telephony externo configurado fora do OneContact.",
    fields: [
      { key: "provider_name", label: "Provedor", type: "text", required: true, placeholder: "Twilio Voice, Vonage..." },
      { key: "phone_number", label: "Número (E.164)", type: "text", required: true, placeholder: "+5511..." },
    ],
    secretFields: [],
    schema: z.object({
      provider_name: required("Provedor"),
      phone_number: required("Número").regex(/^\+?[0-9]{8,15}$/, "Use formato E.164"),
    }),
  },
];

export const CHANNEL_TYPE_LABEL: Record<ChannelType, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook Messenger",
  email: "E-mail",
  webchat: "Webchat",
  voice: "Voz / Telefone",
};

export function getProvider(id: string | undefined | null): ProviderDef | undefined {
  if (!id) return undefined;
  return PROVIDERS.find((p) => p.id === id);
}

export function providersByType(type: ChannelType): ProviderDef[] {
  return PROVIDERS.filter((p) => p.channelType === type);
}