# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 10 (BILLING, SUBSCRIPTIONS & WHITE LABEL)

Este plano detalha a transformação do ONECONTACT OS em uma plataforma SaaS comercialmente viável, escalável e multi-marca.

---

## 1. ARQUITETURA FINANCEIRA E SUBSCRIPTIONS

Implementaremos uma camada de gestão de planos e assinaturas que controla o acesso a recursos baseado no nível de contrato.

### Novas Entidades de Dados
- **`subscription_plans`**: `name`, `price`, `interval` (monthly/yearly), `features` (JSON com limites: max_users, max_messages, max_channels, ai_enabled).
- **`subscriptions`**: `company_id` (FK), `plan_id` (FK), `status` (trial, active, past_due, canceled), `current_period_end`, `trial_ends_at`.
- **`invoices`**: `subscription_id`, `amount`, `status` (paid, pending, failed), `pdf_url`, `billing_reason`.
- **`usage_logs`**: Rastreamento de consumo em tempo real para controle de limites (mensagens enviadas, minutos de voz).

---

## 2. WHITE LABEL E MULTI-TENANCY CORE

O sistema será preparado para assumir a identidade visual de parceiros ou grandes empresas.

### Extensão: `companies` / `tenant_configs`
- **Branding:** `logo_url`, `primary_color`, `custom_domain`, `company_name`.
- **Login:** Customização da tela de autenticação baseada no host da requisição.

---

## 3. ÁREA DO PARCEIRO E COMISSÕES

Módulo para revendedores e consultores gerenciarem sua carteira.

- **Partner Hub:** Dashboard para parceiros visualizarem suas empresas cadastradas e faturamento total.
- **`commissions_log`**: Registro de valores devidos a parceiros baseado em cada pagamento aprovado (recorrência).

---

## 4. EXECUTIVE FINANCIAL DASHBOARD (CEO MASTER)

Visibilidade total da saúde financeira da plataforma.

- **Metrics:** MRR (Monthly Recurring Revenue), ARR, Churn Rate, LTV (Lifetime Value).
- **Billing Health Score:** Identificação de inadimplência e empresas prontas para upgrade baseado em uso (Upsell Signals).

---

## 5. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: Billing Schema & Security**  
Criação das tabelas de planos, faturas e auditoria financeira.

**Passo 2: Subscription Management UI**  
Desenvolvimento da tela de "Assinatura e Planos" dentro das configurações da empresa.

**Passo 3: Módulo White Label Engine**  
Implementação do hook `useTheme` e `useTenant` que injeta cores e logos baseados na empresa logada.

**Passo 4: Integração Gateway (Abstração)**  
Criação do `PaymentService` preparado para Stripe/Asaas, tratando webhooks de pagamento.

**Passo 5: Partner & Commission Hub**  
Interface para parceiros e automação de cálculo de comissões.

---

## RISCOS E CUSTOS ESTIMADOS
- **Custo Gateway:** ~3% a 5% por transação.
- **Infraestrutura:** Aumento marginal de processamento para workers de cobrança.
- **Risco:** Bloqueios indevidos por erro de processamento de webhook (mitigado com logs extensivos).

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para transformar o ONECONTACT OS em uma potência comercial automatizada.