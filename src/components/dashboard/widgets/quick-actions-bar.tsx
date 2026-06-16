import { useNavigate } from "@tanstack/react-router";
import { Inbox, MessageSquarePlus, UserPlus, Briefcase, Globe, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  accent: string;
}

export function QuickActionsBar() {
  const navigate = useNavigate();
  const isDevOrPreview = import.meta.env.DEV || import.meta.env.MODE === "preview";

  const allActions: (QuickAction & { devOnly?: boolean })[] = [
    {
      id: "open-inbox",
      title: "Abrir Inbox",
      description: "Veja todas as conversas",
      icon: Inbox,
      onClick: () => navigate({ to: "/inbox" }),
      accent: "from-indigo-500/15 to-indigo-500/0 border-indigo-500/20 text-indigo-300",
    },
    {
      id: "simulate-message",
      title: "Simular mensagem",
      description: "Teste sem canal real",
      icon: MessageSquarePlus,
      onClick: () => {
        toast.info("Abrindo simulador no Inbox...");
        navigate({ to: "/inbox" });
      },
      accent: "from-emerald-500/15 to-emerald-500/0 border-emerald-500/20 text-emerald-300",
      devOnly: true,
    },
    {
      id: "new-customer",
      title: "Criar cliente",
      description: "Cadastre um contato",
      icon: UserPlus,
      onClick: () => navigate({ to: "/customers" }),
      accent: "from-sky-500/15 to-sky-500/0 border-sky-500/20 text-sky-300",
    },
    {
      id: "new-deal",
      title: "Criar oportunidade",
      description: "Adicione um negócio ao CRM",
      icon: Briefcase,
      onClick: () => navigate({ to: "/crm" }),
      accent: "from-amber-500/15 to-amber-500/0 border-amber-500/20 text-amber-300",
    },
    {
      id: "connect-channel",
      title: "Conectar canal",
      description: "WhatsApp, Instagram, e-mail",
      icon: Globe,
      onClick: () => navigate({ to: "/admin/channels" }),
      accent: "from-fuchsia-500/15 to-fuchsia-500/0 border-fuchsia-500/20 text-fuchsia-300",
    },
    {
      id: "view-crm",
      title: "Ver CRM",
      description: "Pipeline de vendas",
      icon: BarChart3,
      onClick: () => navigate({ to: "/crm" }),
      accent: "from-rose-500/15 to-rose-500/0 border-rose-500/20 text-rose-300",
    },
  ];

  const actions = allActions.filter((a) => !a.devOnly || isDevOrPreview);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
        <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
          O que fazer agora
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={a.onClick}
            className={cn(
              "group flex flex-col items-start gap-2 p-4 rounded-2xl bg-gradient-to-b border text-left transition-all",
              "hover:scale-[1.02] hover:border-white/20 active:scale-[0.98]",
              a.accent,
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center">
              <a.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-sm font-bold text-white truncate">{a.title}</div>
              <div className="text-[11px] text-slate-400 truncate">{a.description}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}