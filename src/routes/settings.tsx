import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Settings as SettingsIcon, User, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});

const TABS = [
  { to: "/settings/profile", label: "Perfil", icon: User },
  { to: "/settings/notifications", label: "Notificações", icon: BellRing },
  { to: "/settings/billing", label: "Cobrança", icon: SettingsIcon },
];

function SettingsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <GlobalErrorBoundary name="SettingsLayout">
      <div className="space-y-6 pb-10 animate-in fade-in duration-300">
        <header>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            Configurações
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Gerencie seu perfil, preferências e organização.</p>
        </header>
        <nav className="flex gap-1 border-b border-white/5">
          {TABS.map((t) => {
            const active = pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 -mb-px transition-all",
                  active
                    ? "text-white border-indigo-500"
                    : "text-slate-500 border-transparent hover:text-slate-200",
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </Link>
            );
          })}
        </nav>
        <Outlet />
      </div>
    </GlobalErrorBoundary>
  );
}