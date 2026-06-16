# Plano A3 — Developer / Webhooks / Logs + API Keys

Escopo isolado. **Não tocar** AI Studio (A1), Automação (A2), Inbox, CRM, Campanhas, Relatórios. Endpoint inbound só recebe pequena adição de logs de falha — sem mudar o fluxo de roteamento/processor.

## 1. Schemas reais

- `channels` ✓ (id, organization_id, provider, identifier, credentials jsonb com `webhook_secret`, is_active, last_sync_at, status).
- `channel_webhooks_log` ✓ (id, channel_id, provider, payload jsonb, status, error_message, processed_at). **Falta `organization_id`** e índices úteis. Inbound atual já tenta inserir `organization_id` via `as any` — não persiste hoje.
- `api_keys` ✓ (id, organization_id, name, key_prefix, key_hash, scopes[], expires_at, last_used_at, created_at). **Sem coluna de status** — revogação = DELETE, “revogar” via expires_at no passado também aceitável.

## 2. Migration mínima

Única migration:

- `ALTER TABLE channel_webhooks_log ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE`;
- `ADD COLUMN IF NOT EXISTS metadata jsonb`;
- Backfill `organization_id` via join com `channels`;
- Index `(organization_id, processed_at desc)` e `(channel_id, processed_at desc)`;
- GRANT SELECT/INSERT a `authenticated`, ALL a `service_role`;
- RLS: policies SELECT/INSERT por `organization_id = current_user_organization_id()`, não recursiva. Drop policy antiga.
- `api_keys`: garantir `GRANT SELECT, INSERT, DELETE ON public.api_keys TO authenticated; GRANT ALL TO service_role;` + RLS por `organization_id = current_user_organization_id()` (SELECT/INSERT/DELETE/UPDATE). Drop policies antigas se conflitarem.

Nada de tabela nova.

## 3. Endpoint inbound (mínima alteração)

Em `src/routes/api/public/channels.$channelId.inbound.ts`:

- Função helper local `logInbound(channel_id, organization_id|null, provider, payload_masked, status, error_message?)` que faz insert em `channel_webhooks_log` com **payload mascarado** (remove `webhook_secret`, `x-webhook-token`, `Authorization`, `access_token`, `api_key`, `secret` em qualquer nível raso).
- Chamar em falhas grandes: `channel_not_found`, `channel_inactive`, `unauthorized`, `missing_sender`, `pending_configuration` (com status=`error`/`pending`).
- Manter log de sucesso já existente, com `organization_id` agora persistido de verdade (não mais `as any` sem efeito).
- Nada do roteamento/processor é tocado.

## 4. Server functions (`src/lib/developer/`)

- `webhook-test.functions.ts` → `testInboundEndpoint({ channelId, payload })`: chama o próprio endpoint público com o secret do canal (server-side via `fetch`) e devolve `{ status, body }`. Usa `requireSupabaseAuth`, valida que o canal pertence à org do caller. Não vaza secret.
- `webhook-secret.functions.ts` → `rotateWebhookSecret({ channelId })`: gera novo `crypto.randomUUID()` no lado servidor, faz UPDATE em `channels.credentials.webhook_secret` (carregando credentials existentes); retorna `{ secret }` UMA vez. UI exibe e some.
- `api-keys.functions.ts` → `createApiKey({ name, scopes })`: gera prefixo `pk_live_xxxxxxxx` + 32 bytes; armazena `key_hash = sha256` e `key_prefix`; retorna `{ key }` UMA vez. `revokeApiKey({ id })` faz DELETE escopado por org. `rotateApiKey({ id })` = delete + create com mesmo name/scopes.

Todos via `requireSupabaseAuth` + checagem de `organization_id`.

## 5. Hooks (`src/hooks/developer/`)

- `use-webhook-logs.ts` — query em `channel_webhooks_log` com filtros: channel_id, status, período (from/to), busca por provider.
- `use-channels-inbound.ts` — wrap leve em `useChannels` que só expõe `id, name, provider, identifier, is_active, status, last_sync_at, organization_id, has_webhook_secret` (booleano derivado de credentials).
- `use-api-keys-actions.ts` — mutations create/rotate/revoke (chamam server fns) + invalidate cache.
- `use-webhook-test.ts` — mutation que chama `testInboundEndpoint`.

## 6. UI

Renomear seção `logs` para “Webhook Logs”. Layout em 3 abas mantido: API Keys / Webhooks / Logs.

- `src/components/marketplace/api-key-manager.tsx` — reescrita:
  - listagem com `name`, `key_prefix••••` mascarado, scopes, criada em, último uso (real);
  - botão “Nova chave” → Dialog com nome + scopes (multi-select simples) → mostra **uma única vez** a chave gerada, botão copiar com feedback, aviso “anote agora”;
  - menu por linha: rotacionar (AlertDialog “gera nova chave, invalida atual” → mostra nova uma vez), revogar (AlertDialog), copiar prefixo.
  - empty state real.

- `src/components/marketplace/webhook-manager.tsx` — reescrita para focar em **inbound de canais** (não webhook_subscriptions mockado). Lista cada canal com:
  - URL real `${origin}/api/public/channels/{id}/inbound` (origin via `window.location.origin`);
  - badge de status (`pending_configuration` se `!webhook_secret`);
  - botões: copiar URL, copiar curl, **Testar endpoint** (chama server fn, mostra resposta), **Gerar/Rotacionar secret** (AlertDialog → exibe secret uma vez);
  - mostra provider, última atividade (`last_sync_at` ou maior `processed_at` do log), feedback toast em cada cópia.
  - exemplo curl com header `x-webhook-token: <COLE_AQUI>` (nunca renderizar o secret).

- `src/components/marketplace/webhook-logs-panel.tsx` (novo):
  - filtros: canal (select), status (select success/error/pending), período (date range simples — 24h/7d/30d/custom), busca por provider;
  - tabela: data, canal (nome), provider, status badge, snippet de erro;
  - clique → Sheet com payload JSON formatado, error_message, metadata; **payload renderizado já vem mascarado do backend** + sanitização adicional no client por garantia (remove campos sensíveis).
  - empty state real.

- `src/components/marketplace/developer-center.tsx` — substitui placeholder “Nenhum log de API disponível” por `<WebhookLogsPanel />`; reaproveita layout existente; remove métricas hardcoded (“1.2M / mês”, “98.5% Success Rate”) — substitui por contagem real simples ou esconde.

- `src/lib/developer/mask.ts` — utilitário compartilhado `maskSensitive(obj)` (lista de chaves proibidas, ofusca recursivamente até 2 níveis com `***`).

## 7. Não duplicar com Canais

- O botão “Testar endpoint” chama a mesma server fn `testInboundEndpoint`. Se já houver um equivalente em `ChannelConfigDrawer`, manter intocado e apenas reaproveitar o hook.
- Rotação de webhook_secret também fica disponível só aqui; `ChannelConfigDrawer` não é alterado.

## 8. Segurança

- Nenhuma server fn nova é pública: todas com `requireSupabaseAuth` + check de org.
- `rotateWebhookSecret` / `createApiKey` / `rotateApiKey` retornam segredo **uma única vez**.
- Logs sempre mascarados antes do insert.
- UI nunca renderiza `webhook_secret`/`key_hash`/`api_key`; só `key_prefix`.
- Listagens de api_keys nunca incluem `key_hash` no select.

## 9. Validação

- `bunx tsc --noEmit`.
- Buscas globais: `Em breve`, `coming soon`, `não implementado`, `próxima sprint`, `TODO`, `onClick={() => {}}`, `console.log` (em arquivos novos).
- Busca por exposição: `rg -n "key_hash" src/components`, `webhook_secret` renderizado em JSX, qualquer `toast.success` mostrando segredo.
- QA manual: criar API key → vê segredo uma vez → recarrega lista → só prefixo. Rotacionar secret de canal → testar endpoint → ver log com status processed. Forçar erro (URL com channelId inválido) → ver log error.
- Regressão: AI Studio, Automação, Inbox, Marketplace canais, fluxo inbound real (POST com secret válido).

## 10. Riscos

- Endpoint inbound passa a logar falhas extras: aumenta linhas em `channel_webhooks_log`. Mitigado por índice + paginação no painel.
- `api_keys` sem coluna `is_active`: revogação é DELETE — perde histórico de quem teve qual chave. Documentar no relatório.
- Server fn de teste do endpoint precisa saber o host público; usar `getRequest()`/`x-forwarded-host` no servidor para montar URL absoluta, fallback `process.env.SITE_URL` se existir, último recurso `http://localhost:8080`.

## 11. Arquivos previstos

Novos:
- migration única;
- `src/lib/developer/mask.ts`;
- `src/lib/developer/webhook-test.functions.ts`;
- `src/lib/developer/webhook-secret.functions.ts`;
- `src/lib/developer/api-keys.functions.ts`;
- `src/hooks/developer/use-webhook-logs.ts`;
- `src/hooks/developer/use-webhook-test.ts`;
- `src/hooks/developer/use-api-keys-actions.ts`;
- `src/components/marketplace/webhook-logs-panel.tsx`;
- `src/components/marketplace/api-key-create-dialog.tsx`;
- `src/components/marketplace/webhook-secret-rotate-dialog.tsx`.

Alterados:
- `src/components/marketplace/developer-center.tsx` (substituir aba Logs por painel real, remover métricas fake);
- `src/components/marketplace/webhook-manager.tsx` (reescrita focada em canais);
- `src/components/marketplace/api-key-manager.tsx` (reescrita com create/rotate/revoke);
- `src/routes/api/public/channels.$channelId.inbound.ts` (logs de erro mascarados, sem mexer no fluxo).

Após aprovação: migration → server fns → hooks → UI → validação → relatório A3 e aguardo OK antes de A4.
