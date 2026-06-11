import { useState, useEffect } from 'react';

export interface CommandSignal {
  type: 'risk' | 'opportunity' | 'bottleneck' | 'kpi';
  level: 'low' | 'medium' | 'high' | 'critical';
  source: 'queue' | 'customer' | 'agent' | 'company';
  title: string;
  description: string;
  action_label: string;
  metadata: Record<string, any>;
}

export function useCommandEngine(role: string) {
  const [signals, setSignals] = useState<CommandSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação da Engine de Comando baseada no Perfil
    const generateMockSignals = () => {
      const mockSignals: CommandSignal[] = [];

      if (role === 'ceo_master' || role === 'ceo') {
        mockSignals.push({
          type: 'risk',
          level: 'high',
          source: 'company',
          title: 'Empresa X - Inatividade Crítica',
          description: 'Nenhuma interação detectada nos últimos 15 dias. Churn risk em 85%.',
          action_label: 'Contatar Gestor',
          metadata: { company_id: '123' }
        });
        mockSignals.push({
          type: 'opportunity',
          level: 'medium',
          source: 'company',
          title: 'Empresa Y - Upgrade Potencial',
          description: 'Atingiu 95% do limite de mensagens do plano Pro.',
          action_label: 'Enviar Proposta',
          metadata: { company_id: '456' }
        });
      }

      if (role === 'admin' || role === 'manager') {
        mockSignals.push({
          type: 'bottleneck',
          level: 'critical',
          source: 'queue',
          title: 'Fila de Suporte Congestionada',
          description: '80% de ocupação. TMR médio subiu para 12 min.',
          action_label: 'Intervir na Fila',
          metadata: { queue_id: '789' }
        });
        mockSignals.push({
          type: 'opportunity',
          level: 'high',
          source: 'customer',
          title: 'Cliente VIP Aguardando',
          description: 'Eduardo Rocha iniciou conversa há 5 min. Prioridade máxima.',
          action_label: 'Assumir Atendimento',
          metadata: { customer_id: '000' }
        });
      }

      setSignals(mockSignals);
      setLoading(false);
    };

    const timer = setTimeout(generateMockSignals, 500);
    return () => clearTimeout(timer);
  }, [role]);

  return { signals, loading };
}
