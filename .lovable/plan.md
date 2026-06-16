# Plano — Prompt 1/3: Núcleo Operacional do OneContact OS

Consolidar 9 módulos preservando tudo de Fase 0. Estratégia: **mapear gaps → preencher com mutations reais → validar fluxo "financeiro" end-to-end**.

## Fase A — Auditoria por módulo (1 round)

Antes de codar, abrir cada hook/componente e listar o que falta. Critério: cada botão visível → ação real (mutation Supabase, modal de configuração, ou nav). Documentar gaps no `.lovable/plan.md` como subseções.

Arquivos-âncora:
- Inbox: `chat-view.tsx`, `chat-list.tsx`, `use-conversation-actions.ts`, `use-send-message.ts`
- Customer 360: `customer-view.tsx`, `contact-form.tsx`, `use-customer-360.ts`
- CRM: `crm-view.tsx`, `deal-form.tsx`, `kanban/`, `use-deals.ts`
- Canais: `channels-view.tsx`, `channel-card.tsx`, `connect-modal.tsx`, `use-channels.ts`
- Campanhas: `campaigns-view.tsx`, `campaign-wizard.tsx`, `use-campaigns.ts`
- Filas: `queues-management.tsx`, `use-queues.ts`, `routing_rules`
- Relatórios: `routes/reports.tsx` (criar componente real)

## Fase B — Inbox (prioridade máxima)

1. **Bucket** `message-attachments` já existe (privado). Adicionar RLS em `storage.objects` por `organization_id` via migration.
2. **Anexo**: input `<input type="file">` em `chat-view.tsx` → upload via `supabase.storage.from('message-attachments').upload(...)` → enviar `message` com `type='image'|'document'` + `metadata.attachment_url`.
3. **Áudio**: `MediaRecorder` → mesmo bucket → `type='audio'`.
4. **Emoji**: popover leve com lista estática (sem dep nova).
5. **Nota interna**: mutation em `internal_notes` (tabela existe).
6. **Assumir/Transferir/Encerrar/Atribuir**: validar/ligar mutations já em `use-conversation-actions.ts`. Encerrar com `ConfirmDialog`.
7. **Status**: dropdown que dispara `updateConversationStatus`.
8. **Histórico de eventos**: ler `conversation_audit` (existe).
9. **Realtime**: validar canal já criado em `useConversations`/`useMessages`.

## Fase C — Customer 360

1. `customer-view.tsx` lê `useCustomer360` → mostrar conversas, notas, eventos (`customer_events_unified`), oportunidades (`deals` por `contact_id`), fila/responsável da última conversa.
2. Ações:
   - **Editar dados**: dialog com `contact-form` → mutation `contacts` update.
   - **Adicionar nota**: textarea inline → `internal_notes`.
   - **Criar oportunidade**: dialog reaproveitando `DealForm` pré-preenchido com `contact_id`.
   - **Voltar para Inbox/CRM**: navigate.

## Fase D — CRM

1. CRUD completo (criar/editar/excluir) via `DealForm` + `ConfirmDialog`.
2. Kanban: garantir mutation `update stage_id` no drag-drop.
3. Filtros (status, pipeline, responsável, valor, data) no `useDeals` queryKey.
4. **Origem omnichannel**: badge baseado em `deals.metadata.source_conversation_id`.
5. Exportar CSV (gera de memória).

## Fase E — Canais

1. `channels-view.tsx` lista de `channels`.
2. `connect-modal.tsx`: campos por provider (whatsapp_meta, twilio, evolution, 360dialog, webchat, simulator) — salva em `channels.config`/`credentials`.
3. Status real: `is_active` + badge "Pendente de configuração" quando faltar credencial obrigatória.
4. **Testar**: para simulator → chama `sim-webhook`; para outros → POST `channels.test` placeholder com retorno explicativo.
5. Toggle ativar/desativar via mutation.

## Fase F — Relatórios (NOVO)

Criar `src/components/reports/reports-view.tsx` ligado em `/reports`:
- Cards de volume por fila (group by `queue_id` em `conversations`).
- Volume por atendente (`agent_id`).
- SLA: % atendidas dentro de `sla_due_at`.
- Conversas por status.
- Oportunidades CRM por estágio + valor total.
- Evolução temporal: 30 dias (recharts já no projeto).
- Filtros: período, fila, atendente, canal.
- Exportar CSV.

Hook: `src/hooks/reports/use-reports.ts` com queries agregadas.

## Fase G — Campanhas

1. CRUD em `campaigns` (table existe).
2. Wizard salva real (não só rascunho local).
3. Segmentação: query a `contacts` por filtros (tags, lead_score).
4. Status mutation (draft/scheduled/active/paused/done).
5. Métricas: ler `campaign_analytics` ou EmptyState.
6. Disparo real → badge `pending_configuration` (provedor externo).

## Fase H — Filas + Roteamento

1. CRUD completo de `queues` + `queue_members`.
2. Editar `sla_minutes`, `assignment_mode`, `is_default`.
3. CRUD de `routing_rules` (intenção/setor → queue_id).
4. Simulador setorizado (já existe `simulator-panel`): garantir que aplica rota e exibe `routing_reason`.
5. Distribuição automática: trigger Postgres existente? Validar com query → senão, criar função no `use-conversation-actions` que aplica `agent_id` por round-robin em modo `auto`.

## Fase I — Fluxo comercial guiado

Validação end-to-end (Playwright + manual):
1. Simulator → enviar "quero falar com o financeiro" → cai em fila Financeiro com `routing_reason`.
2. Sino notifica → atendente assume → responde → nota interna.
3. Customer 360 mostra conversa + nota.
4. Criar oportunidade → aparece no CRM Kanban.
5. Relatórios refletem novo deal e SLA.

## Fase J — Qualidade

- `bunx tsc --noEmit` + `bun run build`
- `rg -ni "em breve|coming soon|não implementado|próxima sprint"` → vazio
- `rg -n "onClick=\{\(\) => \{\}\}"` → vazio
- `rg -n "console\.log\(" src/components/**/onClick` → vazio
- `supabase--linter`
- QA manual 5 perfis.

## Migrations previstas

- `storage.objects` RLS para `message-attachments` por org.
- `routing_rules` se faltar coluna `intent_keywords` / `target_queue_id`.
- (talvez) `deals.metadata` se ainda não existir column jsonb — já existe via padrão.

Tabelas já existentes serão reaproveitadas: `internal_notes`, `conversation_audit`, `customer_events_unified`, `deals`, `contacts`, `campaigns`, `campaign_analytics`, `queues`, `queue_members`, `routing_rules`, `channels`, `notifications`.

## Ordem de execução

A → B → H (filas/roteamento, garante fluxo) → C → D → I (validar fluxo) → E → G → F → J.

## Fora de escopo

Integração real com WhatsApp Cloud, Twilio, Stripe, e-mail SMTP — todos ficam como `pending_configuration` com modal explicativo.

## Riscos

- Storage RLS — testar uploads antes de declarar OK.
- Realtime já funcionando — não tocar policies existentes.
- Roteamento automático: se trigger SQL faltar, fazer no client (atomicidade limitada, aceitável para piloto).

## Relatório final entregará

arquivos alterados · migrations · features por módulo · roteiro de teste "financeiro" · status typecheck/build · pendências externas.
