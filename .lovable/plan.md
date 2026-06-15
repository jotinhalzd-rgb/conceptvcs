## Objetivo
Adicionar um botão "Voltar" consistente nas páginas internas do app, permitindo retornar à página anterior com 1 clique.

## Abordagem
Criar um componente reutilizável `BackButton` e integrá-lo no cabeçalho do `AppLayout` (ou nas páginas que não estão no topo da navegação), evitando duplicação.

## Passos

1. **Criar `src/components/layout/back-button.tsx`**
   - Usa `useRouter()` do `@tanstack/react-router` → `router.history.back()`.
   - Fallback: se `window.history.length <= 1`, navega para `/dashboard` via `useNavigate`.
   - Visual: `Button variant="ghost" size="sm"` com ícone `ArrowLeft` da `lucide-react` + label "Voltar".
   - Props: `to?: string` (destino fixo opcional), `label?: string`, `className?: string`.
   - Oculto automaticamente em rotas raiz (`/`, `/dashboard`, `/auth`).

2. **Integrar no `src/components/layout/app-layout.tsx`**
   - Renderizar `<BackButton />` no topo da área de conteúdo (acima do `<Outlet />`), apenas quando a rota atual não for uma das raízes listadas.
   - Usar `useRouterState({ select: s => s.location.pathname })` para decidir visibilidade.

3. **Mobile**
   - Em `src/components/mobile/layout/mobile-navigation.tsx` (ou no header mobile correspondente), exibir o mesmo `BackButton` no canto esquerdo do header quando não estiver na tela inicial.

4. **Validação**
   - Navegar entre Inbox → Conversa → voltar; CRM → Deal → voltar; Settings → Developer → voltar.
   - Garantir que em `/dashboard` o botão não aparece.
   - Verificar acessibilidade (`aria-label="Voltar"`).

## Fora do escopo
- Breadcrumbs completos.
- Mudanças no roteamento ou criação de novas rotas.
- Histórico persistente entre reloads.

## Arquivos a alterar
- `src/components/layout/back-button.tsx` (novo)
- `src/components/layout/app-layout.tsx`
- `src/components/mobile/layout/mobile-navigation.tsx`
