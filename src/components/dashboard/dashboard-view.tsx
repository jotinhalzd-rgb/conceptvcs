import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/auth/use-auth";
import { Navigate } from "@tanstack/react-router";

export function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Visão geral do seu sistema.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Conversas Ativas", value: "24", trend: "+12%" },
          { label: "Novos Leads", value: "156", trend: "+5%" },
          { label: "Tempo de Resposta", value: "4m", trend: "-10%" },
          { label: "Tickets Abertos", value: "12", trend: "-2%" },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className={cn(
                "text-xs font-medium pb-1",
                stat.trend.startsWith('+') ? "text-green-500" : "text-red-500"
              )}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* More components like Charts, Recent Activities will go here */}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
