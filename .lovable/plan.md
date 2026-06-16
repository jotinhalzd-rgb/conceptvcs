## Sprint Final — Estabilização para Piloto

Escopo: somente correções. Sem módulos novos, sem refactor amplo. Foco no fluxo Login → Dashboard → Inbox → Conversa Demo → Customer 360 → CRM.

---

### 1. Acessos Rápidos Demo (`src/routes/auth.tsx`)
- Garantir os 5 cards: CEO Master, Empresa Demo, Gerente Demo, Atendente Demo, Supervisor IA — com email/senha/role corretos.
- Sequência rígida em `handleDemoLogin`:
  1. `queryClient.cancelQueries()` + `queryClient.clear()`
  2. `localStorage.removeItem("onecontact_dev_role")`
  3. `supabase.auth.signOut()`
  4. `ensureDemoData`
  5. `signInWithPassword`
  6. Validar `user.email === demoEmail`; se diferente → signOut + erro.
  7. `invalidateQueries` + navigate `/dashboard`.
- Loading state com timeout de 15s para não travar.

### 2. Dashboard por Role (`src/pages/dashboard.tsx`)
- Substituir o hardcoded `<CEODashboard />` por switch baseado em `profile.role`:
  - `ceo_master` → `CEODashboard`
  - `ceo` | `admin` → `CompanyDashboard`
  - `manager` → `ManagerDashboard`
  - `agent` → `AgentDashboard`
  - `supervisor` → `ManagerDashboard` (placeholder existente) ou Supervisor view se disponível
- Fallback seguro + estado de loading enquanto `profile` carrega.

### 3. Sidebar (`src/components/layout/app-layout.tsx`)
- Já corrigido nome/role dinâmicos. Reforçar:
  - `isCEOMaster` apenas para `ceo_master`.
  - Empresa Demo nunca vê menus de Governança Global (já filtrado por `isCEOMaster`).
- Manter rodapé limpo; nenhum FAB dentro do `<aside>`.

### 4. Softphone (`src/components/voice/softphone-widget.tsx`)
- Já movido para `right-6`. Adicionar:
  - `bottom-24` em telas pequenas para evitar conflito com botão Lovable.
  - Tag "Beta" / tooltip "Discador em desenvolvimento" no click se sem função real.
  - Ocultar quando `pathname === "/auth"`.

### 5. Developer Panel
- Garantir que ao trocar role override:
  - dispara `onecontact:dev-role-change` (já feito).
  - Botão "Restaurar perfil real" → `localStorage.removeItem("onecontact_dev_role")` + `queryClient.invalidateQueries(["profile"])`.
- Badge visual quando override ativo (já existe via `_dev_role_override`).

### 6. Botão Voltar Global (`src/hooks/use-smart-back-navigation.ts` + `back-button.tsx`)
- Lógica:
  - Se `document.referrer` interno e não-auth → voltar.
  - Senão → `/dashboard`.
  - Bloquear retorno para `/auth`, `/login`, `/register`, `/reset-password`.
- Adicionar `<SmartBackButton />` nos headers das páginas listadas (queues, inbox, customers, crm, reports, campaigns, knowledge, supervisor, admin/*, settings/*).

### 7. Quick Launch (`src/hooks/core/use-quick-launch.ts` ou equivalente)
- Auditar comandos. Remover/ocultar os que apontam para rotas inexistentes.
- Trocar `/customers/:id` → `/customers?contactId=<id>`; `/inbox/:id` → `/inbox?conversationId=<id>`.
- Manter apenas: Abrir Inbox, Buscar cliente, Novo cliente, Nova oportunidade, Simular mensagem, Conectar canal, Criar tarefa, Ir para CRM, Ir para Filas.

### 8. Tela de Filas (`src/pages/queues.tsx` + `src/components/queues/queues-management.tsx`)
- Header: título + `<SmartBackButton />`.
- Botões: Criar Fila → modal funcional; Filtros → popover ou remover; Gerenciar → drawer ou remover.
- Remover elementos brancos soltos no topo.
- Badge "DEMO" em filas seed.

### 9. Validações (Playwright)
- Script único cobrindo: login em cada um dos 5 perfis demo → assert sidebar nome+role → assert dashboard correto → navegar Inbox/CRM/Queues → testar Voltar.
- Screenshots em `/tmp/browser/sprint-final/`.

### 10. Build & Lint
- Build automático do harness. Corrigir erros críticos; warnings podem ficar.

---

### Arquivos a alterar
- `src/routes/auth.tsx`
- `src/pages/dashboard.tsx`
- `src/components/layout/app-layout.tsx` (ajustes finos)
- `src/components/voice/softphone-widget.tsx`
- `src/hooks/use-smart-back-navigation.ts`
- `src/components/layout/back-button.tsx`
- Headers das páginas internas (adicionar BackButton)
- `src/hooks/core/use-quick-launch.ts`
- `src/pages/queues.tsx` + `src/components/queues/queues-management.tsx`
- `src/components/dev/developer-panel.tsx` (ajuste de invalidate)

### Fora de escopo
- RLS / schema / migrations
- Novos módulos
- Refactor de Inbox/CRM internos
- Telefonia real

### Ordem de execução
1. Dashboard por role (#2) — destrava percepção de identidade.
2. Demo login flow (#1) — garante perfil correto carregado.
3. Sidebar + Softphone polish (#3, #4).
4. Smart Back + Quick Launch (#6, #7).
5. Filas (#8).
6. Dev Panel (#5).
7. Validação Playwright (#9).

### Critérios de aceite
- Atendente Demo → sidebar "Atendente Demo / ATENDENTE", abre AgentDashboard.
- Empresa Demo → CompanyDashboard, sem menus Governança Global.
- CEO Master → CEODashboard + menus Governança.
- Softphone não sobrepõe sidebar nem botão Lovable.
- Botão Voltar presente e funcional nas páginas listadas, nunca leva a /auth.
- Quick Launch sem comandos quebrados.
- /queues sem botões mortos.
