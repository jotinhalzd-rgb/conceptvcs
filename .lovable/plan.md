# Onda C — Voice + Billing + White Label + Validação Final Prompt 2/3

Escopo aprovado: C1 Voice real, C2 Billing real, C3 White Label real, C4 validação final. Sem tocar no núcleo omnichannel (A1–A4, Inbox, CRM, Campanhas, Canais, Filas, Marketplace, inbound, RLS, Business Hub Onda B). Sem iniciar Prompt 3/3.

## C1 — Voice

**Hook `src/hooks/voice/use-voice.ts` (reescrever):**
- `useVoiceExtensions` (já existe) — manter, escopar por `organization_id`.
- Adicionar: `useCreateExtension`, `useUpdateExtension`, `useDeleteExtension`, `useToggleExtensionStatus`.
- `useIvrFlows`, `useCreateIvrFlow`, `useUpdateIvrFlow`, `useDeleteIvrFlow`, `useToggleIvrFlow`.
- `useCallLogs` (já existe) — adicionar filtros (período, status, número).
- `useVoiceProviderStatus` — deriva pending_configuration de `channels` tipo `voice` ou da própria extensão (sem credencial → pending).

**`src/components/voice/pbx-management.tsx` (reescrever):**
- Lista real de `voice_extensions` da org.
- Drawer/Dialog de criar/editar: `extension_number`, `user_id` (select dos profiles da org), `provider` (`twilio` | `manual`), `identifier` (DID/número), `default_queue_id` (select de `queues`), `status`.
- Toggle ativar/desativar, excluir com `AlertDialog`.
- Badge de status real. Se provider exige credencial e não há → badge `pending_configuration` + tooltip "Configure credencial Twilio em Marketplace/Canais".
- Empty state honesto.

**`src/components/voice/ivr-builder.tsx` (reescrever):**
- Lista real de `ivr_flows` da org.
- Editor simples: `name`, `description`, `channel_id`, `queue_id`, `is_active`, `flow_config` (textarea JSON com preview validado via `JSON.parse` antes de salvar).
- Criar/editar/duplicar/excluir com confirmação. Sem builder visual complexo.

**`src/components/voice/call-log-list.tsx` (reescrever):**
- Tabela real de `call_logs` filtrada por org via join em `contacts`/`profiles`.
- Filtros: período (date range), `status` (select), busca por número.
- Empty state honesto. Sem chamada fake.

**`src/components/voice/softphone-widget.tsx` (reescrever):**
- Ler `useVoiceProviderStatus`. Se sem provider/extensão própria do usuário → mostrar estado `pending_configuration` com link para `/admin/channels` ou PBX. Sem dialer ativo.
- Se configurado: dialer manual valida formato E.164; botão "Testar configuração" chama serverFn que apenas valida credencial/formato (não disca). Mantém UI atual mas remove o `setIsCalling(true)` fake e o avatar "Roberto Almeida".

**ServerFn:** `src/lib/voice/voice-test.functions.ts` — `validateVoiceConfig({ extensionId })`: valida presença de credencial/identifier, retorna `{ ok, missing[] }`. Sem chamada externa real.

## C2 — Billing

**Hook `src/hooks/billing/use-billing.ts` (estender):**
- `usePlans`, `useCurrentSubscription`, `useUsageMeters`, `useInvoices` (já existem) — manter.
- Adicionar: `usePaymentGatewayStatus` — lê `connected_integrations`/secret presence via serverFn → retorna `{ configured: boolean, provider?: string, missing: string[] }`.
- `useUpdateSubscriptionPlanRequest` — apenas marca request em `billing_subscriptions_v2` (status `pending_configuration`) sem cobrar.

**`src/components/billing/billing-view.tsx` (revisar):**
- Remover banner "Restam 4 dias" e qualquer métrica hardcoded.
- Se sem gateway: banner "Gateway de pagamento não configurado" + botão abrindo modal real (salva pending_configuration em `connected_integrations`).
- Empty state honesto para sem assinatura.

**`src/components/billing/plans-grid.tsx`:** marcar plano atual real; CTA "Fazer Upgrade" → abre modal que salva intenção `pending_configuration` (não cobra). Não fingir assinatura.

**`src/components/billing/invoice-list.tsx` (revisar):** apenas faturas reais; empty honesto; download só se `pdf_url` real.

**`src/components/billing/usage-meter.tsx` (revisar):** apenas `billing_usage_meters` reais; "sem dados de uso ainda" se vazio.

**ServerFn:** `src/lib/billing/gateway.functions.ts` — `getGatewayStatus()` e `saveGatewayConfigRequest({ provider })` (apenas grava intenção; não chama Stripe/Paddle).

## C3 — White Label

**Hook novo `src/hooks/settings/use-white-label.ts`:**
- `useWhiteLabelConfig` — `white_label_configs_v2` por org (maybeSingle).
- `useUpsertWhiteLabelConfig` — upsert real.
- `useUploadLogo` — upload em `message-attachments` bucket sob path `white-label/{org_id}/logo-{ts}.{ext}`; retorna URL.
- `useVerifyDomain` — serverFn que apenas grava status `pending_configuration` e devolve instruções DNS (A/CNAME). Sem fingir ativo.

**Componente novo `src/components/settings/white-label-view.tsx`:**
- Form: `product_name`, `logo_url` (upload + preview + remover), `accent_color` (color picker), `theme` (light/dark/auto), `custom_domain` (input + status badge + instruções DNS).
- Preview ao vivo do header com accent/logo aplicados localmente (sem mexer no tema global).
- Botão "Resetar" com confirmação.
- RLS: já existe; garantir filter por `organization_id`. Sem vazamento.

**Rota:** `src/routes/settings.white-label.tsx` (lazy import) + item no sidebar de settings.

**Migration (se necessário):** garantir colunas `product_name`, `logo_url`, `accent_color`, `theme`, `custom_domain`, `domain_status` em `white_label_configs_v2`. Se já existem, sem migration. RLS por `organization_id` confirmada/adicionada.

## C4 — Validação final Prompt 2/3

```
bunx tsc --noEmit
rg -n "Em breve|coming soon|não implementado|próxima sprint" src/
rg -n "TODO" src/
rg -n "onClick=\{\(\) => \{\}\}|onClick=\{\(\) => null\}" src/
rg -n "console\.log" src/
```

QA regressão (clicar e confirmar não-quebra): AI Studio, Automação + logs, Developer (API Keys, webhook logs, rotação secret), Notificações (sino, lista, preferências), Business Hub, OIL/Advisor, Voice (PBX, IVR, logs, softphone pending), Billing (plano, uso, faturas, gateway pending), White Label (logo upload, domínio pending), Inbox (anexo/áudio/emoji), CRM, Campanhas, Relatórios, CSV export, login/logout demo, sidebar, Marketplace ↔ Canais, endpoint inbound, fluxo "falar com financeiro", filas/regras, Customer 360, RLS.

QA multi-perfil: CEO Master, Empresa Demo, Gerente Demo, Atendente Demo, Supervisor IA — navegação básica sem tela branca.

## Fora de escopo

Prompt 3/3, refactor de núcleo omnichannel, novos módulos, cobrança real, discagem real, ativação real de domínio.

## Entregáveis do relatório final

Arquivos alterados, migrations (se houver), hooks/componentes novos, como testar cada bloco, o que ficou pending_configuration, confirmação sem dado fake, núcleo intocado, resultado tsc/build/buscas, riscos remanescentes. Pedir validação antes de Prompt 3/3.
