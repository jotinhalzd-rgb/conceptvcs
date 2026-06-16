## Plano — Bloco 3: Filas, Roteamento e Inbound

Objetivo: fechar o coração omnichannel. Mensagem entra → roteia por keyword/intenção → cai na fila certa → atribui (auto/manual) → notifica → aparece no Inbox em realtime → segue para Customer 360 e CRM. Caso de aceite: "quero falar com o financeiro".

Preservar tudo do Bloco 1 (Marketplace↔Canais), E1 (Canais), Fase B (Inbox), Fase C (Customer 360), Fase D (CRM). Zero handler fake, zero "Em breve", zero tela morta.

---

### 1. Migration (única, idempotente)

- `queue_routing_rules`: garantir colunas `name text`, `keywords text[]`, `match_mode text default 'any'` (any/all/exact), `intent text`, `channel_id uuid null`, `target_queue_id uuid not null`, `is_fallback bool default false`, `priority int default 0`, `is_active bool default true`, `organization_id uuid not null`. Índice por `(organization_id, is_active, priority desc)`. RLS org-scoped + GRANT.
- `queues`: garantir `is_default bool default false`, `assignment_mode text default 'manual'` (manual|auto), `sla_minutes int`.
- `conversations`: garantir `routing_reason text` e índice por `(organization_id, queue_id, status)`.
- `channels`: garantir `default_queue_id uuid null` (FK queues).
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE` para `conversations`, `messages`, `notifications` se faltar.
- Seed demo: na org demo, garantir fila "Financeiro" + regra `keywords=['financeiro','financ']` → fila Financeiro, priority 100.

### 2. Server function — processor de roteamento

`src/lib/routing/route-message.functions.ts` (`createServerFn`, `requireSupabaseAuth`):
- Input: `{ channel_id, contact: {phone?, email?, name?}, text, external_id?, direction:'in' }`.
- Resolve `organization_id` via channel.
- Upsert `contacts` (match por phone/email + org).
- Roteamento:
  1. Carrega `queue_routing_rules` ativas da org ordenadas por `priority desc`.
  2. Normaliza texto (lowercase, remove acentos). Match por `keywords` (any/all) e/ou `channel_id`.
  3. Primeira regra que casa → `target_queue_id`, `routing_reason = 'rule:<name>'`.
  4. Sem match → `channels.default_queue_id` → `routing_reason='channel_default'`.
  5. Fallback → regra `is_fallback=true` → `routing_reason='fallback'`.
- Cria/reutiliza `conversations` aberta para o contato+canal. Grava `queue_id`, `routing_reason`, `channel_id`.
- Se `queues.assignment_mode='auto'`: escolhe membro ativo com menor carga (`conversations` abertas) e grava `agent_id`. Manual → `agent_id=null`.
- Insere `messages` (inbound). Trigger existente `notify_conversation_event` gera notificações.
- Retorna `{ conversation_id, queue_id, agent_id, routing_reason }`.

Reaproveitado por: simulador, inbound público, futuros webhooks reais.

### 3. Inbound público mínimo

Rota `src/routes/api/public/channels/$channelId/inbound.ts` (POST):
- Valida `webhook_secret` em `channels.credentials.webhook_secret` (se setado). Sem secret → 401 com mensagem clara; canal fica `pending_configuration`.
- Loga em `channel_webhooks_log`.
- Chama processor via `supabaseAdmin` (carregado dentro do handler).
- Retorna 200 `{ ok, conversation_id }`.

### 4. UI Filas — CRUD completo

`src/components/queues/queues-management.tsx` (validar/completar):
- Form criar/editar: nome, setor, descrição, SLA, prioridade, `assignment_mode`, `is_default`, `is_active`.
- Ação arquivar (`is_active=false`) com `AlertDialog`.
- Tab "Membros": adicionar/remover via `useOrgUsers`, impedir duplicidade (unique `queue_id+user_id`).
- Tab "Regras de roteamento": novo componente `routing-rules-tab.tsx` (CRUD `queue_routing_rules`): nome, keywords (chips), match_mode, intent, canal (select de `channels`), fila destino, prioridade, fallback, ativar/desativar, excluir com confirm.
- Hook `src/hooks/queues/use-routing-rules.ts` com list/upsert/toggle/delete + invalidação.

### 5. Simulador setorizado

`src/components/dev/simulator-panel.tsx`:
- Select de canal (real, da org), input texto, botão Enviar.
- Chama o mesmo `routeMessage` server fn (direction='in', is_demo=true).
- Mostra resultado: fila escolhida, `routing_reason`, agent atribuído, link "Abrir no Inbox".
- Edge function `sim-webhook` redireciona ao mesmo helper (consolidação).

### 6. Integração Canais

- `ChannelConfigDrawer`: aba "Roteamento" já tem default queue — garantir persistência em `channels.default_queue_id` (coluna real) além de `settings.default_queue_id` para compat.
- Canal `pending_configuration` continua aceitando inbound de simulador (flag demo) mas marca conversation com aviso.

### 7. Integração Inbox

Verificar `inbox-view.tsx` / `chat-list.tsx`:
- Exibe `queue.name`, `channel.name`, `agent.full_name`, `status`, badge `routing_reason`.
- Ação "Assumir" (set `agent_id=auth.uid()`), "Transferir fila", "Resposta", "Nota interna" — tudo já existe; só validar.
- Realtime nas listas já configurado; adicionar canal `conversations` se faltar.

### 8. Notificações

- Trigger `notify_conversation_event` já cobre new_conversation/assigned/transferred. Validar que sino atualiza (`useNotifications` realtime) e clique navega `/inbox?conversation=<id>`.

### 9. QA final

1. `bunx tsc --noEmit`.
2. `rg -n "Em breve|coming soon|não implementado|próxima sprint|TODO:" src` → 0.
3. `rg -n "onClick=\{\(\) => \{\}\}|onClick=\{\(\) => null\}" src` → 0.
4. `rg -n "console\.log" src/components src/hooks` → revisar.
5. Teste manual: criar fila Financeiro + regra → simular "quero falar com o financeiro" → conferir queue_id, routing_reason, notification, Inbox, assumir, responder, nota, Customer 360, criar deal CRM.

### 10. Relatório final

Arquivos alterados, migration, novas funções/hooks/componentes, shape de `queue_routing_rules`, comportamento do processor, inbound, distribuição auto, roteiro de teste do "financeiro", typecheck/build, buscas, riscos.

---

### Ordem de execução

1. Migration (passo 1) — pedir aprovação.
2. Processor + inbound (passos 2–3).
3. UI Filas/Membros/Regras (passo 4).
4. Simulador + integração canais/inbox/notificações (passos 5–8).
5. QA + relatório (passos 9–10).

Confirma para eu executar a migration do passo 1?
