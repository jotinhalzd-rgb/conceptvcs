# DIAGNÓSTICO DO BUG - TELA DE LOGIN SEM ROLAGEM

Após a análise do arquivo `src/routes/auth.tsx`, identifiquei a causa raiz do bloqueio de rolagem.

**Causa Raiz:**
No componente `AuthPage`, o container principal (linha 101) possui as classes `overflow-y-auto no-scrollbar`. 
Embora `overflow-y-auto` devesse permitir a rolagem, a combinação com `min-height-screen` (100vh) em um container que usa `flex-col md:flex-row` sem uma definição clara de comportamento de rolagem no nível do `html/body` ou em seus filhos imediatos está travando a experiência em algumas resoluções. Além disso, a classe `no-scrollbar` esconde a barra, o que pode dar a impressão de travamento total quando o scroll do mouse não é detectado corretamente pelo navegador.

**Componente:** `AuthPage` em `src/routes/auth.tsx`
**Propriedade CSS Responsável:** `overflow-y-auto no-scrollbar` no container principal e a falta de `overflow-y: auto` explícito no `html/body`.

---

# PLANO DE EXECUÇÃO

### Passo 1: Ajuste de Estrutura Global
Garantir que o navegador permita a rolagem no nível mais alto do documento.

### Passo 2: Refatoração do AuthPage
1. Alterar o container principal para remover `overflow-y-auto no-scrollbar`.
2. Garantir que a coluna da esquerda (`LeftPanel`) e a da direita (`RightPanel`) permitam o crescimento natural do conteúdo.
3. Utilizar `min-h-screen` em vez de `h-screen`.

### Passo 3: Implementação do Scroll Natural
- Remover classes que escondem barras de rolagem.
- Aplicar `overflow-y: auto` no container que realmente precisa rolar (o layout principal da rota auth).

### Passo 4: Validação de Responsividade
- Testar visualmente se o conteúdo abaixo da dobra (botão de Sair e Acessos Rápidos) está acessível via scroll em resoluções baixas (1366x768).

---

**PARANDO PARA APROVAÇÃO.**
Aguardando seu "sim" para aplicar a correção estrutural definitiva.