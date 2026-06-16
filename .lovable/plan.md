## Plano — Fechamento do Núcleo Omnichannel OneContact OS

Escopo: 5 blocos sequenciais. Preservar tudo aprovado (Fases 0, B, C, D, E1). Nada de "Em breve", handler fake, dado fake como produção, ou tela morta.

---

### BLOCO 1 — Marketplace ↔ Canais

**Objetivo:** instalar no Marketplace cria/atribui um registro real em `channels`, reutiliza o drawer da Fase E1, status reflete nos dois lados.

**Backend (migration):**
- Adicionar coluna `channels.marketplace_install_id uuid` (nullable, FK para `hub_installs_marketplace.id`, índice).
- Adicionar coluna `hub_installs_marketplace.channel_id uuid` (nullable, FK para `channels.id`).
- Garantir `GRANT`s já existentes; sem nova policy (segue org-scoped).

**Hooks:**
- `src/hooks/marketplace/use-marketplace.ts`: ao instalar asset com `category='channel'`/`integration_type='channel'`, dentro da mesma transação chamar `upsertChannel({ provider, channel_type, name, status:'pending_configuration', marketplace_install_id })` e gravar `channel_id` no install. Invalidar queries `channels` e `marketplace`.
- Mapear providers legados (`meta` → `whatsapp_meta_cloud`, `twilio` → `whatsapp_twilio`) num helper `src/lib/channels/legacy-map.ts`.

**UI:**
- `marketplace-view.tsx` / `app-card.tsx`: estado real "Instalado" / "Configurar" / "Conectado" lendo `channels.status` via join. Botão "Configurar" navega `/channels?channel=<id>` que abre o drawer correto.
- `channels-view.tsx`: aceitar query `?channel=` e abrir `ChannelConfigDrawer` no carregamento.
- `channel-card.tsx`: badge "via Marketplace" quando `marketplace_install_id != null`.
- Provider desconhecido: mostrar CTA "Migrar provedor" abrindo o picker pré-filtrado por `channel_type`.

**Webhook URL:** rota `src/routes/api/public/channels/$channelId/inbound.ts` (POST) — recebe payload, valida assinatura/secret salvo em `channels.credentials.webhook_secret` quando existir, grava em `channel_webhooks_log` e dispara processamento (ver Bloco 3). Sem secret configurado → `status='pending_configuration'`, copy clara na UI.

---

### BLOCO 2 — Campanhas CRUD real

**Hooks:** `src/hooks/campaigns/use-campaigns.ts` — adicionar `useUpsertCampaign`, `useDuplicateCampaign`, `useArchiveCampaign`, `useDeleteCampaign`, `useEstimateAudience` (count em `contacts` com filtros).

**UI (`src/components/campaigns/`):**
- `campaign-wizard.tsx`: form real (nome, canal via `channels`, segmento, mensagem, status, data programada, responsável via `useOrgUsers`). Zod validation.
- `campaign-manager.tsx` / `campaigns-view.tsx`: lista, filtros, ações duplicar/arquivar/excluir com `AlertDialog`.
- `analytics-dashboard.tsx`: métricas reais via `campaign_analytics`; sem dados → empty state explicando "aguardando envio real".
- Disparo: se canal vinculado não estiver `connected`, salvar `status='pending_configuration'` com mensagem útil. Nada de fake-send.

---

### BLOCO 3 — Filas, Roteamento, Inbound

**Filas (`src/components/queues/queues-management.tsx`):**
- Confirmar CRUD real, membros (`queue_members`), modo (`assignment_mode`), `sla_minutes`, `is_active`, prioridade.

**Roteamento:**
- Tabela `routing_rules` já existe. Migration: garantir colunas `keywords text[]`, `queue_id uuid`, `priority int`, `fallback bool` (só adicionar se faltarem).
- Nova UI: `src/components/queues/routing-rules.tsx` (CRUD simples) acessível por tab em Filas.
- Helper server `src/lib/routing/route-message.functions.ts` (`createServerFn`): recebe `{ organization_id, channel_id, text }`, aplica regras por keyword/intenção, retorna `{ queue_id, routing_reason }`. Fallback para fila padrão do canal.

**Inbound:**
- Rota pública `api/public/channels/$channelId/inbound`: cria/atualiza `contacts`, cria `conversations` com `queue_id` + `routing_reason`, insere `messages`. Trigger `notify_conversation_event` (já existe) gera notificações. Realtime já habilitado em `messages`/`conversations` (verificar via migration `ALTER PUBLICATION` se faltar).
- Simulator (`sim-webhook` edge function) preservado, redirecionado para usar mesmo helper de roteamento.

**Teste "quero falar com o financeiro":** seed migration garante fila "Financeiro" + regra `keywords=['financeiro','financ']` apontando para ela na org demo.

---

### BLOCO 4 — Relatórios

**`src/routes/reports.tsx` + novos componentes em `src/components/reports/`:**
- Hooks `use-reports.ts` agregando via `supabase.rpc` ou `select count` em `conversations`, `messages`, `deals`, `campaigns`.
- Métricas: volume por fila/canal/atendente, status, SLA (`sla_due_at` vs `closed_at`), AHT, oportunidades, campanhas, série temporal.
- Filtros: período, fila, canal, atendente, status. Botão limpar.
- Exportação CSV client-side (Blob) respeitando filtros.
- Empty states reais.

---

### BLOCO 5 — QA

1. `bunx tsc --noEmit`.
2. `rg -n "Em breve|coming soon|não implementado|próxima sprint|TODO:" src` → 0.
3. `rg -n "onClick=\{\(\) => \{\}\}|onClick=\{\(\) => null\}" src` → 0.
4. `rg -n "console\.log" src/components src/hooks` → revisar.
5. Playwright headless: login demo → configura canal → simula mensagem "financeiro" → valida Inbox → assume → responde → Customer 360 → cria deal → CRM → Relatórios.

---

### Entregáveis do relatório final

Arquivos alterados, migrations, hooks/componentes novos, como testar cada bloco, resultado de typecheck/build, resultado das buscas, riscos.

---

### Ordem de execução

1. Migration (B1+B3 juntas) → aguardar aprovação.
2. Hooks + UI Bloco 1.
3. Hooks + UI Bloco 2.
4. Roteamento + inbound + UI filas Bloco 3.
5. Relatórios Bloco 4.
6. QA Bloco 5 + relatório.

Confirma para eu executar a migration do passo 1?
