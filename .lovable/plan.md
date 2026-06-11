text
# OneContact OS - Fase 2: Centro de Controle Operacional (CCO)

O objetivo é transformar o dashboard atual em um verdadeiro Centro de Comando adaptativo, onde cada perfil de usuário (CEO, Gestor, Gerente, Atendente) visualiza apenas o que é essencial para sua tomada de decisão e produtividade.

## 1. Arquitetura Adaptativa de Dashboard
Implementaremos uma lógica de renderização baseada em perfis (Roles) para o `DashboardView`.

### Perfis e Blocos de Comando:

#### CEO Master (Visão Estratégica)
*   **KPIs Críticos:** Receita da plataforma, Consumo total de IA, Crescimento mensal.
*   **Alertas de Risco:** Empresas sem atividade, quedas bruscas de performance.
*   **Oportunidades:** Empresas atingindo limites de plano, alto volume de leads.
*   **Ações Recomendadas:** Sugestões baseadas em dados (Ex: "Empresa X precisa de upgrade").

#### Gestor de Empresa (Visão Operacional)
*   **Status em Tempo Real:** Conversas abertas/aguardando, atendentes/gerentes online.
*   **Métricas de Conversão:** Leads e Vendas do dia.
*   **Painel "Necessita Atenção":** Clientes VIP aguardando, filas congestionadas, SLAs em risco.

#### Gerente de Equipe (Visão Tática)
*   **Performance de Equipe:** Ranking de atendentes, Tempo Médio de Resposta (TMR) e Atendimento (TMA).
*   **Monitoramento em Tempo Real:** Visualização de carga de trabalho (quem está parado vs. sobrecarregado).
*   **Qualidade:** Avaliações médias e conversões.

#### Atendente (Visão de Execução)
*   **Foco Total:** "Minhas Conversas", "Minhas Tarefas", Metas individuais.
*   **Produtividade:** Agenda do dia, avisos importantes e ranking pessoal.

## 2. Customer 360 (Módulo de Inteligência)
Evolução da visualização de clientes para um perfil omnichannel completo.
*   **Timeline:** Histórico unificado de interações, compras, tickets e campanhas.
*   **IA Insights:** Score de propensão à compra, risco de churn (cancelamento) e perfil comportamental.
*   **Contexto:** Último atendente/gerente, canal de origem e tags de segmentação.

## 3. Arquitetura de Filas Enterprise
Estrutura robusta para gestão de tráfego de mensagens.
*   **Configurações:** SLA por fila, níveis de prioridade, supervisores dedicados.
*   **Operação:** Suporte a transferência entre filas/atendentes e regras de escalonamento.
*   **Visual:** Indicadores de volume e "calor" da fila (congestionamento).

## 4. Design System & UX (Estética Premium Dark)
Refinamento visual seguindo referências como Linear e Stripe.
*   **Cards de Comando:** Bordas sutis, tipografia clara, uso semântico de cores para alertas.
*   **Micro-interações:** Feedback imediato em ações de comando.
*   **Responsividade:** Interface adaptada para operação em diferentes tamanhos de tela sem perda de densidade de informação.

## Detalhes Técnicos
*   **Componentes:** Criação de `CommandCenter` component para gerenciar os diferentes widgets por perfil.
*   **Estado:** Utilização de hooks customizados para simular dados em tempo real (Real-time updates).
*   **Tipagem:** Extensão das interfaces de `User`, `Customer` e `Queue` para suportar os novos campos de inteligência e operação.
*   **Performance:** Memoization de componentes pesados e carregamento lazy de módulos do Customer 360.
