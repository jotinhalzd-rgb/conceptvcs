## Prompt 2/3 — Módulos Avançados do OneContact OS

Objetivo: completar 10 módulos avançados com ações reais, sem tocar no núcleo aprovado (Marketplace↔Canais, Canais, Inbound, Filas, Inbox, Customer 360, CRM, Campanhas, Relatórios, Notificações básicas, RLS).

Regra dura: nada de "Em breve", toast genérico, botão morto, dado fake como produção, ou simulação de provedor externo. Quando faltar integração externa → `pending_configuration` honesto + instruções.

---

### BLOCO 1 — AI Studio
Arquivos: `src/components/ai-studio/agent-editor.tsx`, `agent-list.tsx`, `ai-studio-view.tsx`, `src/hooks/ai/use-agents.ts`.
- Confirmar/usar tabela `ai_agents` (já existe, 12 cols, RLS).
- Adicionar no editor: vínculo opcional `queue_id`, `channel_id`, campo `model`/`provider` (com `pending_configuration` se sem chave), confirmação de exclusão (AlertDialog), toggle ativo/inativo real.
- Botão "Testar": chama serverFn `testAgent` que roda chamada Lovable AI Gateway (`google/gemini-3-flash-preview`) com `system_prompt` + input do usuário; resposta marcada como TESTE. Se `LOVABLE_API_KEY` ausente → status `pending_configuration`.
- Remover métricas hardcoded "98%/4.2k" → ler de `agent_performance` ou ocultar quando vazio.
- Migration leve apenas se faltar `queue_id`/`channel_id`/`status` em `ai_agents`.

### BLOCO 2 — Automação
Arquivos: `src/components/automation/workflow-builder.tsx` + novos `automation-list.tsx`, `automation-editor-drawer.tsx`, `src/hooks/automation/use-automations.ts`.
- Usar `automation_workflows` (já existe). Persistir: nome, descrição, trigger (`conversation_created|conversation_routed|conversation_no_reply|deal_created|campaign_created|sla_risk`), condições JSON, ações JSON (`create_notification|assign_queue|create_crm_task|log_event`), `queue_id`, `channel_id`, `responsible_id`, status.
- CRUD completo + confirmação exclusão + filtro por status.
- "Testar regra" → serverFn executa ações 1x manualmente e grava em `automation_logs`.
- Honestidade: na UI deixar claro que execução em background ainda não dispara automaticamente em todos os gatilhos — listar quais já estão ligados (via triggers DB existentes) e quais são executáveis só por teste manual.

### BLOCO 3 — Developer / Webhooks / Logs
Arquivos: `src/components/marketplace/developer-center.tsx`, `webhook-manager.tsx`, `api-key-manager.tsx` + novo `src/components/developer/webhook-logs-panel.tsx`, hook `use-webhook-logs.ts`.
- Listar canais com endpoint inbound real: `/api/public/channels/{id}/inbound`, copiar URL + exemplo curl, rotacionar `webhook_secret` (reusar fn existente), botão "Testar endpoint".
- Painel `channel_webhooks_log` (tabela já existe): filtros por canal/status/período, drawer com payload JSON formatado, sem expor secrets.
- `api_keys`: criar/rotacionar/revogar com confirmação (tabela já existe).

### BLOCO 4 — Voice
Arquivos: `src/components/voice/pbx-management.tsx`, `ivr-builder.tsx`, `call-log-list.tsx`, `softphone-widget.tsx`, `src/hooks/voice/use-voice.ts`.
- CRUD `voice_extensions` + `ivr_flows`. Configurar provider (twilio/none), número, fila padrão (FK `queues`).
- Status: `pending_configuration` quando faltar credencial; "Testar" só valida formato/persistência. Softphone widget mostra estado real (não simula chamada).
- Listar `call_logs` reais; vazio = empty state honesto.
- Desconectar com AlertDialog.

### BLOCO 5 — Billing
Arquivos: `src/components/billing/billing-view.tsx`, `plans-grid.tsx`, `invoice-list.tsx`, `usage-meter.tsx`, `src/hooks/billing/use-billing.ts`.
- Remover banner "Restam 4 dias" e métricas hardcoded → ler `billing_subscriptions_v2`, `billing_invoices_v2`, `billing_usage_meters`.
- Sem gateway configurado → banner "Gateway de pagamento não configurado" + botão abre modal de configuração (salva `pending_configuration`).
- Faturas reais ou empty state. Nenhuma invoice fake.

### BLOCO 6 — Business Hub
Arquivo: `src/components/hub/business-hub-view.tsx`.
- Cards calculam status real (canais conectados, filas com membros, campanhas ativas, agentes IA ativos) via queries reais.
- Cada card navega para rota existente (`/channels`, `/queues`, `/campaigns`, `/dashboard/ai-studio`, etc).
- Checklist de onboarding baseado em estado real do org.

### BLOCO 7 — OIL / Advisor / CEO
Arquivos: `src/components/dashboard/ceo/oil-command-center.tsx`, `ceo-advisor-view.tsx`, `business-ai/*`.
- Alertas vindos de queries reais: filas com SLA estourado (`conversations.sla_due_at < now()` e abertas), conversas sem agente, canais `pending_configuration`, campanhas `pending_configuration`, oportunidades paradas > X dias.
- Sem mock; empty state honesto.
- Cada alerta navega para a entidade (filtros via search params nas rotas existentes).

### BLOCO 8 — White Label
Novo: `src/components/settings/white-label-view.tsx`, hook `use-white-label.ts`. Tabela `white_label_configs_v2` já existe.
- Form: nome, logo (upload bucket `message-attachments` ou novo), accent color, tema, domínio.
- Domínio → `pending_configuration` + instruções DNS. Preview ao vivo. Reset com confirmação.

### BLOCO 9 — Notificações avançadas
Arquivos: `src/components/notifications/notifications-bell.tsx` + novo `notifications-center.tsx`, hook `use-notifications.ts`, `user_notification_preferences` (já existe).
- Listar, marcar lida, marcar todas, arquivar, filtros por tipo (`conversation_created|conversation_assigned|sla_risk|campaign_status|deal_created|channel_error`).
- Página de preferências persistindo `user_notification_preferences`.
- Click navega para entidade correta via `payload`.

### BLOCO 10 — Higiene leve
- Substituir `console.log` em `services/*` e `app-layout` por `if (import.meta.env.DEV) console.log(...)`; manter `console.error`.
- Nenhuma refatoração de logger.

---

### Migrations previstas (mínimas)
1. `ai_agents`: adicionar `queue_id uuid`, `channel_id uuid`, `status text default 'active'` se ausentes (com FKs nullable + GRANTs já existem).
2. `channel_webhooks_log`: garantir colunas necessárias (provavelmente já completas — verificar antes; só migrar se faltar).
3. Nenhuma nova tabela esperada — todas as 10 áreas têm tabelas existentes.

### Ordem de execução
1. Verificar schemas reais via `supabase--read_query` antes de qualquer migration.
2. Bloco 1 → 2 → 3 (alto valor + reaproveitam tabelas existentes).
3. Bloco 9 → 6 → 7 (UI + queries, sem schema).
4. Bloco 4 → 5 → 8 (configurações com `pending_configuration`).
5. Bloco 10 higiene.
6. Validação: `bunx tsc --noEmit`, buscas proibidas, QA regressão dos 21 fluxos do núcleo + QA 5 perfis.

### Garantias
- Zero alteração em: Inbox, Customer 360, CRM, Campanhas, Relatórios, Marketplace↔Canais, endpoint inbound, processor, queue_routing_rules, notify_conversation_event, RLS multiempresa.
- Toda nova feature org-scoped via `current_user_organization_id()`.
- Toda ação com confirmação destrutiva via AlertDialog.
- Nenhum toast genérico no lugar de implementação.

### Riscos conhecidos
- Execução automática completa de Automação fica como "teste manual + log" (background scheduler exigiria edge/cron — fora do escopo seguro).
- Voice/Billing/White Label domínio dependem de credenciais externas → ficam honestos em `pending_configuration`.
- AI Studio "Testar" consome créditos Lovable AI Gateway por chamada.
