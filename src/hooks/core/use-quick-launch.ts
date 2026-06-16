import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  MessageSquare, 
  Briefcase, 
  Ticket, 
  LayoutDashboard, 
  Settings, 
  PlusCircle, 
  Search,
  Zap,
  Sparkles,
  UserPlus,
  BarChart3,
  CreditCard,
  Building2,
  ListTodo,
  Users2
} from "lucide-react";

export function useQuickLaunch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentActions, setRecentActions] = useState<any[]>([]);

  // Carregar ações recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("onecontact_recent_actions");
    if (saved) {
      setRecentActions(JSON.parse(saved));
    }
  }, []);

  const trackAction = useCallback((action: any) => {
    setRecentActions(prev => {
      const filtered = prev.filter(a => a.id !== action.id);
      const updated = [action, ...filtered].slice(0, 5);
      localStorage.setItem("onecontact_recent_actions", JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchPromises = [
          // Buscar Contatos
          supabase
            .from("contacts")
            .select("id, name, email")
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(3),
          
          // Buscar Conversas
          supabase
            .from("conversations")
            .select("id, status, contacts(name)")
            .limit(3),

          // Buscar Deals (Oportunidades)
          supabase
            .from("deals")
            .select("id, title, value")
            .ilike("title", `%${query}%`)
            .limit(3)
        ];

        const [contactsRes, conversationsRes, dealsRes] = await Promise.all(searchPromises);

        const formattedResults: any[] = [];

        if (contactsRes.data?.length) {
          formattedResults.push({
            category: "CLIENTES",
            items: contactsRes.data.map((c: any) => ({
              id: `contact-${c.id}`,
              title: c.name || "Sem nome",
              subtitle: c.email || "Sem e-mail",
              icon: Users,
              action: () => {
                navigate({ to: "/customers", search: { contactId: c.id } as any });
                trackAction({ id: `contact-${c.id}`, title: c.name, icon: "Users", type: "contact" });
              }
            }))
          });
        }

        if (conversationsRes.data?.length) {
          formattedResults.push({
            category: "CONVERSAS",
            items: conversationsRes.data.map((c: any) => ({
              id: `conv-${c.id}`,
              title: c.contacts?.name || "Conversa sem nome",
              subtitle: `Status: ${c.status}`,
              icon: MessageSquare,
              action: () => {
                navigate({ to: "/inbox", search: { conversationId: c.id } as any });
                trackAction({ id: `conv-${c.id}`, title: c.contacts?.name || "Conversa", icon: "MessageSquare", type: "conversation" });
              }
            }))
          });
        }

        if (dealsRes.data?.length) {
          formattedResults.push({
            category: "CRM",
            items: dealsRes.data.map((d: any) => ({
              id: `deal-${d.id}`,
              title: d.title || "Sem título",
              subtitle: d.value ? `R$ ${d.value.toLocaleString()}` : "Sem valor",
              icon: Briefcase,
              action: () => {
                navigate({ to: `/crm` });
                trackAction({ id: `deal-${d.id}`, title: d.title, icon: "Briefcase", type: "deal" });
              }
            }))
          });
        }

        setResults(formattedResults);
      } catch (error) {
        console.error("Quick Launch Search Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, navigate, trackAction]);

  const quickActions = [
    {
      category: "CRM",
      items: [
        { id: "new-lead", title: "Novo Lead", icon: UserPlus, action: () => navigate({ to: "/crm" }) },
        { id: "new-deal", title: "Nova Oportunidade", icon: Briefcase, action: () => navigate({ to: "/crm" }) },
        { id: "new-task", title: "Nova Tarefa", icon: ListTodo, action: () => navigate({ to: "/crm" }) }
      ]
    },
    {
      category: "INBOX",
      items: [
        { id: "new-conv", title: "Nova Conversa", icon: MessageSquare, action: () => navigate({ to: "/inbox" }) },
        { id: "inbox-open", title: "Abrir Inbox", icon: MessageSquare, action: () => navigate({ to: "/inbox" }) }
      ]
    },
    {
      category: "ADMINISTRAÇÃO",
      items: [
        { id: "billing", title: "Faturamento", icon: CreditCard, action: () => navigate({ to: "/settings/billing" }) }
      ]
    },
    {
      category: "INTELIGÊNCIA IA",
      items: [
        { id: "ai-studio", title: "AI Studio", icon: Sparkles, action: () => navigate({ to: "/dashboard/ai-studio" }) },
        { id: "ai-reports", title: "Gerar Relatório IA", icon: BarChart3, action: () => navigate({ to: "/reports" }) }
      ]
    }
  ];

  const navigationCommands = [
    { title: "Dashboard", action: () => navigate({ to: "/dashboard" }), icon: LayoutDashboard },
    { title: "Inbox", action: () => navigate({ to: "/inbox" }), icon: MessageSquare },
    { title: "CRM", action: () => navigate({ to: "/crm" }), icon: Briefcase },
    { title: "Clientes", action: () => navigate({ to: "/customers" }), icon: Users2 },
    { title: "Empresas", action: () => navigate({ to: "/admin/companies" }), icon: Building2 },
  ];

  return {
    query,
    setQuery,
    results,
    isLoading,
    quickActions,
    navigationCommands,
    recentActions
  };
}
