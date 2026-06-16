import { Bell, Check, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { resolveNotificationLink } from "@/lib/notifications/resolve-link";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NotificationsBell() {
  const { data, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const items = data ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.05] relative h-11 w-11 transition-all" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#020617]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-[380px] p-0 bg-[#0B1220] border-white/10 text-slate-200"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white">Notificações</p>
            <p className="text-[10px] text-slate-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Tudo em dia"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 hover:text-indigo-200 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> marcar todas
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-center gap-2 px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-white">Nenhuma notificação ainda</p>
            <p className="text-xs text-slate-500 max-w-[260px]">
              Eventos importantes da operação aparecerão aqui.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <ul className="divide-y divide-white/5">
              {items.map((n) => {
                const unread = !n.read_at;
                const link = resolveNotificationLink(n);
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "p-3 flex gap-3 cursor-pointer hover:bg-white/[0.03] transition-colors",
                      unread && "bg-indigo-500/[0.04]",
                    )}
                    onClick={() => {
                      if (unread) markRead.mutate(n.id);
                      if (link) navigate({ to: link.to });
                    }}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      unread ? "bg-indigo-400" : "bg-transparent border border-white/10",
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-500 font-medium shrink-0">{timeAgo(n.created_at)}</span>
                      </div>
                      {n.message && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                    </div>
                    {unread && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead.mutate(n.id); }}
                        className="text-slate-500 hover:text-emerald-400 p-1"
                        aria-label="Marcar como lida"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
        <div className="border-t border-white/5 px-3 py-2 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/dashboard/notifications" })}
            className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 hover:text-indigo-200"
          >
            Ver todas
          </button>
          <span className="text-[10px] text-slate-600">Central de notificações</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}