import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight } from "lucide-react";

interface ActionItemProps {
  type: 'risk' | 'opportunity' | 'bottleneck' | 'kpi';
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionLabel?: string;
  onClick?: () => void;
}

export const ActionItem = ({ type, level, title, description, actionLabel, onClick }: ActionItemProps) => {
  const getLevelColors = () => {
    switch (level) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'medium': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-white/[0.03] text-slate-400 border-white/[0.05]';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border bg-[#030712]/50 hover:bg-[#030712] transition-all group cursor-pointer",
        getLevelColors()
      )}
    >
      <div className="p-2 rounded-lg bg-white/[0.05]">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black uppercase italic tracking-tight text-white mb-0.5">{title}</h4>
        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{description}</p>
        {actionLabel && (
          <div className="flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:translate-x-1 transition-transform">
            {actionLabel} <ChevronRight className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};
