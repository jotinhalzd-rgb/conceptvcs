# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 5 (IA COPILOT OPERACIONAL)

Este plano detalha a inteligência artificial como um assistente de produtividade em tempo real para toda a operação.

---

## 1. ESTRATÉGIA DE IA E CONSUMO

Utilizaremos uma arquitetura Híbrida para otimizar custos e latência:
- **Modelo Principal:** GPT-4o (via Lovable AI Gateway) para análise de contexto complexo e geração de resumos.
- **Modelo de Latência:** GPT-4o-mini para sugestões de resposta em tempo real e detecção de intenção.
- **Estratégia de Cache:** Redis/Supabase Cache para respostas a FAQs idênticas e documentos da Base de Conhecimento.
- **Consumo Estimado:** ~0.02 USD por atendimento completo (análise de ~20 mensagens + 1 resumo final).

---

## 2. ARQUITETURA TÉCNICA (DATA & ENGINE)

### Base de Conhecimento (RAG)
- Utilização da tabela `knowledge_base` existente.
- Implementação de Busca Vetorial (pgvector) no Supabase para recuperar documentos relevantes baseados no contexto da última mensagem.

### Engine de Processamento
- **Copilot Stream:** Um canal de realtime que envia "pensamentos" da IA enquanto o cliente fala.
- **Detecção Automática:**
  - **Intenção:** Atualiza `ai_intent` na tabela `conversations`.
  - **Sentimento/Risco:** Alimenta `ai_sentiment` e `ai_urgency_score`.
  - **Oportunidade:** Sugere a criação de um `Deal` se detectar interesse comercial.

---

## 3. INTERFACE IA COPILOT (UX/UI)

A IA será um "copiloto silencioso" no painel direito ou em widgets flutuantes.

### Chat Side-Panel (IA Hub)
- **Sugestões Ativas:** Cards de resposta com botão "Aplicar" (copia para o input).
- **Contexto Rápido:** Resumo em 3 tópicos da conversa atual.
- **Alertas de Gestão:** "SLA em 5 min", "Cliente VIP detectado", "Sentimento Negativo".

### Base de Conhecimento Hub
- Tela para upload de PDFs e criação de FAQs que treinam o modelo.

---

## 4. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: Fundação de Vetores & RAG**  
Configuração de `pgvector` no banco de dados e hook para busca na base de conhecimento.

**Passo 2: Painel Copilot no Chat**  
Construção do painel lateral de IA dentro da `InboxView` com sugestões de resposta dinâmicas.

**Passo 3: Motor de Resumo & Audit**  
Implementação da lógica que gera e salva o resumo ao trocar de `status` para `resolved`.

**Passo 4: Dashboard de Insights para Gestores**  
Widget de IA para gerentes com análise de performance da equipe e gargalos operacionais.

---

## ENTIDADES E MODELOS
- `ai_suggestions_log`: Para medir o aprendizado (aceitas vs rejeitadas).
- `knowledge_base`: Expansão para suporte a embeddings vetoriais.

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para transformar a IA no braço direito da sua equipe operacional.