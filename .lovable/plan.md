## Plano A4 — Notificações avançadas

Escopo isolado. Não toca AI Studio (A1), Automação (A2), Developer/Webhooks (A3), Inbox, CRM, Campanhas, Marketplace, endpoint inbound, processor, queue_routing_rules, filas, núcleo omnichannel. Apenas leitura/integração mínima necessária.

### 1. Schemas reais (já existem)

- `notifications`: id, organization_id, user_id, type, title, message, payload jsonb, read_at, created_at. RLS por `user_id = auth.uid()`. Realtime já ligado. **Sem `archived_at`** — arquivar exige migration mínima.
- `user_notification_preferences`: id, user_id (UNIQUE), `inbox_messages`, `sla_alerts`, `crm_deals`, `business_ai_insights`, `system_alerts`, `marketing_campaigns`, `quiet_hours_start/end`, updated_at. RLS `auth.uid() = user_id`.

### 2. Migration mínima (única)

- `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS archived_at timestamptz`;
- Index `(user_id, archived_at) WHERE archived_at IS NULL`;
- GRANT já existe; manter políticas atuais (delete/update/select por user_id) — arquivar = UPDATE archived_at, coberto pela policy update_own.
- `user_notification_preferences`: garantir `GRANT SELECT, INSERT, UPDATE ON ... TO authenticated; GRANT ALL TO service_role;` e policies separadas (SELECT/INSERT/UPDATE escopadas por `auth.uid() = user_id`). Se já existir policy ALL, manter; só adicionar GRANT se faltar.

Sem tabela nova.

### 3. Rota e página

- `src/routes/notifications.tsx` (autenticada via layout pai existente? Hoje `_authenticated` não existe — rotas usam `dashboard.*`. Criar `src/routes/dashboard.notifications.tsx` para reaproveitar AppLayout e auth atual).
- Sidebar (`app-layout.tsx`): adicionar item "Notificações" apontando para `/dashboard/notifications`.

### 4. Componentes (`src/components/notifications/`)

- `notifications-center.tsx` — layout 2 colunas: lista + painel de preferências em tab/sheet.
- `notification-item.tsx` — card: badge tipo, título, mensagem, timeAgo, ações (marcar lida, arquivar, abrir entidade).
- `notification-filters.tsx` — filtros: tipo (select), status (all/unread/read/archived), período (24h/7d/30d/all), limpar.
- `notification-preferences-panel.tsx` — switches por categoria (mapeando tipos para flags existentes), quiet hours opcional (time inputs), salvar com toast.
- Empty/loading/error states reais.

### 5. Hooks (`src/hooks/notifications/`)

Expandir `use-notifications.ts` (preservar API atual usada pelo sino):
- adicionar `useNotificationsList({ type, status, fromIso, archived })` com filtros server-side;
- `useArchiveNotification`, `useUnarchiveNotification`, `useDeleteNotification`;
- manter `useNotifications()` (sino) intacto na assinatura — só excluir archived da lista do sino.
- novo `use-notification-preferences.ts` — `useNotificationPreferences()` (select/upsert), `useUpdatePreferences()` mutation com optimistic toast.

### 6. Mapeamento tipo → preferência

Helper `src/lib/notifications/type-map.ts`:
- `new_conversation`, `conversation_assigned`, `conversation_transferred` → `inbox_messages`
- `sla_risk`, `sla_breach` → `sla_alerts`
- `deal_created`, `deal_won`, `deal_lost` → `crm_deals`
- `campaign_status`, `campaign_completed` → `marketing_campaigns`
- `channel_error`, `system_alert` → `system_alerts`
- `ai_insight`, `ein_suggestion` → `business_ai_insights`
- fallback → `system_alerts`

UI de preferências usa esse mapa para mostrar labels claros. Documentar no relatório: leitura/escrita de preferências está pronta, mas a função `notify_conversation_event` no DB ainda não consulta preferências — esse gating será integração futura (não mexer no trigger nesta onda).

### 7. Navegação por payload

Função `resolveNotificationLink(n)`:
- `payload.conversation_id` → `/inbox` (rota atual; query string `?conversation=` se o inbox aceitar — verificar; senão só `/inbox`)
- `payload.contact_id` → `/customers`
- `payload.deal_id` → `/crm`
- `payload.campaign_id` → `/campaigns`
- `payload.channel_id` → `/admin/channels`
- `payload.queue_id` → `/queues`
- fallback: nenhum (não navegar).

Não criar query params novos no inbox/crm se quebrarem — só navegar para a rota base nesses casos e deixar TODO documentado no relatório (sem string "TODO" no código; comentário interno apenas se necessário, ou nota no relatório).

### 8. Sino existente

`notifications-bell.tsx`: preservar shape. Pequenos ajustes seguros:
- usar `resolveNotificationLink` para navegação correta por tipo (hoje só vai a `/inbox`);
- footer com "Ver todas" → `/dashboard/notifications`;
- não alterar contador / dropdown / layout.

### 9. Segurança/RLS

- Toda query passa pelo client browser com RLS já escopada por `user_id`.
- `organization_id` lido só para exibição; nunca como filtro de bypass.
- Payload sanitizado no render: reusar `maskSensitive` de `src/lib/developer/mask.ts` antes de exibir JSON cru em qualquer detalhe.
- Preferências: upsert escopado por `user_id = auth.uid()`.

### 10. Validação

- `bunx tsc --noEmit`;
- buscas globais: `Em breve`, `coming soon`, `não implementado`, `próxima sprint`, `TODO`, `onClick={() => {}}`, console.log;
- QA: abrir `/dashboard/notifications`, marcar 1 lida, marcar todas, arquivar, filtrar por tipo/status/período, abrir preferências, alterar e recarregar persistência, clicar notificação com `conversation_id` → vai pra Inbox, sino continua funcionando e levando para central via "Ver todas".

### 11. Riscos

- `archived_at` novo: trigger/criadores existentes não setam, ok (default null).
- Preferências ainda não bloqueiam criação no trigger DB — documentado.
- Rotas alvo (inbox/crm) não aceitam query param de seleção hoje; navegação cai na rota base nesses casos.

### 12. Arquivos previstos

Novos:
- migration única;
- `src/routes/dashboard.notifications.tsx`;
- `src/components/notifications/notifications-center.tsx`;
- `src/components/notifications/notification-item.tsx`;
- `src/components/notifications/notification-filters.tsx`;
- `src/components/notifications/notification-preferences-panel.tsx`;
- `src/hooks/notifications/use-notification-preferences.ts`;
- `src/lib/notifications/type-map.ts`;
- `src/lib/notifications/resolve-link.ts`.

Alterados:
- `src/hooks/notifications/use-notifications.ts` (novos hooks, API atual preservada);
- `src/components/notifications/notifications-bell.tsx` (link "Ver todas" + resolveLink);
- `src/components/layout/app-layout.tsx` (item de menu);
- `src/integrations/supabase/types.ts` (regenerado após migration).

Após aprovação: migration → hooks → componentes → rota → sidebar → ajuste sino → validação → relatório A4 e aguardo OK antes da Onda B.
