import { supabase } from "@/integrations/supabase/client";

export interface Campaign {
  id?: string;
  name: string;
  description?: string;
  channel: string;
  type: string;
  objective?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  scheduled_at?: string;
  segmentation_filters?: any;
  content_template?: any;
}

export const CampaignService = {
  async list() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(campaign: Omit<Campaign, 'id'>) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{ ...campaign, created_by: (await supabase.auth.getUser()).data.user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Campaign>) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
