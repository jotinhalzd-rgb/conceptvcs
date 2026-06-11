# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 8 (VOICE & PBX CLOUD)

Este plano detalha a unificação da comunicação por voz ao ecossistema OneContact, transformando o sistema em uma central de atendimento 360º (Omnichannel Real).

---

## 1. ARQUITETURA PBX CLOUD (ABSTRAÇÃO)

Implementaremos uma camada de abstração de voz para permitir a conexão com múltiplos provedores SIP/WebRTC sem dependência de um único fornecedor.

### Novas Entidades de Dados
- **`voice_extensions` (Ramais):** `number`, `agent_id` (FK), `status` (available, busy, offline, ringing), `voicemail_config`.
- **`call_logs` (Chamadas):** `direction` (inbound/outbound), `from_number`, `to_number`, `duration`, `recording_url`, `transcription_text`, `ai_summary`, `deal_id` (FK CRM), `contact_id` (FK).
- **`ivr_flows` (URA):** Estrutura JSON para árvores de decisão de voz.

---

## 2. EXPERIÊNCIA INTEGRADA (VOICE + INBOX + CRM)

A telefonia será um componente nativo da interface, não um popup externo.

- **Softphone Nativo:** Widget flutuante ou integrado à sidebar para discagem, mudo, transferência e conferência.
- **Vincular Chamada:** Ao receber uma ligação de um número conhecido, a Inbox abre automaticamente o **Customer 360** desse contato.
- **Conversão Automática:** Botão "Gerar Negócio" disponível durante a chamada para alimentar o CRM instantaneamente.

---

## 3. INTELIGÊNCIA DE VOZ (AI COPILOT VOICE)

A IA atuará após e durante as chamadas para aumentar a produtividade.

- **Transcrição em Tempo Real:** Conexão preparada para Deepgram/Whisper para transformar áudio em texto.
- **Motor de Insights:** Geração automática de resumo do motivo do contato e identificação de tarefas ("follow-up amanhã").
- **URA Inteligente (NLP):** Preparação para roteamento por voz ("Diga em poucas palavras o que você precisa").

---

## 4. ESTRATÉGIA DE CUSTOS E ESCALABILIDADE

- **Mídia:** Armazenamento de gravações em Supabase Storage com políticas de retenção configuráveis.
- **Latência:** Uso de sinalização WebRTC para voz de alta fidelidade diretamente no navegador.
- **Custos:** Aproximadamente $0.005/min para transcrição e armazenamento.

---

## 5. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: Voice Schema & Migrations**  
Criação das tabelas de ramais, chamadas e URA.

**Passo 2: Painel de Telefonia (Softphone UI)**  
Desenvolvimento da interface de discagem e controle de chamadas na Sidebar.

**Passo 3: Integração com Filas Omnichannel**  
Lógica para fazer chamadas caírem nas mesmas filas de WhatsApp/Email (Round Robin de Voz).

**Passo 4: Monitoramento em Tempo Real (Wallboard)**  
Dashboard para gestores visualizarem quem está em linha e tempo médio de espera.

**Passo 5: Módulo de Transcrição & IA**  
Processamento automático de chamadas finalizadas para gerar resumos no Customer 360.

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para iniciar a construção da central de voz definitiva do ONECONTACT OS.