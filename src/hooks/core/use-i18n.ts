import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useI18n = (langCode: string = 'pt-BR') => {
  // 1. Carregar Traduções
  const { data: translations, isLoading: isLoadingTranslations } = useQuery({
    queryKey: ["global-translations", langCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_translations")
        .select("translation_key, translation_value")
        .eq("lang_code", langCode);
      
      if (error) throw error;
      
      // Transformar em dicionário de chaves
      return data.reduce((acc: any, item) => {
        acc[item.translation_key] = item.translation_value;
        return acc;
      }, {});
    },
  });

  // 2. Carregar Configurações de Região (Baseado em código de país ex: BR)
  const getRegionConfig = (countryCode: string) => {
    return useQuery({
      queryKey: ["global-region-config", countryCode],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("global_regions_config")
          .select("*")
          .eq("country_code", countryCode)
          .single();
        
        if (error) throw error;
        return data;
      },
      enabled: !!countryCode,
    });
  };

  // 3. Obter Cotações de Moeda
  const { data: exchangeRates } = useQuery({
    queryKey: ["global-exchange-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_exchange_rates")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Helper para tradução
  const t = (key: string, fallback: string = "") => {
    return translations?.[key] || fallback || key;
  };

  return {
    t,
    translations,
    getRegionConfig,
    exchangeRates,
    isLoading: isLoadingTranslations
  };
};
