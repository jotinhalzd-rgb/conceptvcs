# ONECONTACT OS - Architectural Blueprint

## 1. System Overview
ONECONTACT OS is a Multi-Tenant, Event-Driven, Enterprise SaaS platform designed to centralize business communications, CRM, and customer support.

## 2. Multi-Tenant Strategy
- **Isolation:** Row Level Security (RLS) at the PostgreSQL level.
- **Tenant Context:** `organization_id` on every table.
- **User Scoping:** Users belong to one or more Organizations with specific Roles.

## 3. Database Schema (PostgreSQL/Supabase)

### Core
- `organizations`: `id, name, slug, settings (jsonb), plan_id, status`
- `profiles`: `id (fk auth.users), organization_id, role, full_name, avatar_url`
- `permissions`: `id, name, key`
- `role_permissions`: `role_id, permission_id`

### Inbox Universal (Channels)
- `channels`: `id, organization_id, type (whatsapp, email, etc), credentials (encrypted), status`
- `contacts`: `id, organization_id, external_id, name, email, phone, avatar_url, metadata`
- `conversations`: `id, organization_id, channel_id, contact_id, status, last_message_at`
- `messages`: `id, conversation_id, sender_id (fk profiles or null for contact), body, type, metadata, read_at`

### CRM & Tickets
- `pipelines`: `id, organization_id, name, type (crm, tickets)`
- `stages`: `id, pipeline_id, name, order_index`
- `leads`: `id, organization_id, contact_id, stage_id, value, status`
- `tickets`: `id, organization_id, contact_id, stage_id, priority, sla_deadline_at, assigned_to`

### AI & Automation
- `automation_workflows`: `id, organization_id, trigger_event, definition (jsonb), active`
- `ai_agents`: `id, organization_id, name, role_description, knowledge_base_refs`

## 4. API & Integration Layer
- **Unified Connector Interface:** Standardized schema for all third-party integrations.
- **Webhooks:** Generic endpoint for receiving events from WhatsApp, Email, etc.
- **Edge Functions:** Handle heavy lifting and third-party API calls.

## 5. Frontend Architecture
- **State Management:** TanStack Query for server state.
- **UI Components:** Shadcn/UI for consistent design language.
- **Real-time:** Supabase Realtime for live chat and dashboard updates.
