# Plano de Implementação: Marketing Automation Enterprise

O objetivo é construir uma engine de automação de jornadas de alta escala, permitindo que as empresas criem fluxos complexos de comunicação e operação que respondem em tempo real a eventos do ecossistema.

## 1. Arquitetura da Engine (Automation Schema)

A estrutura será baseada em uma arquitetura de grafos orientada a eventos:

- `public.automation_workflows`: Definição do fluxo (nome, trigger inicial, status, versão).
- `public.automation_nodes`: Os blocos individuais do fluxo (Trigger, Condição, Ação, Espera).
    - Armazenados como nós de um grafo com `parent_id` e `branch_config`.
- `public.automation_executions`: Log de cada vez que um fluxo é disparado para um contato específico.
- `public.automation_execution_logs`: Histórico detalhado de cada passo percorrido pelo contato no fluxo.
- `public.marketing_templates`: Repositório de modelos de E-mail (HTML) e WhatsApp (JSON/HSM).
- `public.marketing_campaigns`: Agrupador de automações para fins de relatório e ROI.

## 2. Motor de Execução (The Runner)

O processamento será desacoplado da interface para garantir que milhões de eventos não travem o sistema:
- **Event Dispatcher**: Triggers no banco de dados (ex: novo Deal) enviam um sinal para uma Edge Function (`workflow-dispatcher`).
- **Step Processor**: A função avalia as condições do nó atual e agenda a próxima ação.
- **Scheduler**: Sistema de filas para "Aguardar X dias" ou "Enviar em horário otimizado".

## 3. Workflow Builder (Visual UI)

Criaremos um construtor de jornadas moderno utilizando `React Flow`:
- **Canvas Infinito**: Arrastar e soltar nós de Trigger, Condição (IF/ELSE) e Ação.
- **Painel de Configuração**: Lateral dinâmica para configurar o conteúdo do E-mail ou a regra da Tag.
- **Live Preview**: Simulação do caminho que um contato faria no fluxo.

## 4. Integração com IA e OIL

- **AI Segmenter**: Integração com `OIL Signals` para disparar fluxos baseados em predição (ex: disparar fluxo de retenção quando `churn_risk` > 80%).
- **AI Content Generator**: Assistente no editor de e-mail/WhatsApp para gerar variações de texto.

## 5. Escalabilidade e Multi-Tenancy

- **Isolamento RLS**: Garantia de que fluxos e contatos de uma empresa nunca vazem para outra.
- **Throttling**: Limitação de execuções simultâneas por plano para proteger a infraestrutura global.
- **Versionamento**: Cada publicação de fluxo gera uma versão imutável, permitindo auditoria forense de por que um e-mail foi enviado há 6 meses.

## Detalhes do Nó (JSON Node)

```json
{
  "type": "condition",
  "config": {
    "field": "lead_score",
    "operator": "greater_than",
    "value": 50
  },
  "branches": {
    "true": "node_uuid_success",
    "false": "node_uuid_fallback"
  }
}
```

**PRÓXIMO PASSO:** Após sua aprovação, iniciarei a criação da infraestrutura de grafos para automação e o esqueleto do Workflow Builder.