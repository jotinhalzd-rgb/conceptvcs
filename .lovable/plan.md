
# A1 — AI Studio (núcleo intocado)

Migration `ai_agents` (queue_id, channel_id, status) já aplicada. Agora completar o módulo com funcionalidade real.

## Arquivos

**Novos**
- `src/lib/ai/test-agent.functions.ts` — serverFn `testAgent` (Lovable AI Gateway, `google/gemini-3-flash-preview`)
- `src/lib/ai/ai-gateway.server.ts` — provider helper (padrão Lovable)
- `src/components/ai-studio/agent-test-dialog.tsx` — modal de teste com input/output + aviso de créditos
- `src/components/ai-studio/agent-delete-dialog.tsx` — `AlertDialog` para exclusão

**Editados**
- `src/hooks/ai/use-agents.ts` — adicionar `deleteAgent`, `toggleAgent`; ler `queue_id`/`channel_id`/`status`/`provider`/`model`; manter org-scope via `organization_id`
- `src/components/ai-studio/agent-editor.tsx` — adicionar campos: `queue_id` (Select de filas reais), `channel_id` (Select de canais reais), `provider` (lovable_ai), `model` (gemini-3-flash-preview / gemini-2.5-flash / gemini-2.5-pro), `status` (active/inactive/pending_configuration)
- `src/components/ai-studio/agent-list.tsx` — remover "98%"/"4.2k" hardcoded; mostrar status real, fila/canal vinculados, provider/model, updated_at; botão Testar abre dialog; botão Excluir abre AlertDialog; botão toggle ativo
- `src/components/ai-studio/ai-studio-view.tsx` — manter; passar callback de teste
- `src/components/ai-studio/monitoring-hub.tsx` — substituir métricas hardcoded por leitura real de `agent_performance` com fallback empty-state honesto (sem inventar números)

`src/start.ts` — sem mudanças (testAgent não precisa de auth middleware, mas vou usar `requireSupabaseAuth` para escopo org)

## Detalhes

**testAgent serverFn**
```ts
createServerFn({method:'POST'})
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ agentId: z.string().uuid(), input: z.string().min(1).max(2000) }).parse)
  .handler(async ({data, context}) => {
    const key = process.env.LOVABLE_API_KEY
    if (!key) return { status: 'pending_configuration', message: 'LOVABLE_API_KEY não configurada' }
    // buscar agent via context.supabase (RLS → escopo org)
    // chamar generateText com system_prompt + input
    // tratar 429/402 explicitamente
    return { status: 'ok', output, model, usage }
  })
```

**Hooks de filas/canais**: reutilizar `useQueues` e `useChannels` existentes (já org-scoped).

**Métricas monitoring-hub**: query simples em `agent_performance` agregando por org; quando vazio, mostrar card "Sem dados de performance ainda — os agentes começarão a registrar métricas após o primeiro uso real". Sem números fake.

**RLS**: `ai_agents` já tem policy org-scoped existente; nada novo.

## Validação

- `bunx tsc --noEmit`
- `rg -n "Em breve|coming soon|não implementado|próxima sprint" src/`
- `rg -n "onClick=\{\(\) => \{\}\}" src/`
- Núcleo: navegar Inbox/CRM/Campanhas/Marketplace/Channels para confirmar zero regressão (visual via preview).

## Relatório

Ao final: arquivos alterados, serverFn criada, passos para testar cada operação, comportamento sem LOVABLE_API_KEY, confirmação de remoção de métricas fake, resultado typecheck, resultado das buscas, riscos remanescentes.

## Riscos conscientes

- `testAgent` consome créditos Lovable AI (avisado no UI).
- `agent_performance` pode estar vazia — empty state honesto, sem números.
- Não implemento execução autônoma em background (fora do escopo A1).
