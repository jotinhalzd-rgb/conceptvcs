import React from 'react';
import { useProfile } from "@/hooks/auth/use-auth";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Zap,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const MobileNavigation = ({ activeTab, onChange }: { activeTab: string, onChange: (tab: string) => void }) => {
  const { data: profile } = useProfile();
  const role = profile?.role || 'agent';

  // Configuração de abas por perfil
  const getTabsByRole = () => {
    switch (role) {
      case 'ceo_master':
      case 'ceo':
        return [
          { id: 'dashboard', label: 'Global', icon: LayoutDashboard },
          { id: 'business-ai', label: 'AI Feed', icon: Zap },
          { id: 'billing', label: 'Finance', icon: BarChart3 },
          { id: 'alerts', label: 'Alertas', icon: Bell }
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Empresa', icon: LayoutDashboard },
          { id: 'inbox', label: 'Inbox', icon: MessageSquare },
          { id: 'crm', label: 'CRM', icon: Users },
          { id: 'alerts', label: 'Avisos', icon: Bell }
        ];
      case 'manager':
        return [
          { id: 'dashboard', label: 'Equipe', icon: LayoutDashboard },
          { id: 'inbox', label: 'Operação', icon: MessageSquare },
          { id: 'queues', label: 'Filas', icon: Users },
          { id: 'voice', label: 'Voz', icon: Phone }
        ];
      default: // agent
        return [
          { id: 'inbox', label: 'Inbox', icon: MessageSquare },
          { id: 'crm', label: 'Negócios', icon: Users },
          { id: 'tasks', label: 'Tarefas', icon: LayoutDashboard },
          { id: 'profile', label: 'Eu', icon: Settings }
        ];
    }
  };

  const tabs = getTabsByRole();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#030712]/80 backdrop-blur-xl border-t border-white/5 px-6 flex items-center justify-between z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="flex flex-col items-center gap-1 group relative py-2 px-3"
        >
          <div className={cn(
            "p-2 rounded-xl transition-all duration-300",
            activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 group-hover:text-slate-300"
          )}>
            <tab.icon className="w-5 h-5" />
          </div>
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest transition-colors",
            activeTab === tab.id ? "text-indigo-400" : "text-slate-600"
          )}>
            {tab.label}
          </span>
          
          {activeTab === tab.id && (
            <motion.div 
              layoutId="nav-indicator"
              className="absolute -top-px left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            />
          )}
        </button>
      ))}
    </div>
  );
};
