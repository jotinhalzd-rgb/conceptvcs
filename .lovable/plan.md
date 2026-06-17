## Objetivo

Instalar Vitest + Testing Library + jsdom, configurar setup mínimo seguro e escrever uma suíte de testes com cobertura realista (~70%) nas 4 camadas: lib utilitária, server functions, hooks críticos e services. Sem tocar em código de produto, RLS, migrations ou fluxos aprovados.

## 1. Dependências (dev)

```
bun add -d vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

## 2. Arquivos de configuração

- `vitest.config.ts` — environment jsdom, alias `@`, setupFiles, coverage v8 com thresholds 70% nos paths-alvo.
- `src/test/setup.ts` — `@testing-library/jest-dom`, `cleanup` automático, polyfills (`matchMedia`, `ResizeObserver`, `IntersectionObserver`, `crypto.randomUUID`), mock global de `@/integrations/supabase/client` via `vi.mock` reutilizável.
- `src/test/helpers/supabase-mock.ts` — factory que retorna um cliente Supabase fake encadeável (`from().select().eq()...`) com `mockResolvedValue` configurável.
- `src/test/helpers/query-wrapper.tsx` — wrapper com `QueryClientProvider` fresh por teste + `MemoryRouterProvider` mínimo (mock simples de `@tanstack/react-router` quando hook usa `useNavigate`).
- `package.json` — adicionar `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`. Scripts existentes intactos.

## 3. Testes — Lib utilitária (puros, prioridade alta)

| Arquivo | Casos |
|---|---|
| `src/lib/sla.test.ts` | dentro/fora SLA, vencido, sem `sla_due_at`, datas inválidas |
| `src/lib/reports/csv.test.ts` | linhas vazias, escape de vírgula/aspas/quebra de linha, headers, unicode |
| `src/lib/channels/status.test.ts` | cada status mapeado, status desconhecido (fallback) |
| `src/lib/channels/legacy-map.test.ts` | mapeamento legado → novo, valor não mapeado |
| `src/lib/channels/providers.test.ts` | metadata por provedor, provedor inexistente |
| `src/lib/notifications/resolve-link.test.ts` | cada `type` resolve URL correta, payload incompleto, tipo desconhecido |
| `src/lib/notifications/type-map.test.ts` | label/ícone por tipo, fallback |

## 4. Testes — Server functions (mockando Supabase + fetch)

| Arquivo | Estratégia |
|---|---|
| `src/lib/ai/test-agent.functions.test.ts` | mock de `fetch` para Lovable AI Gateway, validar input, retorno de sucesso e erro 401/500. **Nunca chamar provider real.** |
| `src/lib/automation/test-automation.functions.test.ts` | mock Supabase + payload validation |
| `src/lib/developer/api-keys.functions.test.ts` | criação/listagem/revogação com mock Supabase, validar formato da key gerada |
| `src/lib/developer/webhook-test.functions.test.ts` | mock `fetch` para webhook destino, sucesso/timeout/erro |
| `src/lib/developer/webhook-secret.functions.test.ts` | geração de secret, formato |
| `src/lib/demo-seed.functions.test.ts` | **pular** se exigir mock excessivo de Supabase admin (reportar como risco) |

Server fns com `requireSupabaseAuth` testadas chamando o `.handler` diretamente com `context` mockado (`{ supabase: fakeClient, userId: 'test-uid' }`) — evita middleware real.

## 5. Testes — Hooks críticos

Renderizados via `renderHook` com `query-wrapper`. Supabase mockado por teste.

| Hook | Casos cobertos |
|---|---|
| `use-auth` | sessão null → user, signOut, error path |
| `use-conversations` | lista vazia, lista com dados, filtro por queue, erro |
| `use-send-message` | sucesso (insert), validação de input vazio, erro de RLS |
| `use-channels` | list, create (mutate), update, erro |
| `use-queues` | list, default queue, create, erro |
| `use-billing` | usage, plan, invoices, sem dados |

## 6. Testes — Services

| Arquivo | Casos |
|---|---|
| `src/lib/ai/*` (ai-service / copilot-engine se existirem) | mock fetch Gateway, prompt builder, parse de resposta, erro |
| `src/lib/channels/providers.ts` (já em lib) | reaproveita |
| `src/lib/campaigns/dispatch.test.ts` | enfileiramento, dry-run, erro de provider mockado |

> Se `ai-service`/`copilot-engine` não existirem como módulos isolados (lógica colada em hook), reportar como risco e cobrir indiretamente via teste do hook.

## 7. Validação final

```bash
bunx tsc --noEmit
bun run test
bun run test:coverage
rg -n "TODO|FIXME|console\.log\(" src --type ts | head
```

Build não roda manualmente (harness cuida). Confirmar zero alterações em `src/integrations/supabase/**`, `supabase/migrations/**`, `src/routes/**`.

## 8. Regras de segurança

- **Sem chamadas reais** a Lovable AI Gateway, Supabase, webhooks externos. Todo `fetch` mockado com `vi.stubGlobal('fetch', vi.fn())`.
- **Sem secrets** em arquivos de teste.
- **Sem snapshot de UI complexa** — só lógica e contratos.
- Cada teste isolado: `beforeEach` reseta mocks.

## 9. Pular / reportar como risco

- Componentes React grandes (Inbox, Dashboard, CRM views) — fora do escopo.
- Hooks que dependem de realtime do Supabase (`channel().on()`) — cobrir apenas a parte síncrona; realtime fica como risco.
- `demo-seed` se exigir mock de `supabaseAdmin` em demasia.

## 10. Relatório final entregue

- Lista de dependências adicionadas;
- Arquivos de config criados;
- Arquivos de teste criados + contagem de `it()`;
- Camadas cobertas vs puladas (com motivo);
- Resultado de `tsc --noEmit`;
- Resultado de `vitest run` (passed/failed/skipped);
- % de cobertura por path-alvo;
- Riscos remanescentes (realtime, demo-seed, edge functions externas).

## Não-objetivos

- Cobertura 90%+;
- Testes E2E (Playwright);
- Refatorar produto para testabilidade;
- Mexer em RLS, migrations, rotas, UI.
