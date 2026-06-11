text
# ONECONTACT OS - FASE 3: SISTEMA OPERACIONAL DE INTELIGÊNCIA COMERCIAL

Implementação da camada de inteligência e governança sobre a comunicação, transformando conversas em dados estratégicos e ações proativas.

## 1. Arquitetura de Inteligência (IA Copilot & Supervisor)
*   **IA Copilot (Real-time):** Hook de análise semântica que processa a mensagem atual e sugere:
    *   Próxima Melhor Ação (NBA).
    *   Detecção de intenção (Compra, Reclamação, Churn).
    *   Alertas de palavras críticas.
*   **IA Supervisor:** Dashboard de monitoramento de saúde operacional com alertas de:
    *   SLA em risco (visualização por gradiente de cor).
    *   Congestionamento de filas.
    *   Anomalias de produtividade.

## 2. Customer & Agent Scoring (Gamificação e Ranking)
*   **Customer Score Engine:** Algoritmo dinâmico que classifica clientes (Bronze -> VIP) baseado em LTV, Engajamento e Sentimento.
*   **Agent Performance OS:** Ranking gamificado com métricas de Conversão, TMA e CSAT, exibindo Badges de conquista por produtividade.
*   **Knowledge Hub:** Base de conhecimento vetorial (RAG) integrada para que a IA gere respostas fundamentadas em manuais e FAQ da empresa.

## 3. Experiência de Usuário: Timeline Omnichannel
*   **Unified Timeline:** Componente de visualização cronológica que agrupa interações de múltiplos canais (WhatsApp, Email, CRM Events) em um único fio de história.
*   **Executive Insights (CEO View):** Painel de resposta rápida a perguntas de negócio ("Qual canal gera mais lucro?") com visualização de ROI por canal/agente.

## 4. Estrutura Técnica de Dados (Supabase)
*   **Novas Tabelas:**
    *   `knowledge_base`: Documentos e FAQ para treinamento da IA.
    *   `omnichannel_events`: Log central de eventos externos (compras, tickets, visitas).
    *   `gamification_badges`: Registro de conquistas dos operadores.
    *   `business_intelligence`: Agregadores diários para performance executiva.

## 5. Implementação da Inbox Universal 2.0 (Interface)
*   Integração dos widgets de IA na Coluna 3 (Chat).
*   Visualização da Timeline e Customer Score na Coluna 4 (Customer 360).
*   Painéis de controle de filas dinâmicas na Coluna 1.

---
**Diferencial Estratégico:** O sistema deixará de ser um receptor de mensagens para se tornar um preditor de receitas e mitigador de riscos em tempo real.
