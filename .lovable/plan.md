# Onda B — Plano de Execução

Escopo aprovado: B1 Business Hub real, B2 OIL/Advisor/CEO Intelligence com queries reais, B3 higiene leve de console.log. Sem tocar no núcleo omnichannel (A1–A4, Inbox, CRM, Campanhas, Canais, Filas, Marketplace, inbound, RLS).

## B1 — Business Hub

**Arquivo:** `src/components/hub/business-hub-view.tsx` (reescrita completa para painel operacional real).

**Novo hook:** `src/hooks/hub/use-hub-status.ts` — agrega contagens reais via Supabase, escopadas por `organization_id` do `useProfile()`:
- `channels`: total, `status='connected'`, `pending_configuration`, `disconnected`, `error`, sem `default_queue_id`.
- `queues`: total, sem membros (left join `queue_members`), `queue_routing_rules` ativas.
- `campaigns`: ativas, `scheduled`, `pending_configuration`, `error`.
- `ai_agents`: ativos, `pending_configuration`.
- `automation_workflows_v2`: ativos/inativos.
- `deals`: abertos, sem responsável, parados > 14 dias.
- `conversations`: abertas, pendentes, sem `agent_id`, SLA vencido (`sla_due_at < now()`), SLA em risco (próximas 30 min).

**Novo hook:** `src/hooks/hub/use-onboarding-checklist.ts` — derivado do status; cada item: `{ id, label, done, route }`.
1. Configurar canal → `/admin/channels`
2. Criar fila → `/queues`
3. Adicionar membro à fila → `/queues`
4. Criar regra de roteamento → `/queues`
5. Testar inbound → `/settings/developer`
6. Responder conversa → `/inbox`
7. Criar oportunidade → `/crm`
8. Criar campanha → `/campaigns`
9. Abrir relatório → `/reports`
10. Configurar agente IA → `/dashboard/ai-studio`

**Componentes auxiliares (mesmo arquivo ou pasta `src/components/hub/`):**
- `HubStatusCards` — grid responsivo de cards (Canais, Filas, Campanhas, IA, Automação, CRM, Conversas) com badges de status reais.
- `OnboardingChecklist` — lista com check/pendente + `Link` TanStack para a rota.
- `QuickShortcuts` — atalhos para `/inbox`, `/customers`, `/crm`, `/campaigns`, `/reports`, `/dashboard/ai-studio`, `/dashboard/automation`, `/settings/developer`, `/dashboard/notifications`.

**Estados:** loading (skeletons), erro (mensagem + retry via `refetch`), empty honesto ("0"), responsividade preservada, scroll-area mantida. Remove os blocos decorativos `publicProfiles/assets/connections` que não são produção.

## B2 — OIL / Advisor / CEO Intelligence

**Arquivos:**
- `src/components/dashboard/ceo/oil-command-center.tsx` (criar/reescrever para alertas reais).
- `src/components/dashboard/ceo/ceo-advisor-view.tsx` (criar/reescrever para recomendações reais).
- Inspecionar `src/components/dashboard/ceo/business-ai/*` (ai-analyst-chat, revenue-intelligence) e substituir métricas inventadas pelas reais.

**Novo hook:** `src/hooks/dashboard/use-real-alerts.ts` — devolve `{ alerts: Alert[], recommendations: Recommendation[] }` derivados de queries existentes:

Alertas:
- SLA vencido / em risco / sem agente (queries em `conversations`).
- Filas sem membros, filas com maior volume aberto.
- `channels` em `pending_configuration`, `disconnected`, `error`, sem fila padrão.
- `campaigns` em `pending_configuration`, `scheduled`, `error`.
- `deals` sem responsável, parados há > 14 dias.
- `ai_agents` inativos/pending; `automation_workflows_v2` inativos; últimos `automation_logs` com erro.

Cada alerta: `{ id, severity, title, description, count, action: { label, route } }`.

Recomendações: derivadas em texto curto a partir dos alertas (sem IA, sem fake). Empty state: "Sem alertas críticos com os dados atuais."

**Ações:** cada card usa `<Link to=...>` TanStack para a rota correspondente (Inbox, Queues, Reports, Channels, Campaigns, CRM, AI Studio, Automation). Sem botão morto.

**business-ai:** trocar arrays mockados por `useExecutiveInsights` / `useBusinessHealth` (já existem em `src/hooks/core/use-business-ai.ts`) e pelo novo `use-real-alerts`. Se um sub-componente não puder ser alimentado por dado real, ele exibe empty state honesto em vez de número fake.

## B3 — Higiene de console.log

- `rg -n "console\.log" src/` para inventariar.
- Manter `console.error`.
- Em arquivos críticos (auth, app-layout, services, integrations/supabase/*): apenas envelopar em `if (import.meta.env.DEV)` sem alterar lógica.
- Remover `console.log` claramente vestigiais (debug temporário) em componentes/hooks.
- Não criar logger. Não tocar em `lovable-error-reporting.ts` nem `error-capture.ts`.

## Validação

```
bunx tsc --noEmit
rg -n "Em breve|coming soon|não implementado|próxima sprint" src/
rg -n "TODO" src/
rg -n "onClick=\{\(\) => \{\}\}|onClick=\{\(\) => null\}" src/
rg -n "console\.log" src/   # confirmar protegidos/justificados
```

QA regressão: clicar em Sidebar → AI Studio, Automação, Developer, Notificações, Inbox, CRM, Campanhas, Relatórios, Marketplace, Hub; abrir sino; confirmar inbound intocado.

## Entregáveis do relatório final

Arquivos alterados, hooks novos, dados reais usados, checklist implementado, rotas dos atalhos, alertas/recomendações implementados, console.log removidos/protegidos, confirmação sem métrica fake, resultado tsc/build/buscas, riscos remanescentes. Pedir validação antes de iniciar Onda C.

## Fora de escopo (não tocar)

Voice, Billing, White Label, Onda C, núcleo omnichannel, RLS, migrations (nenhuma migração nesta onda).
