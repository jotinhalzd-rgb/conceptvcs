import { supabase } from "@/integrations/supabase/client";

export interface CopilotInsight {
  type: 'reply' | 'action' | 'risk' | 'opportunity';
  content: string;
  confidence: number;
  metadata?: any;
}

export const CopilotEngine = {
  async getInsights(conversationId: string, lastMessage: string): Promise<CopilotInsight[]> {
    // Simulação de motor de IA enquanto o Gateway real é configurado
    // Em produção, isso chamaria uma Edge Function que usa OpenAI/Anthropic
    
    const insights: CopilotInsight[] = [];

    // 1. Detecção de Intenção / Sugestão de Resposta
    if (lastMessage.toLowerCase().includes("preço") || lastMessage.toLowerCase().includes("quanto")) {
      insights.push({
        type: 'reply',
        content: "Olá! Nossos planos corporativos começam em R$ 499/mês. Gostaria de uma demonstração personalizada das funcionalidades premium?",
        confidence: 0.95
      });
      insights.push({
        type: 'opportunity',
        content: "Potencial Lead Qualificado: O cliente demonstrou interesse em precificação.",
        confidence: 0.8
      });
    }

    if (lastMessage.toLowerCase().includes("cancelar") || lastMessage.toLowerCase().includes("sair")) {
      insights.push({
        type: 'risk',
        content: "ALERTA DE CHURN: O cliente mencionou cancelamento. Recomenda-se oferecer upgrade gratuito por 30 dias para retenção.",
        confidence: 0.98
      });
      insights.push({
        type: 'reply',
        content: "Sinto muito que esteja pensando em nos deixar. Antes de prosseguirmos, eu adoraria entender o que houve e como posso tornar sua experiência melhor.",
        confidence: 0.9
      });
    }

    // 2. Ação recomendada baseada no contexto
    insights.push({
      type: 'action',
      content: "Atualizar Status: Mover para 'Aguardando Operador'",
      confidence: 1.0,
      metadata: { action: 'status_change', target: 'active' }
    });

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
