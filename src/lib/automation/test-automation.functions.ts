import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const TestInput = z.object({
  workflow_id: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

type ActionResult = {
  type: string;
  status: "success" | "error" | "skipped";
  message: string;
  detail?: Record<string, string | number | boolean | null>;
};

export type TestAutomationResult = {
  status: "success" | "error";
  results: ActionResult[];
  error?: string;
};

export const testAutomation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => TestInput.parse(i))
  .handler(async ({ data, context }): Promise<TestAutomationResult> => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) {
      return { status: "error", results: [], error: "Organização não encontrada." };
    }

    const { data: wf, error: wfErr } = await supabase
      .from("automation_workflows")
      .select("id, name, trigger_event, nodes, organization_id")
      .eq("id", data.workflow_id)
      .maybeSingle();
    if (wfErr) return { status: "error", results: [], error: wfErr.message };
    if (!wf) return { status: "error", results: [], error: "Automação não encontrada." };

    const nodes = (wf.nodes as Record<string, unknown> | null) ?? {};
    const actions = Array.isArray(nodes.actions)
      ? (nodes.actions as Array<{ type: string; params?: Record<string, unknown> }>)
      : [];

    const results: ActionResult[] = [];
    const payload = data.payload;

    for (const action of actions) {
      try {
        if (action.type === "create_notification") {
          const title =
            (action.params?.title as string) || `[TESTE] ${wf.name}`;
          const message =
            (action.params?.message as string) || "Notificação de teste de automação.";
          const { error } = await supabase.from("notifications").insert({
            organization_id: orgId,
            user_id: userId,
            type: "automation_test",
            title: `[TESTE] ${title}`,
            message,
            payload: { workflow_id: wf.id, test: true } as never,
          });
          if (error) throw new Error(error.message);
          results.push({
            type: action.type,
            status: "success",
            message: "Notificação de teste criada para o usuário atual.",
          });
        } else if (action.type === "assign_queue") {
          const queueId =
            (action.params?.queue_id as string) ||
            (nodes.queue_id as string | undefined);
          if (!queueId) {
            results.push({
              type: action.type,
              status: "error",
              message: "queue_id não definido na ação ou na automação.",
            });
            continue;
          }
          const { data: queue, error } = await supabase
            .from("queues")
            .select("id, name, organization_id")
            .eq("id", queueId)
            .maybeSingle();
          if (error) throw new Error(error.message);
          if (!queue || queue.organization_id !== orgId) {
            results.push({
              type: action.type,
              status: "error",
              message: "Fila não encontrada na organização.",
            });
            continue;
          }
          results.push({
            type: action.type,
            status: "success",
            message: `Em produção seria atribuída para a fila "${queue.name}". Teste não altera conversas reais.`,
            detail: { queue_id: queue.id, queue_name: queue.name },
          });
        } else if (action.type === "create_crm_task") {
          const contactId =
            (payload.contact_id as string | undefined) ||
            (action.params?.contact_id as string | undefined);
          if (!contactId) {
            results.push({
              type: action.type,
              status: "error",
              message: "Informe contact_id no payload do teste para criar tarefa real.",
            });
            continue;
          }
          const { data: contact } = await supabase
            .from("contacts")
            .select("id, organization_id")
            .eq("id", contactId)
            .maybeSingle();
          if (!contact || contact.organization_id !== orgId) {
            results.push({
              type: action.type,
              status: "error",
              message: "Contato não encontrado na organização.",
            });
            continue;
          }
          const title =
            (action.params?.title as string) || `[TESTE] Tarefa de ${wf.name}`;
          const { error } = await supabase.from("crm_tasks").insert({
            organization_id: orgId,
            contact_id: contactId,
            title,
            description: "Tarefa criada por teste manual de automação.",
            assigned_to: userId,
            created_by: userId,
          } as never);
          if (error) throw new Error(error.message);
          results.push({
            type: action.type,
            status: "success",
            message: "Tarefa CRM real criada.",
          });
        } else if (action.type === "log_event") {
          results.push({
            type: action.type,
            status: "success",
            message: "Evento registrado no log de execução.",
          });
        } else {
          results.push({
            type: action.type,
            status: "skipped",
            message: "Tipo de ação não suportado nesta versão.",
          });
        }
      } catch (e) {
        results.push({
          type: action.type,
          status: "error",
          message: e instanceof Error ? e.message : "Erro desconhecido.",
        });
      }
    }

    const hasError = results.some((r) => r.status === "error");
    const status: "success" | "error" = hasError ? "error" : "success";

    await supabase.from("automation_logs").insert({
      workflow_id: wf.id,
      organization_id: orgId,
      trigger_event: wf.trigger_event,
      status,
      input: payload as never,
      output: { results } as never,
      error_message: hasError
        ? results.find((r) => r.status === "error")?.message ?? null
        : null,
      created_by: userId,
      metadata: { source: "manual_test" } as never,
    });

    return { status, results };
  });