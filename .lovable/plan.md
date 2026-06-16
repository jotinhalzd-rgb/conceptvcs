# Plano — Regra Mestra Atualizada: Implementar, Não Excluir

Objetivo: substituir toda a estratégia anterior de "esconder/marcar como Labs" por **implementação real** de cada botão, tela e módulo visível. Manter padrão visual premium, RLS, multi-tenant e qualidade de dados (real, demo marcado, ou EmptyState).

## Fase 0 — Varredura (antes de codar)

Rodar buscas no `src/` e listar tudo que precisa ser corrigido:
- `onClick={() => {}}` e botões sem `onClick`/`type="submit"`
- Strings: "em breve", "coming soon", "próxima sprint", "não implementado", "placeholder", "TODO"
- Toasts genéricos do tipo "em breve"
- `<Link to="...">` para rotas inexistentes
- Botões que só fazem `console.log`

Gerar lista única que será o backlog desta entrega.

## Fase 1 — Fluxo Omnichannel (Inbox) — prioridade máxima

Em `src/components/inbox/`:
- Anexo: input file + upload para bucket `message-attachments` + mensagem `type=image/document`
- Áudio: gravação via MediaRecorder + upload + mensagem `type=audio`
- Emoji: popover com picker leve (sem dep nova se possível) inserindo no textarea
- Nota interna: mutation em `internal_notes` (hook já existe)
- Assumir/Transferir/Encerrar: validar mutations existentes em `use-conversation-actions`, ligar botões soltos, adicionar `ConfirmDialog` no encerrar
- Filtros (status, fila, canal, agente): aplicar em `useConversations` via `queryKey`
- SLA: badge já existe; garantir tooltip com tempo restante
- Realtime e notificações: já existem; validar

## Fase 2 — Customer 360

Em `src/components/customer-360/`:
- Editar cliente: dialog com `contact-form`, mutation em `contacts`
- Adicionar tag: popover + tabela `tags` + `conversation_tags`/`contact_tags`
- Criar tarefa: dialog → `crm_tasks`
- Criar oportunidade: dialog reaproveitando `DealForm` → `deals`
- Timeline: ler `customer_events_unified` (já existe trigger); empty state real
- Botões de IA sem chave: trocar por "Configurar IA" abrindo `/dashboard/ai-studio`

## Fase 3 — CRM

Em `src/components/crm/`:
- Novo/Editar/Excluir negócio: dialogs + mutations (DealForm pronto)
- Mover Kanban: garantir persistência (mutation update `stage_id`)
- Filtros: status, pipeline, responsável, valor — aplicar em `useDeals`
- Excluir com `ConfirmDialog`
- Exportar CSV: gerar a partir dos `deals` em memória

## Fase 4 — Canais

Em `src/components/channels/`:
- Configurar/editar canal: dialog com `connect-modal` por provider
- Testar canal: chamar edge function existente (`sim-webhook` para simulator)
- Ativar/desativar: mutation `is_active`
- Status visual real + badge "Pendente de configuração" quando faltar credencial
- Para providers reais sem credencial: dialog explica e abre formulário de credenciais

## Fase 5 — Filas e Setores

Em `src/components/queues/queues-management.tsx`:
- CRUD completo (criar/editar/excluir fila) com `ConfirmDialog`
- Gerenciar `queue_members` (adicionar/remover agentes)
- Editar `sla_minutes`, `assignment_mode`, `is_default`
- Botão "Abrir Inbox filtrado" → navega para `/inbox?queue_id=...`
- Transferência entre filas (já existe `transfer-modal`)

## Fase 6 — Campanhas

Em `src/components/campaigns/`:
- Criar/editar/duplicar/excluir campanha → `campaigns` table
- Ativar/pausar: mutation `status`
- Wizard já existe; conectar submit a mutation real
- Filtros e relatório básico (contagem por status) — `campaign_analytics` se existir, senão EmptyState

## Fase 7 — Configurações

Já implementado em `/settings/{profile,notifications}`. Adicionar/validar:
- Organização: editar nome em `organizations`
- Preferências: idioma, tema (persistir em `profiles` ou localStorage)
- Segurança: trocar senha via `supabase.auth.updateUser`

## Fase 8 — Billing / Marketplace / Developer / Hub / AI Studio / Automação

**Sem provedor externo = fluxo mínimo real, nunca decorativo.**

Billing (`billing-view`, `plans-grid`, `invoice-list`):
- Listar `billing_plans_v2`
- Selecionar plano → criar `billing_subscriptions_v2` com `status='pending_configuration'`
- Listar `billing_invoices_v2` reais ou EmptyState
- Botão "Configurar provedor de pagamento" abre dialog explicando Stripe/Paddle

Marketplace (`marketplace-view`, `app-card`):
- Listar `hub_marketplace_assets`
- Instalar → cria `hub_installs_marketplace` + `connected_integrations` com status
- Detalhes via dialog

Developer (`api-key-manager`, `webhook-manager`):
- Gerar API key real → `api_keys` (mostrar 1x)
- CRUD `webhook_subscriptions`

Hub (`business-hub-view`): listar `hub_connections`, conectar/desconectar

AI Studio (`agent-editor`, `agent-list`, `training-center`):
- Listar/criar/editar `ai_agents`
- Upload conhecimento → `agent_knowledge_base`
- Logs: `ai_analytical_logs` ou EmptyState
- Quando faltar `LOVABLE_API_KEY` em runtime: badge "Configurar IA"

Automação (`workflow-builder`): salvar `automation_workflows_v2` + nodes

## Fase 9 — Eliminar linguagem proibida

Substituir globalmente:
- "Em breve" → "Configurar agora" / "Pendente de configuração"
- "Coming soon" → idem
- "TODO" visível → remover ou implementar
- "Não implementado" → fluxo mínimo

## Fase 10 — Segurança e Multi-tenant

Para cada tabela tocada/criada:
- `organization_id` obrigatório
- RLS por `current_user_org()`
- GRANTs `authenticated` + `service_role`
- `created_at`/`updated_at` + trigger

Rodar `supabase--linter` ao final.

## Fase 11 — Testes

```
bunx tsc --noEmit
bun run build
```

QA manual via Playwright (sessão Supabase pré-injetada) nos fluxos críticos: Inbox simular→assumir→nota→oportunidade; CRM criar→mover; Filas criar→adicionar membro→transferir; Canais configurar; Billing selecionar plano.

## Fase 12 — Relatório Final

Tabela por módulo: ✅ funcional · 🟡 mínimo (depende de externo) · 🔴 bloqueia · ⚠️ pós-piloto.

Incluir: botões corrigidos, tabelas usadas/criadas, hooks reaproveitados, arquivos alterados, pendências externas (Stripe, WhatsApp Cloud, e-mail transacional, voz), build status.

Veredito: **"OneContact OS aprovado com funcionalidades reais implementadas."** ou lista de bloqueadores.

## Ordem de execução

1. Fase 0 (varredura — gera backlog real)
2. Fases 1→7 sequenciais (núcleo do produto)
3. Fase 8 em paralelo onde possível (módulos independentes)
4. Fase 9 (limpeza de linguagem) varrendo o repo
5. Fase 10 (lint segurança)
6. Fase 11 (build + QA)
7. Fase 12 (relatório)

## Fora de escopo

- Integração produtiva real com Stripe/Paddle, WhatsApp Cloud, e-mail SMTP, gateway de voz, IA com chave de cliente. Para esses: fluxo mínimo + status `pending_configuration` + tela para configurar depois.
- Refactor de stack, troca de UI library, mudança de auth.

## Riscos e mitigação

- **Escopo enorme**: priorizar Fases 1–5 (coração comercial). Fases 8 entregam mínimo viável.
- **Migrations novas**: cada tabela nova com GRANT + RLS no mesmo arquivo.
- **Quebrar realtime/RLS já funcionando**: nunca alterar policies existentes sem motivo, só somar.
