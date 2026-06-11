# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 11 (MARKETPLACE & ECOSYSTEM)

Este plano detalha a abertura da plataforma para integrações externas, transformando o ONECONTACT OS em um hub central de dados e operações empresariais.

---

## 1. ARQUITETURA DE INTEGRAÇÕES (DATA HUB)

Implementaremos uma camada de abstração que permite ao sistema processar eventos de qualquer fonte externa (Shopify, ERPs, etc.) de forma padronizada.

### Novas Entidades de Dados
- **`integration_apps`**: Catálogo de aplicativos disponíveis (Nome, Categoria, Logo, Descrição).
- **`connected_integrations`**: Registro de conexões por empresa (Status, Credenciais Criptografadas, Configurações).
- **`integration_events`**: Barramento de eventos central (ex: `order_created`, `payment_paid`) que alimenta o Customer 360 e o CRM.
- **`api_keys`**: Gestão de tokens de acesso para a API pública do OneContact.
- **`webhook_subscriptions`**: Configurações de webhooks de saída (notificar sistemas externos sobre eventos no OneContact).

---

## 2. MARKETPLACE & CENTRAL DE INTEGRAÇÕES (UI)

Uma nova área de alto nível para descoberta e gestão de conectores.

- **Marketplace Grid:** Visual estilo HubSpot/Shopify App Store, dividido por categorias (ERP, E-commerce, Marketing).
- **Configuração de Conector:** Tela passo-a-passo para cada integração (ex: Colar API Key da Omie ou Token do Shopify).
- **Dashboard de Saúde:** Monitoramento de logs de sincronização e volume de dados por conector.

---

## 3. DEVELOPER CENTER (PLATAFORMA ABERTA)

Área dedicada para TI e desenvolvedores terceiros.

- **API Management:** Geração e revogação de chaves de API com controle de scopes.
- **Webhook Center:** Painel para cadastrar URLs de destino e testar payloads de saída.
- **Logs do Desenvolvedor:** Histórico detalhado de requisições à API para depuração.

---

## 4. MOTOR DE SINCRONIZAÇÃO (INTEGRATION ENGINE)

- **Event Bus:** Toda entrada externa gera um evento no barramento, que é processado e distribuído para:
  - **Timeline do Customer 360:** "Pedido #123 realizado na Shopify".
  - **CRM:** Criação ou atualização automática de `Deals`.
  - **Business AI:** Recálculo de previsão de receita e health scores.

---

## 5. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: Marketplace & Ecosystem Schema**  
Criação das tabelas de aplicativos, conexões, chaves de API e barramento de eventos.

**Passo 2: Marketplace UI**  
Desenvolvimento da galeria de aplicativos e filtros por categoria.

**Passo 3: Engine de Conectores**  
Implementação da lógica base para receber, validar e transformar dados externos (Adapter Pattern).

**Passo 4: Developer Center UI**  
Construção da área de gestão de API Keys e Webhooks.

**Passo 5: Integração com Customer 360 & CRM**  
Garantir que eventos externos alimentem proativamente a timeline do cliente e o funil de vendas.

---

**ESTRATÉGIA DE SEGURANÇA**
- **Criptografia:** Credenciais de terceiros armazenadas com criptografia em repouso.
- **Rate Limiting:** Proteção da API pública contra abusos.

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para transformar o ONECONTACT OS em um ecossistema aberto e conectado.