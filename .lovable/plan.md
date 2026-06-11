# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 13 (PERSONALIZED AI AGENTS)

Este plano detalha a criação do **AI Studio**, onde cada empresa poderá configurar sua própria força de trabalho digital composta por agentes especializados (Vendas, Suporte, Cobrança, etc.).

---

## 1. ARQUITETURA DE AGENTES (DIGITAL WORKFORCE)

Transformaremos a IA de um assistente genérico em múltiplos agentes com identidades e escopos de atuação específicos.

### Novas Entidades de Dados
- **`ai_agents`**: `name`, `role_type` (sales, support, hr, etc), `tone_of_voice`, `autonomy_level` (assistant, semi, full), `system_prompt`.
- **`agent_knowledge_base`**: Tabela pivot para vincular documentos da `knowledge_base` a agentes específicos (RAG segmentado).
- **`ai_agent_memory`**: Contexto de memória de longo prazo por agente e por contato.
- **`ai_agent_actions`**: Log detalhado de toda ação executada pela IA (criação de deal, transferência de fila, resposta enviada).

---

## 2. AI STUDIO (MÓDULO DE CRIAÇÃO E TREINAMENTO)

Uma interface de "baixo código" para gestores treinarem seus agentes.

### Funcionalidades do Studio
- **Agent Builder:** Assistente de configuração de perfil, tom de voz (Formal, Amigável, Técnico) e nível de autonomia.
- **Training Hub:** Área para upload de documentos (PDF, DocX) e links de sites que alimentam a base de conhecimento específica do agente.
- **Action Framework:** Definição de quais "poderes" o agente tem (ex: Agente de Vendas pode `create_deal`, Agente de Suporte pode `transfer_to_queue`).

---

## 3. SUPERVISÃO E MARKETPLACE DE AGENTES

- **Supervision Panel:** Dashboard para auditar as ações da IA. No modo "Semi-Autônomo", o atendente humano aprova a ação sugerida com um clique.
- **Agent Library (Marketplace):** Modelos pré-configurados (Ex: "Agente Comercial Farmácia" com scripts e dores do setor já mapeados) para instalação rápida.

---

## 4. ESTRATÉGIA DE CONSUMO E ESCALA

- **Multi-Agent Orchestration:** Um "Master Agent" decide qual sub-agente deve assumir a conversa baseado na intenção detectada (Fase 9).
- **Token Optimization:** Uso de `gpt-4o-mini` para roteamento e `gpt-4o` para resoluções complexas que exigem RAG.
- **Costs:** Implementação de limites de tokens por agente/empresa para controle financeiro.

---

## 5. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: AI Agent Schema**  
Criação das tabelas de agentes, permissões e memória seletiva.

**Passo 2: AI Studio UI Core**  
Desenvolvimento da tela de gestão de agentes e configurações de perfil.

**Passo 3: RAG Segmentado (Training Engine)**  
Lógica para a IA consultar apenas os documentos vinculados ao seu papel específico.

**Passo 4: Tool-Calling Framework**  
Implementação técnica que permite à IA "chamar" funções do sistema (CRM, Inbox, Telefonia).

**Passo 5: Monitoring & Analytics Hub**  
Criação dos gráficos de eficiência (Tempo economizado pela IA, Taxa de conversão por agente digital).

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para iniciar a construção da sua equipe digital de elite.