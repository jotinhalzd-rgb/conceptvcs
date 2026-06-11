# Plano de Implementação: CRM Enterprise

O objetivo é transformar o CRM em uma engine de vendas e relacionamento de alta escala, nativamente integrada ao ecossistema de inteligência (OIL/EIN) e atendimento (Inbox).

## 1. Arquitetura de Dados (Database Schema)

A fundação será expandida para suportar pipelines ilimitados, automações e previsibilidade:

- `public.pipelines`: Estrutura de funis (Vendas, Pós-venda, etc).
- `public.pipeline_stages`: Etapas customizáveis com ordenação e regras.
- `public.deals`: Tabela de negócios com `company_id`, `probability`, `expected_close_date` e `tags`.
- `public.crm_tasks`: Tarefas vinculadas a negócios ou clientes.
- `public.crm_automation_rules`: Definição de gatilhos (triggers) por etapa.
- `public.crm_goals`: Metas por organização, time ou usuário.
- `public.crm_forecast`: Tabela de cache para projeções de receita geradas por IA.

## 2. Componentes Frontend (UI/UX)

### A. Visão Kanban & Lista
- `CRMView`: Tela principal com alternador de pipelines e visões (Kanban/Lista).
- `KanbanBoard`: Implementação de Drag & Drop performático com `dnd-kit`.
- `DealCard`: Resumo visual com indicadores de temperatura (IA Score) e atrasos.

### B. Gestão e Metas
- `GoalTracker`: Widgets de progresso de metas em tempo real.
- `PipelineEditor`: Interface visual para criar e ordenar etapas.

### C. Inteligência & Forecast
- `ForecastPanel`: Gráficos de receita prevista vs. realizada.
- `DealAIAdvisor`: Painel lateral no detalhe do negócio com "Próxima Melhor Ação".

## 3. Fluxos de Automação

O sistema utilizará **Postgres Triggers** e **Edge Functions** para:
- Mover um negócio para "Ganhos" -> Gerar evento no Customer 360 -> Notificar Gerente.
- Negócio parado por > 5 dias -> IA gera alerta de risco e sugere follow-up.

## 4. Escalabilidade e Segurança

- **Performance**: Indexação composta por `(organization_id, pipeline_id, stage_id)`.
- **Isolamento**: RLS garantindo que usuários de uma empresa nunca vejam pipelines de outra.
- **Cache**: Queries otimizadas com filtros pré-processados no banco.

## Detalhes Técnicos

```text
TABELA DE METAS:
- target_value (numeric)
- current_value (numeric)
- target_type (revenue, conversion, activity)
- period (monthly, quarterly)
```

**PRÓXIMO PASSO:** Após sua aprovação, iniciarei a criação das novas tabelas de CRM e o desenvolvimento do Kanban Enterprise com suporte a múltiplos pipelines.