import { supabase } from "@/integrations/supabase/client";

export const AuditService = {
  async log(action: string, resourceType: string, resourceId?: string, oldValues?: any, newValues?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user?.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: '0.0.0.0', // Em um ambiente real, pegaríamos o IP real via Edge Function
        user_agent: navigator.userAgent
      }]);
    
    if (error) console.error("Erro ao registrar log de auditoria:", error);
  },

  async list() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles:user_id (
          full_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
