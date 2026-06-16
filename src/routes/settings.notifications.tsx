import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/auth/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings/notifications")({
  component: NotificationsPrefsPage,
});

type Prefs = {
  inbox_messages: boolean;
  sla_alerts: boolean;
  crm_deals: boolean;
  marketing_campaigns: boolean;
  business_ai_insights: boolean;
  system_alerts: boolean;
};

const DEFAULTS: Prefs = {
  inbox_messages: true,
  sla_alerts: true,
  crm_deals: true,
  marketing_campaigns: false,
  business_ai_insights: true,
  system_alerts: true,
};

const ROWS: { key: keyof Prefs; title: string; desc: string }[] = [
  { key: "inbox_messages", title: "Novas conversas", desc: "Alerta quando uma conversa entrar em uma fila ou for atribuida a voce." },
  { key: "sla_alerts", title: "Alertas de SLA", desc: "Conversas em risco ou ja vencidas." },
  { key: "crm_deals", title: "Oportunidades", desc: "Novas oportunidades criadas a partir das suas conversas." },
  { key: "business_ai_insights", title: "Insights de IA", desc: "Sinais e recomendacoes da OneContact AI." },
  { key: "marketing_campaigns", title: "Campanhas", desc: "Resultados e disparos em andamento." },
  { key: "system_alerts", title: "Sistema", desc: "Eventos administrativos e operacionais." },
];

function NotificationsPrefsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          inbox_messages: data.inbox_messages ?? true,
          sla_alerts: data.sla_alerts ?? true,
          crm_deals: data.crm_deals ?? true,
          marketing_campaigns: data.marketing_campaigns ?? false,
          business_ai_insights: data.business_ai_insights ?? true,
          system_alerts: data.system_alerts ?? true,
        });
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const toggle = async (key: keyof Prefs, value: boolean) => {
    if (!user?.id) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    const { error } = await supabase
      .from("user_notification_preferences")
      .upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) {
      setPrefs(prefs);
      toast.error(error.message);
    } else {
      toast.success("Preferencia atualizada");
    }
  };

  if (loading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-3">
      {ROWS.map((row) => (
        <div key={row.key} className="flex items-start justify-between gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div>
            <Label className="text-sm font-bold text-white">{row.title}</Label>
            <p className="text-xs text-slate-500 mt-1 max-w-md">{row.desc}</p>
          </div>
          <Switch checked={prefs[row.key]} onCheckedChange={(v) => toggle(row.key, !!v)} />
        </div>
      ))}
    </div>
  );
}