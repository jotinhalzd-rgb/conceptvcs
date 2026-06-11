import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select(`
          *,
          stages(*)
        `)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}
