# Checklist de Demonstração — Piloto

Sequência recomendada para uma demo guiada de ~30 min.

## 1. Acesso
- [ ] Login com perfil Empresa Demo ou Gerente Demo
- [ ] Dashboard carrega com métricas reais (sem números fake)
- [ ] Sidebar respeita o papel

## 2. Canais
- [ ] Abrir `/admin/channels`
- [ ] Mostrar canal demo (simulator) já configurado
- [ ] Apresentar webhook_secret oculto e botão de copy/rotate
- [ ] Confirmar fila padrão vinculada

## 3. Filas
- [ ] Abrir `/queues`
- [ ] Confirmar filas Financeiro, Suporte, Vendas
- [ ] Mostrar membros e modo `assignment_mode` (manual/auto)
- [ ] Aba de regras: keyword "financeiro" → fila Financeiro

## 4. Inbound técnico
- [ ] Disparar inbound via simulator com texto "quero falar com o financeiro"
- [ ] Confirmar `routing_reason` na conversa
- [ ] Confirmar `agent_id` atribuído em modo auto
- [ ] Confirmar sino piscando com notificação

## 5. Inbox
- [ ] Atendente assume a conversa
- [ ] Responder texto
- [ ] Enviar anexo (imagem/pdf)
- [ ] Enviar áudio
- [ ] Inserir emoji
- [ ] Adicionar nota interna privada

## 6. Customer 360 / CRM
- [ ] Abrir painel do contato
- [ ] Mostrar histórico unificado (mensagens, deals, tickets, billing)
- [ ] Criar oportunidade ligada à conversa
- [ ] Abrir `/crm`, mover deal de etapa
- [ ] Criar tarefa

## 7. Campanhas
- [ ] Abrir `/campaigns`
- [ ] Criar campanha com contato real
- [ ] Mostrar `pending_configuration` se canal não suportar envio

## 8. Relatórios
- [ ] Abrir `/reports`
- [ ] Filtrar por período
- [ ] Exportar CSV

## 9. Módulos avançados
- [ ] AI Studio: criar agente, vincular fila, testar
- [ ] Automação: criar regra, ativar, ver log
- [ ] Developer: gerar/rotacionar/revogar API key, copiar curl, ver logs mascarados
- [ ] Notificações: filtros, marcar lida, preferências
- [ ] Business Hub: checklist real + atalhos navegando
- [ ] OIL/Advisor: alertas e recomendações reais
- [ ] Voice: ramal + IVR + call logs; softphone `pending_configuration`
- [ ] Billing: planos, faturas/empty, uso/empty, gateway `pending_configuration`
- [ ] White Label: nome, logo, cor, domínio `pending_configuration`, preview, reset

## 10. Encerramento
- [ ] Logout limpa sessão
- [ ] Login com outro perfil para mostrar isolamento RLS