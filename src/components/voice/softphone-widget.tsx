import React, { useState } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import { Phone, Minimize2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceProviderStatus } from "@/hooks/voice/use-voice";
import { toast } from "sonner";

const E164_RE = /^\+?[1-9]\d{7,14}$/;

export const SoftphoneWidget = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: provider } = useVoiceProviderStatus();

  if (pathname.startsWith("/auth") || pathname.startsWith("/login")) return null;

  const validate = () => {
    const clean = phoneNumber.replace(/\s/g, "");
    if (!E164_RE.test(clean)) {
      toast.error("Número inválido. Use formato E.164 (ex: +5511999999999).");
      return;
    }
    if (!provider?.configured) {
      toast.message("Configuração pendente", {
        description: "Número válido, mas o provider de voz ainda não foi configurado.",
      });
      return;
    }
    toast.success("Configuração válida.");
  };

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 md:bottom-6 z-40 transition-all duration-500",
        isMinimized ? "w-14 h-14" : "w-72 h-[360px]",
      )}
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 border-2 bg-indigo-600 border-indigo-400 hover:bg-indigo-500"
            aria-label="Abrir softphone"
          >
            <Phone className="w-6 h-6 text-white" />
          </motion.button>
        ) : (
          <motion.div
            key="maximized"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full h-full bg-[#030712] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", provider?.configured ? "bg-emerald-500" : "bg-amber-500")} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {provider?.configured ? "Softphone Pronto" : "Configuração Pendente"}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col p-6 gap-4">
              {!provider?.configured && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Provider de voz não configurado. Configure em{" "}
                    <Link to="/admin/channels" className="underline font-bold">Canais</Link> para discar.
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Discador manual</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-lg font-bold text-white text-center focus:outline-none focus:border-indigo-500 placeholder:text-slate-700"
                />
              </div>

              <Button onClick={validate} className="mt-auto h-12 rounded-xl font-black uppercase tracking-widest">
                Validar configuração
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
