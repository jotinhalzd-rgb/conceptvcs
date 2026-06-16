import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-16 rounded-3xl",
        "bg-white/[0.02] border border-white/[0.05]",
        className,
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">{description}</p>
      )}
      {children}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {action && (
            <Button
              onClick={action.onClick}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 px-5 h-11"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="rounded-xl text-slate-300 hover:text-white hover:bg-white/5 h-11 px-4"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}