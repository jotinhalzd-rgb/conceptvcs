# UX Omnichannel — Parte 3 (limpeza final)

Limpar resíduos de mock, padronizar `DemoBadge`/`EmptyState`/condicionais. Sem novos módulos.

## 1. Customer 360 principal (`src/components/customer-360/customer-view.tsx`)
- Remover tags hardcoded ("VIP", "PAGADOR"). Renderizar apenas `contact.tags` reais.
- Bloco **IA Strategist**: só renderizar se `insights?.summary` ou `insights?.next_best_action` existir. Senão, `EmptyState` "Insights IA indisponíveis".
- **Saúde da Conta**: só se `contact.lead_score != null`.
- **Probabilidade de Fechamento**: só se `insights?.purchase_probability != null`.
- **Risco de Inadimplência "Nível Seguro"**: remover (hardcoded).
- **Timeline**: já condicional, manter; trocar empty inline por `EmptyState`.
- Quando `!contact`, manter empty mas usar componente `EmptyState`.
- Aplicar `DemoBadge` quando `isDemoRecord(contact)`.

## 2. Channel card (`src/components/channels/channel-card.tsx`)
- `DemoBadge` quando `channel.provider === 'development_simulator'` ou `is_demo`/`is_test`/`isDemoRecord`.
- Texto auxiliar "Canal de teste para demonstração. Não envia mensagens reais." nos canais demo.
- Estado "Canal não configurado" + ação Configurar quando `!is_active`.

## 3. Queues (`src/pages/queues.tsx`)
- StatsBox topo (482 / 2m 14s / 18% / 42/50) — números falsos. Trocar por valores neutros/zeros ou marcar como demo.
- Botão "Gerenciar" → `toast.info("Funcionalidade em preparação para o piloto. Esta fila é demonstrativa.")`.
- Botão `MoreVertical` → mesmo toast.

## 4. Dashboards secundários — varredura
Procurar mocks visíveis em `src/components/dashboard/**` e em pages restantes:
- `agent-dashboard.tsx`, `manager-dashboard.tsx`, `company-dashboard.tsx`, `ceo-dashboard.tsx` — qualquer array `mockData`/números fixos sem fonte. Trocar por `EmptyState` quando sem dado real.

## 5. QuickActionsBar
- Validar que a ação "Simular" só aparece em `import.meta.env.DEV` ou `MODE === 'preview'`. Senão, ocultar.

## 6. Onboarding checklist
- Revisão visual: garantir persistência localStorage, recolhimento ao concluir, responsivo. Sem mudanças se já OK.

## 7. Validação
- `bunx tsc --noEmit` deve passar.
- Smoke check via preview.

## Fora de escopo
Refatoração de hooks, mudanças em RLS/auth, novos módulos, novos dashboards.

## Entrega
Lista de arquivos editados + status do typecheck + pendências.
