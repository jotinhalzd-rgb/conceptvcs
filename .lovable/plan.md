# UX Omnichannel First — Parte 2

Aplicar os componentes já criados (`EmptyState`, `DemoBadge`, `QuickActionsBar`, `OnboardingChecklist`) nas telas do fluxo principal. Sem novos módulos, sem refatoração profunda.

## Escopo por tela

### 1. Inbox
**Arquivos:** `src/components/inbox/chat-list.tsx`, `chat-view.tsx`, `inbox-layout.tsx` (ou equivalente em `src/pages/inbox.tsx`).
- Lista vazia → `EmptyState` ("Nenhuma conversa ainda", ações: Simular mensagem / Configurar canal).
- Nenhuma conversa selecionada → `EmptyState` ("Selecione uma conversa").
- Mini-stats reais (abertas / aguardando / SLA risco / não atribuídas); zeros se sem dados.
- Cada item da lista: nome, canal, última msg, status, responsável, horário, SLA, `DemoBadge` quando `is_demo`/`is_test`.
- Chat header: nome, canal, status, responsável, `DemoBadge`.
- Diferenciar visualmente nota interna vs resposta pública.

### 2. Customer 360
**Arquivos:** `src/components/customers/customer-panel.tsx`, `customer-view.tsx`.
- Renderização condicional: ocultar Health Score, NPS, timeline fake, eventos Shopify/Stripe, insights IA, recomendações quando não houver dado real.
- Ordem: nome → telefone → canal → tags → conversas → negócios → tarefas → observações → histórico.
- Sem histórico → `EmptyState` ("Histórico ainda em construção").
- Bloco Negócios vazio → `EmptyState` pequeno "Nenhuma oportunidade vinculada" + ação Criar oportunidade.
- Bloco Conversas vazio → `EmptyState` "Nenhuma conversa registrada" + ação Abrir Inbox.
- `DemoBadge` quando cliente demo.

### 3. Canais
**Arquivo:** `src/pages/channels.tsx` (ou `channels-view.tsx`).
- Tagline: "Como conecto meu WhatsApp?".
- Card padronizado: status, provider, última sync, botões Configurar / Testar, `DemoBadge` quando simulado.
- Canal demo: descrição "Canal de teste... Não envia mensagens reais."
- Sem canais → `EmptyState` "Configurar canal".

### 4. CRM
**Arquivo:** `src/pages/crm.tsx` ou `src/components/crm/...`.
- `DemoBadge` em negócios/pipelines/tarefas/contatos demo.
- Kanban vazio → `EmptyState` "Nenhuma oportunidade criada ainda" + ação Criar oportunidade.

### 5. Filas
**Arquivo:** `src/pages/queues.tsx`.
- Lista vazia → `EmptyState` "Nenhuma fila configurada" + ação Criar fila (toast info por ora).

### 6. Relatórios
**Arquivo:** `src/pages/reports.tsx` / `src/components/reports/...`.
- Sem dados → `EmptyState` "Sem dados suficientes ainda" com ações Inbox / Configurar canal / Criar oportunidade.
- Marcar dados demo com `DemoBadge`.

### 7. Validações
- `QuickActionsBar`: cada ação aponta a rota existente; ocultar/desabilitar por perfil.
- `OnboardingChecklist`: persistência localStorage funcionando; recolhe ao completar; não invasivo em mobile.
- Responsividade: sidebar, QuickActions, Inbox, Customer 360, CRM Kanban em desktop e mobile.

## Helper de detecção demo
Reusar `isDemoRecord` de `src/lib/demo-badge.tsx` em todos os pontos.

## Fora de escopo
Novos módulos, novos dashboards, mudanças de auth/schema/RLS, telefonia/IA real.

## Validação final
Playwright cobrindo 3 perfis (Atendente, Empresa, CEO Master) executando o fluxo Inbox → Customer 360 → CRM, verificando empty states e badges.
