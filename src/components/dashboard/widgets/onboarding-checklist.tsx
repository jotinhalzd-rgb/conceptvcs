import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  to: string;
}

const ITEMS: ChecklistItem[] = [
  { id: "company", title: "Configurar empresa", to: "/settings/billing" },
  { id: "channel", title: "Conectar canal ou usar simulador", to: "/admin/channels" },
  { id: "queue", title: "Criar fila de atendimento", to: "/queues" },
  { id: "customer", title: "Cadastrar primeiro cliente", to: "/customers" },
  { id: "message", title: "Simular primeira mensagem", to: "/inbox" },
  { id: "deal", title: "Criar primeira oportunidade", to: "/crm" },
  { id: "invite", title: "Convidar equipe", to: "/admin/companies" },
];

const STORAGE_KEY = "onecontact_onboarding";

function loadState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setDone(loadState());
  }, []);

  const progress = useMemo(() => {
    const completed = ITEMS.filter((i) => done[i.id]).length;
    return { completed, total: ITEMS.length, pct: Math.round((completed / ITEMS.length) * 100) };
  }, [done]);

  useEffect(() => {
    if (progress.completed === progress.total) setCollapsed(true);
  }, [progress.completed, progress.total]);

  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  if (progress.completed === progress.total && collapsed) {
    return (
      <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-emerald-300">Onboarding completo. Bom trabalho!</span>
      </div>
    );
  }

  return (
    <section className="mb-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 overflow-hidden">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Rocket className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-sm font-bold text-white">Primeiros passos</h3>
            <p className="text-[11px] text-slate-400">
              {progress.completed} de {progress.total} concluídos · {progress.pct}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>
      {!collapsed && (
        <div className="p-3 pt-0 grid gap-1">
          {ITEMS.map((item) => {
            const checked = !!done[item.id];
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="shrink-0"
                  aria-label={checked ? "Marcar como pendente" : "Marcar como concluído"}
                >
                  {checked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400 transition-colors" />
                  )}
                </button>
                <button
                  onClick={() => navigate({ to: item.to as any })}
                  className={cn(
                    "flex-1 text-left text-sm font-semibold transition-colors",
                    checked ? "text-slate-500 line-through" : "text-white hover:text-indigo-300",
                  )}
                >
                  {item.title}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}