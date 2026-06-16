# Prompt 3/3 — Acabamento de Venda

Objetivo: deixar o OneContact OS pronto para piloto comercial. Nada de features novas; só acabamento, ligação de botões, métricas honestas, QA multi-perfil e build limpo.

## Parte 1 — Varredura de botões (sem ação morta)

Auditar áreas: AppLayout (sino, engrenagem, Quick Launch, QuickActionsBar), Inbox, Customer 360, CRM, Filas, Canais, Campanhas, Knowledge, Billing, Marketplace, Webhooks, AI Studio, Hub, Relatórios, Admin, Settings.

Para cada botão visível, aplicar uma destas regras (sem exceção):
- ✅ ligar à ação real (modal, mutação, navegação)
- 🟡 manter com toast de feedback claro ("Em preparação para o piloto")
- 🔴 remover ou desabilitar com tooltip explicativo
- ⚠️ mover para seção Avançado/Labs

Botões críticos garantidos: login rápido, logout, voltar, abrir Inbox, simular mensagem, enviar mensagem, nota interna, assumir/transferir/encerrar conversa, criar/editar cliente, criar/editar oportunidade, mover Kanban, criar/editar fila, configurar/testar canal, nova campanha, filtros, exportar, configurações, notificações.

## Parte 2 — Campanhas

Decisão: **Opção B** (mover para "Em preparação") salvo se já estiver funcional.
- Ocultar botões decorativos.
- EmptyState com texto: "Campanhas omnichannel estão em preparação. O piloto atual foca em atendimento, filas e CRM."

## Parte 3 — CRM e Customer 360

CRM: validar criar/editar negócio, persistência do Kanban, filtros (manter ou remover), Exportar (ligar ou remover), DemoBadge em dados seed, EmptyState.
Customer 360: criar tarefa/oportunidade/observação ligadas ou com feedback; remover botões de IA quando não houver IA real; nenhum score falso como real; DemoBadge.

## Parte 4 — Billing / Marketplace / Webhooks / Hub / AI Studio

Não são coração do piloto.
- Billing: marcar como Demo/Preparação se não houver cobrança real.
- Marketplace/Webhooks: botões abrem config real, ficam desabilitados com tooltip, ou vão para Labs.
- AI Studio: implementar mínimo OU ocultar "Em breve" OU marcar como Labs.
- Hub: mover para Avançado/Labs se conceitual.

## Parte 5 — Métricas do Dashboard

Arquivo principal: `src/hooks/dashboard/use-dashboard-stats.ts` + widgets CEO.
- Remover hardcodes (uptime, SLA fixo, variações, health artificial).
- Migration: `ALTER TABLE stages ADD COLUMN is_won boolean DEFAULT false;` e marcar estágio ganho no seed demo.
- Calcular receita ganha via `stages.is_won` (não UUID fixo).
- Widgets puramente demonstrativos recebem DemoBadge + nota "Indicadores demonstrativos".
- Sem dado → EmptyState.

## Parte 6 — Relatórios

Cada gráfico/card/tabela: dado real, dado demo marcado, ou EmptyState. Exportar: ligar ou remover. Filtros idem.

## Parte 7 — Segurança e multi-tenant

Validar: RLS preservado, `organization_id`/`company_id` em toda tabela nova, sem credenciais de canal no frontend, sem `service_role` no client, sem vazamento entre orgs, escopos por papel corretos. Rodar `supabase--linter`. Documentar (não apagar) qualquer `.env` versionado.

## Parte 8 — QA multi-perfil

Perfis: CEO Master, Empresa Demo, Gerente Demo, Supervisor IA, Atendente Demo.
Para cada um: login → nome → role → dashboard → sidebar → permissões → logout → sem cache herdado.

## Parte 9 — QA do fluxo comercial

Via Playwright headless (localhost:8080), com sessão Supabase pré-injetada:
1. Empresa Demo: dashboard → filas (Financeiro/Suporte/Vendas) → canais → Inbox → simular "Quero falar com o financeiro" → conversa cai em Financeiro → notificação → realtime ok.
2. Atendente Demo: Inbox → ver conversa → assumir/responder → nota interna → criar oportunidade → Customer 360 → CRM → mover Kanban.
3. Gerente Demo: Filas → SLA → transferir → notificação.
4. CEO Master: visão global, DemoBadges, sem 404/tela branca.

## Parte 10 — QA de rotas

Abrir cada rota e confirmar render: `/auth`, `/dashboard`, `/inbox`, `/customers`, `/crm`, `/queues`, `/reports`, `/campaigns`, `/knowledge`, `/supervisor`, `/admin/companies`, `/admin/channels`, `/admin/audit`, `/settings`, `/settings/profile`, `/settings/notifications`, `/settings/billing`, `/settings/developer`, `/settings/marketplace`. Rotas inexistentes → ajustar links para rota válida. Quick Launch sem 404.

## Parte 11 — Responsividade

Testar desktop/notebook/tablet/mobile nos pontos críticos (sidebar, topbar, sino, engrenagem, softphone, QuickActionsBar, Inbox, Customer 360, CRM Kanban, Filas, Canais, Relatórios). Sem sobreposição, sem corte, sem loading infinito, sem área vazia sem EmptyState.

## Parte 12 — Build final

```
bunx tsc --noEmit
bun run build
bun run lint   # se existir
```
Corrigir só bloqueantes; warnings cosméticos ficam.

## Parte 13 — Relatório final

Tabela por módulo: status (✅/🟡/🔴/⚠️) · o que funciona · o que foi corrigido · pendência · bloqueia venda?

Entrega complementar:
1. relatório de QA
2. pendências não bloqueantes
3. roteiro de demonstração
4. ordem de cliques para venda
5. frase principal de venda
6. próximos passos pós-piloto

Fechamento exigido:
> "OneContact OS aprovado para piloto comercial." **ou** "OneContact OS ainda possui bloqueadores para piloto comercial: ..."

## Fora de escopo

- Novos módulos, refactor de stack, mudanças de UX além do necessário.
- Não tocar em RLS, login demo, filas, roteamento, realtime, notificações, Inbox, CRM.
- Sem push nativo, sem e-mail real, sem integração WhatsApp produtiva.

## Ordem de execução

1. Parte 5 (migration `is_won` + métricas honestas) — primeiro porque é migration.
2. Partes 1–4, 6 (acabamento de UI por módulo, em paralelo onde possível).
3. Parte 7 (linter + revisão multi-tenant).
4. Partes 8–11 (QA Playwright multi-perfil + rotas + responsivo).
5. Parte 12 (build).
6. Parte 13 (relatório final + veredito).
