import { useState, useEffect } from 'react';
import { AIService, AIAnalysisResult } from '@/services/ai/ai-service';
import { toast } from "sonner";

export function useAICopilot(messageContent: string) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!messageContent || messageContent.length < 5) {
      setAnalysis(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (!isMounted) return;
      
      setIsAnalyzing(true);
      setError(null);
      
      try {
        const result = await AIService.analyzeMessage(messageContent);
        if (isMounted) {
          setAnalysis(result);
        }
      } catch (err: any) {
        console.error('Erro ao analisar mensagem com IA:', err);
        if (isMounted) {
          setError(err);
          toast.error("IA Copilot: Falha ao analisar o contexto.");
        }
      } finally {
        if (isMounted) {
          setIsAnalyzing(false);
        }
      }
    }, 1000); // Debounce de 1s para evitar chamadas excessivas

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [messageContent]);

  return { analysis, isAnalyzing, error };
}

