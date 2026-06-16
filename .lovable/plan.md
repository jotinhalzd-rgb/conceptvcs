# Plano — Correção dos 2 itens da Fase 0

## Item 1 — AI Studio: substituir "Em breve" por instalação real de agente

**Arquivo:** `src/components/ai-studio/ai-studio-view.tsx` (aba `marketplace`)

A tabela `ai_agents` já existe (12 colunas, RLS habilitada). Reaproveitar o `AgentEditor` que já cobre nome, descrição, instruções, status etc.

Mudanças:
1. Remover o bloco com a copy "Em breve: Instale agentes pré-treinados..."
2. Renderizar uma **galeria de templates de agentes pré-definidos** (lista estática local: Atendimento Farmácia, Agendamento Clínica, Suporte E-commerce, SDR B2B — cada um com `name`, `description`, `sector`, `instructions` sugeridas).
3. Cada card tem botão **"Instalar agente"** → chama mutation `installAgentTemplate` (novo hook `useInstallAgentTemplate` em `src/hooks/ai/use-agents.ts`):
   - `INSERT` em `ai_agents` com `organization_id = current_user_org()`, `is_active = true`, dados do template.
   - `onSuccess`: invalidar `["ai-agents"]`, toast de sucesso, abrir o `AgentEditor` no agente recém-criado para refinar (reusa `handleEdit`/`setIsCreating`).
4. Se já existe agente com mesmo `name+organization_id`, oferecer botão **"Editar agente"** em vez de "Instalar agente" (consultar `useAgents()` que já existe).
5. Estados: loading no botão durante mutation, toast em erro.

Nenhuma migration necessária — `ai_agents` já atende.

## Item 2 — Marketplace: `onConnect` real

**Arquivos:**
- `src/components/marketplace/marketplace-view.tsx`
- `src/hooks/marketplace/use-marketplace.ts` (adicionar mutations)
- `src/components/marketplace/install-modal.tsx` (novo)
- `src/components/marketplace/app-card.tsx` (mostrar status: Instalar / Configurar / Conectado / Remover)

Tabelas existentes: `hub_installs_marketplace` (6 col), `connected_integrations` (10 col). Reaproveitar — sem migration nova.

Mudanças:
1. Novo `InstallModal` (Dialog shadcn):
   - mostra nome/descrição do asset;
   - lista o que será configurado;
   - se asset depende de credencial externa (campo no asset OU heurística por categoria `telecom`/`finance`): aviso "Requer configuração de provedor — será marcado como pendente";
   - botão **Confirmar instalação**.
2. Novo hook `useInstallAsset()`:
   - `INSERT` em `hub_installs_marketplace` (`asset_id`, `organization_id`, `installed_at`, `status`);
   - `INSERT` em `connected_integrations` com `status = 'pending_configuration'` quando precisar de credencial, senão `'installed'`;
   - invalida `["hub-installs"]` e `["connected-integrations"]`.
3. Novo hook `useUninstallAsset()`:
   - `DELETE` em `hub_installs_marketplace` por `asset_id` + `ConfirmDialog`.
4. Em `marketplace-view.tsx`:
   - remover `onConnect={(id) => console.log(...)}`;
   - `onConnect` abre `InstallModal` com asset selecionado;
   - `AppCard` recebe `install` (registro existente) e mostra badge correto + ações (Configurar / Remover).
5. `AppCard` "Configurar": abre modal explicativo com link para `/settings/developer` quando depende de API key, ou aviso "Provedor externo — disponível após contratação" (sem fingir conexão).

## Verificação

- `bunx tsc --noEmit`
- `bun run build`
- `rg -n "Em breve|console\.log\(\"Connect" src/` → vazio
- QA manual: AI Studio → aba Marketplace → instalar template → editor abre; Marketplace → instalar app → card vira "Instalado" → remover.

## Fora de escopo

Integração real com provedores externos (Stripe, WhatsApp Cloud etc.) — apenas marcar `pending_configuration`.

## Relatório final entregará

arquivos alterados · hooks/componentes criados · confirmação `rg` vazio · status do build.
