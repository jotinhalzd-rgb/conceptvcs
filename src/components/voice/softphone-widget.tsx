import React, { useState } from 'react';
import { useRouterState } from "@tanstack/react-router";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  UserPlus, 
  ArrowRightLeft,
  X,
  Maximize2,
  Minimize2,
  Grid3X3
} from 'lucide-react';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export const SoftphoneWidget = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callTimer, setCallTimer] = useState("00:00");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const toggleCall = () => {
    setIsCalling(!isCalling);
    if (!isCalling) {
      setIsMinimized(false);
    }
  };

  // Não mostrar em telas públicas/auth
  if (pathname.startsWith("/auth") || pathname.startsWith("/login")) return null;

  return (
    <div className={cn(
      "fixed bottom-24 right-6 md:bottom-6 z-40 transition-all duration-500",
      isMinimized ? "w-14 h-14" : "w-72 h-[420px]"
    )}>
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 border-2",
              isCalling ? "bg-rose-500 border-rose-400 animate-pulse" : "bg-indigo-600 border-indigo-400 hover:bg-indigo-500"
            )}
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
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PBX Online • 1001</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* View Port */}
            <div className="flex-1 flex flex-col p-6 items-center justify-center">
              {!isCalling ? (
                <div className="w-full space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Manual Dialer</p>
                    <input 
                      type="text" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0800 000 0000"
                      className="w-full bg-transparent border-none text-2xl font-black text-white text-center focus:outline-none placeholder:text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
                      <button 
                        key={key}
                        onClick={() => setPhoneNumber(prev => prev + key)}
                        className="h-12 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300 font-bold hover:bg-white/[0.08] hover:text-white transition-all active:scale-90"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                    <Avatar className="h-24 w-24 border-4 border-indigo-500/20 p-1 relative z-10">
                      <AvatarFallback className="bg-[#020617] text-white text-2xl font-black">RA</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-white">Roberto Almeida</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+55 11 99999-9999</p>
                    <p className="text-sm font-black text-emerald-400 tabular-nums mt-2">{callTimer}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="ghost" size="icon" className={cn("h-12 w-12 rounded-2xl border border-white/5", isMuted && "bg-rose-500/10 text-rose-500")} onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className={cn("h-12 w-12 rounded-2xl border border-white/5", isOnHold && "bg-amber-500/10 text-amber-500")} onClick={() => setIsOnHold(!isOnHold)}>
                      {isOnHold ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-white/5 text-slate-400">
                      <ArrowRightLeft className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Call Action */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
              <Button 
                onClick={toggleCall}
                className={cn(
                  "w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 gap-3",
                  isCalling 
                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20" 
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                )}
              >
                {isCalling ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                {isCalling ? "Encerrar Chamada" : "Iniciar Chamada"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
