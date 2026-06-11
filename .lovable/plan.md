# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 12 (APLICATIVO MOBILE CORPORATIVO)

Este plano detalha a estratégia para transformar o ONECONTACT OS em uma experiência mobile nativa e PWA, com interfaces customizadas por perfil e suporte a operações críticas em movimento.

---

## 1. ARQUITETURA MOBILE (HYBRID STRATEGY)

Utilizaremos uma abordagem **Mobile-First PWA** com wrapping em **Capacitor** para recursos de hardware.

### Tecnologias e Sincronização
- **Plataforma:** PWA (Progressive Web App) para instalação imediata e Capacitor para distribuição em lojas (App Store/Google Play).
- **Offline Engine:** Implementação de `TanStack Query Persister` com `LocalStorage/IndexedDB` para garantir visualização de dados mesmo sem conexão.
- **Biometria:** Integração com `@capacitor/biometric-auth` para Face ID, Touch ID e PIN seguro.

---

## 2. EXPERIÊNCIAS POR PERFIL (ADAPTIVE UI)

O App detectará o `profile.role` e adaptará todo o layout e navegação.

### Perfis Detalhados
1. **CEO Master App:** Dashboard de faturamento (MRR/ARR), métricas de saúde global da plataforma e alertas críticos de infraestrutura.
2. **Gestor App:** Foco em indicadores da empresa, performance da equipe comercial e alertas de SLA.
3. **Gerente App:** Ferramentas de supervisão em tempo real (assumir conversas, monitorar filas, transferências rápidas).
4. **Atendente App:** Terminal de produtividade focado em Inbox, CRM e notificações de mensagens não lidas.

---

## 3. INFRAESTRUTURA DE NOTIFICAÇÕES (PUSH HUB)

Centralização de todos os alertas da plataforma em um canal de alta prioridade.

### Novas Entidades de Dados
- **`push_subscriptions`**: Armazenamento de tokens de dispositivos (Web Push / FCM).
- **`notification_preferences`**: Configuração de quais eventos cada usuário deseja receber no mobile.
- **`device_audit`**: Registro de dispositivos conectados e opção de revogação remota (segurança).

---

## 4. MOBILE-OPTIMIZED MODULES

Refatoração dos módulos core para gestos e telas pequenas.

- **Mobile Inbox:** Swipe para arquivar/transferir, gravação de áudio nativa e seletor de arquivos do sistema.
- **Mobile CRM:** Visualização de funil em lista compressível (em vez de colunas largas) e edição rápida de valor de deals.
- **Business AI Mobile:** Interface de chat simplificada para consultas por voz e "resumo do dia" via IA.

---

## 5. CRONOGRAMA DE EXECUÇÃO (STEP-BY-STEP)

**Passo 1: PWA & Manifest Foundation**  
Configuração do `manifest.json`, Service Workers e suporte a instalação (Add to Home Screen).

**Passo 2: Perfil-Based Adaptive Navigation**  
Criação do componente `MobileLayout` que renderiza sidebars e menus inferiores específicos para cada papel.

**Passo 3: Push Notification System**  
Integração com Web Push API e criação da tabela de subscrições de dispositivos no Supabase.

**Passo 4: Offline Mode & Cache Persistence**  
Configuração do cache local para mensagens e dados do CRM para acesso instantâneo.

**Passo 5: Biometria & Dispositivo Hub**  
Implementação da tela de bloqueio por biometria e painel de gestão de sessões mobile.

---

## RISCOS E CUSTOS ESTIMADOS
- **Custos:** Firebase Cloud Messaging (Gratuito no tier inicial), armazenamento extra de cache no dispositivo.
- **Desafio:** Manter a paridade de funcionalidades entre Desktop e Mobile em canais de voz (Softphone WebRTC em segundo plano).

---

**PARANDO PARA APROVAÇÃO.**  
Aguardando seu "sim" para iniciar a construção do aplicativo que levará o ONECONTACT OS para o bolso de cada empresário e operador.