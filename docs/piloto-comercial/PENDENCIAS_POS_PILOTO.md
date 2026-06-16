# Pendências Pós-Piloto (não-bloqueantes)

Itens conhecidos que **não impedem o piloto comercial guiado**, mas devem ser endereçados antes do go-live em produção plena.

## Integrações reais
- [ ] WhatsApp Meta Cloud API — substituir simulator quando o cliente fornecer App ID / Phone Number ID / Access Token.
- [ ] Twilio (WhatsApp e Voice) — credenciais Account SID / Auth Token.
- [ ] 360dialog — API key.
- [ ] Evolution API — URL + token.
- [ ] Webchat público — embed no site do cliente.

## Pagamentos
- [ ] Stripe ou Paddle — gateway hoje fica `pending_configuration`. Conectar via secret + webhook de billing events.
- [ ] Conciliar `billing_invoices_v2` com faturas reais.
- [ ] Ativar cobrança automática por uso (`billing_usage_meters`).

## White Label
- [ ] DNS do domínio personalizado apontando para a infraestrutura (CNAME).
- [ ] Emissão automática de certificado TLS.
- [ ] Verificação automática do status do domínio (hoje fica `pending_configuration`).

## Segurança
- [ ] Revisar 16 funções `SECURITY DEFINER` e revogar `EXECUTE FROM anon` onde não houver uso público legítimo.
- [ ] Auditoria periódica de RLS por tabela nova.

## Escala
- [ ] Paginação real em `call_logs`, `notifications`, `automation_logs`, `channel_webhooks_log`.
- [ ] Otimizar agregações de Relatórios via RPC (`get_conversation_metrics`, etc).
- [ ] Índices adicionais conforme volume de dados real do piloto.

## Métricas reais
- [ ] Métricas de campanha (entregue, lida, respondida) dependem do provider real.
- [ ] Health Score de cliente: refinar fórmula após coletar dados reais.

## Automação
- [ ] Worker background dedicado para execuções pesadas / agendadas.
- [ ] Retry policy configurável por nó.

## Voz
- [ ] Softphone WebRTC real (após Twilio Voice / SIP configurado).
- [ ] Gravação e transcrição de chamadas.

## Operacional
- [ ] Monitoring/alerting externo (Sentry, Datadog ou similar).
- [ ] Backup verificado do banco.
- [ ] Runbook de incidentes.