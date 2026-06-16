import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
}

export function ReportKpiCard({ label, value, icon: Icon, hint }: Props) {
  return (
    <Card className="bg-white/[0.02] border-white/[0.08]">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-2">
          {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-2xl font-black text-white italic">{value}</p>
        {hint && <p className="text-[10px] text-slate-500 mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}