
# Fase E1 — Canais / Integrações por provider

Objetivo: transformar a Central de Canais em algo configurável de verdade, com persistência real, status confiável e vínculo com filas / Inbox / Marketplace — sem quebrar Fase 0, B, C, D.

## 1. Estrutura de dados (sem migration pesada)

A tabela `public.channels` já tem tudo necessário:
- `provider`, `name`, `identifier`, `credentials jsonb`, `settings jsonb`, `status`, `is_active`, `last_sync_at`, `error_log`, `organization_id` (com RLS por `current_user_org()` + `is_org_admin()` para writes).

Decisões:
- `settings.default_queue_id` → fila padrão.
- `settings.channel_type` → `whatsapp | instagram | facebook | email | webchat | voice`.
- `settings.config` → campos não-secretos por provider (page_id, smtp_host, allowed_domain, etc.).
- `credentials` → apenas segredos (access_token, api_key, smtp_pass...). Continua só em jsonb (vault não existe no projeto); UI nunca re-exibe valor salvo, só indica "configurado".
- Status padrão: `disconnected | pending_configuration | configured | connected | error`. Vou normalizar `status` em código (sem migration) e manter compat com `offline/online` legados via mapping.

Sem migration nova — toda persistência é via `channels` existente. Se durante a implementação aparecer falta real (ex.: vincular `hub_installs_marketplace.channel_id`), abro migration mínima e separada.

## 2. Hooks (`src/hooks/channels/`)

- Estender `use-channels.ts`:
  - `useChannels()` mantido.
  - `useUpsertChannel()` — insert/update com `organization_id` resolvido por profile; recebe `{ id?, channel_type, provider, name, identifier?, settings, credentials, default_queue_id, status }`.
  - `useDeleteChannel()` — soft via `status='disconnected'` + `is_active=false` (preserva FK com `conversations`).
  - `useTestChannel()` — valida campos mínimos por provider e atualiza `status` + `last_sync_at` + `error_log`. Sem chamada externa real (não fingir): testes locais de schema/regex + ping HTTP só onde for seguro (ex.: HEAD em SMTP host? não — fica como validação local).
- Novo `use-channel-providers.ts` — fonte única de catálogo (icon, label, channel_type, campos visíveis, campos secretos, validators zod).

## 3. Catálogo de providers

`src/lib/channels/providers.ts` (puro, sem IO):

```text
whatsapp.meta_cloud   → phone_number_id, business_account_id, verify_token | secret: access_token
whatsapp.twilio       → from_number, account_sid | secret: auth_token
whatsapp.360dialog    | secret: api_key
whatsapp.evolution    → base_url, instance | secret: api_key
instagram.meta        → page_id, ig_user_id | secret: access_token
facebook.messenger    → page_id | secret: page_access_token, app_secret
email.smtp            → from_email, from_name, host, port, username, secure | secret: password
email.api (resend/ses) → from_email, from_name, region? | secret: api_key
webchat.native        → widget_name, allowed_domain, theme_color (snippet derivado do id)
voice.generic         → provider_name, phone_number  (marca dependência externa em texto)
```

Cada entrada exporta um `zodSchema` para validação cliente + server-side feedback.

## 4. UI — Central de Canais

`src/components/channels/`:

- `channels-view.tsx` — adiciona filtro por status + tipo, ações reais nos cards.
- `channel-card.tsx` — passa a mostrar:
  - status mapeado (`pending_configuration`, etc.) com cor/badge,
  - botão principal contextual: `Configurar` (pending), `Reconfigurar` (configured), `Testar` (connected/configured), `Desconectar` (active).
  - Abre `ChannelConfigDrawer` com o canal preenchido.
- `connect-modal.tsx` → reescrever como `channel-picker-modal.tsx` (escolhe channel_type + provider) → abre o drawer.
- Novo `channel-config-drawer.tsx` — `Sheet` lateral com:
  - cabeçalho: provider + status,
  - tabs: **Configuração**, **Credenciais**, **Roteamento**, **Avançado** (snippet/webhook URL/desconectar),
  - render dinâmico baseado em `providers.ts`,
  - select de `default_queue_id` (usa hook existente `useQueues`),
  - botão `Testar conexão` (chama `useTestChannel`),
  - botão `Salvar` (chama `useUpsertChannel`),
  - botão `Desconectar` com `AlertDialog`.
- Para Webchat, snippet copiável `<script src=".../widget.js" data-channel="{id}">`.

## 5. Lógica de status

Helper `computeChannelStatus(provider, settings, credentials)`:
- Faltam campos obrigatórios → `pending_configuration`.
- Tudo presente, sem teste → `configured`.
- Após `useTestChannel` ok → `connected` + `last_sync_at = now()`.
- Erro → `error` + `error_log`.
- Desconectar → `disconnected` + `is_active=false`.

Sem chamadas externas que finjam sucesso. Texto explícito no card quando aguardando credenciais.

## 6. Integração Marketplace ↔ Canais

- Em `src/pages/settings.marketplace.tsx`: instalar item de canal cria/atualiza linha em `channels` com `status='pending_configuration'` e `settings.marketplace_install_id`.
- Card do Marketplace passa a refletir status real consultando `channels` por `marketplace_install_id` (sem duplicar).
- Botão "Configurar" no Marketplace abre o mesmo `ChannelConfigDrawer`.

## 7. Integração com Inbox / filas

- Garantir que `conversations.channel_id` continua aceitando os canais novos (FK já existe).
- `default_queue_id` salvo em `settings` é consumido pelo edge function `send-message-v2` / roteador já existente apenas como hint — sem alterar o roteamento atual nesta fase para não regredir.

## 8. Preservação (não quebrar)

- Não tocar em: Inbox (Fase B), Customer 360 (Fase C), CRM (Fase D), AI Studio, sidebar, login demo, perfis, dashboard por role, simulador setorizado, notificações, SLA.
- `notify_conversation_event` e demais triggers permanecem intocados.
- Sem mudança de RLS.

## 9. QA final

- `bunx tsc --noEmit`.
- `rg -n "Em breve|coming soon|não implementado|próxima sprint"` em `src/` → 0.
- `rg -n "onClick=\\{\\(\\) => \\{\\}\\}"` → 0.
- `rg -n "onClick=\\{\\(\\) => console\\.log"` → 0.
- Teste manual: criar WhatsApp Meta sem token → vira `pending_configuration`; preencher → `configured`; testar → `connected`; desconectar → some da lista ativa, conversas antigas preservadas; Webchat com snippet copiável; Marketplace install reflete em Canais.

## Arquivos previstos

Novos:
- `src/lib/channels/providers.ts`
- `src/lib/channels/status.ts`
- `src/components/channels/channel-config-drawer.tsx`
- `src/components/channels/channel-picker-modal.tsx`
- `src/components/channels/provider-fields.tsx`

Alterados:
- `src/components/channels/channels-view.tsx`
- `src/components/channels/channel-card.tsx`
- `src/components/channels/connect-modal.tsx` (vira wrapper do picker para preservar imports)
- `src/components/channels/webchat-config.tsx` (passa a render dentro do drawer)
- `src/hooks/channels/use-channels.ts`
- `src/pages/settings.marketplace.tsx` (vínculo install→channel)

Sem migration nesta fase, salvo se durante implementação algo se mostrar tecnicamente necessário — nesse caso, migration mínima isolada com GRANTs e RLS por `organization_id`.

Confirma para eu executar?
