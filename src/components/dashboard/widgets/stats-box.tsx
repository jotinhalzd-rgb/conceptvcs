import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsBoxProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const StatsBox = ({ icon: Icon, label, value, color, trend }: StatsBoxProps) => (
  <div className="flex flex-col p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", color)}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
          trend.positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
        )}>
          {trend.value}
        </div>
      )}
    </div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    <h4 className="text-2xl font-black text-white mt-1.5 tracking-tight">{value}</h4>
  </div>
);
