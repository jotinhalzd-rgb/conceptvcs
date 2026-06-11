# Plano de Implementação: White Label, Franquias e Canais

O objetivo é transformar o OneContact OS em um ecossistema multi-camada, permitindo que a plataforma seja distribuída sob diferentes marcas e hierarquias (Franquias, Revendas, White Label).

## 1. Arquitetura de Canais (Distribution Schema)

A fundação de dados será estendida para suportar relações de parentesco e personalização visual:

- `public.white_label_configs`: Configurações visuais por marca (Logo, Cores, Domínio, Nome).
- `public.channel_networks`: Estrutura de redes (ex: Franquia X, Rede de Consultoria Y).
- `public.channel_hierarchy`: Mapeamento de relações (Parent/Child) entre organizações.
    - `parent_org_id` -> `child_org_id`.
    - Níveis: 'Master', 'Franchise', 'Unit', 'Partner'.
- `public.channel_permissions`: Escopo de visibilidade (ex: Master vê agregados de todas as Units).

## 2. White Label Engine (Dynamic Branding)

Implementaremos um sistema de injeção de marca em tempo real:
- **Theme Provider**: Lê a `white_label_config` baseada no `window.location.hostname`.
- **Asset Resolver**: Alterna logos, favicons e e-mails de sistema dinamicamente.
- **Subdomain Routing**: Mapeamento de `marca-a.onecontact.os` para o perfil visual correspondente.

## 3. Painéis Hierárquicos (The Network Views)

### A. Franchise Dashboard (Master View)
- Visão agregada de receita (MRR) de toda a rede.
- Ranking de performance entre unidades.
- Benchmark interno (EIN focado na rede).

### B. Unit/Partner Dashboard (Local View)
- Interface operacional padrão, mas com indicação da rede vinculada.
- Gestão de carteira para consultores e agências.

## 4. Governança e Repasses (Billing Integration)

- **Revenue Split**: Integração com a `Billing Platform` para automatizar o split de pagamentos.
- **Certification Badges**: Visualização do nível de parceria no perfil do Hub.

## 5. Escalabilidade e Segurança (RLS Cross-Tenant)

- **Hierarchical RLS**: Política que permite ao `parent_org_id` ler (SELECT) dados agregados de seus filhos, sem permitir escrita direta.
- **Isolation**: Garantia de que a Marca A nunca acesse a configuração de marca B.

## Detalhes da Hierarquia

```text
MASTER FRANQUIA (Vê Tudo)
   └── FRANQUEADO REGIONAL (Vê sua Região)
       └── UNIDADE LOCAL (Vê sua Unidade)
```

**PRÓXIMO PASSO:** Após sua aprovação, iniciarei a criação das tabelas de configuração White Label e a infraestrutura de hierarquia de organizações.