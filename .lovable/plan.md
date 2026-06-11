text
# PLANO DE REPROJETO: INBOX OPERACIONAL PREMIUM (LINEAR/INTERCOM STYLE)

Transformação da Inbox em uma ferramenta de alta performance, eliminando desperdícios de espaço e focando na produtividade do operador.

## 1. Reestruturação do Grid & Viewport
*   **Aplicação 100vh:** Ajustar o `AppLayout` para que a área de conteúdo principal possa ocupar 100% da altura disponível sem paddings excessivos.
*   **CSS Grid Operacional:** Implementar o grid fixo: `[Sidebar 80px] | [Lista 360px] | [Chat 1fr] | [Customer 360 420px]`.
*   **Scroll Isolado:** Garantir que apenas as colunas internas possuam scroll (`overflow-y-auto`), travando o scroll da página.

## 2. Refinamento das Colunas
*   **Coluna 2 (Lista de Conversas):** Aumento da densidade de informação. Redução de paddings, tipografia otimizada e inclusão de mini-badges de Fila e Sentimento sem poluição visual.
*   **Coluna 3 (Chat Principal - Core):** Expansão da largura para 55-65%. Interface de mensagens inspirada no Slack/Linear (foco no conteúdo, bolhas de chat discretas).
*   **Coluna 4 (Customer 360):** Painel compacto com cabeçalho fixo, timeline vertical densa e insights de IA em blocos de alto contraste.

## 3. Experiência de Usuário & Responsividade
*   **Brekpoints Inteligentes:** 
    *   < 1440px: Customer 360 torna-se um painel flutuante (Drawer) acionável por ícone.
    *   < 1024px: Sidebar e Lista de Conversas entram em modo compacto/recolhido.
*   **Estética "Enterprise SaaS":** 
    *   Remoção de glows e sombras agressivas.
    *   Uso de bordas sutis (`border-white/5`).
    *   Background sólido `#020617` com variações mínimas para separação de áreas.
    *   Tipografia Inter/Sans de alta legibilidade.

## 4. Detalhes de Produtividade
*   **Área de Input:** Fixada no rodapé do chat, com comandos rápidos visíveis e suporte a mídias sem expandir excessivamente a altura.
*   **Cabeçalhos:** Fixos com metadados do contato e status de atendimento sempre visíveis.

---
**Resultado Esperado:** Uma interface que desaparece para dar lugar ao trabalho, transmitindo a sensação de um sistema robusto, rápido e confiável para uso contínuo.
