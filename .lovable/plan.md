## BLOCO 4 — Campanhas CRUD Real

Objetivo: completar Campanhas com CRUD real, segmentação real, status persistente e integração segura com Canais. Sem fake, sem botão morto, sem esconder funcionalidade.

### 1. Banco de dados (migration única)

Estender `public.campaigns` com colunas faltantes (idempotentes):
- `organization_id uuid` (preencher via trigger/profile), `created_by uuid`, `assigned_to uuid`
- `channel_id uuid references channels(id)`, `description text`, `message_content text`, `variables jsonb`, `segment_filters jsonb`, `estimated_recipients int`, `scheduled_at timestamptz`, `archived_at timestamptz`, `error_message text`
- Ampliar CHECK de `status` para: `draft|scheduled|pending_configuration|ready|paused|completed|archived|error`
- Substituir policy permissiva por RLS org-scoped via `current_user_organization_id()` (sem recursão)
- GRANTs já existem; reforçar `GRANT SELECT,INSERT,UPDATE,DELETE` para authenticated

Novas tabelas (com GRANTs + RLS org-scoped):
- `campaign_recipients (id, campaign_id, contact_id, organization_id, status, error, sent_at, created_at)`
- `campaign_events (id, campaign_id, organization_id, event_type, payload jsonb, created_at)` (para futuro Relatórios)

Triggers: `updated_at`, set `organization_id` default = `current_user_organization_id()`.

`campaign_analytics` já existe — preservar.

### 2. Hooks (`src/hooks/campaigns/`)

Expandir `use-campaigns.ts`:
- `useCampaigns(filters)` — lista com filtros: search, status, channel_id, assigned_to, período
- `useCampaign(id)` — detalhe
- `useCreateCampaign`, `useUpdateCampaign`, `useDuplicateCampaign`, `useArchiveCampaign`, `useDeleteCampaign`
- `useChangeCampaignStatus` — valida transições
- `useEstimateRecipients(filters)` — conta `contacts` reais por filtros (tag, channel origin, status, owner, created_at, busca)
- `useCampaignStats()` — agregados por status

Todos invalidam queries corretamente.

### 3. Componentes (`src/components/campaigns/`)

Reescrever `campaigns-view.tsx` para usar hooks reais + estado de filtros (URL search params):
- Barra de filtros real (status, canal, responsável, período, busca, limpar)
- Cards com status badges reais, estimativa de recipients, canal, última atualização
- Métricas no topo: total por status (real, via `useCampaignStats`)
- EmptyState: sem campanhas → "Criar"; sem resultados de filtro → "Limpar"
- Menu por card: Editar / Duplicar / Pausar / Retomar / Arquivar / Excluir (AlertDialog)

Novo `campaign-editor-drawer.tsx`:
- Tabs: Conteúdo | Público | Canal | Agendamento
- Conteúdo: nome, descrição, mensagem (textarea), variáveis (`{{nome}}`), preview, validação vazio
- Público: filtros reais (tags, status, responsável, busca) + contagem ao vivo via `useEstimateRecipients`; se 0 contatos → CTA "Abrir Contatos" (link para `/customers`)
- Canal: select de `channels` com status; bloqueia disparo se `disconnected`; se `pending_configuration` salva como `pending_configuration` com aviso útil; se `connected`/`configured` permite `ready`/`scheduled`
- Agendamento: datetime opcional; botões "Salvar rascunho" / "Agendar" / "Marcar como pronta"
- Validações antes de mudar status: canal + segmento + conteúdo
- Sem disparo externo real nesta fase: status reflete preparação; registra tentativa em `campaign_events`

Remover `campaign-manager.tsx` legado se não usado, ou apontá-lo para os novos hooks (preservar rota se houver).

### 4. Integração com Canais

Reaproveita `useChannels` existente. Helper `canChannelDispatch(channel)`:
- `disconnected` → bloqueia (`error_message` explicativo)
- `pending_configuration` → permite salvar mas força status `pending_configuration`
- `connected`/`configured` → libera `ready`/`scheduled`

### 5. Métricas

- Recipients estimados: `count(contacts)` por filtros — real
- Aberturas/cliques/respostas: ficam 0 com tooltip "Disponível quando provider externo estiver conectado" — sem fake

### 6. Validação

- `bunx tsc --noEmit`
- `rg "Em breve|coming soon|não implementado|próxima sprint|TODO" src/components/campaigns src/hooks/campaigns`
- `rg "onClick={\(\) => {}}" src/components/campaigns`
- Teste manual roteiro de 15 passos do brief

### Arquivos a criar/editar

- **Migration**: `supabase/migrations/<ts>_campaigns_bloco4.sql`
- **Criar**: `src/components/campaigns/campaign-editor-drawer.tsx`, `src/components/campaigns/campaign-filters.tsx`, `src/components/campaigns/campaign-card.tsx`, `src/hooks/campaigns/use-campaign-mutations.ts`, `src/hooks/campaigns/use-campaign-recipients.ts`, `src/hooks/campaigns/use-campaign-stats.ts`
- **Editar**: `src/hooks/campaigns/use-campaigns.ts`, `src/components/campaigns/campaigns-view.tsx`, `src/services/campaigns/campaign-service.ts` (alinhar à nova schema ou marcar como legacy interno)

### Preservação (não tocar)

Marketplace↔Canais, Canais E1, endpoint inbound, Filas/Routing/Processor, Inbox, Customer 360, CRM, notificações, SLA, simulador, login demo, RLS multiempresa.

### Ordem de execução

1. Migration (aprovação) → regen types
2. Hooks + helpers
3. Drawer + filters + card
4. Reescrita do view + rota preservada
5. Typecheck + buscas proibidas
6. Relatório final + pedido de validação (sem iniciar Relatórios)
