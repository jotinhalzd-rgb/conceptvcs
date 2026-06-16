## Prompt 3/3 — QA Final, Acabamento e Preparação para Piloto

**Sem novos módulos. Sem novas features. Sem refator amplo.** Apenas varredura, correção de regressões, consistência e validação. Núcleo omnichannel e módulos avançados (A1–A4, Ondas B e C) permanecem intocados, exceto correções pontuais.

---

### Bloco 1 — Varredura global (read-only → fix pontual)

Buscas obrigatórias com `rg` em `src/`:
- `"Em breve"`, `"coming soon"`, `"não implementado"`, `"próxima sprint"`
- `TODO`, `FIXME` visíveis em UI
- `onClick={() => {}}`, `onClick={() => null}`, handlers no-op
- `console.log` sem `import.meta.env.DEV`
- `toast(` genérico sem ação real associada
- `<Link to="` apontando para rotas inexistentes (cruzar com `routeTree.gen.ts`)
- imports não usados que disparam erro de build

Para cada ocorrência: corrigir no arquivo, sem remover funcionalidade existente.

### Bloco 2 — QA multi-perfil

Verificar para CEO Master, Empresa Demo, Gerente, Atendente, Supervisor IA:
- login → dashboard correto (sem tela branca)
- sidebar filtrada por papel (já existente — só validar)
- rotas bloqueadas mostram empty state, não crash
- logout limpa sessão

Correções apenas onde houver tela branca, loop ou erro de RLS.

### Bloco 3 — QA fluxo comercial "financeiro"

Validar end-to-end (Canais → Filas → inbound sim-webhook "quero falar com o financeiro" → roteamento por keyword → notificação no sino → Inbox → resposta + anexo + áudio + emoji + nota → Customer 360 → CRM → Campanha → Relatórios → CSV).

Corrigir somente quebras encontradas no caminho.

### Bloco 4 — QA módulos avançados

Smoke test rápido: AI Studio, Automação, Developer (API keys + webhooks), Notificações, Business Hub, OIL/Advisor, Voice, Billing, White Label.
Garantir empty states honestos e `pending_configuration` onde falta provedor.

### Bloco 5 — Consistência de UX (pontual)

Padronizar somente o que estiver visivelmente fora:
- empty states usando `EmptyState` (já existe em `src/components/ui/empty-state.tsx`)
- confirmação destrutiva em delete (AlertDialog onde faltar)
- botões primários/secundários consistentes
- loading skeletons no padrão `animate-pulse bg-white/[0.02]`

Sem redesign.

### Bloco 6 — Rotas e navegação

Cruzar sidebar (`app-layout.tsx`) e todos os `<Link to="...">` contra `src/routes/`. Corrigir links órfãos; garantir que `SmartBackButton` funciona onde já está em uso.

### Bloco 7 — Segurança/RLS

Confirmar via `supabase--linter` que tabelas novas (voice_extensions, ivr_flows, call_logs, white_label_configs_v2, notifications, user_notification_preferences) têm:
- RLS habilitada
- política scoped a `organization_id` / `user_id`
- GRANT correto

Se linter apontar algo nas tabelas que tocamos, corrigir via migration nova.

### Bloco 8 — Performance leve

- `enabled: !!orgId` em queries dependentes (auditoria rápida em `src/hooks/`)
- sem refetchInterval agressivo
- sem listas sem paginação/filtro visíveis no piloto

### Bloco 9 — Higiene de produção

- `console.log` restantes → envolver em `if (import.meta.env.DEV)` ou remover
- preservar `console.error`
- limpar imports não usados que gerem warning de build

### Bloco 10 — Validação final

```bash
rg -n "Em breve|coming soon|não implementado|próxima sprint" src/
rg -n "onClick=\{\(\) => \{\}\}|onClick=\{\(\) => null\}" src/
rg -n "console\.log\(" src/ | rg -v "import.meta.env.DEV"
rg -n "TODO|FIXME" src/
bunx tsc --noEmit
```

E `supabase--linter` para RLS.

---

### Entregáveis

1. Relatório final com status **APROVADO PARA PILOTO** ou **BLOQUEADO**.
2. Lista de correções aplicadas (arquivo + motivo).
3. Resultado de cada busca proibida (idealmente 0 hits).
4. Resultado `tsc --noEmit`.
5. Resultado do linter RLS.
6. Riscos não-bloqueantes e recomendações pós-piloto.

### Fora de escopo (não fazer)

- Novos módulos, novas rotas, novas tabelas (exceto correção RLS pontual).
- Refator de núcleo omnichannel.
- Integração real com Stripe/Twilio/Meta (segue `pending_configuration`).
- Redesign visual.
- Prompt 4.

### Estimativa de arquivos tocados

10–25 arquivos com edições cirúrgicas (textos, handlers, links, console). Possivelmente 1 migration se o linter apontar RLS faltando.

Aguardando aprovação para iniciar a varredura.
