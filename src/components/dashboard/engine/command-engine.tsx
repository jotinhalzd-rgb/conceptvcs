import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('oil_insights_v2')
        .select('insight_type, priority, title, description, metadata')
        .order('created_at', { ascending: false })
        .limit(10);

      if (cancelled) return;
      if (error || !data) {
        setSignals([]);
        setLoading(false);
        return;
      }
      const mapped: CommandSignal[] = data.map((i: any) => ({
        type: (i.insight_type as CommandSignal['type']) || 'kpi',
        level: (i.priority as CommandSignal['level']) || 'medium',
        source: 'company',
        title: i.title || 'Insight',
        description: i.description || '',
        action_label: 'Ver Detalhes',
        metadata: i.metadata || {},
      }));
      setSignals(mapped);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [role]);

  return { signals, loading };
}
