# Plano de Implementação: OIL (OneContact Intelligence Layer)

O OIL é o "cérebro" do OneContact OS, transformando o fluxo bruto de dados em sinais estratégicos e ações preditivas.

## 1. Arquitetura de Dados (Intelligence Schema)

Para suportar análises em tempo real sem degradar a performance operacional, o OIL utilizará tabelas de agregação e sinais:

- `public.oil_signals`: Captura de eventos brutos de todos os módulos (CRM, Inbox, Tickets).
- `public.oil_insights`: Tabela de resultados processados (Riscos, Oportunidades, Recomendações).
- `public.oil_health_scores`: Histórico de scores (Customer, Team, Organization).
- `public.oil_alerts`: Central de notificações críticas geradas automaticamente.
- `public.oil_prediction_models`: Metadados e versões dos modelos de IA aplicados a cada tenant.

## 2. Motores de Análise (Logic Engine)

O processamento será dividido em três camadas:

### A. Real-Time Monitor (SLA & Riscos)
- Monitoramento de filas e SLAs.
- Gatilhos instantâneos para "Atendimento Sobrecarregado" ou "Negócio Esquecido".

### B. Analytical Engine (Tendências & Performance)
- Agregadores diários de conversão, ticket médio e produtividade.
- Comparação histórica para detectar anomalias (quedas ou picos repentinos).

### C. Predictive Engine (IA Strategy)
- Modelos de propensão de Churn e Probabilidade de Fechamento.
- Sugestão de "Next Best Action" (Próxima melhor ação) personalizada por cliente.

## 3. Componentes Frontend (Intelligence UI)

### A. OIL Command Center (Painel Executivo)
- `OilInsightsFeed`: Feed dinâmico de cards (Alerta, Oportunidade, Sugestão).
- `OilHealthMap`: Visualização de radar do score global da empresa (Vendas, Atendimento, Retenção).

### B. Widgets de Contexto (Injetados)
- Indicador de "Risco de Perda" no detalhe do CRM.
- Resumo de "Interesses do Cliente" no Inbox.

## 4. Estratégia de Escalabilidade e IA

- **Aggregation**: Uso de tabelas de resumo (Materialized Views ou Agregadores) para suportar 100k+ empresas.
- **Isolamento**: RLS absoluto por `organization_id`. Dados anônimos para benchmarks setoriais (EIN).
- **Asynchronous Processing**: Toda análise complexa será executada em background via Edge Functions ou Workers dedicados.

## Detalhes Técnicos do Sinal (OIL Signal)

```json
{
  "source": "crm",
  "event": "deal_stagnated",
  "severity": "high",
  "entities": ["deal_id", "contact_id"],
  "inference": "Probabilidade de perda aumentou 30% devido a 5 dias sem contato."
}
```

**PRÓXIMO PASSO:** Após sua aprovação, iniciarei a criação da infraestrutura de sinais e o painel de controle do OIL.