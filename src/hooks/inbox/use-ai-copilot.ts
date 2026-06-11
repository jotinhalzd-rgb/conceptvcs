import { useState, useEffect } from 'react';
import { AIService, AIAnalysisResult } from '@/services/ai/ai-service';

export function useAICopilot(messageContent: string) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!messageContent || messageContent.length < 5) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const result = await AIService.analyzeMessage(messageContent);
        setAnalysis(result);
      } catch (error) {
        console.error('Erro ao analisar mensagem com IA:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000); // Debounce de 1s para evitar chamadas excessivas

    return () => clearTimeout(timer);
  }, [messageContent]);

  return { analysis, isAnalyzing };
}
