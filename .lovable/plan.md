# PLANO DE IMPLEMENTAÇÃO - FASE 3: INBOX UNIVERSAL E DISTRIBUIÇÃO INTELIGENTE

Este plano detalha a fundação operacional para transformar o ONECONTACT OS em uma central de atendimento omnichannel, focando em estrutura de dados, roteamento e interface de alta performance.

---

## 1. ARQUITETURA DE DADOS (DATABASE)

A infraestrutura atual já possui tabelas base (`conversations`, `messages`, `queues`), mas precisamos expandir para suportar a lógica operacional da Fase 3.

### Expansão da Tabela `conversations`
- **Campos Adicionais:** `waiting_since` (timestamp), `first_response_at` (timestamp), `closed_at` (timestamp), `agent_id` (FK profiles), `sla_status` (enum: 'normal', 'warning', 'breached'), `temperature` (enum: 'cold', 'warm', 'hot').
- **Status da Conversa:** `new`, `active`, `waiting_customer`, `transferred`, `resolved`, `archived`.

### Novos Modelos e Tabelas
- **`internal_notes`**: Para comentários entre agentes (invisíveis ao cliente).
  - Campos: `conversation_id`, `author_id`, `content`, `created_at`.
- **`conversation_audit`**: Registro histórico de cada movimentação.
  - Campos: `conversation_id`, `action_type`, `performed_by`, `previous_state`, `new_state`.
- **`routing_rules`**: Regras baseadas em palavras-chave e departamentos.
  - Campos: `keyword`, `target_queue_id`, `priority_bonus`, `is_active`.

---

## 2. MOTOR DE DISTRIBUIÇÃO (COMMANDCENTER ENGINE)

O motor será responsável por orquestrar o fluxo de entrada sem necessidade de intervenção manual inicial.

- **Classificação Inicial:** Engine intercepta mensagens e verifica `keywords` para alocação de `queue_id`.
- **Sistema de Sticky Agent:** Se o contato já foi atendido anteriormente, o motor tenta priorizar o último atendente.
- **Gerenciamento de SLA:** Job periódico (ou edge function) que atualiza o `sla_status` com base no tempo de espera da fila.

---

## 3. INTERFACE INBOX UNIVERSAL (UX/UI)

Design inspirado em Linear/Intercom, focado em produtividade máxima para turnos de 8 horas.

### Estrutura do Layout (Split View)
1. **Sidebar de Navegação:** Canais e Filas.
2. **Lista de Conversas:** Filtros rápidos (Minhas, Não Lidas, Pendentes). Indicadores visuais de SLA e Temperatura.
3. **Viewport de Chat:** Timeline unificada de mensagens e notas internas (identificadas por cor amarela/ícone de cadeado).
4. **Painel Customer 360 (Lateral Direita):** Score de saúde, histórico de compras, tags e timeline de eventos do cliente.

---

## 4. FLUXO OPERACIONAL (STEP-BY-STEP)

### Passo 1: Migração e Schema
Execução do SQL para expandir `conversations` e criar tabelas de suporte (`internal_notes`, `audit`).

### Passo 2: Componentização do Inbox
Criação do componente `UniversalInbox` e sub-componentes: `ChatList`, `MessageView`, `InternalNoteEditor`, `CustomerSidePanel`.

### Passo 3: Implementação da Lógica de Fila e Transferência
Desenvolvimento dos hooks para mudança de `queue_id` e alocação de `agent_id`.

### Passo 4: Dashboard de Supervisão (SLA)
Criação de widgets para gerentes visualizarem gargalos em tempo real nas filas.

---

## TÉCNICO (PARA DESENVOLVIMENTO)

- **Estado Global:** Utilizaremos TanStack Query para sincronização em tempo real das mensagens via Supabase Realtime.
- **Segurança:** RLS (Row Level Security) garantindo que Atendentes só vejam conversas de suas filas e Gerentes vejam toda a empresa.
- **Performance:** Virtualização da lista de conversas para suportar milhares de chats ativos.

---

**ESTE PLANO NÃO CONECTA APIs REAIS (WhatsApp/Instagram).** Toda a simulação será feita via banco de dados e interface.

**PARANDO PARA APROVAÇÃO.**
Aguardando seu "sim" para iniciar a execução do Passo 1.