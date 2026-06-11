import { supabase } from "@/integrations/supabase/client";

export type EventType = 'sent' | 'opened' | 'clicked' | 'responded' | 'converted' | 'churned' | 'survey_completed';

export interface CustomerEvent {
  id?: string;
  customer_id: string;
  campaign_id?: string;
  event_type: EventType;
  channel: string;
  metadata?: any;
  created_at?: string;
}

export const CDPService = {
  async track(event: Omit<CustomerEvent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('customer_events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCustomerJourney(customerId: string) {
    const { data, error } = await supabase
      .from('customer_events')
      .select(`
        *,
        campaigns (
          name,
          type
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getExecutiveMetrics() {
    const { data, error } = await supabase
      .from('customer_events')
      .select('event_type, channel, created_at');
    
    if (error) throw error;
    return data;
  }
};
