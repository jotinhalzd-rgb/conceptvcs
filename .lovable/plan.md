# Smoke Test Final Multi-Perfil — Pré-Piloto

## Objetivo
Validação final visual e funcional. Sem novos módulos, sem refactor — apenas reproduzir os 5 fluxos, registrar status e corrigir somente bloqueadores.

## Estratégia de execução
Usar Playwright headless contra `localhost:8080`, um script por perfil, reaproveitando os acessos rápidos DEV/PREVIEW para login. Screenshot a cada passo crítico, console + network capturados em log por perfil.

```
/tmp/browser/smoke/
  run_atendente.py
  run_empresa.py
  run_gerente.py
  run_ceo.py
  run_supervisor.py
  screenshots/<perfil>/NN_passo.png
  logs/<perfil>.log
```

## Etapas

### 1. Preparação (sem mudanças de código)
- Confirmar dev server na porta 8080.
- `bunx tsc --noEmit` — baseline verde.
- Auditar `useQuickLaunch` + sidebar para garantir que todas as rotas obrigatórias existem em `src/routes/`.

### 2. Execução dos 5 perfis
Para cada perfil, rodar o fluxo descrito no briefing, capturando:
- URL final de cada passo
- Screenshot
- Console errors / network 4xx-5xx
- Persistência após reload (Inbox nota interna, CRM Kanban)

Critérios de falha imediata:
- Tela branca / loading infinito (>5s sem render)
- Role/nome do perfil incorreto na sidebar
- Empresa Demo carregando Master View
- Atendente vendo widgets CEO
- Botão crítico sem feedback (dead button)
- 404 a partir de Quick Launch / QuickActionsBar

### 3. Rotas obrigatórias
Loop separado abrindo cada rota da lista (`/auth`, `/dashboard`, `/inbox`, `/customers`, `/crm`, `/queues`, `/reports`, `/campaigns`, `/knowledge`, `/supervisor`, `/admin/companies`, `/admin/channels`, `/admin/audit`, `/settings/billing`, `/settings/developer`, `/settings/marketplace`) como CEO Master, screenshot + check de root error boundary.

### 4. Responsividade
Reexecutar trecho curto (dashboard + inbox + CRM + customer 360 + filas) em três viewports:
- 1440x900 (desktop)
- 1280x800 (notebook)
- 390x844 (mobile)
Verificar overflow de sidebar/softphone sobre botões críticos.

### 5. Correções
Apenas bloqueadores 🔴 (tela branca, role errada, crash, botão morto sem feedback). Sem polish, sem renomear, sem refactor.

### 6. Build final
- `bunx tsc --noEmit`
- `bun run build` se configurado
- Apenas erros bloqueantes corrigidos.

## Entrega
Tabela final por (perfil × fluxo) com Status / Problema / Correção / Pendência / Bloqueia? e veredito:
- "ONECONTACT OS aprovado para apresentação piloto", ou
- "ONECONTACT OS ainda possui bloqueadores" + lista.

## Fora de escopo
Novos módulos, refactor profundo, mudanças de UX, RLS/segurança, troca de libs, novas features.
