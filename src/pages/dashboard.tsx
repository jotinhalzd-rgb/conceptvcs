import { CEODashboard } from "@/components/dashboard/ceo/ceo-dashboard";
import { CompanyDashboard } from "@/components/dashboard/company/company-dashboard";
import { ManagerDashboard } from "@/components/dashboard/manager/manager-dashboard";
import { AgentDashboard } from "@/components/dashboard/agent/agent-dashboard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      {/* O componente Dashboard (da dashboard-view.tsx) já lida com a lógica de roles */}
      <CEODashboard /> {/* Exemplo direto para visualização enquanto a rota não é carregada */}
    </div>
  );
}
