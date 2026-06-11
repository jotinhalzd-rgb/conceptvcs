import { Link, Outlet } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Inbox, 
  Users, 
  Settings, 
  LifeBuoy,
  MessageSquare,
  BarChart3,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, useProfile } from "@/hooks/auth/use-auth";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Inbox, label: "Inbox", href: "/inbox" },
  { icon: Users, label: "CRM", href: "/crm" },
  { icon: MessageSquare, label: "Canais", href: "/channels" },
  { icon: BarChart3, label: "Relatórios", href: "/reports" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export function AppLayout() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">ONECONTACT OS</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              activeProps={{
                className: "bg-primary text-primary-foreground",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t mt-auto space-y-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.organizations?.name || "Organização"}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
