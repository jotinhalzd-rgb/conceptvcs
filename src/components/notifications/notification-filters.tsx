import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NOTIFICATION_TYPE_OPTIONS } from "@/lib/notifications/type-map";
import type { NotificationListFilters, NotificationStatusFilter, NotificationPeriod } from "@/hooks/notifications/use-notifications";

type Props = {
  value: NotificationListFilters;
  onChange: (v: NotificationListFilters) => void;
};

export function NotificationFilters({ value, onChange }: Props) {
  const isDefault = !value.type && (!value.status || value.status === "all") && (!value.period || value.period === "30d");
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={value.status ?? "all"}
        onValueChange={(v) => onChange({ ...value, status: v as NotificationStatusFilter })}
      >
        <SelectTrigger className="h-9 w-[160px] bg-white/[0.02] border-white/10 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="unread">Não lidas</SelectItem>
          <SelectItem value="read">Lidas</SelectItem>
          <SelectItem value="archived">Arquivadas</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.type ?? "__all__"}
        onValueChange={(v) => onChange({ ...value, type: v === "__all__" ? null : v })}
      >
        <SelectTrigger className="h-9 w-[200px] bg-white/[0.02] border-white/10 text-xs">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos os tipos</SelectItem>
          {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.period ?? "30d"}
        onValueChange={(v) => onChange({ ...value, period: v as NotificationPeriod })}
      >
        <SelectTrigger className="h-9 w-[140px] bg-white/[0.02] border-white/10 text-xs">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="24h">Últimas 24h</SelectItem>
          <SelectItem value="7d">Últimos 7 dias</SelectItem>
          <SelectItem value="30d">Últimos 30 dias</SelectItem>
          <SelectItem value="all">Tudo</SelectItem>
        </SelectContent>
      </Select>

      {!isDefault && (
        <Button
          size="sm"
          variant="ghost"
          className="h-9 text-xs gap-1 text-slate-400"
          onClick={() => onChange({ status: "all", type: null, period: "30d" })}
        >
          <X className="w-3 h-3" /> Limpar
        </Button>
      )}
    </div>
  );
}