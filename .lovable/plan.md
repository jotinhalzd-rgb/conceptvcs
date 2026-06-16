# Bloco 3.1 — Fechamento de Inbound + Filas Completas

Objetivo: fechar o coração omnichannel — endpoint inbound real + CRUD completo de filas (membros, assignment_mode, default) — sem tocar Campanhas/Relatórios.

## 1. Migration (idempotente)

Arquivo: `supabase/migrations/<ts>_bloco_3_1_inbound_queues.sql`

- `channels`: garantir `webhook_secret text` em `credentials` (jsonb já existe) — apenas validação no código.
- `queues`: garantir `assignment_mode text default 'manual' check in ('manual','auto')`, `is_default boolean default false`, `sla_minutes int`, `description text`, `is_active boolean default true` (se faltar).
- Trigger `enforce_single_default_queue`: ao inserir/atualizar `is_default=true`, zera as demais defaults da mesma `organization_id`.
- `queue_members`: garantir índice único `(queue_id, user_id)` para evitar duplicidade.
- Realtime: `queues`, `queue_members`, `queue_routing_rules` no `supabase_realtime` se faltar.
- GRANTs já existentes preservados; nenhum novo `public.*` criado.

## 2. Endpoint inbound público

Arquivo: `src/routes/api/public/channels.$channelId.inbound.ts` (TSS server route).

Payload aceito (POST JSON):
```
{
  sender_id?, phone?, email?, external_id?,
  sender_name?, text?, body?,
  media_url?, media_kind?,
  provider?, timestamp?, metadata?,
  verify_token?    // opcional, também aceito via header x-webhook-token
}
```

Fluxo:
1. Carrega `channels` pelo `channelId` (admin client, dentro do handler).
2. Se não existir / `is_active=false` → 404/410 JSON `{error}`.
3. Se `credentials.webhook_secret` existir → exigir match com header `x-webhook-token` ou `verify_token` no body; senão 401.
4. Se não houver `webhook_secret` e canal não estiver `is_demo` → retorna 202 com `status:'pending_configuration'` (não vaza nada).
5. Monta `WhatsAppMessage` (`from = phone||sender_id||external_id`, `to = channel.identifier`, `body = text||body`, type text/media).
6. Chama `processWhatsAppMessage(supabaseAdmin, msg, provider||'inbound_api')` — reusa todo roteamento já validado no Bloco 3.
7. Loga em `channel_webhooks_log` (payload sanitizado, resultado).
8. Resposta JSON: `{ ok:true, conversation_id, queue_id, routing_reason, assigned_agent_id, message_id }`.

CORS: `OPTIONS` 204 + `Access-Control-Allow-*` no POST.

## 3. UI — Aba Avançado do canal

`src/components/channels/channel-config-drawer.tsx`:
- Nova seção "Endpoint Inbound":
  - URL: `${window.location.origin}/api/public/channels/${channel.id}/inbound` + botão Copiar.
  - Token: input para gerar/editar `credentials.webhook_secret` (gera via `crypto.randomUUID()`); botão Copiar; mascarado por default com toggle olho.
  - Status pill: "Endpoint técnico ativo" / "Aguardando token" / "Aguardando credenciais do provider".
  - Texto curto: "Provider externo ainda exige credenciais reais."
- Botão "Testar endpoint" → abre painel com curl pronto + dispara fetch local para o próprio endpoint com payload `"quero falar com o financeiro"` e mostra a resposta JSON.

## 4. CRUD completo de filas

`src/hooks/queues/use-queues.ts` — adicionar `useUpdateQueue`, `useDeleteQueue`, `useSetDefaultQueue`, `useToggleQueueActive`. Todos invalidam `queues-with-stats`.

`src/components/queues/queue-edit-dialog.tsx` (novo): nome, descrição, departamento, prioridade (1-5), `sla_minutes`, `assignment_mode` (Select manual/auto), `is_default` (Switch), `is_active` (Switch), `max_capacity`. Submit → upsert.

`src/components/queues/queue-members-tab.tsx` (novo, dentro do edit dialog em tabs):
- Lista membros via join `queue_members` + `profiles` da org (usa `useOrgUsers`).
- Adicionar (Select de profiles que ainda não são membros) → `queue_members.insert`.
- Remover com confirm.
- Empty state útil.

`src/components/queues/queues-management.tsx`:
- `QueueCard`: badge `assignment_mode` (Manual/Auto) e badge `Padrão` quando `is_default`; click no Settings2 abre `QueueEditDialog`.
- Manter tabs Filas/Regras existentes.

## 5. Inbox/Customer 360/CRM

Sem alterações estruturais — já consomem `agent_id`, `queue_id`, `routing_reason`, notificações. Apenas verificar que `chat-list` exibe `routing_reason` quando presente (já implementado no Bloco 3).

## 6. QA

- `bunx tsc --noEmit`.
- `rg -n "Em breve|coming soon|não implementado|próxima sprint|TODO" src/` esperado vazio nos arquivos tocados.
- `rg -n "onClick=\{\(\) => \{\}\}|console\.log\(" src/components/queues src/components/channels src/routes/api/public` esperado vazio.
- Teste manual com curl no endpoint:
```
curl -X POST $URL/api/public/channels/$ID/inbound \
  -H 'content-type: application/json' \
  -H 'x-webhook-token: $TOKEN' \
  -d '{"phone":"+5511999999999","sender_name":"Teste","text":"quero falar com o financeiro"}'
```
- Resposta esperada: `queue_id` = Financeiro, `routing_reason` começa com `rule:`.

## 7. Ordem de execução

1. Migration (aprovação necessária).
2. Endpoint + CORS.
3. Hooks de fila (update/delete/setDefault/toggle).
4. UI: QueueEditDialog + QueueMembersTab + badges no card.
5. ChannelConfigDrawer aba Avançado (URL, token, testador).
6. QA (typecheck + greps + teste manual via curl/UI).
7. Relatório final.

Pergunta antes de executar: aprovar a migration (passo 1)?
