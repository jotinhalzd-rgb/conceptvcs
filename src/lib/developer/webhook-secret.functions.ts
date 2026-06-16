import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({ channelId: z.string().uuid() });

export const rotateWebhookSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: channel, error } = await supabase
      .from("channels")
      .select("id, credentials, organization_id")
      .eq("id", data.channelId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!channel) throw new Error("Canal não encontrado");

    const secret = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const newCreds = { ...((channel.credentials as Record<string, unknown>) ?? {}), webhook_secret: secret };
    const { error: upErr } = await supabase
      .from("channels")
      .update({ credentials: newCreds, updated_at: new Date().toISOString() })
      .eq("id", channel.id);
    if (upErr) throw new Error(upErr.message);
    return { secret };
  });