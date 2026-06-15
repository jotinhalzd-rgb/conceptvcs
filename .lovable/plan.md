# Restaurar Acessos Rápidos DEV/PREVIEW em /auth

## Causa raiz

Os cards são renderizados condicionalmente por `isDevEnvironment()`, que lê `window.location.hostname`. Durante o SSR `window` é `undefined` e a função retorna `false` — o HTML inicial não traz os cards. Em alguns refreshes a hidratação não “acende” o estado a tempo (ou a rota redireciona antes via `useEffect(session → /dashboard)` quando havia sessão residual), e os cards somem visualmente. Nenhuma mudança da camada global (QueryClient/ErrorBoundary) removeu o código — só o gate de ambiente ficou frágil pós-SSR.

## Mudanças

### 1. `src/lib/dev-mode.ts` — `isDevEnvironment()` mais robusto
- Considerar (qualquer um já habilita):
  - `import.meta.env.DEV === true`
  - `import.meta.env.VITE_ENABLE_DEV_ACCESS === "true"`
  - `hostname` em `localhost` / `127.0.0.1` / `.local`
  - `hostname` termina em `.lovable.app` **e** (`startsWith("id-preview--")` | `includes("--")` | `includes("-dev.")` | `includes("preview")` | `includes("staging")`)
- Continuar retornando `false` em produção real (custom domain) e em `*.lovable.app` sem marcadores de preview.

### 2. `src/routes/auth.tsx` — render independente + sem SSR mismatch
- Trocar `const devMode = isDevEnvironment()` por estado hidratado:
  ```ts
  const [devMode, setDevMode] = useState(false);
  useEffect(() => { setDevMode(isDevEnvironment()); }, []);
  ```
  Garante que o gate só decide no cliente, sem mismatch de SSR.
- Adicionar `ssr: false` na rota `/auth` (a tela de login não precisa de SSR e a UI dela depende de `window`/Supabase de qualquer modo). Isso elimina o flash de HTML sem cards.
- Manter a seção de cards **fora** de qualquer query autenticada: ela já está. Confirmar que nenhum `Suspense`/`useSuspenseQuery` envolve a `section`.
- Tratamento de erro por card já existe via `toast.error` + `demoLoading` por email. Adicionar mensagens claras:
  - “Usuário demo não encontrado” quando `res.password` ausente.
  - “Senha demo inválida” em `signInWithPassword` retorno `Invalid login credentials`.
  - “Falha ao criar sessão” em catch genérico.
- Garantir que o estado `demoLoading` é resetado no `finally` (já está) — sem loading infinito.
- Verificar que não existe botão “Sair do sistema” no JSX (não existe hoje; manter assim).

### 3. Resiliência global não pode esconder /auth
- Confirmar que `AuthSyncBridge` em `__root.tsx` apenas invalida router/queries em `SIGNED_IN/OUT/USER_UPDATED` — não dispara navegação para `/dashboard` a partir da `/auth` quando não há sessão. Sem alteração esperada.
- `ErrorComponent` global só renderiza quando o `errorComponent` do root pega exceção do `loader/render`. `/auth` não tem loader nem query autenticada → não acionará. Sem alteração.

## Arquivos tocados

- `src/lib/dev-mode.ts` — função expandida.
- `src/routes/auth.tsx` — `ssr: false`, gate via `useEffect`, mensagens de erro mais específicas.

## Fora de escopo

- Mudar Supabase Auth, RLS, triggers, `demo-seed.functions.ts`, providers.
- Refatorar `useAuth`, layout, ou QueryClient.
- Tema/visual dos cards (mantém o atual).

## Validação no Preview

1. Abrir `/auth` no preview Lovable → 5 cards visíveis.
2. Clicar cada um (CEO Master → Supervisor IA) → login OK, redireciona para `/dashboard`.
3. Logout entre cada login → cards reaparecem.
4. Abrir `https://conceptvcs.lovable.app/auth` (custom domain produção) → cards ocultos.
5. Erro forçado (senha inválida) → toast claro, sem loading infinito.
