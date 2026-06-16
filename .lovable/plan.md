## BLOCO 5 — Relatórios + CSV com dados reais

Objetivo: substituir o `src/routes/reports.tsx` atual (3 queries simples, sem filtros, sem CSV) por um módulo completo de Relatórios com métricas reais do núcleo omnichannel, filtros globais que afetam cards/tabelas/exportação, e exportação CSV respeitando os filtros. Zero mock, zero invenção de métrica, empty states honestos quando faltar dado.

### 1. Estrutura de arquivos

**Criar:**
- `src/hooks/reports/use-report-filters.ts` — estado dos filtros via URL search params (`validateSearch` + `zodValidator` + `fallback`)
- `src/hooks/reports/use-conversation-metrics.ts` — agregados de conversas/mensagens/SLA
- `src/hooks/reports/use-queue-metrics.ts` — volume por fila, routing_reason, manual vs auto
- `src/hooks/reports/use-crm-metrics.ts` — deals por status/etapa/responsável/valor
- `src/hooks/reports/use-campaign-metrics.ts` — campanhas por status, recipients, events
- `src/hooks/reports/use-channel-metrics.ts` — volume por canal
- `src/lib/reports/csv.ts` — `toCSV(rows, headers)`, `downloadCSV(filename, csv)` (escape com aspas duplas, BOM UTF-8)
- `src/lib/reports/filters.ts` — `applyConversationFilters(query, filters)`, `applyDealFilters`, `applyCampaignFilters`
- `src/components/reports/report-filters-bar.tsx` — período (data início/fim), canal, fila, atendente, status conversa, status CRM, status campanha, botão "Limpar"
- `src/components/reports/report-kpi-card.tsx` — card KPI reutilizável
- `src/components/reports/conversations-report.tsx` — aba conversas + CSV
- `src/components/reports/queues-report.tsx` — aba filas/roteamento + CSV
- `src/components/reports/sla-report.tsx` — aba SLA com cálculo real ou "indisponível" honesto
- `src/components/reports/crm-report.tsx` — aba CRM + CSV
- `src/components/reports/campaigns-report.tsx` — aba campanhas + CSV
- `src/components/reports/reports-view.tsx` — layout principal com `Tabs` (Atendimento, Filas, SLA, CRM, Campanhas)

**Editar:**
- `src/routes/reports.tsx` — `validateSearch` + montagem do `ReportsView` (preservar `SmartBackButton` e header existentes)

### 2. Filtros (URL search params)

```ts
{
  from?: string (ISO), to?: string (ISO),
  channelId?: string, queueId?: string, agentId?: string,
  convStatus?: string, dealStatus?: string, campaignStatus?: string
}
```
Default período = últimos 14 dias. `useReportFilters()` retorna filters + `setFilter`/`clear` via `useNavigate`. Todos os hooks de métrica recebem `filters` e incluem no `queryKey`.

### 3. Métricas implementadas (todas com dados reais)

**Atendimento:** total conversas, abertas, pendentes, resolvidas/fechadas, sem responsável, mensagens recebidas (`direction='inbound'`), enviadas (`direction='outbound'`), breakdown por status/canal/fila/atendente, volume diário (LineChart existente).

**Filas/Routing:** volume por fila (join `conversations.queue_id → queues.name`), top filas, `routing_reason` agregado, conversas em `queue.is_default`, manual (`agent_id is null` no insert) vs auto, aguardando atribuição.

**SLA:** dentro/fora (`sla_due_at` vs `closed_at`/`now()`), TMR (`first_response_at - waiting_since`) quando ambos existirem, conversas abertas há mais tempo (ordem por `created_at`). Se campo ausente → card "Indisponível: requer X".

**CRM:** total deals, abertos/ganhos/perdidos, valor total, valor por etapa (já existe), por responsável (`assigned_to`), originadas do omnichannel (`deals.contact_id` com `conversations` existentes).

**Campanhas:** total, breakdown por status (draft/scheduled/pending_configuration/ready/completed/archived/error), `estimated_recipients` somado, `campaign_recipients` count, `campaign_events` recentes. Aberturas/cliques = 0 com tooltip "Disponível quando provider externo conectado".

### 4. Exportação CSV

`downloadCSV(filename, rows, headers)`:
- gera CSV com BOM UTF-8 (Excel), escape de `"`, `,`, newlines
- filename: `relatorio-<aba>-<YYYYMMDD>.csv`
- usa os mesmos dados já filtrados na view (não refaz query)
- `toast.success` ou `toast.error` real, com `try/catch`

Botão "Exportar CSV" em cada aba. Disabled quando array vazio + tooltip "Sem dados para exportar".

### 5. Empty states

`EmptyState` (componente existente) quando query retorna `[]`:
- título: "Sem dados no período/filtro selecionado"
- ações reais: "Limpar filtros", "Abrir Inbox", "Configurar canal", "Ir para Campanhas", "Ir para CRM" (`useNavigate`)

### 6. Performance / Query

- `useQuery` por aba, `enabled` baseado em aba ativa
- `select` apenas colunas usadas, `head:true` + `count:'exact'` para totais
- `staleTime: 30_000`
- invalidação via key estável incluindo filters

### 7. Preservação (não tocar)

Marketplace/Canais/Inbound/Webhook/Filas/Routing/Processor/Inbox/Customer 360/CRM/Campanhas/notificações/SLA helpers/simulador/login demo/5 perfis/RLS multiempresa. RLS atual já é org-scoped via `current_user_organization_id()` — sem migration necessária.

### 8. Validação

- `bunx tsc --noEmit`
- `rg "Em breve|coming soon|não implementado|próxima sprint|TODO" src/components/reports src/hooks/reports src/lib/reports src/routes/reports.tsx`
- `rg "onClick=\{\(\) => \{\}\}" src/components/reports`
- `rg "console\.log" src/components/reports src/hooks/reports`
- Teste manual dos 16 passos do brief
- Testar CSV abrindo no Excel (BOM correto, acentos OK)

### 9. Ordem de execução

1. `csv.ts` + `filters.ts` + `use-report-filters.ts`
2. Hooks de métrica (5 arquivos, paralelo)
3. `report-filters-bar.tsx` + `report-kpi-card.tsx`
4. 5 componentes de aba
5. `reports-view.tsx` + edit `routes/reports.tsx`
6. Typecheck + buscas proibidas
7. Relatório final + aguardar validação (sem iniciar módulos avançados)

### 10. Sem migration

Todas as colunas necessárias já existem (`conversations.sla_due_at/first_response_at/waiting_since/closed_at/routing_reason/queue_id/agent_id/channel_id/status`, `messages.direction`, `deals.*`, `campaigns.*`, `campaign_recipients.*`, `campaign_events.*`). Se faltar coluna durante implementação → degradar para "Indisponível" honesto, não criar migration neste bloco.
