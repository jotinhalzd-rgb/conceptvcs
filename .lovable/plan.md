text
# PLANO DE REFATORAÇÃO E OTIMIZAÇÃO ESTRUTURAL - ONECONTACT OS

Este plano visa consolidar a arquitetura da Fase 3, garantindo escalabilidade para milhões de mensagens e performance de resposta abaixo de 100ms.

## ETAPA 1: OTIMIZAÇÃO DA CAMADA DE DADOS (DATABASE & CACHING)
*   **Normalização de Performance:** Criar índices compostos nas tabelas `messages` (conversation_id, created_at) e `conversations` (status, queue_id).
*   **Data Tiering:** Implementar lógica de arquivamento para mensagens com mais de 90 dias para tabelas de cold storage, mantendo a performance da Inbox ativa.
*   **Caching Estratégico:** Configurar cache via React Query com políticas de stale-while-revalidate agressivas para metadados de Customer 360.

## ETAPA 2: REFATORAÇÃO DO CORE DE INTELIGÊNCIA (IA ENGINE)
*   **Abstração de LLM:** Criar um Service Layer unificado para chamadas de IA, permitindo alternar entre GPT-4o, Claude 3.5 e modelos locais sem alterar a UI.
*   **Vetorização (RAG):** Implementar Supabase Vector (pgvector) no `knowledge_base` para buscas semânticas ultrarrápidas pelo Copilot.
*   **Batch Processing:** Otimizar as Edge Functions de análise de sentimento para processamento em lote, reduzindo latência e custos de API.

## ETAPA 3: OTIMIZAÇÃO DE FRONTEND & UX (CLIENT-SIDE)
*   **Virtualização de Listas:** Implementar `react-window` ou `tanstack-virtual` na lista de conversas da Inbox para suportar scroll infinito sem degradação de FPS.
*   **Otimização de Asset Loading:** Migrar ícones Lucide para carregamento dinâmico e otimizar o bundle principal através de Code Splitting por rota.
*   **Web Workers:** Mover cálculos pesados de scores (Customer/Agent) para Web Workers, liberando a Main Thread para interações de chat.

## ETAPA 4: GOVERNANÇA E SEGURANÇA (SYSTEM HARDENING)
*   **Auditoria Imutável:** Refinar os triggers de histórico para garantir que nenhuma edição de mensagem escape da trilha de auditoria.
*   **Rate Limiting:** Implementar limites de taxa por Tenant/Agente para proteger a infraestrutura contra picos de tráfego.
*   **Monitoring:** Adicionar logs estruturados e telemetria para monitorar o Tempo Médio de Resposta da IA (TMR-IA).

## ETAPA 5: ESCALABILIDADE OMNICHANNEL (ADAPTER PATTERN)
*   **Unified Adapter Interface:** Refatorar os conectores de canais (WhatsApp, Email, etc) para um padrão de Adapter único, facilitando a adição de novos canais como TikTok ou LinkedIn em tempo recorde.
