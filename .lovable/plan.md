# Plano — Correção Sidebar + Acesso Demo

## Causas identificadas

**1. Botão telefone sobrepondo sidebar**
`src/components/voice/softphone-widget.tsx:41` — posicionado em `fixed bottom-6 left-6 z-50`, exatamente sobre o rodapé da sidebar (avatar, nome, role, sair, recolher).

**2. Atendente Demo aparece como "CEO DEMO"**
- `src/components/layout/app-layout.tsx:212` tem fallback **hardcoded** `"CEO DEMO"` quando `profile.full_name` ainda não carregou.
- Mapeamento de role na linha 214 não cobre `ceo`, `agent`, `supervisor` — só `ceo_master`, `admin`, `manager`, e cai em "ATENDENTE" como default (errado para CEO/supervisor).
- `isCEOMaster` (linha 60) trata `role === 'ceo'` como master, expondo menus de governança ao Empresa Demo.
- Login demo não limpa cache do React Query nem sessão anterior, então o `useProfile()` do usuário antigo permanece visível por alguns ms após o `signIn`.

## Correções

### A. Softphone (Opção A — FAB inferior direito)
`src/components/voice/softphone-widget.tsx`
- Trocar `bottom-6 left-6` → `bottom-6 right-6`.
- Manter `z-50`, garantir que não conflita com o botão Lovable (que fica no canto também) movendo para `bottom-24 right-6` em telas pequenas se necessário.
- Em DEV/preview, manter visível mas com tooltip "Discador em desenvolvimento" se ainda sem função real (não alterar lógica do widget agora — só posição).

### B. Sidebar — remover hardcode e ampliar mapeamento de role
`src/components/layout/app-layout.tsx`
- Linha 212: remover fallback `"CEO DEMO"` → usar `profile?.full_name ?? user?.email ?? "Carregando..."`.
- Linha 214: criar helper `roleLabel(role)` cobrindo todos os papéis:
  - `ceo_master` → "CEO MASTER"
  - `ceo` → "CEO / EMPRESA"
  - `admin` → "ADMIN"
  - `manager` → "GERENTE"
  - `supervisor` → "SUPERVISOR IA"
  - `agent` → "ATENDENTE"
  - default → role.toUpperCase()
- Linha 60: `isCEOMaster` só para `ceo_master` (separar de `ceo`); criar `isCompanyAdmin` para `ceo`/`admin` se o menu precisar.

### C. Limpar cache entre logins demo
`src/routes/auth.tsx` (`handleDemoLogin`)
- Antes do `signInWithPassword`: `await supabase.auth.signOut()` + `queryClient.clear()` (importar `useQueryClient`).
- Após sign-in: `await queryClient.invalidateQueries()` para forçar refetch do profile novo.
- Limpar override dev: `localStorage.removeItem("onecontact_dev_role")` para não persistir papel anterior.

### D. Validação pós-login (defensiva)
Após o sign-in, ler `supabase.auth.getUser()` e conferir que `user.email === demoEmail`. Se não bater, signOut + erro "Perfil demo não corresponde".

## Arquivos alterados
1. `src/components/voice/softphone-widget.tsx` — reposicionar FAB.
2. `src/components/layout/app-layout.tsx` — remover hardcode, helper `roleLabel`, separar `isCEOMaster` de `ceo`.
3. `src/routes/auth.tsx` — limpar cache/sessão antes de cada login demo + validação.

## Fora de escopo
Sem mudanças em RLS, Supabase Auth, schema, ou criação de módulos novos.

## Testes (preview)
Roteiro de cliques: CEO Master → Empresa Demo → Gerente Demo → Atendente Demo → Supervisor IA. Em cada um, verificar via Playwright:
- nome correto no rodapé da sidebar
- label de role correto
- softphone no canto inferior **direito** sem cobrir nada
