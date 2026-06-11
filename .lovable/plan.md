# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 3 (INBOX UNIVERSAL)

Este plano detalha a construção da central operacional de atendimento do ONECONTACT OS, focando em produtividade, automação de distribuição e gestão de SLA.

---

## 1. ARQUITETURA E ESTRUTURA DE DADOS

A fundação de dados foi expandida para suportar a complexidade de uma operação Enterprise.

### Entidade: Conversation (Conversas)
- **Status:** Implementação de máquina de estados: `new` (Novo), `active` (Em Atendimento), `waiting_customer` (Aguardando Cliente), `transferred` (Transferido), `resolved` (Finalizado), `archived` (Arquivado).
- **Inteligência:** Campos de `priority`, `sla_status`, `temperature` e `last_message_preview`.
- **Relações:** Vinculação obrigatória a uma `queue_id` (Fila) e opcional a um `agent_id` (Responsável).

### Tabelas de Suporte (Implementadas)
- `internal_notes`: Mensagens colaborativas entre agentes (amarelas/privadas).
- `conversation_audit`: Histórico imutável de movimentações (quem transferiu, quando mudou status).
- `routing_rules`: Base do motor de distribuição por palavras-chave (ex: "financeiro" -> Fila Financeiro).

---

## 2. INTERFACE INBOX UNIVERSAL (VISUAL & UX)

O design seguirá o padrão **Linear/Intercom**: máxima densidade de informação com clareza visual.

### Layout Split-Pane
- **Sidebar (Canais/Filas):** Filtros rápidos por departamento e canal (WhatsApp, IG, Email).
- **Lista de Conversas:** Card compacto com indicadores de tempo de espera, SLA (bolinha colorida) e canal.
- **Área de Chat:** 
  - Balões diferenciados para cliente, agente e IA.
  - Notas internas integradas na timeline.
  - Botões rápidos de transferência e finalização.
- **Painel Customer 360 (Lateral Direita):** Exibição de dados do CRM, tags, timeline de eventos e score de saúde do cliente.

---

## 3. MOTOR DE DISTRIBUIÇÃO E OPERAÇÃO

### Lógica de Roteamento (Simulation Engine)
- **Classificação:** Ao receber uma mensagem (mock), a engine verificará `routing_rules`.
- **Distribuição:** 
  - Se `agent_id` estiver vago -> Enviar para a Fila.
  - Se houver `agent_id` (Sticky Agent) -> Notificar o responsável.
- **Transferência:** Interface para mover conversas entre Filas ou Agentes com registro automático em `conversation_audit`.

### Monitoramento de SLA
- Cronômetro visual regressivo baseado no `waiting_since`.
- Mudança de cor dinâmica: Verde (Normal) -> Laranja (Atenção) -> Vermelho (Breached).

---

## 4. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: Componentização do Inbox v2**  
Refatoração do `InboxView` para utilizar dados reais do Supabase e hooks de tempo real.

**Passo 2: Sistema de Mensagens e Notas**  
Implementação da timeline unificada que distingue `messages` de `internal_notes`.

**Passo 3: Módulo de Distribuição & Transferência**  
Criação dos modais de transferência e lógica de atualização de `agent_id`/`queue_id`.

**Passo 4: Integração Customer 360**  
Conexão do painel lateral com os dados de `customer_scores` e `customer_events`.

---

## TÉCNICO
- **Realtime:** Uso de `supabase.channel()` para refletir novas mensagens e mudanças de status instantaneamente.
- **Performance:** Virtualização da lista de chats para evitar gargalos em operações com >100 conversas simultâneas.
- **UX:** Atalhos de teclado (Alt+S para notas, Alt+T para transferir).

---

**PARANDO PARA APROVAÇÃO.**
Aguardando sua aprovação para iniciar a implementação da fundação visual e lógica do Inbox Universal.