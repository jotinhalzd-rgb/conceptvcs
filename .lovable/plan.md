text
# PLANO DE IMPLEMENTAÇÃO: ONECONTACT OS - FASE 6 (GOVERNANÇA & HIERARQUIA ENTERPRISE)

Este plano estabelece a espinha dorsal de controle e segurança do sistema, permitindo a gestão multi-nível desde o CEO Master até o Atendente Operacional.

## 1. Arquitetura de Governança & RLS
*   **Novos Perfis de Acesso:** Implementar o campo `role` na tabela `profiles`: `ceo_master`, `admin` (Gestor), `manager` (Gerente), `agent` (Atendente).
*   **Isolamento de Dados (Multi-tenancy):** Refinar as políticas de RLS para que:
    *   `ceo_master`: Visualiza e edita TUDO (todas as empresas).
    *   `admin`: Visualiza apenas dados da sua `company_id`.
    *   `manager`: Visualiza dados da sua empresa e subordinados.
    *   `agent`: Visualiza apenas suas próprias conversas e dados operacionais básicos.

## 2. Dashboard CEO Master (Painel Global)
*   **Métricas Agregadas:** Visão em tempo real de todas as empresas integradas.
*   **Gestão de Inquilinos (Tenants):** Interface para criar, suspender e gerenciar limites de uso de IA e mensagens de cada empresa.
*   **Módulo de Impersonação:** Sistema de "Acesso por Atribuição" que permite ao CEO assumir a sessão de qualquer usuário para suporte técnico, com registro obrigatório em log de auditoria.

## 3. Gestão de Equipe & Hierarquia Funcional
*   **Painel do Gestor Master:** Controle total sobre os usuários da sua empresa (Admin -> Gerente -> Atendente).
*   **Painel do Gerente Operacional:** Foco em monitoramento de SLA e produtividade da equipe sob seu comando.
*   **IA Supervisora:** Alertas em tempo real para o Gerente sobre filas congestionadas e riscos de SLA.

## 4. Auditoria Total & Compliance
*   **Rastreabilidade Extrema:** Registro de cada login, logout e troca de perfil.
*   **Log de Impersonação:** Registro de quem, quando e por que um CEO Master acessou uma conta de cliente.
*   **IP & User-Agent Tracking:** Captura automática de metadados em cada ação crítica.

## 5. Experiência de Login & Demonstração
*   **Acesso Rápido 2.0:** Botões na tela de login para alternar instantaneamente entre os 4 níveis de demonstração.
*   **Sistema de Logout Robusto:** Botão global que limpa estados de impersonação, cache e redireciona ao login com segurança.

---

### Especificações Técnicas
*   **Tabelas de Apoio:** `companies`, `audit_logs` (já criada, será expandida), `user_permissions`.
*   **Segurança:** Implementação de JWT Claims personalizados (via hooks do Supabase) para facilitar a verificação de permissões no lado do cliente.
*   **Performance:** Índices compostos por `company_id` em todas as tabelas transacionais.
