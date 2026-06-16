import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/notifications/use-notification-preferences";
import { PREF_ROWS } from "@/lib/notifications/type-map";

export function NotificationPreferencesPanel() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  if (isLoading || !prefs) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const save = (patch: Partial<typeof prefs>) => {
    update.mutate(patch, {
      onSuccess: () => toast.success("Preferência atualizada"),
      onError: (e: any) => toast.error(e?.message ?? "Falha ao salvar"),
    });
  };

  return (
    <div className="space-y-3">
      {PREF_ROWS.map((row) => (
        <div key={row.key} className="flex items-start justify-between gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div>
            <Label className="text-sm font-bold text-white">{row.title}</Label>
            <p className="text-xs text-slate-500 mt-1 max-w-md">{row.desc}</p>
          </div>
          <Switch
            checked={!!prefs[row.key]}
            onCheckedChange={(v) => save({ [row.key]: !!v } as any)}
          />
        </div>
      ))}

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <Label className="text-sm font-bold text-white">Horário silencioso</Label>
        <p className="text-xs text-slate-500 mt-1 mb-3">
          Janela em que notificações no app não interromperão (futuro: silenciar push/email).
        </p>
        <div className="flex items-center gap-3">
          <Input
            type="time"
            className="h-9 w-32 bg-white/[0.02] border-white/10 text-xs"
            value={prefs.quiet_hours_start ?? ""}
            onChange={(e) => save({ quiet_hours_start: e.target.value || null })}
          />
          <span className="text-xs text-slate-500">até</span>
          <Input
            type="time"
            className="h-9 w-32 bg-white/[0.02] border-white/10 text-xs"
            value={prefs.quiet_hours_end ?? ""}
            onChange={(e) => save({ quiet_hours_end: e.target.value || null })}
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-500 px-1">
        Preferências são aplicadas no painel e no sino. A integração com push/email depende de provedor configurado.
      </p>
    </div>
  );
}