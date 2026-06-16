# Plano A2 — Automação

Escopo isolado: **somente** Automação. Não tocar AI Studio (A1), núcleo omnichannel, Marketplace, Inbox, CRM, Campanhas, Relatórios, Notificações básicas. Preservar RLS.

## 1. Schema real verificado

`automation_workflows` (existe): `id, organization_id, name, trigger_event, nodes jsonb, is_active, created_at, updated_at`.
→ Sem coluna `description`, `queue_id`, `channel_id`, `responsible_id`, `status`, `conditions`. Esses campos serão armazenados **dentro de `nodes jsonb`** (`nodes.description`, `nodes.queue_id`, `nodes.channel_id`, `nodes.responsible_id`, `nodes.conditions[]`, `nodes.actions[]`). Status ativo/inativo usa `is_active`.

`automation_logs` (existe, mas restritivo): `id, workflow_id, node_id, action_type, contact_id NOT NULL, status, metadata jsonb, created_at`.
→ Faltam `organization_id`, `trigger_event`, `input`, `output`, `error_message`, `created_by`, e `contact_id` é obrigatório (quebra teste manual sem contato).

## 2. Migration mínima e segura

Uma única migration:

- `ALTER TABLE automation_logs ALTER COLUMN contact_id DROP NOT NULL`;
- `ALTER TABLE automation_logs ALTER COLUMN node_id DROP NOT NULL`;
- `ALTER TABLE automation_logs ALTER COLUMN action_type DROP NOT NULL`;
- `ADD COLUMN organization_id uuid REFERENCES organizations(id)`;
- `ADD COLUMN trigger_event text`;
- `ADD COLUMN input jsonb`;
- `ADD COLUMN output jsonb`;
- `ADD COLUMN error_message text`;
- `ADD COLUMN created_by uuid`;
- Backfill `organization_id` a partir do `workflow_id`;
- Index `(organization_id, created_at desc)` e `(workflow_id, created_at desc)`;
- RLS: substituir policy existente por policies não-recursivas baseadas em `current_user_organization_id()` (SELECT/INSERT escopados por `organization_id`); GRANT para `authenticated` e `service_role`.

Nenhuma alteração estrutural em `automation_workflows`.

## 3. Server functions (`src/lib/automation/`)

Arquivos novos, todos com `requireSupabaseAuth`, leitura escopada por `context.userId` → `organization_id` via profile:

- `automation.functions.ts`:
  - `listAutomations` (com filtros opcionais status/trigger);
  - `getAutomation(id)`;
  - `upsertAutomation(payload)` — valida nodes via Zod;
  - `toggleAutomation(id, is_active)`;
  - `deleteAutomation(id)`;
  - `duplicateAutomation(id)`.
- `automation-logs.functions.ts`:
  - `listAutomationLogs({ workflow_id?, status?, limit })`.
- `test-automation.functions.ts`:
  - `testAutomation({ workflow_id, payload })` — executa **uma vez, manual**, percorre `nodes.actions[]`; para cada ação:
    - `create_notification` → insert em `notifications` (título prefixado `[TESTE]`, user_id = caller);
    - `assign_queue` → valida `queue_id` na org; **não** altera conversa real no teste, retorna “seria atribuída para fila X”;
    - `create_crm_task` → cria em `crm_tasks` **somente** se `payload.contact_id` e/ou `deal_id` válidos da org; senão retorna erro útil;
    - `log_event` → insert em `automation_logs` com `status='success'`;
  - Sempre grava 1 log agregado em `automation_logs` com `input`, `output`, `error_message`, `trigger_event`, `organization_id`, `created_by`.

Nenhum scheduler/worker novo — execução automática **não** é prometida.

## 4. Hooks (`src/hooks/automation/`)

- `use-automations.ts`: queries (`automations`, `automation:{id}`), mutations (upsert/toggle/delete/duplicate), invalidação.
- `use-automation-logs.ts`: query paginada simples.
- `use-test-automation.ts`: mutation que chama `testAutomation`.

## 5. UI (`src/components/automation/`)

Novos / ajustados:

- `automation-list.tsx`: tabela com nome, descrição (de nodes), trigger_event (badge), status switch, nº de ações, última execução (join leve via logs query), ações (editar / testar / duplicar / excluir via `AlertDialog`). Filtros por status e trigger. Empty state com CTA real.
- `automation-editor-drawer.tsx`: Drawer com formulário (nome, descrição, trigger_event Select, is_active Switch, queue_id Select opcional, channel_id Select opcional, responsible_id Select opcional, lista editável de **condições** e **ações** com selects+inputs, JSON preview read-only). Validação Zod. Salvar via `upsertAutomation`.
- `automation-test-dialog.tsx`: Dialog com textarea de payload JSON (com template por trigger), botão “Executar teste”, resultado por ação (✓/✗ + mensagem), aviso claro: *“Execução manual única. Não dispara worker automático.”*
- `automation-logs-panel.tsx`: lista últimos 50 logs com badge status, trigger_event, data, drawer de detalhe (input/output/error). Filtro por workflow e status.
- `automation-delete-dialog.tsx`: `AlertDialog` de confirmação.
- Pequeno banner honesto na topo da listagem: *“Gatilhos conectados automaticamente: novo conversation_created via trigger DB existente. Demais gatilhos disponíveis apenas para teste manual nesta versão.”* (texto baseado no que existir de fato — confirmar antes de afirmar).

`workflow-builder.tsx` existente: manter como está se não estiver referenciado pelo fluxo principal; se for legado quebrado, esconder do menu e marcar TODO interno (não exibir “Em breve”).

## 6. Gatilhos e ações suportados

Triggers no Select: `conversation_created`, `conversation_routed`, `conversation_no_reply`, `deal_created`, `campaign_created`, `sla_risk`.
Ações: `create_notification`, `assign_queue`, `create_crm_task`, `log_event`.

## 7. Linguagem honesta

Sem “Em breve”, sem toasts genéricos. Mensagens permitidas:
- “Execução automática não conectada para este gatilho — disponível para teste manual.”
- “Automação salva.”
- “Teste executado com sucesso / erro: …”

## 8. Validação

- `bunx tsc --noEmit`;
- `rg -n "Em breve|coming soon|não implementado|próxima sprint" src/`;
- `rg -n "onClick=\{\(\) => \{\}\}|onClick=\{\(\) => null\}" src/`;
- `rg -n "TODO" src/components/automation src/hooks/automation src/lib/automation`;
- Smoke manual: criar → editar → ativar/desativar → duplicar → testar (com cada ação) → ver log → excluir.
- Regressão: AI Studio abre, Inbox lista conversas, Marketplace conecta canal, sino notifica.

## 9. Riscos conhecidos

- `automation_logs` antes só aceitava contact_id obrigatório — a migration relaxa isso; verificar se algum código legado insere logs com schema antigo (busca já planejada).
- `nodes` jsonb sem schema forte no banco — Zod no servidor garante forma.
- Execução automática real (worker / pg triggers para cada `trigger_event`) **fica fora do A2** e será comunicada na UI.

## 10. Arquivos previstos

Novos: migration, `src/lib/automation/automation.functions.ts`, `automation-logs.functions.ts`, `test-automation.functions.ts`, `src/hooks/automation/use-automations.ts`, `use-automation-logs.ts`, `use-test-automation.ts`, `src/components/automation/automation-list.tsx`, `automation-editor-drawer.tsx`, `automation-test-dialog.tsx`, `automation-logs-panel.tsx`, `automation-delete-dialog.tsx`.
Ajustes: view de Automação (rota existente) para montar list + logs panel.

Após aprovação: rodo migration → implemento server fns + hooks + UI → valido → entrego relatório A2 e aguardo OK antes de A3.
