# QA Final — Pilot Launch

Validação final e correção dos bloqueadores conhecidos. Sem novos módulos.

## Bloqueadores a corrigir agora

### 1. `src/pages/queues.tsx` — StatsBox hardcoded
Trocar os 4 stats (482 / 2m 14s / 18% / 42/50) por valores zerados + `DemoBadge` no header da seção, ou ocultar quando não houver fila real. Implementação: marcar visualmente cada StatsBox como demo (badge inline) já que as filas inteiras são demonstração.

### 2. CEO widgets com números fake
- `src/components/dashboard/ceo/oil-command-center.tsx`
- `src/components/dashboard/ceo/business-ai/health-score-widget.tsx`

Adicionar `DemoBadge` no header destes widgets para indicar claramente que são exibições de demonstração no piloto. Sem refatorar lógica.

### 3. Quick Launch — auditar rotas
Reabrir `src/hooks/core/use-quick-launch.ts` e confirmar:
- Toda ação aponta a rota existente em `src/routes/`.
- "Simular mensagem" só listada em `import.meta.env.DEV || MODE==='preview'`.

## Validação automatizada

- `bunx tsc --noEmit` deve passar.
- Smoke via Playwright (headless) cobrindo: login `/auth` → `/dashboard` → `/inbox` → `/customers` → `/crm` → `/reports`. Screenshot por etapa, verificar ausência de tela branca/console errors.

## Relatório final
Tabela por módulo com status (✅ / 🟡 / 🔴 / ⚠️), problema, correção, pendência.

## Fora de escopo
Novo CRUD de filas, refatoração CEO, mudanças de auth/RLS, novos dashboards.
