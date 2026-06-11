# Plano de Implementação: Billing & Subscription Platform

O objetivo é construir a espinha dorsal financeira do ecossistema OneContact OS, permitindo a gestão de assinaturas recorrentes, cobrança por consumo, marketplace de terceiros e distribuição de comissões.

## 1. Arquitetura Financeira (Universal Billing Schema)

A plataforma será dividida em três pilares: **Core Subscriptions**, **Usage Metering** e **Ecosystem Revenue**.

- `public.billing_plans_v2`: Definição de planos e seus recursos (JSON com limites).
- `public.billing_subscriptions_v2`: Registro da assinatura ativa por tenant, ciclo de faturamento e status.
- `public.billing_usage_meters`: Log de consumo em tempo real (ex: mensagens enviadas, tokens de IA).
- `public.billing_invoices_v2`: Faturas geradas, histórico de pagamentos e links para recibos.
- `public.billing_commissions_v2`: Gestão de repasses para parceiros e afiliados.
- `public.billing_gateways_config`: Configuração abstrata de conectores (Stripe, Asaas, etc).

## 2. Camada de Abstração de Pagamentos (Gateway Adapter)

Para evitar o acoplamento a um único provedor, utilizaremos o padrão **Adapter**:
- Interface comum para `createCustomer`, `subscribe`, `processRefund`.
- Webhook Handler unificado que traduz eventos externos (ex: `invoice.paid`) em ações internas.

## 3. Controle de Consumo & Overage (Metering Engine)

O sistema monitorará limites de forma proativa:
- **Hard Limits**: Impedir criação de novos usuários se o limite do plano for atingido.
- **Soft/Overage Limits**: Permitir o uso excedente (ex: IA) e cobrar na fatura do mês seguinte.
- **OIL Integration**: Alerta automático quando uma empresa atinge 90% da cota.

## 4. Componentes Frontend (Finance UI)

### A. Billing Center (Visão do Cliente)
- `PlansGrid`: Comparativo de recursos e botão de upgrade.
- `UsageDashboard`: Gráficos de barras mostrando o consumo atual vs. limite do plano.
- `InvoicesHistory`: Lista para download de comprovantes.

### B. Partner Portal (Comissões)
- `RevenueShareTracker`: Extrato de ganhos por vendas no Marketplace ou indicações.

## 5. Escalabilidade e Segurança

- **Idempotency**: Garantia de que uma cobrança nunca seja processada duas vezes via chaves de idempotência.
- **RLS Financeiro**: Acesso estritamente restrito. Somente donos da organização e administradores financeiros podem visualizar faturas.
- **Audit Log**: Todo upgrade/downgrade será registrado com metadados do autor e timestamp.

## Detalhes do Modelo de Monetização

```text
REVENUE SHARE MARKETPLACE:
- 70% Partner (Desenvolvedor do App)
- 20% OneContact Platform
- 10% Afiliado (Se houver indicação)
```

**PRÓXIMO PASSO:** Após sua aprovação, iniciarei a criação da infraestrutura de planos, assinaturas e o motor de controle de consumo.