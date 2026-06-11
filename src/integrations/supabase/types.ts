export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_performance: {
        Row: {
          agent_id: string
          avg_response_time: number | null
          conversion_rate: number | null
          csat_score: number | null
          date: string | null
          id: string
          resolved_chats: number | null
          revenue_generated: number | null
          total_chats: number | null
        }
        Insert: {
          agent_id: string
          avg_response_time?: number | null
          conversion_rate?: number | null
          csat_score?: number | null
          date?: string | null
          id?: string
          resolved_chats?: number | null
          revenue_generated?: number | null
          total_chats?: number | null
        }
        Update: {
          agent_id?: string
          avg_response_time?: number | null
          conversion_rate?: number | null
          csat_score?: number | null
          date?: string | null
          id?: string
          resolved_chats?: number | null
          revenue_generated?: number | null
          total_chats?: number | null
        }
        Relationships: []
      }
      ai_analytical_logs: {
        Row: {
          ai_response: string | null
          created_at: string | null
          data_points_referenced: Json | null
          id: string
          organization_id: string
          query_text: string
          satisfaction_score: number | null
          user_id: string | null
        }
        Insert: {
          ai_response?: string | null
          created_at?: string | null
          data_points_referenced?: Json | null
          id?: string
          organization_id: string
          query_text: string
          satisfaction_score?: number | null
          user_id?: string | null
        }
        Update: {
          ai_response?: string | null
          created_at?: string | null
          data_points_referenced?: Json | null
          id?: string
          organization_id?: string
          query_text?: string
          satisfaction_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analytical_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          action_label: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          insight_type: string
          is_resolved: boolean | null
          level: string
          metadata: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_label?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          insight_type: string
          is_resolved?: boolean | null
          level: string
          metadata?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_label?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          insight_type?: string
          is_resolved?: boolean | null
          level?: string
          metadata?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions_log: {
        Row: {
          agent_id: string | null
          applied_content: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          status: string | null
          suggestion_type: string
        }
        Insert: {
          agent_id?: string | null
          applied_content?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          status?: string | null
          suggestion_type: string
        }
        Update: {
          agent_id?: string | null
          applied_content?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          status?: string | null
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_log_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          action_type: string
          contact_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          node_id: string
          status: string | null
          workflow_id: string
        }
        Insert: {
          action_type: string
          contact_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          node_id: string
          status?: string | null
          workflow_id: string
        }
        Update: {
          action_type?: string
          contact_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          node_id?: string
          status?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          nodes: Json
          organization_id: string
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nodes?: Json
          organization_id: string
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nodes?: Json
          organization_id?: string
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_health_scores: {
        Row: {
          calculated_at: string | null
          category: string
          id: string
          metrics_breakdown: Json | null
          organization_id: string
          score: number
          status: string
        }
        Insert: {
          calculated_at?: string | null
          category: string
          id?: string
          metrics_breakdown?: Json | null
          organization_id: string
          score: number
          status: string
        }
        Update: {
          calculated_at?: string | null
          category?: string
          id?: string
          metrics_breakdown?: Json | null
          organization_id?: string
          score?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_health_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          agent_id: string | null
          ai_sentiment: string | null
          ai_summary: string | null
          contact_id: string | null
          cost: number | null
          created_at: string | null
          deal_id: string | null
          direction: string
          duration_seconds: number | null
          from_number: string
          id: string
          organization_id: string
          recording_url: string | null
          status: string
          to_number: string
          transcription_text: string | null
        }
        Insert: {
          agent_id?: string | null
          ai_sentiment?: string | null
          ai_summary?: string | null
          contact_id?: string | null
          cost?: number | null
          created_at?: string | null
          deal_id?: string | null
          direction: string
          duration_seconds?: number | null
          from_number: string
          id?: string
          organization_id: string
          recording_url?: string | null
          status: string
          to_number: string
          transcription_text?: string | null
        }
        Update: {
          agent_id?: string | null
          ai_sentiment?: string | null
          ai_summary?: string | null
          contact_id?: string | null
          cost?: number | null
          created_at?: string | null
          deal_id?: string | null
          direction?: string
          duration_seconds?: number | null
          from_number?: string
          id?: string
          organization_id?: string
          recording_url?: string | null
          status?: string
          to_number?: string
          transcription_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_analytics: {
        Row: {
          campaign_id: string
          converted_count: number | null
          delivered_count: number | null
          id: string
          last_updated_at: string | null
          read_count: number | null
          replied_count: number | null
          revenue_generated: number | null
          sent_count: number | null
        }
        Insert: {
          campaign_id: string
          converted_count?: number | null
          delivered_count?: number | null
          id?: string
          last_updated_at?: string | null
          read_count?: number | null
          replied_count?: number | null
          revenue_generated?: number | null
          sent_count?: number | null
        }
        Update: {
          campaign_id?: string
          converted_count?: number | null
          delivered_count?: number | null
          id?: string
          last_updated_at?: string | null
          read_count?: number | null
          replied_count?: number | null
          revenue_generated?: number | null
          sent_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ab_test_config: Json | null
          budget: number | null
          campaign_type: string | null
          channel: string
          company_id: string
          content_template: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expected_roi: number | null
          id: string
          name: string
          objective: string | null
          priority: string | null
          scheduled_at: string | null
          segmentation_filters: Json | null
          segmentation_rules: Json | null
          status: string
          total_cost: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          ab_test_config?: Json | null
          budget?: number | null
          campaign_type?: string | null
          channel: string
          company_id: string
          content_template?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_roi?: number | null
          id?: string
          name: string
          objective?: string | null
          priority?: string | null
          scheduled_at?: string | null
          segmentation_filters?: Json | null
          segmentation_rules?: Json | null
          status?: string
          total_cost?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          ab_test_config?: Json | null
          budget?: number | null
          campaign_type?: string | null
          channel?: string
          company_id?: string
          content_template?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_roi?: number | null
          id?: string
          name?: string
          objective?: string | null
          priority?: string | null
          scheduled_at?: string | null
          segmentation_filters?: Json | null
          segmentation_rules?: Json | null
          status?: string
          total_cost?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      channel_webhooks_log: {
        Row: {
          channel_id: string | null
          error_message: string | null
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          status: string | null
        }
        Insert: {
          channel_id?: string | null
          error_message?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          provider: string
          status?: string | null
        }
        Update: {
          channel_id?: string | null
          error_message?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_webhooks_log_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string | null
          credentials: Json | null
          error_log: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          organization_id: string
          provider: string
          settings: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credentials?: Json | null
          error_log?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          organization_id: string
          provider: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credentials?: Json | null
          error_log?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          organization_id?: string
          provider?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          ai_config: Json | null
          created_at: string | null
          global_kpis: Json | null
          id: string
          limits: Json | null
          name: string
          plan_type: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          ai_config?: Json | null
          created_at?: string | null
          global_kpis?: Json | null
          id?: string
          limits?: Json | null
          name: string
          plan_type?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          ai_config?: Json | null
          created_at?: string | null
          global_kpis?: Json | null
          id?: string
          limits?: Json | null
          name?: string
          plan_type?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_users: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_lead: boolean | null
          lead_score: number | null
          lifecycle_stage: string | null
          metadata: Json | null
          name: string | null
          organization_id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_lead?: boolean | null
          lead_score?: number | null
          lifecycle_stage?: string | null
          metadata?: Json | null
          name?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_lead?: boolean | null
          lead_score?: number | null
          lifecycle_stage?: string | null
          metadata?: Json | null
          name?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_audit: {
        Row: {
          action_type: string
          conversation_id: string
          created_at: string | null
          id: string
          new_state: Json | null
          performed_by: string | null
          previous_state: Json | null
        }
        Insert: {
          action_type: string
          conversation_id: string
          created_at?: string | null
          id?: string
          new_state?: Json | null
          performed_by?: string | null
          previous_state?: Json | null
        }
        Update: {
          action_type?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          new_state?: Json | null
          performed_by?: string | null
          previous_state?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_audit_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_tags: {
        Row: {
          conversation_id: string
          tag_id: string
        }
        Insert: {
          conversation_id: string
          tag_id: string
        }
        Update: {
          conversation_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_tags_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          ai_intent: string | null
          ai_sentiment: string | null
          ai_summary: string | null
          ai_urgency_score: number | null
          channel_id: string
          churn_risk_probability: number | null
          closed_at: string | null
          contact_id: string
          conversion_probability: number | null
          created_at: string | null
          first_response_at: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          organization_id: string
          priority: string | null
          queue_id: string | null
          sla_status: string | null
          status: string | null
          temperature: string | null
          updated_at: string | null
          waiting_since: string | null
        }
        Insert: {
          agent_id?: string | null
          ai_intent?: string | null
          ai_sentiment?: string | null
          ai_summary?: string | null
          ai_urgency_score?: number | null
          channel_id: string
          churn_risk_probability?: number | null
          closed_at?: string | null
          contact_id: string
          conversion_probability?: number | null
          created_at?: string | null
          first_response_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          organization_id: string
          priority?: string | null
          queue_id?: string | null
          sla_status?: string | null
          status?: string | null
          temperature?: string | null
          updated_at?: string | null
          waiting_since?: string | null
        }
        Update: {
          agent_id?: string | null
          ai_intent?: string | null
          ai_sentiment?: string | null
          ai_summary?: string | null
          ai_urgency_score?: number | null
          channel_id?: string
          churn_risk_probability?: number | null
          closed_at?: string | null
          contact_id?: string
          conversion_probability?: number | null
          created_at?: string | null
          first_response_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          organization_id?: string
          priority?: string | null
          queue_id?: string | null
          sla_status?: string | null
          status?: string | null
          temperature?: string | null
          updated_at?: string | null
          waiting_since?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_audit: {
        Row: {
          action_type: string
          created_at: string | null
          deal_id: string
          id: string
          new_state: Json | null
          performed_by: string | null
          previous_state: Json | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          deal_id: string
          id?: string
          new_state?: Json | null
          performed_by?: string | null
          previous_state?: Json | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          deal_id?: string
          id?: string
          new_state?: Json | null
          performed_by?: string | null
          previous_state?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_audit_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_events: {
        Row: {
          campaign_id: string | null
          channel: string
          company_id: string | null
          created_at: string | null
          customer_id: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          campaign_id?: string | null
          channel: string
          company_id?: string | null
          created_at?: string | null
          customer_id: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          campaign_id?: string | null
          channel?: string
          company_id?: string | null
          created_at?: string | null
          customer_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_identities: {
        Row: {
          contact_id: string
          created_at: string | null
          external_id: string
          id: string
          metadata: Json | null
          provider: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          external_id: string
          id?: string
          metadata?: Json | null
          provider: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          external_id?: string
          id?: string
          metadata?: Json | null
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_identities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_scores: {
        Row: {
          churn_risk: string | null
          created_at: string | null
          customer_id: string
          health_score: number | null
          id: string
          last_calculated_at: string | null
          ltv_estimated: number | null
          potential_purchase_score: number | null
        }
        Insert: {
          churn_risk?: string | null
          created_at?: string | null
          customer_id: string
          health_score?: number | null
          id?: string
          last_calculated_at?: string | null
          ltv_estimated?: number | null
          potential_purchase_score?: number | null
        }
        Update: {
          churn_risk?: string | null
          created_at?: string | null
          customer_id?: string
          health_score?: number | null
          id?: string
          last_calculated_at?: string | null
          ltv_estimated?: number | null
          potential_purchase_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_scores_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          closed_at: string | null
          contact_id: string
          created_at: string | null
          expected_close_date: string | null
          id: string
          organization_id: string
          origin_conversation_id: string | null
          pipeline_id: string
          probability: number | null
          responsible_id: string | null
          stage_id: string
          status: string | null
          title: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          closed_at?: string | null
          contact_id: string
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          organization_id: string
          origin_conversation_id?: string | null
          pipeline_id: string
          probability?: number | null
          responsible_id?: string | null
          stage_id: string
          status?: string | null
          title: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          closed_at?: string | null
          contact_id?: string
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          organization_id?: string
          origin_conversation_id?: string | null
          pipeline_id?: string
          probability?: number | null
          responsible_id?: string | null
          stage_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_origin_conversation_id_fkey"
            columns: ["origin_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_insights: {
        Row: {
          created_at: string | null
          description: string
          id: string
          insight_type: string
          is_resolved: boolean | null
          metadata: Json | null
          organization_id: string
          priority: string | null
          suggested_action: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          is_resolved?: boolean | null
          metadata?: Json | null
          organization_id: string
          priority?: string | null
          suggested_action?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          organization_id?: string
          priority?: string | null
          suggested_action?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_notes: {
        Row: {
          author_id: string
          content: string
          conversation_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          author_id: string
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ivr_flows: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          nodes: Json
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nodes?: Json
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nodes?: Json
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ivr_flows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          metadata: Json | null
          organization_id: string
          original_content: string | null
          read_at: string | null
          sender_profile_id: string | null
          type: string | null
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          metadata?: Json | null
          organization_id: string
          original_content?: string | null
          read_at?: string | null
          sender_profile_id?: string | null
          type?: string | null
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          metadata?: Json | null
          organization_id?: string
          original_content?: string | null
          read_at?: string | null
          sender_profile_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      omnichannel_events: {
        Row: {
          created_at: string | null
          customer_id: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pipelines: {
        Row: {
          created_at: string | null
          id: string
          name: string
          organization_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          impersonated_by: string | null
          organization_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          impersonated_by?: string | null
          organization_id?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          impersonated_by?: string | null
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      queues: {
        Row: {
          color: string | null
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          max_capacity: number | null
          metadata: Json | null
          name: string
          priority_level: number | null
          sla_threshold: string | null
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          max_capacity?: number | null
          metadata?: Json | null
          name: string
          priority_level?: number | null
          sla_threshold?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          max_capacity?: number | null
          metadata?: Json | null
          name?: string
          priority_level?: number | null
          sla_threshold?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      routing_rules: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          keyword: string
          priority_bonus: number | null
          target_queue_id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keyword: string
          priority_bonus?: number | null
          target_queue_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keyword?: string
          priority_bonus?: number | null
          target_queue_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routing_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_target_queue_id_fkey"
            columns: ["target_queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string
          organization_id: string
          period: string
          responsible_id: string | null
          target_value: number
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          organization_id: string
          period: string
          responsible_id?: string | null
          target_value: number
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          organization_id?: string
          period?: string
          responsible_id?: string | null
          target_value?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfaction_surveys: {
        Row: {
          agent_id: string | null
          comment: string | null
          company_id: string | null
          conversation_id: string | null
          created_at: string | null
          customer_id: string
          id: string
          metadata: Json | null
          score: number
          type: string
        }
        Insert: {
          agent_id?: string | null
          comment?: string | null
          company_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          metadata?: Json | null
          score: number
          type: string
        }
        Update: {
          agent_id?: string | null
          comment?: string | null
          company_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          metadata?: Json | null
          score?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_surveys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          pipeline_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          pipeline_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          pipeline_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      voice_extensions: {
        Row: {
          agent_id: string | null
          created_at: string | null
          extension_number: string
          id: string
          metadata: Json | null
          organization_id: string
          status: string | null
          updated_at: string | null
          voicemail_enabled: boolean | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          extension_number: string
          id?: string
          metadata?: Json | null
          organization_id: string
          status?: string | null
          updated_at?: string | null
          voicemail_enabled?: boolean | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          extension_number?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          status?: string | null
          updated_at?: string | null
          voicemail_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_extensions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
