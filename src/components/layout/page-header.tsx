import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BackButton } from "./back-button";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backTo?: string;
  showBackButton?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  backTo,
  showBackButton = true,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {showBackButton && (
        <div className="flex items-center">
          <BackButton to={backTo} />
        </div>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1 min-w-0">
          {eyebrow && (
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight uppercase italic">
            {title}
          </h1>
          {description && (
            <p className="text-slate-400 font-medium text-sm">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}