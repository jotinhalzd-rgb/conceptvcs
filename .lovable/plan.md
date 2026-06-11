# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 4 (CRM OPERACIONAL)

Este plano detalha a transformação do ONECONTACT OS em um ecossistema de vendas integrado à comunicação, onde cada conversa é uma oportunidade de receita.

---

## 1. ARQUITETURA DE DADOS (DATABASE)

Expandiremos o schema para suportar a gestão de oportunidades e metas.

### Nova Entidade: `deals` (Negócios)
- **Campos:** `title`, `value` (decimal), `probability` (0-100), `status` (open, won, lost), `expected_close_date`, `closed_at`, `origin_conversation_id` (FK).
- **Relações:** Vinculado obrigatoriamente a um `contact_id`, `pipeline_id` e `stage_id`.

### Extensão: `contacts` & `lead_scores`
- **Lead Status:** Adição de flag `is_lead` e `lifecycle_stage` em `contacts`.
- **Pontuação:** Criação da tabela `lead_scores` para motor de temperatura (Cold, Warm, Hot, Priority).

### Gestão de Metas: `sales_goals`
- **Campos:** `target_value`, `current_value`, `type` (individual, team, company), `period` (YYYY-MM).

---

## 2. EXPERIÊNCIA INTEGRADA (INBOX + CRM)

A filosofia é "Zero Context Switching". O CRM vive dentro do chat.

### Interface no Chat (Inbox)
- **Barra de Contexto CRM:** No topo ou lateral do chat, exibição do negócio ativo vinculado ao contato.
- **Ações Rápidas:**
  - Botão "Criar Oportunidade" (abre pequeno popover com valor e pipeline).
  - Seletor de Etapa do Funil direto na conversa.
  - Indicador visual de "Lead Score" ao lado do nome do cliente.

---

## 3. MÓDULO CRM (KANBAN & FORECAST)

Uma visão macro para gestão de fluxo.

- **Visualização Kanban:** Colunas por `stages`, cartões com `value`, `contact_name` e `last_interaction_time`.
- **Drag & Drop:** Movimentação entre etapas com atualização instantânea no banco e registro em `crm_audit`.
- **Painel de Forecast:**
  - Receita Prevista (Soma dos valores * probabilidade).
  - Receita Realizada (Soma dos deals 'won').
  - Gráfico de funil de conversão.

---

## 4. MOTOR DE LEAD SCORING (LOGIC ENGINE)

Algoritmo inicial para classificação automática:
- **+20 pts:** Interação nas últimas 2h.
- **+30 pts:** Palavras-chave de intenção ("preço", "comprar", "pix").
- **-10 pts:** Tempo de resposta do agente acima do SLA.
- **Categorização:**
  - 0-30: Frio | 31-60: Morno | 61-90: Quente | 91+: Prioritário.

---

## 5. CRONOGRAMA DE EXECUÇÃO

**Passo 1: Schema & Migrations**  
Criação das tabelas `deals`, `sales_goals` e índices de performance.

**Passo 2: CRM Core UI**  
Desenvolvimento da tela de Pipelines e o componente de Kanban.

**Passo 3: Integração Inbox Universal**  
Implementação dos widgets de CRM dentro do terminal de chat e automação de criação de Lead.

**Passo 4: Dashboards de Gestão**  
Construção da visão de Metas e Previsão de Receita para CEO e Gerentes.

---

## IMPACTO NAS ENTIDADES EXISTENTES
- **Customer 360:** Ganha aba "Oportunidades" com histórico de negociações.
- **Audit Logs:** Passa a registrar cada mudança de valor ou etapa de negócio para transparência total.

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para iniciar a construção do CRM nativo integrado.