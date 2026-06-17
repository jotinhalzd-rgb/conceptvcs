# Testes e QA — Piloto Comercial

Documento de referência sobre o estado atual da suíte de testes automatizados
do projeto e como operá-la durante o piloto.

## 1. Status atual

- Vitest configurado (`vitest.config.ts`).
- Testing Library configurado (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`).
- jsdom configurado como ambiente de teste.
- **69 testes verdes.**
- `bunx tsc --noEmit` → **0 erros**.
- Nenhum arquivo de produto foi alterado para viabilizar os testes.

## 2. Como rodar

```bash
bun run test           # roda toda a suíte uma vez
bun run test:watch     # modo watch durante desenvolvimento
bun run test:coverage  # roda com relatório de cobertura (v8)
bunx tsc --noEmit      # checagem de tipos sem build
```

Setup global em `src/test/setup.ts` (polyfills de `matchMedia`,
`ResizeObserver`, `IntersectionObserver` e mock seguro do client Supabase
do navegador). Helpers em `src/test/helpers/` (incluindo
`makeSupabaseMock` para encadeamento de queries).

## 3. Camadas cobertas

Arquivos de teste atualmente versionados:

- `src/lib/sla.test.ts`
- `src/lib/reports/csv.test.ts`
- `src/lib/channels/status.test.ts`
- `src/lib/channels/legacy-map.test.ts`
- `src/lib/notifications/resolve-link.test.ts`
- `src/lib/notifications/type-map.test.ts`
- `src/lib/campaigns/dispatch.test.ts`

Cobrem a camada de **bibliotecas utilitárias puras** (SLA, exportação CSV,
normalização de canais, mapeamento de provedores legados, roteamento de
notificações e regras de disparo de campanha), que é onde o risco de
regressão silenciosa é maior e o custo de manutenção dos testes é menor.

## 4. O que ficou fora e por quê

- **Server functions** (`src/lib/**/*.functions.ts`): exigem harness do
  TanStack Start + React Start e mock do middleware de autenticação
  (`requireSupabaseAuth` / `attachSupabaseAuth`). O esforço para um harness
  estável não cabe no piloto.
- **Hooks críticos** (`use-conversations`, `use-send-message`, `use-auth`,
  `use-channels`, `use-queues`, `use-billing`): exigem wrapper combinando
  `QueryClientProvider`, `RouterProvider` e mocks profundos do client
  Supabase encadeado. Sem isso, os testes ficam frágeis e de alta
  manutenção.
- **Realtime do Supabase** (canais `channel().on().subscribe()`): não
  coberto por testes unitários; depende de teste de integração.
- **AI service / copilot-engine**: não estão isolados como módulos puros
  testáveis — a lógica está acoplada ao client Supabase e a chamadas
  externas, sem boundary claro para mockar sem refatorar produto.

Nenhum desses pontos foi refatorado: a regra do piloto é **não alterar
código de produto** para viabilizar testes.

## 5. Recomendação pós-piloto

1. Adicionar **testes de integração** para o endpoint público de inbound
   (`src/routes/api/public/channels.$channelId.inbound.ts`) usando um
   harness HTTP real contra um Supabase de teste.
2. Construir um **harness para server functions** que injete o contexto de
   `requireSupabaseAuth` (usuário fake + claims) e permita testar handlers
   sem subir o servidor inteiro.
3. Adicionar **testes de hooks** com `QueryClientProvider` e mocks
   estáveis do client Supabase (extensão do `makeSupabaseMock` atual).
4. Integrar `bun run test` ao **CI** como gate obrigatório de PR, junto
   com `bunx tsc --noEmit`.
5. Manter cobertura **realista**: priorizar lib pura + integração; evitar
   testes de UI baseados em snapshots visuais e mocks frágeis que
   reproduzem implementação em vez de comportamento.

## 6. Status final

- Os testes **não bloqueiam o piloto**.
- A cobertura atual é suficiente como **primeira camada de segurança**
  contra regressões em regras de negócio puras.
- O próximo incremento de QA deve focar **testes de integração** (endpoint
  inbound, server functions com harness real), e não em testes unitários
  artificiais sobre hooks/UI.
