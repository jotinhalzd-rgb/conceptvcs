# Plano de Implementação: OneContact Hub (Marketplace & Ecossistema)

O Hub transformará o OneContact OS de um software em uma **plataforma expansível**, criando um efeito de rede onde desenvolvedores, consultores e empresas trocam ativos digitais e serviços.

## 1. Arquitetura do Ecossistema (Hub Schema)

A estrutura será dividida em Ativos (Apps/Templates) e Entidades (Parceiros/Serviços):

- `public.hub_marketplace_assets`: Tabela central de itens (Apps, Bots, AI Agents, Templates).
    - `type`: 'app', 'bot', 'ai_agent', 'template', 'workflow'.
    - `category`: 'crm', 'marketing', 'support', 'finance'.
    - `pricing_model`: 'free', 'one_time', 'subscription'.
- `public.hub_asset_installs`: Registro de quais empresas instalaram quais ativos.
- `public.hub_partners`: Perfis de parceiros (Consultores, Agências, Devs).
    - `certification_level`: 'partner', 'expert', 'specialist', 'elite'.
- `public.hub_service_offers`: Catálogo de serviços profissionais (Implantação, Treinamento).
- `public.hub_reviews`: Avaliações e ratings para ativos e parceiros.
- `public.hub_revenue_share`: Log de transações para repasse de comissões.

## 2. Governança e Validação

- **Asset State**: Todo item passará por estados: `draft` -> `pending_review` -> `certified` -> `published`.
- **Sandboxing**: Apps instalados via Hub operarão via API com escopos limitados, respeitando o RLS do tenant.

## 3. Componentes Frontend (Hub UI)

### A. Marketplace Central (`MarketplaceView`)
- `AssetExplorer`: Grade de descoberta com filtros por categoria e popularidade.
- `AssetDetailCard`: Página completa do item com screenshots, documentação e botão "Instalar".

### B. Portal do Parceiro (`PartnerDashboard`)
- Gestão de portfólio e ativos publicados.
- Monitoramento de instalações e receita gerada (Revenue Share).

### C. Gestão de Ativos Instalados
- Central de controle para gerenciar APIs, webhooks e configurações de extensões instaladas.

## 4. Estratégia de Monetização e Escalabilidade

- **Universal Installer**: Sistema de "um clique" que executa scripts de configuração (tabelas, webhooks, bots) ao instalar um ativo.
- **Isolamento**: `company_id` em todos os registros de instalação e transação.
- **Repasse Automático**: Preparação para integração com gateways de pagamento para divisão de receita (Stripe Connect / Paddle).

## Fluxo do Hub

```text
PUBLICAÇÃO (Dev/Parceiro) -> HOMOLOGAÇÃO (OneContact) -> MARKETPLACE (Descoberta) -> INSTALAÇÃO (Empresa) -> VALOR (Efeito de Rede)
```

**PRÓXIMO PASSO:** Após sua aprovação, iniciarei a criação das tabelas de marketplace e a interface de exploração de aplicativos.