import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const TestAgentInput = z.object({
  agentId: z.string().uuid(),
  input: z.string().min(1).max(2000),
});

export type TestAgentResult =
  | {
      status: "ok";
      output: string;
      model: string;
    }
  | {
      status: "pending_configuration";
      reason: string;
    }
  | {
      status: "error";
      reason: string;
    };

export const testAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TestAgentInput.parse(input))
  .handler(async ({ data, context }): Promise<TestAgentResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        status: "pending_configuration",
        reason:
          "LOVABLE_API_KEY não configurada. Configure a chave do Lovable AI Gateway para testar agentes.",
      };
    }

    const { supabase } = context;
    const { data: agent, error } = await supabase
      .from("ai_agents")
      .select("id, name, system_prompt, metadata, status")
      .eq("id", data.agentId)
      .maybeSingle();

    if (error) return { status: "error", reason: error.message };
    if (!agent) return { status: "error", reason: "Agente não encontrado ou sem acesso." };

    const meta = (agent.metadata as Record<string, unknown> | null) ?? {};
    const model =
      (typeof meta.model === "string" && meta.model) || "google/gemini-3-flash-preview";

    const systemPrompt =
      (agent.system_prompt && agent.system_prompt.trim()) ||
      "Você é um assistente útil. Responda de forma clara e objetiva.";

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "vercel-ai-sdk",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: data.input },
          ],
        }),
      });

      if (resp.status === 429) {
        return {
          status: "error",
          reason: "Rate limit excedido no Lovable AI Gateway. Tente novamente em alguns segundos.",
        };
      }
      if (resp.status === 402) {
        return {
          status: "error",
          reason:
            "Créditos esgotados no workspace. Adicione créditos em Settings → Workspace → Usage.",
        };
      }
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        return {
          status: "error",
          reason: `Falha no gateway (${resp.status}): ${text.slice(0, 200) || resp.statusText}`,
        };
      }

      const json = (await resp.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const output =
        json.choices?.[0]?.message?.content?.trim() || "(resposta vazia do modelo)";

      return { status: "ok", output, model };
    } catch (e) {
      return {
        status: "error",
        reason: e instanceof Error ? e.message : "Erro desconhecido ao chamar gateway.",
      };
    }
  });