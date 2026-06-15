import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const ROOT_PATHS = new Set(["/", "/auth", "/dashboard", "/dashboard/"]);

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  forceShow?: boolean;
}

export function BackButton({ to, label = "Voltar", className, forceShow }: BackButtonProps) {
  const router = useRouter();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!forceShow && ROOT_PATHS.has(pathname)) return null;

  const handleClick = () => {
    if (to) {
      navigate({ to });
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-3 rounded-xl",
        "bg-slate-900/75 border border-slate-800 text-slate-200",
        "hover:bg-indigo-950 hover:border-indigo-500/40 hover:text-white",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60",
        "text-xs font-bold uppercase tracking-widest",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}