import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, X, Check, AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEV_PERSONAS,
  getDevRoleOverride,
  isDevEnvironment,
  setDevRoleOverride,
  type DevRole,
} from "@/lib/dev-mode";
import { useProfile } from "@/hooks/auth/use-auth";
import { SimulatorPanel } from "./simulator-panel";

export function DeveloperPanel() {
  const enabled = isDevEnvironment();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<DevRole | null>(null);
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!enabled) return;
    setActive(getDevRoleOverride());
    const handler = () => setActive(getDevRoleOverride());
    window.addEventListener("onecontact:dev-role-change", handler);
    return () => window.removeEventListener("onecontact:dev-role-change", handler);
  }, [enabled]);

  if (!enabled) return null;

  const apply = (role: DevRole | null) => {
    setDevRoleOverride(role);
    setActive(role);
    // Re-derive any role-gated queries
    queryClient.invalidateQueries();
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider",
          "bg-amber-500/10 text-amber-300 border border-amber-500/30 backdrop-blur-md",
          "hover:bg-amber-500/20 hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/10",
        )}
        title="Developer Tools (apenas em ambiente de desenvolvimento)"
      >
        <Code2 className="w-3.5 h-3.5" />
        <span>Dev Tools</span>
        {active && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-100 text-[10px] normal-case">
            {DEV_PERSONAS.find((p) => p.id === active)?.label}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-20 right-4 z-[100] w-[340px] rounded-2xl border border-amber-500/20 bg-[#0b1220]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-amber-500/5">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Developer Tools</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3 flex items-start gap-2 text-[11px] text-amber-200/80 bg-amber-500/5 border-b border-white/5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>
                Impersonação apenas visual. RLS, Auth e policies continuam ativos no servidor. Indisponível em produção.
              </p>
            </div>

            <div className="p-3 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Trocar Perfil
              </div>
              {DEV_PERSONAS.map((persona) => {
                const isActive = active === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => apply(persona.id)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                      isActive
                        ? "bg-indigo-500/15 border border-indigo-500/30"
                        : "hover:bg-white/5 border border-transparent",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {persona.label}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {persona.description}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}

              <button
                onClick={() => apply(null)}
                disabled={!active}
                className={cn(
                  "mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  active
                    ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20"
                    : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed",
                )}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar perfil real
              </button>
            </div>

            <SimulatorPanel />

            <div className="px-4 py-2 border-t border-white/5 bg-black/20 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Sessão real:</span>
              <span className="font-mono text-slate-400 truncate ml-2 max-w-[180px]">
                {profile?.full_name || "—"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}