import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Workflow, History } from "lucide-react";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { SmartBackButton } from "@/components/layout/back-button";
import { PbxManagement } from "@/components/voice/pbx-management";
import { IvrBuilder } from "@/components/voice/ivr-builder";
import { CallLogList } from "@/components/voice/call-log-list";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/voice")({
  component: VoicePage,
});

const TABS = [
  { id: "pbx", label: "PBX", icon: Phone },
  { id: "ivr", label: "IVR", icon: Workflow },
  { id: "logs", label: "Histórico", icon: History },
] as const;

function VoicePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pbx");
  return (
    <GlobalErrorBoundary name="Voice">
      <div className="space-y-6 pb-10">
        <header className="flex items-center gap-4">
          <SmartBackButton />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
              <Phone className="w-6 h-6 text-indigo-400" /> Voz / PBX
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Ramais, fluxos IVR e histórico de chamadas.</p>
          </div>
        </header>
        <nav className="flex gap-1 border-b border-white/5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 -mb-px transition-all",
                tab === t.id ? "text-white border-indigo-500" : "text-slate-500 border-transparent hover:text-slate-200",
              )}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </nav>
        {tab === "pbx" && <PbxManagement />}
        {tab === "ivr" && <IvrBuilder />}
        {tab === "logs" && <CallLogList />}
      </div>
    </GlobalErrorBoundary>
  );
}