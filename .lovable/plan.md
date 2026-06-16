# Smoke Test Final Pós-Correção do Login

## Objetivo
Validar que a correção (`ensureDemoData` com try/catch + retry no `/auth`) estabilizou o login demo e que o fluxo piloto continua íntegro. Corrigir somente bloqueadores. Sem novas features.

## Estratégia

Playwright headless contra `http://localhost:8080`. Um único script orquestra os 5 perfis, mais um passo de "rotas + responsividade" rodando como CEO Master.

```
/tmp/browser/smoke2/
  run.py                    # 5 perfis + rotas + responsividade
  screenshots/<perfil>/...
  logs/run.json
```

## Etapas

### 1. Baseline
- `bunx tsc --noEmit` — confirma typecheck verde após patch.
- `curl /` — confirma dev server respondendo.

### 2. Login dos 5 perfis (CEO Master, Empresa Demo, Gerente Demo, Atendente Demo, Supervisor IA)
Para cada perfil em contexto isolado:
1. `goto /auth`, clica o card, aguarda redirect para `/dashboard`.
2. Captura nome + role visíveis na sidebar.
3. Confirma ausência de blank screen, ausência de erros runtime de `pageerror`, ausência de 500 em respostas `_serverFn`.
4. Logout via UI; verifica volta a `/auth` e localStorage limpo.

Critérios de falha imediata:
- blank screen, loading >5s, role/nome errados, herança de cache, 500 em `_serverFn/ensureDemoData`.

### 3. Retry automático (cold-start)
Inspecionar `src/routes/auth.tsx` para confirmar:
- chamada principal a `ensureDemoFn`;
- segunda tentativa apenas se `!res?.password`;
- toast amigável + sem loop infinito no caminho de falha.

Verificação dinâmica: forçar o cold-start derrubando o módulo do dev server (`touch src/lib/demo-seed.functions.ts`) e tentar o login imediatamente. Esperado: 1 retry, login OK.

### 4. Tratamento de `{ ok: false, error }`
Confirmar no código `auth.tsx` que:
- mensagem técnica vai só ao `console.error`;
- usuário vê toast amigável;
- não há redirect cego para `/dashboard`.

### 5. Fluxo Atendente Demo (smoke funcional)
Login → Inbox → abrir conversa demo → enviar msg simulada → criar nota interna → reload → confirmar persistência → Customer 360 → criar oportunidade → CRM → mover card no Kanban → reload → confirmar persistência → Dashboard → logout. Screenshot em cada etapa.

### 6. Fluxos Empresa Demo / CEO Master
- Empresa Demo: dashboard ≠ Master View, `/admin/channels` mostra canal demo com `DemoBadge`, `/reports` com empty state ou DEMO, `/crm` carrega, logout.
- CEO Master: `/dashboard` Master, widgets com `DemoBadge`, `/admin/companies`, `/admin/audit`, `/dashboard/ai-studio` ou `/dashboard/hub` (Labs/Avançado), logout.

### 7. Rotas obrigatórias (CEO Master logado)
Loop por `/auth`, `/dashboard`, `/inbox`, `/customers`, `/crm`, `/queues`, `/reports`, `/campaigns`, `/knowledge`, `/supervisor`, `/admin/companies`, `/admin/channels`, `/admin/audit`, `/settings/billing`, `/settings/developer`, `/settings/marketplace`. Cada rota: status 200, corpo renderizado, sem `pageerror`.

### 8. Botões críticos (spot-check)
QuickActionsBar (Inbox + Simular), Quick Launch, "Criar Fila", "Gerenciar Fila", "Configurar Canal", "Voltar". Confirmar feedback (navegação ou `toast.info`) — nenhum botão morto.

### 9. Responsividade
Reexecutar Inbox + CRM + Customer 360 + Queues em 3 viewports: 1440x900, 1280x800, 390x844. Verificar overflow de sidebar/softphone.

### 10. Correções
Aplicar só para bloqueadores 🔴 (blank screen, role errada, 500, botão morto). Sem polish.

### 11. Build final
`bunx tsc --noEmit` (e `bun run build` se ainda for rápido o suficiente para caber no timeout — pular se demorar). Apenas erros bloqueantes corrigidos.

## Entrega
Tabela (perfil × passo) com Status / Bug / Correção / Pendência / Bloqueia? + veredito:
- "ONECONTACT OS aprovado para apresentação piloto." ou
- "ONECONTACT OS ainda possui bloqueadores para apresentação piloto."

## Fora de escopo
Novos módulos, refactor profundo, mudanças de UX, RLS adicional, troca de libs.
