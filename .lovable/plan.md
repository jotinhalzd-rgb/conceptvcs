# PLANO DE IMPLEMENTAÇÃO: ONECONTACT INTELLIGENCE LAYER (OIL) - FASE 14

Este plano detalha a criação do **OIL**, o cérebro central do ONECONTACT OS, projetado para unificar dados de todos os módulos e gerar inteligência acionável em tempo real.

---

## 1. ARQUITETURA TÉCNICA (OIL CORE)

O OIL funcionará como uma camada de abstração sobre o banco de dados atual, utilizando um modelo de **Entity Graph** para conectar pontos de dados dispersos.

### A. Memory Engine (Central de Contexto)
*   **Vector Sync**: Sincronização automática de conversas, tickets e interações no CRM para uma base vetorial centralizada.
*   **Temporal Memory**: Armazenamento de eventos históricos com carimbo de tempo para análise de tendências e detecção de padrões sazonais.

### B. Decision Engine (Motor de Inferência)
*   **Opportunity Detector**: Algoritmos para identificar leads quentes, cross-sell (ex: cliente do CRM sem campanha ativa) e reativação.
*   **Risk Guard**: Monitoramento de SLAs críticos, sentimentos negativos em massa e quedas bruscas de conversão.

### C. Digital Twin (Gêmeo Digital)
*   Representação virtual da empresa baseada em:
    *   **Receita Real-time** (Financeiro)
    *   **Capacidade Operacional** (Atendentes logados vs. Demanda)
    *   **Saúde do Cliente** (Customer Health Score 360)

---

## 2. COMPONENTES DE INTERFACE (COMMAND CENTER)

### A. OIL Command Center (Visão Exclusiva CEO)
Uma nova interface de controle que substitui dashboards estáticos por "Inteligência Ativa":
*   **Top 3 Risks**: Exibição imediata de gargalos ou riscos de churn detectados.
*   **Top 3 Opportunities**: Recomendações diretas de ações para aumentar a receita.
*   **Predictive Revenue**: Projeção de faturamento baseada no funil atual do CRM.

### B. Entity Graph Explorer
*   Visualização relacional de como um cliente se conecta a uma campanha, um atendente e um resultado financeiro.

---

## 3. ESPECIFICAÇÕES DE DADOS (MIGRAÇÕES)

Criação de novas tabelas estruturais para sustentar o OIL:
*   `oil_events`: Log central de eventos significativos de todos os módulos.
*   `oil_recommendations`: Recomendações geradas pelo motor de decisão com status de execução.
*   `oil_entity_graph`: Tabela de mapeamento de relacionamentos transversais.
*   `oil_health_scores`: Scores detalhados por departamento e entidade.

---

## 4. CRONOGRAMA DE EXECUÇÃO

**Passo 1: Data Pipeline & Events**
Mapeamento de gatilhos em todos os módulos existentes para alimentar a tabela `oil_events`.

**Passo 2: Memory & Decision Engine**
Implementação das funções de banco de dados (Edge Functions) que processam eventos e geram recomendações.

**Passo 3: Command Center UI**
Desenvolvimento da nova visão "Intelligence" dentro do Dashboard, com foco em previsões e alertas.

**Passo 4: Digital Twin Integration**
Conexão final do OIL com Financeiro, CRM e Inbox para fechar o ciclo de inteligência.

---

## 5. RISCOS E MITIGAÇÃO
*   **Risco**: Latência no processamento de grandes volumes de eventos.
*   **Mitigação**: Processamento assíncrono via Edge Functions e filas PGMQ para não afetar a UX.
*   **Custo**: Aumento no consumo de tokens de IA para análise de padrões (OIL consumirá modelos avançados para geração de recomendações).

**AGUARDANDO APROVAÇÃO PARA INICIAR A CONSTRUÇÃO DO CÉREBRO DA PLATAFERMA.**
