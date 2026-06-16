# OneContact OS — Piloto Comercial

## Visão geral
OneContact OS (conceptvcs) é uma plataforma omnichannel de atendimento, CRM e inteligência de negócio, com automação, IA e marketplace integrados.

## Proposta de valor
- Atendimento unificado em múltiplos canais (WhatsApp, webchat, voz).
- Roteamento inteligente por filas, regras e IA.
- CRM e Customer 360 integrados ao atendimento.
- Campanhas, relatórios e exportação CSV nativos.
- AI Studio, Automação e Developer Center prontos para extensão.
- Business Hub, OIL/CEO Advisor com métricas reais.
- Voice/PBX, Billing e White Label como módulos opcionais.

## Status atual
Aprovado para **piloto comercial guiado**. Núcleo omnichannel e módulos avançados validados (typecheck 0, sem strings proibidas, sem handlers no-op, sem console.log solto).

## O que está pronto
- Núcleo: Canais, Filas, Inbox realtime, Anexos/Áudio/Emoji, Customer 360, CRM, Campanhas, Relatórios, CSV, Notificações, SLA, RLS multiempresa.
- Avançado: AI Studio, Automação, Developer (API keys + webhooks + logs mascarados), Notificações avançadas, Business Hub, OIL/Advisor/CEO, Voice/PBX, Billing, White Label.
- Simulador de inbound para demo end-to-end sem provedor externo.

## Depende de configuração externa
- WhatsApp real: Meta Cloud API, Twilio, 360dialog ou Evolution (credenciais do cliente).
- Pagamentos: Stripe ou Paddle.
- Voz real: Twilio Voice ou provedor SIP.
- Domínio White Label: DNS apontando para infraestrutura.

Sem credenciais, todos os módulos exibem `pending_configuration` honesto — sem fingir sucesso.

## Perfis demo
- CEO Master
- Empresa Demo
- Gerente Demo
- Atendente Demo
- Supervisor IA

## Fluxo principal de demo
Canal demo → inbound "quero falar com o financeiro" → roteamento por keyword → notificação → Inbox → resposta com anexo/áudio/emoji → Customer 360 → oportunidade no CRM → campanha → relatório + CSV.

## Riscos não bloqueantes
- 16 WARN de `SECURITY DEFINER` em funções legadas (necessárias para RLS sem recursão).
- Integrações reais aguardam credenciais do cliente piloto.
- DNS White Label aguarda configuração.

## Próximos passos pós-piloto
Ver `PENDENCIAS_POS_PILOTO.md`.