import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // 1. Total Faturamento (deals em estágios de "ganho")
      const { data: wonStages } = await supabase
        .from("stages")
        .select("id")
        .or("name.ilike.%ganho%,name.ilike.%won%,name.ilike.%fechado%");

      const wonStageIds = (wonStages ?? []).map((s) => s.id);

      let revenueQuery = supabase.from("deals").select("value,status");
      if (wonStageIds.length > 0) {
        revenueQuery = revenueQuery.or(
          `stage_id.in.(${wonStageIds.join(",")}),status.eq.won`
        );
      } else {
        revenueQuery = revenueQuery.eq("status", "won");
      }
      const { data: dealsData } = await revenueQuery;

      const totalRevenue =
        dealsData?.reduce((acc, d) => acc + Number(d.value || 0), 0) || 0;
      const wonDealsCount = dealsData?.length || 0;

      // 2. Empresas Ativas
      const { count: companiesCount, error: companiesError } = await supabase
        .from("organizations")
        .select("*", { count: 'exact', head: true });

      // 3. Mensagens Processadas
      const { count: messagesCount, error: messagesError } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true });

      // 4. Contatos (Clientes)
      const { count: contactsCount, error: contactsError } = await supabase
        .from("contacts")
        .select("*", { count: 'exact', head: true });

      return {
        totalRevenue,
        wonDealsCount,
        companiesCount: companiesCount || 0,
        messagesCount: messagesCount || 0,
        contactsCount: contactsCount || 0,
      };
    },
  });
}
