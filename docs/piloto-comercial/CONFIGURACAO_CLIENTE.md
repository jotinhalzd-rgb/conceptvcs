# Configuração de Cliente Piloto

Guia passo a passo para preparar um novo cliente no piloto comercial.

## 1. Organização e usuários
- Criar/validar organização (`organizations`)
- Validar `profiles` dos usuários e papéis (`ceo_master`, `ceo`, `admin`, `manager`, `agent`, `supervisor`)
- Confirmar `organization_id` em todos os registros do cliente

## 2. Canal
- Em `/admin/channels`, escolher o provedor real (Meta, Twilio, 360dialog, Evolution) ou usar simulator
- Preencher credenciais — sem credenciais o canal fica `pending_configuration`
- Gerar/copiar `webhook_secret` e configurar no provedor externo
- URL inbound: `/api/public/channels/{channelId}/inbound`
- Vincular fila padrão

## 3. Filas
- Criar filas operacionais: Financeiro, Suporte, Vendas (ajustar à operação)
- Definir `assignment_mode` (manual ou auto)
- Adicionar membros via `queue_members`
- Configurar SLA em minutos

## 4. Regras de roteamento
- Em `queue_routing_rules`, criar regras por keyword, contato, horário ou canal
- Testar com simulator antes de ativar provedor real

## 5. Validação inbound
- Disparar inbound de teste (simulator ou número real)
- Confirmar criação de `conversations` + `messages`
- Confirmar `queue_id` e `routing_reason`
- Confirmar notificação no sino

## 6. Inbox
- Atendente assume conversa
- Validar envio de texto, anexo, áudio, emoji, nota interna
- Validar realtime entre 2 sessões

## 7. CRM
- Criar/ajustar pipelines e stages
- Criar deals piloto
- Validar movimentação entre etapas e tarefas

## 8. Campanhas
- Importar contatos
- Criar campanha de teste
- Confirmar `pending_configuration` se canal não suportar envio em massa

## 9. Relatórios
- Validar dashboards de conversas, filas, SLA, CRM, campanhas
- Exportar CSV

## 10. Integrações externas (quando houver credenciais)
- WhatsApp: Meta / Twilio / 360dialog / Evolution
- Voz: Twilio Voice / SIP
- Pagamentos: Stripe / Paddle
- White Label: apontar DNS do domínio personalizado

## 11. Segurança
- Confirmar isolamento por `organization_id` em todas as tabelas
- Validar que API keys aparecem mascaradas e webhook_secret nunca é exposto em log
- Validar login de 2 perfis distintos para confirmar RLS