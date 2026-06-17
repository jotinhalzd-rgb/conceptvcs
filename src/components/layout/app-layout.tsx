import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUIStore } from "@/hooks/core/use-ui-store";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { 
  LayoutDashboard, 
  Inbox, 
  Users, 
  Settings, 
  LifeBuoy,
  MessageSquare,
  BarChart3,
  LogOut,
  Zap,
  Globe,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Ticket,
  Rocket,
  CreditCard,
  Sparkles,
  Phone
} from "lucide-react";


import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, useProfile } from "@/hooks/auth/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { isDevEnvironment } from "@/lib/dev-mode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { SoftphoneWidget } from "@/components/voice/softphone-widget";
import { ProfileAwareContainer } from "@/components/mobile/layout/profile-aware-container";
import { CommandCenter } from "./command-center";
import { DeveloperPanel } from "@/components/dev/developer-panel";
import { NotificationsBell } from "@/components/notifications/notifications-bell";

export function AppLayout() {


  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useProfile();
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed, setQuickLaunchOpen } = useUIStore();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isInbox = pathname.startsWith("/inbox");
  const isCampaigns = pathname.startsWith("/campaigns");
  const isCustomers = pathname.startsWith("/customers");
  const isQueues = pathname.startsWith("/queues");
  const isCRM = pathname.startsWith("/crm");
  const isHub = pathname.startsWith("/dashboard/hub");


  const isCEOMaster = profile?.role === 'ceo_master';

  const roleLabel = (role?: string) => {
    switch (role) {
      case 'ceo_master': return 'CEO MASTER';
      case 'ceo': return 'CEO / EMPRESA';
      case 'admin': return 'ADMIN';
      case 'manager': return 'GERENTE';
      case 'supervisor': return 'SUPERVISOR IA';
      case 'agent': return 'ATENDENTE';
      default: return role ? role.toUpperCase() : 'CARREGANDO...';
    }
  };


  const devEnv = isDevEnvironment();

  const navItems = [
    // PRINCIPAL
    { icon: LayoutDashboard, label: "Início", href: "/dashboard", group: "Principal" },
    { icon: Inbox, label: "Inbox", href: "/inbox", group: "Principal" },
    { icon: Users, label: "Clientes", href: "/customers", group: "Principal" },
    { icon: Briefcase, label: "CRM", href: "/crm", group: "Principal" },
    { icon: Globe, label: "Canais", href: "/admin/channels", group: "Principal" },
    { icon: BarChart3, label: "Relatórios", href: "/reports", group: "Principal" },
    { icon: Bell, label: "Notificações", href: "/dashboard/notifications", group: "Principal" },

    // OPERAÇÃO
    { icon: LifeBuoy, label: "Filas", href: "/queues", group: "Operação" },
    { icon: MessageSquare, label: "Oportunidades", href: "/opportunities", group: "Operação" },
    { icon: Rocket, label: "Campanhas", href: "/campaigns", group: "Operação" },
    { icon: ShieldCheck, label: "Supervisor IA", href: "/supervisor", group: "Operação" },
    { icon: Phone, label: "Voz / PBX", href: "/voice", group: "Operação" },

    // ADMINISTRAÇÃO
    ...(isCEOMaster ? [
      { icon: Briefcase, label: "Empresas", href: "/admin/companies", group: "Administração" },
      { icon: ShieldCheck, label: "Auditoria Global", href: "/admin/audit", group: "Administração" },
    ] : []),
    { icon: CreditCard, label: "Billing", href: "/settings/billing", group: "Administração" },

    // AVANÇADO / LABS
    { icon: Sparkles, label: "Insights IA", href: "/dashboard/ai-studio", group: "Avançado" },
    { icon: Zap, label: "Automações", href: "/dashboard/automation", group: "Avançado" },
    { icon: Zap, label: "Knowledge Hub", href: "/knowledge", group: "Avançado" },
    { icon: Globe, label: "Marketplace", href: "/dashboard/hub", group: "Avançado" },
    ...(devEnv ? [
      { icon: Settings, label: "Developer", href: "/settings/developer", group: "Avançado" },
    ] : []),
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      if (import.meta.env.DEV) console.log("Nenhum usuário detectado, redirecionando para /auth");
      navigate({ to: "/auth" });
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) console.warn("Supabase signOut error:", error.message);

      // Limpa override de dev impersonation, se ativo
      try { localStorage.removeItem("onecontact_dev_role"); } catch {}

      // Reload completo garante limpeza de estado em memória e do Query cache
      window.location.href = "/auth";
    } catch (error: any) {
      console.error("Critical error during logout:", error);
      window.location.href = "/auth";
    } finally {
      setLogoutLoading(false);
    }
  };

  const groups = [...new Set(navItems.map(item => item.group))];

  return (
    <GlobalErrorBoundary name="AppLayout">
      <ProfileAwareContainer>
      <div className="flex h-screen bg-[#020817] text-slate-200 overflow-hidden font-sans">

      <CommandCenter />
      <SoftphoneWidget />
      <DeveloperPanel />
      <TooltipProvider delayDuration={0}>

        {/* Sidebar */}
        <aside 
          className={cn(
            "relative border-r border-white/5 bg-[#030712] flex flex-col transition-all duration-500 ease-in-out z-30 shadow-2xl",
            collapsed ? "w-20" : "w-64 lg:w-[280px]"
          )}
        >
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/10 flex-shrink-0">
                <div className="w-full h-full rounded-[10px] bg-[#020617] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>

              {!collapsed && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                  <h1 className="text-lg font-bold tracking-tight text-white leading-none">ONECONTACT</h1>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Enterprise OS</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar py-4">
            {groups.map((group) => (
              <div key={group} className="space-y-2">
                {!collapsed && (
                  <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 animate-in fade-in duration-700">
                    {group}
                  </h3>
                )}
                <div className="space-y-1">
                  {navItems.filter(item => item.group === group).map((item) => (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          activeProps={{
                            className: "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]",
                          }}
                          inactiveProps={{
                            className: "text-slate-400 hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent",
                          }}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2.5 rounded-r-xl text-sm font-semibold transition-all duration-300",
                            collapsed && "justify-center px-0 rounded-xl border-l-0"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", collapsed ? "" : "")} />
                          {!collapsed && <span className="animate-in fade-in slide-in-from-left-1 duration-300">{item.label}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right" className="bg-indigo-600 text-white border-none font-bold">{item.label}</TooltipContent>}
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5 space-y-4 bg-[#030712]/50 backdrop-blur-sm">
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-2xl hover:bg-white/[0.03] transition-all group cursor-pointer relative",
              collapsed && "justify-center"
            )}>
              <Avatar className="h-10 w-10 border-2 border-indigo-500/20 group-hover:border-indigo-500/50 transition-all shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-indigo-600 text-white font-bold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-bold text-white truncate leading-none mb-1">
                      {profile?.full_name || user?.email || "Carregando..."}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                      {roleLabel(profile?.role)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão de Logout Rápido acoplado ao perfil */}
              {!collapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      id="sidebar-quick-logout"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className={cn(
                        "absolute right-2 p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50",
                        logoutLoading && "opacity-100"
                      )}
                    >
                      {logoutLoading ? (
                        <div className="w-4 h-4 border-2 border-rose-400/20 border-t-rose-400 rounded-full animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Sair do Perfil</TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/[0.03] rounded-xl font-semibold",
                      collapsed && "justify-center"
                    )}
                    onClick={() => setCollapsed(!collapsed)}
                  >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    {!collapsed && <span>Recolher Menu</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Expandir Menu</TooltipContent>}
              </Tooltip>

              {collapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                    >
                      {logoutLoading ? (
                        <div className="w-5 h-5 border-2 border-rose-400/20 border-t-rose-400 rounded-full animate-spin" />
                      ) : (
                        <LogOut className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sair do Perfil</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </aside>

        {/* Topbar & Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#020817]">
          {/* Header */}
          {!isInbox && !isCampaigns && !isCustomers && !isQueues && !isCRM && !isHub && (
            <header className="h-16 md:h-20 border-b border-white/[0.05] flex items-center justify-between gap-3 px-4 md:px-6 lg:px-8 bg-[#020817]/80 backdrop-blur-2xl sticky top-0 z-20">
              <div className="flex items-center gap-6 flex-1">
                <div 
                  onClick={() => setQuickLaunchOpen(true)}
                  className="relative max-w-md w-full group hidden md:block cursor-pointer"
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-all duration-300" />
                  <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-500 hover:border-indigo-500/50 hover:bg-white/[0.05] transition-all flex justify-between items-center">
                    <span>Pesquisar em toda a plataforma...</span>
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4 lg:gap-5 shrink-0">
                <div className="flex items-center gap-1">
                  <NotificationsBell />
                  <Link to="/settings/profile" className="rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.05] h-11 w-11 transition-all inline-flex items-center justify-center" aria-label="Configurações">
                    <Settings className="h-5 w-5" />
                  </Link>
                </div>
                <div className="hidden sm:block h-8 w-px bg-white/[0.08] mx-1" />
                <Button 
                  onClick={() => setQuickLaunchOpen(true)}
                  className="h-11 min-w-11 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl px-3 md:px-6 py-2 font-bold shadow-xl shadow-indigo-600/20 gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Rocket className="w-4 h-4" />
                  <span className="hidden md:inline">Quick Launch</span>
                </Button>
              </div>
            </header>
          )}

          {/* Main Content Area */}
          <main className={cn(
            "flex-1 overflow-hidden relative",
            (!isInbox && !isCampaigns && !isCustomers && !isQueues && !isCRM && !isHub) && "p-4 md:p-6 lg:p-8 overflow-y-auto no-scrollbar"
          )}>
            {/* Background Gradient Spotlights */}
            {(!isInbox && !isCampaigns && !isCustomers && !isQueues && !isCRM && !isHub) && (

              <>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full" />
              </>
            )}
            
            <div className={cn(
              "relative z-10 h-full",
              (!isInbox && !isCampaigns && !isCustomers && !isQueues && !isCRM && !isHub) && "max-w-7xl mx-auto"
            )}>
              <GlobalErrorBoundary name="RouteOutlet">
                <Outlet />
              </GlobalErrorBoundary>
            </div>
          </main>
        </div>
      </TooltipProvider>
      </div>
      </ProfileAwareContainer>
    </GlobalErrorBoundary>

  );
}
