"use client";

import { useAuth, useProfile } from "@/hooks/auth/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Navigate } from "@tanstack/react-router";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { CEODashboard } from "./ceo/ceo-dashboard";
import { CompanyDashboard } from "./company/company-dashboard";
import { ManagerDashboard } from "./manager/manager-dashboard";
import { AgentDashboard } from "./agent/agent-dashboard";
import { 
  LayoutDashboard,
  Rocket
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function Dashboard() {
  return (
    <GlobalErrorBoundary name="Dashboard">
      <DashboardContent />
    </GlobalErrorBoundary>
  );
}

function DashboardContent() {
  const { user, loading } = useAuth();
  const { data: profile } = useProfile();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  const role = profile?.role || 'agent';
  const isCEOMaster = role === 'ceo_master' || role === 'ceo';
  const isCompanyAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isAgent = role === 'agent';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
              {isCEOMaster ? "Célula de Governança Global" : 
               isCompanyAdmin ? "Centro de Comando Operacional" :
               isManager ? "Supervisão de Equipes" : "Terminal de Produtividade"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight uppercase italic">
            {isCEOMaster ? "Master View" : 
             isCompanyAdmin ? "Company Control" :
             isManager ? "Team Hub" : "My Workspace"}
          </h1>
          <p className="text-slate-400 font-medium max-w-xl">
            Olá, {profile?.full_name || "Operador"}. {isCEOMaster ? "Business AI detectou 2 novas oportunidades de receita nas últimas 12h." : "Sincronização omnichannel ativa em 4 canais simultâneos."}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center gap-2.5 backdrop-blur-md shadow-lg shadow-indigo-500/5">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black text-indigo-100 uppercase tracking-wider">Centro de Comando 1.0</span>
          </div>
          <Button className="h-11 bg-white text-[#020617] hover:bg-slate-200 rounded-2xl shadow-xl font-black px-8 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase text-[11px] tracking-widest">
            Relatório BI
          </Button>
        </div>
      </header>

      {/* Renderização Condicional do Painel Específico */}
      {isCEOMaster && <CEODashboard />}
      {isCompanyAdmin && <CompanyDashboard />}
      {isManager && <ManagerDashboard />}
      {isAgent && <AgentDashboard />}
    </motion.div>
  );
}
