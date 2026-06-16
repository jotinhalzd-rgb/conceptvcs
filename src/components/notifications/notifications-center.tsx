import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Inbox, Loader2, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotificationFilters } from "./notification-filters";
import { NotificationItem } from "./notification-item";
import { NotificationPreferencesPanel } from "./notification-preferences-panel";
import {
  useNotifications,
  useNotificationsList,
  useArchiveNotification,
  useUnarchiveNotification,
  useDeleteNotification,
  type AppNotification,
  type NotificationListFilters,
} from "@/hooks/notifications/use-notifications";
import { useNotificationPreferences } from "@/hooks/notifications/use-notification-preferences";
import { resolveNotificationLink } from "@/lib/notifications/resolve-link";
import { notificationMeta } from "@/lib/notifications/type-map";

export function NotificationsCenter() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<NotificationListFilters>({ status: "all", type: null, period: "30d" });
  const { data: prefs } = useNotificationPreferences();
  const list = useNotificationsList(filters);
  const { markRead, markAllRead, unreadCount } = useNotifications();
  const archive = useArchiveNotification();
  const unarchive = useUnarchiveNotification();
  const remove = useDeleteNotification();

  const items = useMemo(() => {
    const all = list.data ?? [];
    if (!prefs) return all;
    return all.filter((n) => {
      const meta = notificationMeta(n.type);
      return prefs[meta.prefKey] !== false;
    });
  }, [list.data, prefs]);

  const open = (n: AppNotification) => {
    if (!n.read_at) markRead.mutate(n.id);
    const link = resolveNotificationLink(n);
    if (link) navigate({ to: link.to });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Central de notificações</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Tudo em dia"} · filtre, arquive e abra eventos.
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllRead.mutate(undefined, { onSuccess: () => toast.success("Todas marcadas como lidas") })}
          >
            <CheckCheck className="w-4 h-4" /> Marcar todas
          </Button>
        )}
      </header>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="gap-2"><Inbox className="w-4 h-4" /> Notificações</TabsTrigger>
          <TabsTrigger value="prefs" className="gap-2"><SettingsIcon className="w-4 h-4" /> Preferências</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          <NotificationFilters value={filters} onChange={setFilters} />

          {list.isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : list.error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-4 text-sm text-rose-200">
              Falha ao carregar notificações: {(list.error as any)?.message ?? "erro desconhecido"}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-14 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-bold text-white">Nada por aqui</p>
              <p className="text-xs text-slate-500 max-w-[320px]">
                Quando houver eventos correspondentes aos filtros, eles aparecerão nesta lista.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((n) => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  onOpen={open}
                  onMarkRead={(id) => markRead.mutate(id)}
                  onArchive={(id) => archive.mutate(id, { onSuccess: () => toast.success("Arquivada") })}
                  onUnarchive={(id) => unarchive.mutate(id, { onSuccess: () => toast.success("Restaurada") })}
                  onDelete={(id) => remove.mutate(id, { onSuccess: () => toast.success("Excluída") })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prefs" className="mt-4">
          <NotificationPreferencesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}