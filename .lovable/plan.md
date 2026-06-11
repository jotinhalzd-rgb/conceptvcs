# Execution Master Plan: ONECONTACT OS

Este plano mestre organiza as 11 fases aprovadas em uma jornada lógica de construção, priorizando a estabilidade da fundação e o time-to-market.

## 1. Mapeamento de Dependências
A ordem de construção segue o fluxo de dados:
- **Base**: Customer 360 -> Inbox (Canais) -> CRM.
- **Processamento**: CRM -> OIL (Inteligência Local).
- **Rede**: OIL -> EIN (Inteligência Global).
- **Expansão**: Billing -> Marketplace/Hub -> White Label -> Global Expansion.
- **Canal**: Mobile Experience (Extensão transversal).

## 2. Definição de MVP e Versões

### MVP 1.0 (Lançamento Local)
- **Objetivo**: Operação comercial básica e atendimento omnichannel.
- **Escopo**: Customer 360 (Básico), Inbox (WhatsApp/Webchat), CRM (1 Pipeline), Billing (Starter).

### MVP 1.1 (Inteligência Inicial)
- **Objetivo**: Adicionar valor analítico para retenção de clientes.
- **Escopo**: OIL (Sinais básicos), Dashboards operacionais, Mobile (Inbox/CRM).

### V1.0 (Enterprise Readiness)
- **Objetivo**: Suportar grandes operações e automação.
- **Escopo**: Marketing Automation, Multi-Pipeline CRM, OIL (Predições), Suporte Global (pt/en).

### V2.0 (Ecosystem & Scale)
- **Objetivo**: Tornar-se uma plataforma expansível.
- **Escopo**: OneContact Hub, White Label, EIN (Benchmarks), Franquias.

## 3. Épicos e Priorização (P0-P3)

| Épico | Feature Chave | Prioridade | Risco | Complexidade |
| :--- | :--- | :---: | :---: | :---: |
| **Customer 360** | Timeline Unificada | P0 | Baixo | M |
| **Inbox** | WhatsApp Cloud API | P0 | Alto | L |
| **CRM** | Kanban Drag & Drop | P0 | Baixo | M |
| **OIL** | Sinais de Risco (Churn) | P1 | Médio | XL |
| **Billing** | Assinatura Recorrente | P1 | Crítico | L |
| **Automation** | Visual Workflow Builder | P2 | Médio | XXL |
| **Mobile** | Offline Sync | P2 | Alto | XL |
| **EIN** | Peer Benchmarking | P3 | Médio | XL |
| **Hub** | Marketplace Ativos | P3 | Baixo | L |

## 4. Planejamento de Sprints (Fase Inicial)

### Sprint 1: Fundação & Identidade
- **Objetivo**: Estabilizar Auth, Tenant e Perfil do Cliente.
- **Conclusão**: Login multi-tenant e visualização 360 funcionando com dados reais.

### Sprint 2: Operação Omnichannel
- **Objetivo**: Integrar o primeiro canal real (WhatsApp).
- **Conclusão**: Envio e recebimento de mensagens via Inbox Mobile e Desktop.

### Sprint 3: Engine Comercial
- **Objetivo**: Pipelines e Negócios.
- **Conclusão**: Gestão de funil de vendas completa com RLS validada.

## 5. Roadmap Executivo

### 3 Meses: Operação Core
- MVP 1.0 estável. Primeiros clientes pagantes operando Inbox + CRM.

### 6 Meses: Inteligência Ativa
- OIL operando com alertas de SLA e risco. Lançamento do App Mobile oficial.

### 12 Meses: Ecossistema
- Billing consolidado. Abertura do OneContact Hub para parceiros (Templates/Apps).

### 24 Meses: Liderança Global
- Operação Multi-Region (EUA/Europa). EIN fornecendo benchmarks mundiais. White Label disponível para grandes redes.

## 6. Matriz de Riscos Técnicos
- **Crítico**: Gateway de Pagamento e Billing (Segurança e Compliance).
- **Alto**: Sincronização Offline no Mobile (Consistência de dados).
- **Alto**: Escalabilidade da Engine de Automação (Milhões de execuções).

**O plano mestre está concluído e pronto para servir de guia para o desenvolvimento do ONECONTACT OS.**