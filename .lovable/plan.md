## UX Omnichannel First — Simplificação para Piloto

Escopo: somente reorganização visual, copy e empty states. Sem novos módulos, sem refactor profundo, sem mexer em segurança/RLS.

Mensagem central: "Centralize seus canais, atenda melhor seus clientes e transforme conversas em vendas."

Fluxo prioritário: **Canal → Inbox → Customer 360 → CRM → Relatórios**.

---

### 1. Sidebar reorganizada (`src/components/layout/app-layout.tsx`)
Manter todas as rotas. Reagrupar visualmente:

- **PRINCIPAL**: Início, Inbox, Clientes, CRM, Canais, Relatórios
- **OPERAÇÃO**: Filas, Tarefas, Campanhas
- **ADMINISTRAÇÃO**: Usuários, Empresas, Billing, Configurações
- **AVANÇADO / LABS**: IA Studio, Knowledge Hub, OIL (renomear "Insights IA"), EIN ("Inteligência Executiva"), Business Hub ("Marketplace"), Developer

CEO Master mantém Governança Global em PRINCIPAL. Filtragem por role já existe.

### 2. Home / Dashboard objetivo
Cada dashboard ganha um "QuickActionsBar" no topo com 6 cards:
Abrir Inbox · Simular mensagem · Criar cliente · Criar oportunidade · Conectar canal · Ver CRM.

Componente novo: `src/components/dashboard/widgets/quick-actions-bar.tsx`. Reutilizado em CEO/Company/Manager/Agent dashboards.

### 3. Home por perfil
Ajustar conteúdo de cada dashboard existente:
- **AgentDashboard**: minhas conversas, aguardando, tarefas hoje, SLA em risco, botão Abrir Inbox.
- **ManagerDashboard**: filas, equipe, SLA, conversas abertas, oportunidades, tarefas.
- **CompanyDashboard**: conversas, clientes, oportunidades, receita prevista, canais conectados, relatórios.
- **CEODashboard**: empresas, operação global, organizações, auditoria, saúde plataforma.

### 4. Checklist de primeiro uso
Novo componente `src/components/dashboard/widgets/onboarding-checklist.tsx`:
- 7 itens (config empresa, conectar canal, criar fila, criar cliente, simular msg, criar oportunidade, convidar equipe).
- Estado persistido em `localStorage` (`onecontact_onboarding`).
- Renderizado em CompanyDashboard e ManagerDashboard. Recolhe quando 100%.

### 5–6. Inbox como centro + empty states
Em `src/components/inbox/components/chat-view.tsx`:
- Empty state elegante quando sem seleção: título "Selecione uma conversa", subtítulo orientativo, mini-stats (abertas, aguardando, SLA risco, não atribuídas).
- Garantir header da conversa exibe: canal, cliente, status, responsável, SLA, badge DEMO quando aplicável.

### 7. Badge DEMO / SIMULADO
Adicionar utilitário `src/lib/demo-badge.tsx` (componente Badge reutilizável). Marcar em:
- `chat-list.tsx` (item da lista)
- `chat-view.tsx` (header)
- `customer-panel.tsx` (Customer 360)

Heurística: conversa demo quando contato/canal pertence a `onecontact-demo-corp` ou flag em metadata.

### 8. Customer 360 limpo (`src/components/customer-360/customer-view.tsx`)
Ordem fixa: nome, telefone, canal principal, tags, últimas conversas, negócios, tarefas, observações, histórico.
Remover/condicionar: Health Score, NPS, timeline Shopify/Stripe e insights IA — só renderizar se houver dado real; senão empty state "Este cliente ainda não possui histórico suficiente."

### 9. CRM mais objetivo (`src/components/crm/crm-view.tsx`)
- Tagline no header: "Transforme conversas em oportunidades."
- Botão "Novo Negócio" em destaque.
- Remover métricas avançadas sem dado real.
- Badge DEMO no card kanban quando aplicável.

### 10. Canais (`src/components/channels/channels-view.tsx`)
Tagline: "Como conecto meu WhatsApp ou outro canal?"
Card padronizado: nome, provider, status, última sincronização, botões Conectar/Testar, logs básicos, badge DEMO/SIMULADO no simulador.

### 11. Filas
Já corrigido em sprint anterior. Adicionar tagline "Distribua atendimentos entre equipes." e wire `Gerenciar` para drawer informativo (toast info se sem ação).

### 12. Relatórios (`src/routes/reports.tsx` / `src/components/reports/...`)
Se sem dados: empty state "Sem dados suficientes ainda. Conecte um canal e comece a atender para gerar métricas."
Remover números fake hardcoded — usar hook real com fallback empty.

### 13. Quick Launch enxuto (`src/hooks/core/use-quick-launch.ts`)
Manter apenas: Abrir Inbox, Buscar cliente, Novo cliente, Nova oportunidade, Simular mensagem, Conectar canal, Criar tarefa, Ir para CRM, Ir para Filas, Ir para Configurações.
Remover comandos sem implementação real.

### 14. Linguagem
Renomear labels visíveis na sidebar e nav:
- OIL → "Insights IA" (em Avançado)
- EIN → "Inteligência Executiva" (em Avançado)
- Business Hub → "Marketplace" (em Avançado)
- Developer → escondido fora de DEV

### 15. Cabeçalhos padronizados
`PageHeader` (já existe) — auditar todas as rotas internas (queues, inbox, customers, crm, reports, campaigns, knowledge, supervisor, admin/*, settings/*) para garantir: Voltar + título + descrição curta + ação principal evidente.

### 16. Empty states padronizados
Novo componente `src/components/ui/empty-state.tsx` (título, descrição, ícone, ação CTA). Aplicar em Inbox, Clientes, CRM, Canais, Relatórios.

### 17. Design system
Sem mudanças nos tokens. Auditar consistência: botão primário (`bg-indigo-600`), secundário (`ghost`), destrutivo (`rose`), cards (`bg-white/[0.02] border-white/[0.05]`), badges, loading/skeleton. Documentar em `docs/architecture/DESIGN-TOKENS.md` (opcional).

### 19. Validação Playwright
Script único cobrindo os três perfis (Atendente, Empresa, CEO Master) e o fluxo de 12 passos do Atendente. Screenshots em `/tmp/browser/ux-piloto/`.

---

### Arquivos a alterar
- `src/components/layout/app-layout.tsx` (sidebar reagrupada + labels)
- `src/components/dashboard/widgets/quick-actions-bar.tsx` (novo)
- `src/components/dashboard/widgets/onboarding-checklist.tsx` (novo)
- `src/components/dashboard/{agent,manager,company,ceo}/*.tsx`
- `src/components/inbox/components/{chat-view,chat-list,customer-panel}.tsx`
- `src/components/customer-360/customer-view.tsx`
- `src/components/crm/crm-view.tsx`
- `src/components/channels/channels-view.tsx`
- `src/components/reports/...` ou `src/routes/reports.tsx`
- `src/components/ui/empty-state.tsx` (novo)
- `src/lib/demo-badge.tsx` (novo)
- `src/hooks/core/use-quick-launch.ts`
- `src/pages/queues.tsx`

### Fora de escopo
- Novos módulos / dashboards
- Refactor de arquitetura
- Mudanças em RLS, schema, auth
- Telefonia real, IA real, integrações externas
- Marketplace, Global, White Label no fluxo principal

### Ordem de execução
1. Sidebar reagrupada + labels (#1, #14) — impacto visual imediato.
2. Empty state component + Quick Actions Bar (#16, #2) — bases reutilizáveis.
3. Dashboards por perfil (#3, #4) — entrega de valor.
4. Inbox + badge DEMO (#5, #6, #7).
5. Customer 360 limpo (#8).
6. CRM + Canais + Relatórios (#9, #10, #12).
7. Quick Launch + Filas polish (#13, #11).
8. Validação Playwright (#19).

### Critérios de aceite
- Sidebar tem 4 grupos claros, Developer só em DEV.
- Cada dashboard mostra Quick Actions Bar funcional.
- Checklist visível para CEO/Admin/Gerente, persistente.
- Inbox sem seleção mostra empty state com mini-stats.
- Conversas/canais demo têm badge visível.
- Customer 360 sem dado fake — empty state quando vazio.
- Relatórios sem dado mostram CTA "Conectar canal".
- Quick Launch sem comandos mortos.
- Nomes amigáveis (Insights IA, Inteligência Executiva, Marketplace) substituem siglas no fluxo principal.
