# ONDA 0C — Simulador Omnichannel DEV/PREVIEW

Objetivo: permitir validar o fluxo completo (canal → webhook → inbox → customer 360 → CRM) sem canal externo real, restrito a development/preview, invisível em produção, sem mocks enganosos (tudo marcado como DEMO).

---

## 1. Schema (migration única)

Adicionar flags de demo nas tabelas-alvo e provider simulado:

- `channels`: `is_demo boolean default false`, `is_test boolean default false`.
- `conversations`, `messages`, `internal_notes`, `contacts`, `deals`: `is_demo boolean default false`.
- Índices parciais `WHERE is_demo = true` em `conversations(organization_id)` e `messages(conversation_id)`.
- RLS já existente por `organization_id` continua valendo — sem novas policies amplas.

Sem novas tabelas — reaproveita o schema atual.

## 2. Seed do canal e conversas demo

Estender `src/lib/demo-seed.functions.ts` (server fn já protegido) com um passo `seedDemoOmnichannel`:

1. Upsert do canal `WhatsApp Demo — Simulado` na org `onecontact-demo-corp`:
   - `provider = 'development_simulator'`, `status = 'connected'`, `identifier = 'demo-sim-wa'`, `is_demo = true`, `is_test = true`, `credentials = {}`.
2. Upsert dos 3 contatos demo (Maria Oliveira, João Silva, Farmácia Central) com `is_demo = true`.
3. Upsert das 3 conversas demo (status/SLA conforme spec) ligadas ao canal e ao Atendente Demo.
4. Inserir mensagens demo idempotentes (chave: `provider_message_id = 'demo-<conv>-<n>'`): inbound do cliente + reply pública do atendente + 1 nota interna em `internal_notes`.

Chamado automaticamente ao logar como Atendente/Gerente/CEO Demo (já há gate por email demo no fluxo de login rápido).

## 3. Provider simulado

Criar `supabase/functions/_shared/providers/simulator.ts` implementando a mesma interface dos demais providers. `sendMessage` apenas devolve `{ sid: 'sim-' + crypto.randomUUID(), status: 'simulated_sent' }`, sem chamada externa.

Registrar em `send-message-v2/index.ts`:
```ts
providers['development_simulator'] = new SimulatorProvider();
```
Quando `channel.provider === 'development_simulator'`, gravar `messages.delivery_status = 'simulated_sent'` e `metadata.simulated = true`. Notas internas já estão isoladas (não tocam provider) — manter.

## 4. Webhook simulado (endpoint público controlado)

Novo server route `src/routes/api/public/sim-webhook.ts` (POST) com guard:
- Bloqueia se `process.env.NODE_ENV === 'production'` E `process.env.LOVABLE_ALLOW_SIM !== '1'` → 404.
- Validação Zod: `{ channelIdentifier, from, body, providerMessageId? }`.
- Reaproveita `_shared/providers/processor.ts` (mesmo caminho dos webhooks reais): normaliza payload → localiza canal por `identifier` → org → upsert contato → upsert conversa → insert message (idempotente por `provider_message_id`).
- Só aceita canais com `is_demo = true`.
- Retorna `{ ok, conversationId, messageId, deduped }`.

## 5. UI do simulador (apenas DEV/PREVIEW)

Gate via `import.meta.env.DEV || window.location.hostname.includes('lovable.app')` em helper `src/lib/dev-mode.ts` (já existe — reutilizar `isDevPreview()`).

Adicionar painel `SimulatorPanel` em `src/components/dev/developer-panel.tsx` (renderizado em `/settings/developer`):
- Select de conversa demo (ou "novo contato" com input de nome/telefone).
- Textarea da mensagem.
- Botão "Simular mensagem recebida" → POST `/api/public/sim-webhook`.
- Toast com resultado + invalida queries `conversations`, `messages`.
- Badge "DEMO / SIMULADO" visível.

Em `channels-view.tsx`, mostrar badge `DEMO` no card do canal simulado e botão atalho "Simular recebimento" (mesmo gate dev).

## 6. Marcação visual DEMO no Inbox / Customer 360

- `chat-list.tsx` e `chat-view.tsx`: se `conversation.is_demo`, badge âmbar `DEMO`.
- `customer-panel.tsx` (Customer 360): banner topo "Dados de demonstração" quando `contact.is_demo`.
- Sem números fake genéricos — só dados realmente vindos do seed.

## 7. Idempotência e logs

- Insert de `messages` usa `ON CONFLICT (channel_id, provider_message_id) DO NOTHING` (criar índice único parcial se ainda não existir).
- `processor.ts` retorna `deduped: true` quando conflito.
- Logs estruturados (`console.log(JSON.stringify({...}))`) em cada passo do processor para aparecer em `supabase--edge_function_logs`.

## 8. Segurança / produção

- Server route `/api/public/sim-webhook`: guard NODE_ENV + only `is_demo` channels + valida org_id do canal.
- `SimulatorPanel` e badges "DEMO" só renderizam sob `isDevPreview()`.
- Seed só roda para emails `@onecontact.dev`.
- RLS atual (`organization_id = current_user_org()`) continua sem alterações.

## 9. Teste final (manual, em Preview)

Roteiro dos passos 1–16 da spec executado após deploy: login Atendente Demo → Inbox carrega 3 conversas → abrir Maria → enviar pública (simulated_sent) → nota interna → refresh → assumir → transferir → encerrar → reabrir → criar tarefa → criar oportunidade → ver no Kanban → ver histórico no Customer 360.

---

## Arquivos a criar / alterar

**Criar**
- `supabase/migrations/<ts>_demo_flags_and_indexes.sql`
- `supabase/functions/_shared/providers/simulator.ts`
- `src/routes/api/public/sim-webhook.ts`
- `src/components/dev/simulator-panel.tsx`

**Alterar**
- `src/lib/demo-seed.functions.ts` (+ seedDemoOmnichannel)
- `supabase/functions/send-message-v2/index.ts` (registrar simulator + simulated_sent)
- `supabase/functions/_shared/providers/processor.ts` (idempotência + logs)
- `src/components/dev/developer-panel.tsx` (montar SimulatorPanel)
- `src/components/channels/channels-view.tsx` (badge DEMO + atalho)
- `src/components/inbox/components/chat-list.tsx` + `chat-view.tsx` (badge DEMO)
- `src/components/inbox/components/customer-panel.tsx` (banner DEMO)
- `src/lib/dev-mode.ts` (exportar `isDevPreview()` se faltar)

## Fora de escopo
- UX polish, Dashboards, integrações reais de WhatsApp/Email — ficam para ondas seguintes.
