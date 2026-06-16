import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function randHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  scopes: z.array(z.string().min(1).max(40)).max(20).optional(),
});

const idSchema = z.object({ id: z.string().uuid() });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    if (pErr || !profile?.organization_id) throw new Error("Organização não encontrada");

    const rawSecret = randHex(24);
    const prefix = `pk_live_${randHex(4)}`;
    const fullKey = `${prefix}_${rawSecret}`;
    const keyHash = await sha256Hex(fullKey);

    const { data: inserted, error } = await supabase
      .from("api_keys")
      .insert({
        organization_id: profile.organization_id,
        name: data.name,
        scopes: data.scopes ?? ["read"],
        key_prefix: prefix,
        key_hash: keyHash,
      })
      .select("id, name, key_prefix, scopes, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { key: fullKey, record: inserted };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("api_keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const rotateApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: existing, error: getErr } = await supabase
      .from("api_keys")
      .select("id, name, scopes, organization_id")
      .eq("id", data.id)
      .maybeSingle();
    if (getErr) throw new Error(getErr.message);
    if (!existing) throw new Error("Chave não encontrada");

    const rawSecret = randHex(24);
    const prefix = `pk_live_${randHex(4)}`;
    const fullKey = `${prefix}_${rawSecret}`;
    const keyHash = await sha256Hex(fullKey);

    const { data: inserted, error: insErr } = await supabase
      .from("api_keys")
      .insert({
        organization_id: existing.organization_id,
        name: existing.name,
        scopes: existing.scopes ?? ["read"],
        key_prefix: prefix,
        key_hash: keyHash,
      })
      .select("id, name, key_prefix, scopes, created_at")
      .single();
    if (insErr) throw new Error(insErr.message);

    await supabase.from("api_keys").delete().eq("id", existing.id);
    return { key: fullKey, record: inserted };
  });