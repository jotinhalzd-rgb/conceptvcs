## Bloco 3.1 — Status atual

A maior parte do Bloco 3.1 **já foi entregue** no turno anterior. Este plano fecha o que falta validar/ajustar e produz o relatório final exigido antes de qualquer avanço para Campanhas/Relatórios.

### Já implementado (preservar, não refazer)

- **Migration** `20260616141346_*`: trigger `enforce_single_default_queue`, índice único `queue_members_queue_user_uniq`, realtime em `queues`/`queue_members`/`queue_routing_rules`.
- **Endpoint inbound real**: `src/routes/api/public/channels.$channelId.inbound.ts` (POST + OPTIONS/CORS), validação de canal, `x-webhook-token`, upsert de contato, dedup de mensagem, roteamento 4-tier (rules → channel default → fallback → org default), auto-assign por menor carga, log em `channel_webhooks_log`.
- **CRUD de filas**: `useUpdateQueue`, `useDeleteQueue`, `useQueueMembers`, `useAddQueueMember`, `useRemoveQueueMember` em `use-queues.ts`; `QueueEditDialog` com SLA, prioridade, `assignment_mode`, `is_default`, `is_active`, descrição, capacidade; aba de membros com `useOrgUsers`.
- **ChannelConfigDrawer**: aba Avançado com URL inbound, geração/rotação de `webhook_secret`, botão "Testar endpoint" enviando "quero falar com o financeiro".
- **Processor + routing_reason + notificações + realtime** do Bloco 3 mantidos.

### Pendências reais do Bloco 3.1

1. **Verificação executável** — rodar e reportar:
   - `bunx tsc --noEmit` (esperado: 0 erros).
   - Buscas proibidas: `rg -n "Em breve|coming soon|não implementado|próxima sprint|TODO" src/`.
   - Buscas no-op: `rg -n "onClick=\{\(\) => \{\}\}|console\.log\(" src/components src/hooks`.
2. **Teste end-to-end via curl** ao endpoint real usando o `webhook_secret` da Drawer, confirmando JSON `{ conversation_id, queue_id, routing_reason, assigned_agent_id }`.
3. **Smoke UI**: abrir `/queues` → criar/editar/excluir, alternar `is_default` (confirmar que zera os outros), adicionar/remover membro, alternar manual↔auto e repetir o teste inbound.
4. **Relatório final** (entregue na resposta, não em arquivo) cobrindo todos os itens exigidos: arquivos alterados, migrations, payload, resposta esperada, comando curl, comportamento de manual vs auto, resultado de typecheck/buscas, riscos remanescentes.

### Riscos conhecidos a declarar no relatório

- Endpoint inbound é **técnico**: não faz handshake real com Meta/Twilio/360dialog/Evolution — providers externos continuam dependendo de credenciais e webhooks específicos.
- Auto-assign usa "menor carga" simples (sem skills/horário/capacidade por agente).
- `queue_members.organization_id` é exigido no insert; UI já passa `profile.organization_id`, mas RLS pode rejeitar se o membro pertencer a outra org — comportamento esperado.
- `channel_webhooks_log` é append-only; não há UI de inspeção ainda (fora do escopo deste bloco).

### Ordem de execução

1. Rodar typecheck + buscas em paralelo.
2. Smoke do endpoint via `curl` no preview (usar token gerado na Drawer).
3. Compilar relatório final com evidências e entregar — **sem iniciar Bloco 4**.

Nenhuma alteração de código nova é necessária a menos que o typecheck/buscas revelem regressão; nesse caso, corrigir pontualmente antes do relatório.
