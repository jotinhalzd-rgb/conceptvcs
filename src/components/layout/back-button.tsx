import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSmartBackNavigation } from "@/hooks/use-smart-back-navigation";

interface SmartBackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  forceShow?: boolean;
}

export function SmartBackButton({ to, label = "Voltar", className, forceShow }: SmartBackButtonProps) {
  const { goBack, shouldShowBackButton } = useSmartBackNavigation({ fallback: to });

  if (!forceShow && !shouldShowBackButton) return null;

  const handleClick = () => {
    goBack(to);
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

export function BackButton(props: SmartBackButtonProps) {
  return <SmartBackButton {...props} />;
}