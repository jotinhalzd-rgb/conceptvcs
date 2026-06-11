# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 7 (GROWTH & AUTOMATION HUB)

Este plano detalha a construção da máquina de relacionamento e automação do ONECONTACT OS, transformando disparos isolados em jornadas inteligentes de cliente.

---

## 1. ARQUITETURA DE DADOS E ENTIDADES

Expandiremos o schema para suportar automações complexas e rastreamento de ROI.

### Extensão: `campaigns` (Campanhas)
- **Campos:** `type` (promo, post-sales, retention, etc), `segmentation_rules` (JSON), `ab_test_config` (JSON), `budget`, `expected_roi`.
- **Status:** `draft`, `scheduled`, `sending`, `completed`, `paused`, `canceled`.

### Nova Entidade: `automation_workflows` (Jornadas)
- **Campos:** `name`, `trigger_event` (ex: purchase_completed), `nodes` (JSON - estrutura visual), `is_active`.
- **Nodos:** `trigger`, `delay`, `condition` (if/else), `action` (send_msg, create_deal, tag_contact).

### Nova Entidade: `campaign_analytics` (Performance)
- **Métricas:** `sent`, `delivered`, `read`, `replied`, `converted`, `revenue_generated`, `roi`.

---

## 2. JORNADAS VISUAIS (WORKFLOW BUILDER)

Implementaremos uma interface inspirada em ferramentas de alto nível (ActiveCampaign/HubSpot).

- **Visual Interface:** Canvas infinito para arrastar e soltar elementos de lógica.
- **Integração Nativa:** Automações que podem criar `Deals` no CRM, mudar `Lead Score` e enviar mensagens em qualquer canal da Fase 6.
- **Workflow Engine:** Worker em segundo plano que escuta `omnichannel_events` e processa as condições de cada jornada ativa.

---

## 3. IA DE CAMPANHAS (CAMPAIGN AI)

A inteligência artificial atuará como estrategista de crescimento.

- **Copy Generator:** Geração de variações de texto focadas em conversão (A/B testing nativo).
- **Predictive Sending:** Sugestão do melhor canal e horário baseado no histórico de engajamento do cliente no Customer 360.
- **Churn Recovery:** Identificação automática de clientes inativos e sugestão de campanhas de reativação personalizadas.

---

## 4. ESTRATÉGIA DE CUSTOS E ESCALA

- **Caching:** Cache agressivo de regras de segmentação para disparos em massa.
- **Rate Limiting:** Controle inteligente por canal para evitar banimentos (especialmente WhatsApp).
- **Processamento:** Uso intensivo de filas de mensageria (Supabase/PGMQ) para processar milhões de eventos sem travar a interface.

---

## 5. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: Schema & Automation Engine Core**  
Criação das tabelas de workflows e logs de execução de jornadas.

**Passo 2: Workflow Builder UI**  
Desenvolvimento da interface visual de construção de automações (Nodes & Canvas).

**Passo 3: Módulo de Campanhas v2**  
Refatoração da tela de campanhas com segmentação avançada e suporte a Teste A/B.

**Passo 4: Dashboards de Growth**  
Visualização de funil de conversão de campanhas e cálculo automático de ROI.

**Passo 5: Campaign AI Integration**  
Integração do motor de geração de copy e sugestões estratégicas.

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para iniciar a construção da máquina de crescimento do ONECONTACT OS.