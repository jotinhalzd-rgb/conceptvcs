import { CEODashboard } from "@/components/dashboard/ceo/ceo-dashboard";
import { CompanyDashboard } from "@/components/dashboard/company/company-dashboard";
import { ManagerDashboard } from "@/components/dashboard/manager/manager-dashboard";
import { AgentDashboard } from "@/components/dashboard/agent/agent-dashboard";
import { useProfile } from "@/hooks/auth/use-auth";

export default function DashboardPage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const role = profile?.role ?? "agent";

  const renderDashboard = () => {
    switch (role) {
      case "ceo_master":
        return <CEODashboard />;
      case "ceo":
      case "admin":
        return <CompanyDashboard />;
      case "manager":
      case "supervisor":
        return <ManagerDashboard />;
      case "agent":
        return <AgentDashboard />;
      default:
        return <AgentDashboard />;
    }
  };

  return <div className="container mx-auto">{renderDashboard()}</div>;
}
