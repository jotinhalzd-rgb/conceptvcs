import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const DEMO_PASSWORD = "DemoOneContact2026!";
const DEMO_ORG_SLUG = "onecontact-demo-corp";
const DEMO_ORG_NAME = "ONECONTACT DEMO CORP";

export const DEMO_USERS = [
  { email: "demo-ceo-master@onecontact.dev", role: "ceo_master", full_name: "CEO Master Demo" },
  { email: "demo-ceo@onecontact.dev",        role: "ceo",        full_name: "Empresa Demo" },
  { email: "demo-manager@onecontact.dev",    role: "manager",    full_name: "Gerente Demo" },
  { email: "demo-agent@onecontact.dev",      role: "agent",      full_name: "Atendente Demo" },
  { email: "demo-supervisor@onecontact.dev", role: "supervisor", full_name: "Supervisor IA Demo" },
] as const;

function isDevHost(host: string | null): boolean {
  if (!host) return false;
  const h = host.toLowerCase().split(":")[0];
  if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")) return true;
  if (h.endsWith(".lovable.app")) {
    if (h.startsWith("id-preview--")) return true;
    if (h.includes("-dev.")) return true;
    if (h.includes("--")) return true; // preview subdomains contain "--"
  }
  return false;
}

/**
 * Ensures demo organization, demo users (auth + profile) and demo data exist.
 * GATED: only runs when the request host is a dev/preview/staging surface.
 * In production this returns 403, so demo accounts are never auto-provisioned.
 */
export const ensureDemoData = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => ({ email: String(d?.email ?? "") }))
  .handler(async ({ data }) => {
    const req = getRequest();
    const host = req?.headers.get("host") ?? null;
    if (!isDevHost(host)) {
      throw new Error("Demo acessível apenas em ambientes de desenvolvimento.");
    }

    const target = DEMO_USERS.find((u) => u.email === data.email);
    if (!target) throw new Error("Usuário demo inválido.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Demo org
    let { data: org } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("slug", DEMO_ORG_SLUG)
      .maybeSingle();
    if (!org) {
      const { data: created, error } = await supabaseAdmin
        .from("organizations")
        .insert({ name: DEMO_ORG_NAME, slug: DEMO_ORG_SLUG })
        .select("id")
        .single();
      if (error) throw error;
      org = created;
    }
    const orgId = org!.id as string;

    // 2) Ensure all demo users exist + profiles point at demo org
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    for (const u of DEMO_USERS) {
      let user = list?.users.find((x) => x.email === u.email);
      if (!user) {
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: u.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: u.full_name, role: u.role },
        });
        if (error) throw error;
        user = created.user!;
      }
      const { error: upsertErr } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            organization_id: orgId,
            full_name: u.full_name,
            role: u.role,
          },
          { onConflict: "id" },
        );
      if (upsertErr) {
        throw new Error(`Falha ao gravar profile demo (${u.email}): ${upsertErr.message}`);
      }
    }

    // 3) Seed demo data (idempotent)
    await seedDemoData(supabaseAdmin, orgId);
    await seedDemoOmnichannel(supabaseAdmin, orgId);

    return { ok: true, password: DEMO_PASSWORD };
  });

async function seedDemoData(db: any, orgId: string) {
  const { count } = await db
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);
  if ((count ?? 0) > 0) return; // already seeded

  // Pipeline + stages
  const { data: pipeline, error: pipeErr } = await db
    .from("pipelines")
    .insert({ organization_id: orgId, name: "Vendas Principal", type: "sales" })
    .select("id")
    .single();
  if (pipeErr) throw pipeErr;

  const stageNames = ["Prospecção", "Qualificação", "Proposta", "Negociação", "Fechado"];
  const { data: stages, error: stagesErr } = await db
    .from("stages")
    .insert(stageNames.map((n, i) => ({ pipeline_id: pipeline.id, name: n, order_index: i })))
    .select("id, order_index");
  if (stagesErr) throw stagesErr;

  // Channels
  const { data: channel, error: chErr } = await db
    .from("channels")
    .insert({
      organization_id: orgId,
      provider: "whatsapp",
      name: "WhatsApp Demo",
      identifier: `demo-wpp-${orgId.slice(0, 8)}`,
      is_active: true,
      status: "online",
    })
    .select("id")
    .single();
  if (chErr) throw chErr;

  // Queue
  await db.from("queues").insert([
    { organization_id: orgId, name: "Atendimento Geral", department: "support", priority_level: 1 },
    { organization_id: orgId, name: "Vendas", department: "sales", priority_level: 2 },
  ]);

  // Contacts
  const contactsSeed = [
    { name: "Mariana Silva",  email: "mariana@cliente.com",  phone: "+5511999990001", lead_score: 85, lifecycle_stage: "customer" },
    { name: "Carlos Souza",   email: "carlos@cliente.com",   phone: "+5511999990002", lead_score: 62, lifecycle_stage: "opportunity" },
    { name: "Juliana Reis",   email: "juliana@cliente.com",  phone: "+5511999990003", lead_score: 41, lifecycle_stage: "lead" },
    { name: "Felipe Costa",   email: "felipe@cliente.com",   phone: "+5511999990004", lead_score: 92, lifecycle_stage: "customer" },
    { name: "Ana Pereira",    email: "ana@cliente.com",      phone: "+5511999990005", lead_score: 28, lifecycle_stage: "subscriber" },
    { name: "Rodrigo Lima",   email: "rodrigo@cliente.com",  phone: "+5511999990006", lead_score: 70, lifecycle_stage: "opportunity" },
  ].map((c) => ({ ...c, organization_id: orgId, is_lead: true, status: "active", main_channel: "whatsapp" }));

  const { data: contacts, error: cErr } = await db
    .from("contacts")
    .insert(contactsSeed)
    .select("id, name");
  if (cErr) throw cErr;

  // Deals — spread across stages
  const deals = contacts.map((c: any, i: number) => ({
    organization_id: orgId,
    title: `Negócio – ${c.name}`,
    value: (i + 1) * 2500,
    probability: Math.min(95, 20 + i * 12),
    status: "open",
    contact_id: c.id,
    pipeline_id: pipeline.id,
    stage_id: stages[i % stages.length].id,
    expected_close_date: new Date(Date.now() + (i + 1) * 86400_000 * 7).toISOString(),
  }));
  await db.from("deals").insert(deals);

  // Conversations + messages for the first 4 contacts
  for (const c of contacts.slice(0, 4)) {
    const { data: conv } = await db
      .from("conversations")
      .insert({
        organization_id: orgId,
        channel_id: channel.id,
        contact_id: c.id,
        status: "open",
        ai_sentiment: "positive",
        priority: "medium",
        temperature: "warm",
        last_message_preview: "Olá, gostaria de mais informações sobre o produto.",
      })
      .select("id")
      .single();
    if (!conv) continue;

    await db.from("messages").insert([
      {
        conversation_id: conv.id,
        organization_id: orgId,
        body: "Olá, gostaria de mais informações sobre o produto.",
        type: "text",
      },
      {
        conversation_id: conv.id,
        organization_id: orgId,
        body: "Claro! Posso ajudar. Qual seu interesse principal?",
        type: "text",
      },
      {
        conversation_id: conv.id,
        organization_id: orgId,
        body: "Quero entender preços e prazos para a equipe.",
        type: "text",
      },
    ]);
  }
}