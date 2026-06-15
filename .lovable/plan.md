## Objetivo
Padronizar o cabeçalho de todas as páginas internas com um componente global `PageHeader` que inclui botão "Voltar", título, descrição e ações à direita. Remover o atual `BackButton` solto e o elemento branco sem função no topo da tela `/queues`.

## Componente novo: `src/components/layout/page-header.tsx`

API:
```ts
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backTo?: string;            // override do fallback
  showBackButton?: boolean;   // default true
  actions?: React.ReactNode;  // botões à direita
  className?: string;
}
```

Comportamento do "Voltar":
- `router.history.back()` quando `window.history.length > 1`.
- Senão usa `backTo` se fornecido, senão mapa de fallback por rota (default `/dashboard`).
- Oculto automaticamente em `/`, `/auth`, `/dashboard`, `/dashboard/`.

Mapa de fallback (interno ao componente):
```
/queues, /inbox, /customers, /crm, /reports, /campaigns, /knowledge,
/supervisor, /opportunities, /admin/*, /settings/*, /dashboard/hub,
/dashboard/ai-studio  → /dashboard
```

Visual (tokens do design system, sem hex hardcoded):
- Linha 1: `<BackButton>` à esquerda + breadcrumb opcional.
- Linha 2 (flex justify-between): bloco título (eyebrow uppercase tracking-wider em `text-primary/80`, `h1` bold com gradiente já usado no app, `p` `text-muted-foreground`) + `actions` à direita.
- Botão Voltar: `ghost` com `bg-slate-900/75 border border-slate-800 hover:bg-indigo-950 hover:border-indigo-500/40 text-slate-200 rounded-xl h-9 px-3 gap-2 transition-colors`, `aria-label="Voltar"`, foco visível via `focus-visible:ring-1 ring-ring`.
- Responsivo: em `sm:` ações vão para a direita; em mobile empilham abaixo do título.

## Integração no layout

`src/components/layout/app-layout.tsx`:
- Remover o `<BackButton />` injetado anteriormente no header e na área principal (passos da iteração anterior).
- Manter apenas a barra de busca/notificações no header global; o `PageHeader` por página cuidará do "Voltar" + título.

## Páginas a refatorar (substituir título atual por `<PageHeader>`)

Inserir/substituir o cabeçalho atual nas views:
- `src/components/queues/queues-management.tsx` — remover o quadrado branco solto ao lado de "Criar Fila"; mover "Criar Fila" para `actions`.
- `src/components/inbox/inbox-view.tsx` (apenas se houver título de página; se for fullscreen, montar PageHeader compacto acima).
- `src/components/customer-360/customer-view.tsx`
- `src/components/crm/crm-view.tsx`
- `src/components/campaigns/campaigns-view.tsx`
- `src/components/channels/channels-view.tsx` (admin/channels)
- `src/routes/reports.tsx`, `src/routes/knowledge.tsx`, `src/routes/supervisor.tsx`, `src/routes/opportunities.tsx`
- `src/routes/admin.companies.tsx`, `src/routes/admin.audit.tsx`, `src/routes/admin.channels.tsx`
- `src/routes/settings.billing.tsx`, `src/routes/settings.developer.tsx`, `src/routes/settings.marketplace.tsx`
- `src/components/ai-studio/ai-studio-view.tsx`
- `src/components/hub/business-hub-view.tsx`

Cada chamada segue o padrão:
```tsx
<PageHeader
  eyebrow="Fluxo Operacional de Distribuição"
  title="Gestão de Filas"
  description="Controle em tempo real da carga de trabalho e eficiência por departamento."
  actions={<Button>+ Criar Fila</Button>}
/>
```

## Correções pontuais
- `/queues`: remover o `<div className="bg-white ...">` (caixa branca sem função) identificado na captura; mover apenas o botão "Criar Fila" para `actions`.
- Auditar cada view convertida para garantir que nenhum elemento branco solto sobre fundo escuro permaneça.

## Acessibilidade
- `aria-label="Voltar"`, `role="navigation"` no wrapper do header opcional.
- Tab order: Voltar → título (não focável) → ações.
- Suporte Enter/Espaço nativo do `<button>`.

## Fora do escopo
- Refazer rotas, criar `/_authenticated`, novos módulos ou novas funcionalidades.
- Mudar o sidebar/topbar global além de remover o BackButton injetado.
- Mobile shell (apenas garantir que o PageHeader empilha corretamente em telas pequenas).

## Validação
Abrir cada rota da lista de testes obrigatórios e confirmar:
1. Botão aparece e não cobre o título.
2. Voltar funciona (histórico ou fallback `/dashboard`).
3. Ações à direita continuam funcionando.
4. Sem elementos brancos soltos.
5. Layout não quebra em mobile (DevTools 375px).
