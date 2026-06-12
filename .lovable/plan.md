# OPERAÇÃO PRODUÇÃO — PLANO DE EXECUÇÃO

## OBJETIVO
Levar o ONECONTACT OS de "demonstrável" para "operacional para clientes pagantes": zero mock, zero botão morto, zero tela vazia.

## METODOLOGIA
Para cada módulo, executar 4 passos:
1. **AUDIT** — listar telas, botões, hooks e queries; marcar status (✅🟡🔴⚠️).
2. **DATA** — substituir mocks por queries reais (Supabase + RLS + organization_id).
3. **ACTION** — conectar cada botão a um hook/mutation ou navegação real.
4. **UX** — adicionar loading, empty, error, toast de feedback.

Trabalho feito em ondas; cada onda termina com relatório de status e commit.

---

## ONDA 1 — FUNDAÇÃO (bloqueante para o resto)
- **Auth & Multi-tenant**: garantir `organization_id` propagado em todas as queries; revisar RLS de todas as 100+ tabelas; corrigir políticas faltantes.
- **Quick Launch v2**: já implementado — auditar resultados, conectar atalhos restantes (Relatórios, Empresas, Configurações).
- **Layout/Navigation**: validar todas as rotas do menu; eliminar links 404; padronizar AppLayout.

## ONDA 2 — OPERAÇÃO (Inbox + Canais)
- Inbox Universal: recebimento real (webhooks Meta/Twilio/360/Evolution já criados), envio via `send-message-v2`, SLA, transferência entre filas, encerramento, histórico, notas internas.
- Filas: CRUD, roteamento, atribuição, métricas reais.
- Central de Canais: CRUD de canais, teste de conexão, exibição de webhook URL por provedor.

## ONDA 3 — CRM
- Customer 360: timeline unificada (eventos, deals, tickets, billing) — já há triggers; validar leitura.
- CRM Enterprise: Kanban com drag-and-drop persistente, CRUD de deals, pipelines, stages, tarefas.
- CRM Financeiro: invoices, forecast, goals — queries reais.

## ONDA 4 — IA
- AI Studio: CRUD de agentes, treino, logs de execução reais via `ai_agent_actions`.
- OIL: alertas, sinais, recomendações lidas das tabelas `oil_*`.
- EIN: benchmarks e best practices reais.
- Knowledge Hub: upload + busca em `knowledge_base`.

## ONDA 5 — MARKETING
- Campanhas: wizard salvando em `campaigns`, disparo real, analytics em `campaign_analytics`.
- Automações: workflows ativando/desativando, execuções em `automation_executions_v2`.
- Templates: CRUD em `marketing_templates_v2`.

## ONDA 6 — ANALYTICS & DASHBOARDS
- Dashboard CEO/Manager/Agent/Company: substituir todos os números hardcoded por agregações reais (`useDashboardStats` expandido).
- Health Scores, Revenue Intelligence, Smart Feed: ler `business_health_scores`, `oil_insights_v2`, `executive_insights`.

## ONDA 7 — BILLING
- Planos, assinaturas, faturas, medidores de uso: ler `billing_*_v2`.
- Limites e permissões aplicados em UI (gate em features).
- Integração Stripe (se aprovado pelo usuário) para checkout real.

## ONDA 8 — CONFIGURAÇÕES
- Usuários: convite real via Supabase Auth Admin (server fn).
- Equipes, perfis, roles: CRUD com `user_roles` e `has_role`.
- Integrações & Webhooks: CRUD em `webhook_subscriptions` e `connected_integrations`.

## ONDA 9 — UX GLOBAL
- Padronizar Skeleton, EmptyState, ErrorBoundary em todas as listas.
- Toasts (sonner) em todas as mutations.
- Responsividade mobile validada nas rotas críticas (Inbox, CRM, Dashboard).

## ONDA 10 — SEGURANÇA & AUDITORIA
- Rodar `supabase--linter` e corrigir todos os warnings.
- Validar RLS por tenant em cada tabela.
- Habilitar logs em `audit_logs` e `global_audit_tracing` para mutations sensíveis.
- HIBP password check ligado.

---

## ENTREGÁVEL POR ONDA
- Lista de telas auditadas com status (✅🟡🔴⚠️).
- Diffs aplicados.
- Relatório final consolidado ao término da Onda 10.

## ORDEM DE EXECUÇÃO IMEDIATA
Começar pela **Onda 1 (Fundação)** e **Onda 2 (Operação/Inbox)**, pois são bloqueantes do uso real por clientes. Demais ondas seguem em sequência.

Confirme para iniciar pela Onda 1 ou indique outra prioridade.
