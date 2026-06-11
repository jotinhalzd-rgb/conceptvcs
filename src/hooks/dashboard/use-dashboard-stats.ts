import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // 1. Total Faturamento (Closed Won Deals)
      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("value")
        .eq("stage_id", "20377b37-cc23-4c7d-b96e-f56532721a2a");
      
      const totalRevenue = dealsData?.reduce((acc, deal) => acc + Number(deal.value || 0), 0) || 0;

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
        companiesCount: companiesCount || 0,
        messagesCount: messagesCount || 0,
        contactsCount: contactsCount || 0,
        uptime: "99.99%", // Hardcoded for now but conceptually dynamic
        sla: "98.5%" // Hardcoded for now but conceptually dynamic
      };
    },
  });
}
