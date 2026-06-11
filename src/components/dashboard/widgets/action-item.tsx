import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItemProps {
  label: string;
  description: string;
  urgency: 'high' | 'medium';
}

export const ActionItem = ({ label, description, urgency }: ActionItemProps) => (
  <div className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-pointer">
    <div className={cn(
      "p-2 rounded-lg transition-transform group-hover:scale-110", 
      urgency === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
    )}>
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-white truncate">{label}</h4>
      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{description}</p>
    </div>
  </div>
);
