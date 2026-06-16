ns# Prompt 1 — Fundação Omnichannel

Executar passo a passo, validando typecheck após cada parte. Sem trocar stack, sem mexer em RLS existente além do mínimo necessário.

## Parte 1 — Conectar `/queues` ao componente real

- Substituir `src/pages/queues.tsx` para renderizar `<QueuesManagement />` (já existente em `src/components/queues/queues-management.tsx`) dentro de `PageHeader` + `GlobalErrorBoundary`.
- Remover toasts "em breve" e cards fake (Comercial/Suporte/Financeiro mockados).
- Manter `StatsBox` no topo, mas alimentados pelo hook `useQueues()` (volume total, espera média, agentes online derivados das stats já calculadas).
- `EmptyState` quando lista vazia (já tratado no componente).
- Critério: criar Financeiro, Suporte, Vendas, Atendimento Geral via UI; persistem em `queues` com `organization_id`.

## Parte 2 — Migration mínima em `queues`

Tabela `queues` já tem: id, organization_id, name, description, color, priority_level, sla_threshold (interval), max_capacity, supervisor_id, metadata.

Faltam: `assignment_mode`, `is_default`, `is_active`, `is_demo`.

Migration:
```sql
ALTER TABLE public.queues
  ADD COLUMN IF NOT EXISTS assignment_mode text NOT NULL DEFAULT 'manual'
    CHECK (assignment_mode IN ('manual','auto')),
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_demo    boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS queues_one_default_per_org
  ON public.queues(organization_id) WHERE is_default;
```

Criar `queue_members` (não existe nenhum equivalente):
```sql
CREATE TABLE public.queue_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  queue_id uuid NOT NULL REFERENCES public.queues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  capacity int NOT NULL DEFAULT 10,
  priority int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(queue_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queue_members TO authenticated;
GRANT ALL ON public.queue_members TO service_role;
ALTER TABLE public.queue_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY queue_members_org ON public.queue_members
  FOR ALL TO authenticated
  USING (organization_id = current_user_org())
  WITH CHECK (organization_id = current_user_org());
CREATE TRIGGER queue_members_updated_at BEFORE UPDATE ON public.queue_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

Garantir coluna `routing_reason text` em `conversations` (se ainda não houver) para auditoria do roteamento:
```sql
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS routing_reason text;
```

## Parte 3 — Roteamento automático no processor

Arquivo: `supabase/functions/_shared/providers/processor.ts`.

Antes do insert de nova conversation:
1. Normalizar `message.body` (lowercase + remover acentos via `normalize('NFD').replace(/[\u0300-\u036f]/g,'')`).
2. `select * from routing_rules where company_id = <org_or_company> and is_active order by priority_bonus desc`.
3. Match: `normalized.includes(rule.keyword normalizada)`.
4. Se match → `queue_id = rule.target_queue_id`, `routing_reason = 'rule:' + keyword`.
5. Senão → buscar `queues where organization_id = orgId and is_default and is_active limit 1`, `routing_reason = 'default'`.
6. Nunca deixar `queue_id` nulo quando há default.
7. `console.log` com regra aplicada em DEV.

Nota: `routing_rules.company_id` hoje aponta para `companies`, e `queues.organization_id` é `organizations`. No seed demo a `organization` da demo será a fonte; usar `orgId` como `company_id` é incompatível com o FK. Solução pragmática: ler regras por `target_queue_id IN (queues da org)` — query:
```sql
select rr.* from routing_rules rr
join queues q on q.id = rr.target_queue_id
where q.organization_id = $1 and rr.is_active
order by rr.priority_bonus desc;
```
Sem alterar schema de `routing_rules`.

## Parte 4 — Distribuição automática

Após definir `queue_id`, dentro do processor:
- Buscar fila: se `assignment_mode = 'auto'`, executar least-busy:
  ```sql
  select qm.user_id,
         (select count(*) from conversations c
          where c.agent_id = qm.user_id and c.status in ('open','pending')) as load
    from queue_members qm
   where qm.queue_id = $1 and qm.is_active
   order by load asc, random()
   limit 1;
  ```
- Setar `agent_id`, `assigned_at = now()` na nova conversation.
- Se `manual` → `agent_id = null`.

## Parte 5 — Enriquecer `demo-seed.functions.ts`

Adicionar ao seed (idempotente, gated pelo `is_demo`):
- 4 filas demo (Financeiro, Suporte, Vendas, Atendimento Geral); Atendimento Geral com `is_default=true`, `assignment_mode='auto'`; demais `manual`. Todas `is_demo=true`.
- `queue_members`: atendente demo em Atendimento Geral (auto). Gerente demo em todas.
- `routing_rules` ligadas aos `queue_id` demo: keywords listadas no prompt (financeiro/boleto/pagamento/fatura/segunda via; suporte/erro/problema/ajuda; comprar/preço/plano/proposta/orçamento).
- 3 conversas demo já com `queue_id` correto + 1 mensagem cada; flag `is_demo=true`.
- 1–2 deals demo ligados aos contatos das conversas.

Tudo via `supabaseAdmin` no handler do server fn (já é o padrão do arquivo).

## Parte 6 — Inbox setorizado (mínimo)

- `chat-list.tsx`: exibir badge da fila (`conversation.queues.name`) + responsável (`profiles.full_name`) + `DemoBadge` quando `is_demo`.
- `chat-view.tsx` header: mostrar fila/responsável/status; botões Assumir / Transferir / Encerrar / Criar Oportunidade (reaproveitar `transfer-modal`, demais podem disparar `toast.info` se ainda não implementados — não criar botão novo se inexistente).
- Filtros: manter os existentes; não adicionar novos nesta etapa.

## Parte 7 — Transferência

Verificar `transfer-modal.tsx` continua funcionando após nova coluna; nenhum código novo previsto além de garantir refetch de `["conversations"]` no `onSuccess`.

## Parte 8 — Testes

- `bunx tsc --noEmit`.
- Playwright headless: login Atendente Demo → `/queues` mostra 4 filas → simular 3 mensagens via edge function `sim-webhook` → checar `queue_id` correto via `supabase--read_query`.
- Login Gerente Demo → transferir conversa entre filas.

## Entregáveis

Relatório final em PT-BR cobrindo arquivos alterados, migration, comportamento do processor, seed, status do build. Veredito:
- "Prompt 1 concluído: fundação omnichannel pronta." ou
- "Prompt 1 ainda possui bloqueadores: ..."

## Fora de escopo

Refactor de auth, troca de stack, novos módulos, mexer em RLS de outras tabelas, novos filtros de Inbox, UI polish.
