import React, { useState, useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavigation } from "./mobile-navigation";
import { useProfile } from "@/hooks/auth/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { InboxView } from "@/components/inbox/inbox-view";
import { CRMView } from "@/components/crm/crm-view";
import { Dashboard } from "@/components/dashboard/dashboard-view";
import { CEODashboard } from "@/components/dashboard/ceo/ceo-dashboard";
import { BillingView } from "@/components/billing/billing-view";
import { MarketplaceView } from "@/components/marketplace/marketplace-view";


export const ProfileAwareContainer = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState('inbox');

  useEffect(() => {
    if (profile?.role) {
      if (profile.role.includes('ceo')) setActiveTab('dashboard');
      else setActiveTab('inbox');
    }
  }, [profile?.role]);

  if (!isMobile) return <>{children}</>;

  // Lógica de renderização de módulos mobile baseada na aba e perfil
  const renderMobileModule = () => {
    switch (activeTab) {
      case 'inbox': return <InboxView />;
      case 'crm': return <CRMView />;
      case 'dashboard': return profile?.role?.includes('ceo') ? <CEODashboard /> : <Dashboard />;
      case 'billing': return <BillingView />;
      case 'business-ai': return <CEODashboard />; // IA Feed é parte da view executiva
      case 'marketplace': return <MarketplaceView />;
      default: return <Dashboard />;
    }
  };


  return (
    <div className="flex flex-col h-screen bg-[#020617] overflow-hidden">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#030712]/60 backdrop-blur-xl shrink-0">
        <h1 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">OneContact OS</h1>
        <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-[10px] font-black text-indigo-400">{profile?.full_name?.charAt(0)}</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            {renderMobileModule()}
          </motion.div>
        </AnimatePresence>
      </main>

      <MobileNavigation activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
};
