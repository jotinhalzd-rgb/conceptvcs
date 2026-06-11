# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 6 (OMNICHANNEL REAL)

Este plano detalha a arquitetura para transformar o sistema em uma central de comunicação escalável, capaz de processar milhões de mensagens de diversos canais de forma unificada.

---

## 1. ARQUITETURA DE CANAIS (ABSTRAÇÃO)

Para evitar dependência de fornecedores únicos (vendor lock-in), implementaremos uma **Omni-Gateway Layer**.

- **Provider Adapter Pattern:** O sistema falará com uma interface genérica. Plugins específicos (Meta, 360Dialog, Evolution API, etc.) traduzirão as mensagens para o formato OneContact.
- **Identidade Única (Unified Contact):** Busca automática por CPF/Email/Telefone em todos os canais para vincular ao mesmo `contact_id`.
- **Canal Padrão:** Toda conversa terá um `channel_type` (whatsapp, instagram, email, telegram, webchat) e um `provider_id`.

---

## 2. ESTRATÉGIA DE SINCRONIZAÇÃO E ESCALABILIDADE

- **Webhooks de Alta Performance:** Utilização de Edge Functions (Deno) para receber webhooks externos. Elas apenas validam e jogam a mensagem em uma fila de processamento (Supabase/PGMQ) para garantir resposta < 200ms aos provedores.
- **Worker de Distribuição:** Um worker processará a fila, aplicará as `routing_rules` (Motor de Distribuição) e notificará o front-end via Realtime.
- **Sincronização de E-mail:** Implementação via IMAP/SMTP com workers de polling (ou SendGrid/Resend Inbound) para transformar e-mails em threads de conversa na Inbox.

---

## 3. MOTOR DE DISTRIBUIÇÃO E TRANSBORDO (ENGINE)

- **Distribuição Inteligente:** Regras baseadas em carga de trabalho (quem tem menos chats ativos), horário de funcionamento e palavras-chave.
- **Lógica de Transbordo:** 
  - Se `waiting_since` > 5 min -> Reatribuir para Fila de Contingência.
  - Se `queue_capacity` atingida -> Notificar gestor via IA e sugerir transbordo entre departamentos.

---

## 4. CUSTOS ESTIMADOS (INFRAESTRUTURA)

- **Mensageria (Provedores):** De acordo com a tabela da Meta/Provedor (~$0.01 por conversa 24h).
- **Processamento:** Baixo impacto inicial em Edge Functions.
- **Escalabilidade de Banco:** Supabase suporta milhões de registros; utilizaremos particionamento de tabela para `messages` se o volume ultrapassar 10M/mês.

---

## 5. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: Omni-Gateway Setup**  
Criação da estrutura de tabelas `channel_configs` e `external_identifiers` para mapear IDs de diferentes redes ao mesmo cliente.

**Passo 2: Central de Canais UI**  
Desenvolvimento da tela de gestão onde o gestor conecta e monitora o status (Online/Offline) de cada canal.

**Passo 3: Módulo de E-mail Corporativo**  
Integração de recebimento e envio de e-mails diretamente pela timeline da Inbox.

**Passo 4: Webchat White Label**  
Criação do script injetável para sites que abre o canal de chat direto do OneContact.

**Passo 5: Motor de Transbordo & Dashboard Realtime**  
Implementação dos triggers de escala e visualização macro de saúde das integrações.

---

## ESTRUTURA DE ENTIDADES (MODELO)
- `channel_accounts`: Credenciais e configurações (Meta Token, API Keys).
- `customer_identities`: Mapa de `(provider_name, external_id) -> contact_id`.

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para iniciar a construção da fundação omnichannel definitiva para os próximos 5 anos.