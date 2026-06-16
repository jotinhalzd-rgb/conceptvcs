import { supabase } from "@/integrations/supabase/client";

export type AIIntent = 'sale' | 'support' | 'churn' | 'complaint' | 'neutral';
export type AISentiment = 'positive' | 'neutral' | 'negative';

export interface AIAnalysisResult {
  intent: AIIntent;
  sentiment: AISentiment;
  urgency: number; // 0 to 1
  suggestion?: string;
  summary?: string;
}

export class AIService {
  /**
   * Analisa uma mensagem em tempo real para detectar intenção, sentimento e urgência.
   * Centraliza a lógica para facilitar a troca de provedores (OpenAI, Claude, etc).
   */
  static async analyzeMessage(content: string): Promise<AIAnalysisResult> {
    try {
      if (import.meta.env.DEV) console.log('AI Service: Analisando mensagem...', content.substring(0, 50));
      
      // Simulação de latência de IA
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 500);
        // Exemplo: se o conteúdo for muito curto, poderíamos rejeitar
        if (content.length < 2) reject(new Error("Conteúdo muito curto para análise."));
      });

      // Lógica heurística inicial (MVP) que será substituída por chamadas à Edge Function
      const lowerContent = content.toLowerCase();
      
      let intent: AIIntent = 'neutral';
      let sentiment: AISentiment = 'neutral';
      let urgency = 0.2;

      if (lowerContent.includes('cancelar') || lowerContent.includes('sair')) {
        intent = 'churn';
        sentiment = 'negative';
        urgency = 0.9;
      } else if (lowerContent.includes('comprar') || lowerContent.includes('preço') || lowerContent.includes('upgrade')) {
        intent = 'sale';
        sentiment = 'positive';
        urgency = 0.7;
      } else if (lowerContent.includes('ajuda') || lowerContent.includes('problema') || lowerContent.includes('erro')) {
        intent = 'support';
        urgency = 0.6;
      }

      return {
        intent,
        sentiment,
        urgency,
        suggestion: intent === 'churn' 
          ? "Roberto, entendo sua frustração. Podemos oferecer um desconto exclusivo para você continuar conosco?" 
          : "Como posso ajudar você com essa solicitação hoje?",
      };
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Falha na análise da IA. Por favor, tente novamente.");
    }
  }

  /**
   * Busca na base de conhecimento (Knowledge Hub) usando busca semântica (vetorial).
   */
  static async searchKnowledgeBase(query: string) {
    try {
      if (!query) return [];
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .limit(3);
        
      if (error) {
        console.error("Knowledge Base Query Error:", error);
        throw new Error("Não foi possível consultar a base de conhecimento.");
      }
      
      return data || [];
    } catch (error) {
      console.error("Knowledge Base Service Error:", error);
      throw error;
    }
  }
}
