# Plano de Implementação: Customer 360 Enterprise

O objetivo é transformar a visualização atual em uma central de inteligência de dados do cliente, consolidando informações de CRM, Suporte, Financeiro e IA em uma única interface escalável.

## 1. Arquitetura de Dados (Database Schema)

Serão criadas/ajustadas as seguintes tabelas para suportar o volume enterprise:

- `public.contacts`: Adição de colunas para `profile_picture_url`, `main_channel`, `status`, `lead_score`.
- `public.customer_events_unified`: Tabela centralizadora de eventos para a Timeline.
- `public.customer_tickets`: Gestão de tickets de suporte com SLA e NPS.
- `public.billing_transactions`: Histórico financeiro consolidado.
- `public.customer_insights_enterprise`: Cache de inteligência gerado por IA (resumos, churn, propensão).

## 2. Componentes Frontend (UI/UX)

A interface será dividida em zonas de responsabilidade:

### A. Perfil e Identificação (Header/Sidebar)
- Componente `CustomerIdentity`: Exibição de Nome, Foto, Empresa e Tags.
- Componente `AccountHealthScore`: Visualização gráfica do score e status.

### B. Timeline Unificada (Centro)
- Componente `OmniTimeline`: Feed infinito com carregamento incremental (`useInfiniteQuery`).
- Filtros por categoria: Conversas, Financeiro, CRM, Suporte e IA.

### C. Painéis Laterais (Contexto)
- `CRMContextPanel`: Negócios ativos e valor negociado.
- `SupportSlaPanel`: Tickets ativos e métricas de atendimento.
- `CommunicationLauncher`: Histórico por canal (WA, Email, etc).

### D. Camada de Inteligência (IA Insights)
- `AIStrategistCard`: Resumo dinâmico, Churn risk e "Next Best Action".
- Alertas preditivos (Oportunidades e Riscos).

## 3. Fluxos de Dados e Performance

- **Lazy Loading**: A timeline carregará apenas os últimos 20 eventos por vez.
- **Cache SWR**: Uso de React Query para garantir que a navegação entre clientes seja instantânea.
- **Triggers de Agregação**: Eventos no CRM ou Inbox disparam automaticamente uma inserção na `customer_events_unified`.

## 4. Segurança (Multi-Tenancy)

- Todas as queries incluirão `WHERE organization_id = current_org()`.
- RLS rigoroso para impedir vazamento de dados entre empresas (Tenants).

## Detalhes Técnicos

```text
ESTRUTURA DE EVENTOS (JSONB):
{
  "type": "deal_closed",
  "icon": "TrendingUp",
  "color": "emerald",
  "amount": 5000,
  "agent_name": "Marcos"
}
```

**PRÓXIMO PASSO:** Após sua aprovação, iniciarei a migração final do banco de dados e o desenvolvimento dos novos componentes de UI.