import { supabase } from "@/integrations/supabase/client";

export interface CopilotInsight {
  type: 'reply' | 'action' | 'risk' | 'opportunity';
  content: string;
  confidence: number;
  metadata?: any;
}

export const CopilotEngine = {
  async getInsights(conversationId: string, lastMessage: string, agentId?: string | null): Promise<CopilotInsight[]> {
    const insights: CopilotInsight[] = [];

    // Se houver um agente selecionado, buscamos o prompt do sistema dele
    let agentPrompt = "";
    if (agentId) {
      const { data: agent } = await supabase
        .from('ai_agents')
        .select('system_prompt, role_type')
        .eq('id', agentId)
        .single();
      
      if (agent) {
        agentPrompt = agent.system_prompt || "";
        console.log(`Usando contexto do agente: ${agent.role_type}`);
      }
    }

    // Simulação de motor de IA baseado no agente
    if (lastMessage.toLowerCase().includes("preço") || lastMessage.toLowerCase().includes("quanto")) {
      insights.push({
        type: 'reply',
        content: agentId ? `[Agente Especialista] Analisando sua solicitação baseada em nossa política de preços atual...` : "Olá! Nossos planos corporativos começam em R$ 499/mês.",
        confidence: 0.95
      });
    }

    // Ações variam por agente
    if (agentId) {
      insights.push({
        type: 'action',
        content: `Ação sugerida pelo Especialista Digital: Criar tarefa de acompanhamento`,
        confidence: 1.0,
        metadata: { action: 'create_task' }
      });
    }

    return insights;
  },

  async logSuggestion(conversationId: string, type: string, content: string, status: 'applied' | 'rejected') {
    const { error } = await supabase
      .from('ai_suggestions_log')
      .insert({
        conversation_id: conversationId,
        suggestion_type: type,
        content: content,
        status: status
      });
    
    if (error) console.error("Erro ao logar sugestão da IA:", error);
  }
};
