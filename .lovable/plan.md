# Plano de Integração Real: Twilio WhatsApp (P1)

Este plano detalha a transição do ONECONTACT OS para comunicações reais, utilizando Twilio como provedor de WhatsApp sob uma arquitetura multi-tenant segura.

## 1. Arquitetura Técnica
A integração será baseada em eventos e processada via Edge Functions para garantir isolamento e escalabilidade.

- **Gateway de Entrada**: Edge Function `twilio-webhook` para receber mensagens, mídias e status da Twilio.
- **Gateway de Saída**: Edge Function `send-message` (ou similar) que encapsula a lógica de envio para diferentes provedores.
- **Segurança**: Validação de assinatura X-Twilio-Signature em todas as requisições de entrada.
- **Storage**: Uso do Supabase Storage para persistência de mídias (imagens, docs) recebidas.

## 2. Fluxo de Dados (Entrada)
1. Twilio envia POST para o Webhook.
2. Edge Function valida a assinatura e identifica a `organization_id` baseada no número de destino.
3. Busca/Cria Contato (`contacts`) pelo número de telefone.
4. Busca/Cria Conversa (`conversations`) ativa.
5. Se houver mídia, faz o download via proxy seguro e salva no Bucket `messages_attachments`.
6. Insere registro em `messages`.
7. Dispara triggers de banco para atualizar `last_message_at` e timeline do `customer_360`.

## 3. Estrutura de Dados e Variáveis
### Tabelas Impactadas
- `channels`: Armazenará credenciais criptografadas (Account SID, Auth Token) por tenant.
- `messages`: Novos campos para `provider_message_id` e `delivery_status`.
- `channel_audit_logs_v2`: Registro de latência e sucesso/falha.

### Variáveis de Ambiente (Secrets)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (para bypass de RLS no processamento de webhook)

## 4. Próximos Passos de Execução
1. **Configuração de Infra**: Criar bucket de storage e configurar variáveis globais.
2. **Desenvolvimento da Edge Function**: Implementar o parser de mensagens e mídias.
3. **Módulo de Envio**: Criar hook `useSendMessageTwilio` que chama a API real.
4. **Interface de Configuração**: Adicionar tela em `Admin > Canais` para o usuário inserir suas credenciais Twilio.

---
### Detalhes Técnicos (Desenvolvedor)
```typescript
// Exemplo de payload processado
{
  "from": "whatsapp:+5511...",
  "to": "whatsapp:+5511...",
  "body": "Olá, preciso de suporte",
  "mediaUrls": ["..."]
}
```
**Aguardando sinal verde para iniciar a criação dos arquivos e funções.**