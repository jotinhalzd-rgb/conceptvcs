import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUIStore } from "@/hooks/core/use-ui-store";
import { motion, AnimatePresence } from "framer-motion";
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
  Rocket
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, useProfile } from "@/hooks/auth/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", group: "Principal" },
  { icon: Inbox, label: "Inbox", href: "/inbox", group: "Comunicação" },
  { icon: Ticket, label: "Tickets", href: "/tickets", group: "Comunicação" },
  { icon: Users, label: "Clientes", href: "/customers", group: "CRM" },
  { icon: Briefcase, label: "CRM", href: "/crm", group: "CRM" },
  { icon: Zap, label: "Automações", href: "/automations", group: "Inteligência" },
  { icon: MessageSquare, label: "IA Agents", href: "/ia", group: "Inteligência" },
  { icon: Globe, label: "Integrações", href: "/integrations", group: "Ecossistema" },
  { icon: BarChart3, label: "Relatórios", href: "/reports", group: "Análise" },
];

export function AppLayout() {
  const { user, loading } = useAuth();
  const { data: profile } = useProfile();
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const groups = [...new Set(navItems.map(item => item.group))];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <TooltipProvider delayDuration={0}>
        {/* Sidebar */}
        <aside 
          className={cn(
            "relative border-r border-white/5 bg-[#030712] flex flex-col transition-all duration-500 ease-in-out z-30 shadow-2xl",
            collapsed ? "w-[80px]" : "w-[280px]"
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
            <div className={cn("flex items-center gap-3 p-2 rounded-2xl hover:bg-white/[0.03] transition-colors group cursor-pointer", collapsed && "justify-center")}>
              <Avatar className="h-10 w-10 border-2 border-indigo-500/20 group-hover:border-indigo-500/50 transition-all">
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
                    <p className="text-sm font-bold text-white truncate leading-none mb-1">{profile?.full_name || "CEO DEMO"}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">CEO / Founder</p>
                  </motion.div>
                )}
              </AnimatePresence>
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "w-full justify-start gap-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl font-semibold",
                      collapsed && "justify-center"
                    )}
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span>Encerrar Sessão</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right" className="bg-rose-600 text-white">Sair</TooltipContent>}
              </Tooltip>
            </div>
          </div>
        </aside>

        {/* Topbar & Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#020617]">
          {/* Header */}
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-6 flex-1">
              <div className="relative max-w-md w-full group hidden md:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar em toda a plataforma... (Command + K)" 
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020617]" />
              </Button>
              <div className="h-6 w-px bg-white/10 mx-2" />
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 font-bold shadow-lg shadow-indigo-600/20 gap-2">
                <Rocket className="w-4 h-4" />
                <span>Quick Action</span>
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto no-scrollbar relative p-8">
            {/* Background Gradient Spotlights */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full" />
            
            <div className="relative z-10 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
