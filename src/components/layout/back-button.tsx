import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "gap-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-xl",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}