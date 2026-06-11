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
  company_id: string;
}

export const CampaignService = {
  async list() {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error listing campaigns:", error);
      throw error;
    }
  },

  async create(campaign: Omit<Campaign, 'id'>) {
    try {
      // Validações básicas
      if (!campaign.name) throw new Error("O nome da campanha é obrigatório.");
      if (!campaign.channel) throw new Error("O canal de disparo deve ser selecionado.");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada. Por favor, faça login novamente.");

      const { data, error } = await supabase
        .from('campaigns')
        .insert([{ 
          ...campaign, 
          created_by: user?.id,
          company_id: campaign.company_id || '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      throw new Error(error.message || "Falha ao criar campanha. Tente novamente.");
    }
  },

  async update(id: string, updates: Partial<Campaign>) {
    try {
      if (!id) throw new Error("ID da campanha não fornecido.");

      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error(`Error updating campaign ${id}:`, error);
      throw new Error(error.message || "Erro ao atualizar dados. Verifique sua conexão.");
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
