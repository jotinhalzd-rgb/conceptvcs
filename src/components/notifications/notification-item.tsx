import { Check, ArchiveRestore, Archive, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AppNotification } from "@/hooks/notifications/use-notifications";
import { notificationMeta } from "@/lib/notifications/type-map";
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

type Props = {
  n: AppNotification;
  onMarkRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpen?: (n: AppNotification) => void;
};

export function NotificationItem({ n, onMarkRead, onArchive, onUnarchive, onDelete, onOpen }: Props) {
  const meta = notificationMeta(n.type);
  const Icon = meta.icon;
  const unread = !n.read_at;
  const archived = !!n.archived_at;
  const link = resolveNotificationLink(n);

  return (
    <div
      className={cn(
        "group rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors",
        unread && !archived && "border-indigo-500/30 bg-indigo-500/[0.04]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", meta.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider", meta.color)}>
              {meta.label}
            </Badge>
            {unread && !archived && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">não lida</span>
            )}
            {archived && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">arquivada</span>
            )}
            <span className="text-[10px] text-slate-500 ml-auto">{timeAgo(n.created_at)}</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-1.5">{n.title}</h4>
          {n.message && <p className="text-xs text-slate-400 mt-1 line-clamp-3">{n.message}</p>}

          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {link && onOpen && (
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onOpen(n)}>
                <ExternalLink className="w-3 h-3" /> {link.label}
              </Button>
            )}
            {unread && onMarkRead && (
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onMarkRead(n.id)}>
                <Check className="w-3 h-3" /> Marcar lida
              </Button>
            )}
            {!archived && onArchive && (
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-slate-400" onClick={() => onArchive(n.id)}>
                <Archive className="w-3 h-3" /> Arquivar
              </Button>
            )}
            {archived && onUnarchive && (
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-slate-400" onClick={() => onUnarchive(n.id)}>
                <ArchiveRestore className="w-3 h-3" /> Restaurar
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-rose-300 hover:text-rose-200" onClick={() => onDelete(n.id)}>
                <Trash2 className="w-3 h-3" /> Excluir
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}