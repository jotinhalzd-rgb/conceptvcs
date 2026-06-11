text
# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 4 (CAMPANHAS & CDP)

Transformação do sistema em uma plataforma central de inteligência de dados (CDP) e motor de engajamento multicanal de alta escala.

## 1. Infraestrutura de Dados & CDP (Customer Data Platform)
*   **Esquema de Campanhas:** Criar tabelas `campaigns`, `campaign_batches` e `campaign_logs` para rastreamento granular.
*   **Motor de Eventos:** Implementar uma tabela central de `events` que unifica disparos, aberturas, cliques e conversões, alimentando a timeline 360 do cliente.
*   **Segmentação Dinâmica:** Criar sistema de "Audiências" baseado em metadados (tags, ticket médio, última compra, health score).

## 2. Módulo de Campanhas 2.0
*   **Interface de Criação:** Workflow passo a passo: [Definição] -> [Público/Audiência] -> [Conteúdo Multicanal] -> [Agendamento].
*   **Canais Suportados:** Implementar seletores para WhatsApp, Email, SMS e Push, preparados para integração com provedores (Twilio, SendGrid, etc).
*   **Validação de Lista:** Processo de "Sanitização" na importação (limpeza de duplicados e verificação de formato).

## 3. Inteligência Artificial de Engajamento
*   **IA Copywriter:** Integração com LLM para gerar variações de mensagens e CTAs baseados no objetivo da campanha.
*   **Predição de Melhor Horário:** Algoritmo que sugere o envio baseado no histórico de engajamento do cliente.
*   **Análise de ROI:** Painel que cruza dados de disparos com eventos de conversão no CRM.

## 4. Governança & Auditoria (Compliance)
*   **Audit Log Central:** Registrar todas as ações administrativas (quem criou a campanha, quem exportou contatos, quem alterou permissões).
*   **Sistema de Pesquisa (CSAT/NPS):** Automação pós-atendimento que dispara pesquisas e vincula resultados ao Atendente e à Fila.

## 5. Dashboard Executivo (CEO View)
*   **Métricas de Funil:** Visualização clara do ROI por canal e performance de conversão por equipe.
*   **Relatórios de Crescimento:** Gráficos de retenção (Churn) versus novas oportunidades geradas por campanhas.

---

### Detalhes Técnicos (Para Desenvolvedores)
*   **Escalabilidade:** Migração de logs de eventos para uma estrutura otimizada para leitura (indexes compostos em `campaign_id` + `status`).
*   **Edge Functions:** Processamento de disparos em massa via Supabase Edge Functions com filas de processamento para evitar gargalos.
*   **Multi-tenancy:** RLS (Row Level Security) rigoroso para garantir isolamento total entre empresas em um ambiente de milhões de registros.
