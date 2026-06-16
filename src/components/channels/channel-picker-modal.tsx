import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Camera, MessageCircle, Mail, Globe, Phone, ChevronRight } from "lucide-react";
import {
  CHANNEL_TYPE_LABEL,
  PROVIDERS,
  providersByType,
  type ChannelType,
  type ProviderDef,
} from "@/lib/channels/providers";
import { ChannelConfigDrawer } from "./channel-config-drawer";

interface ChannelPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_ICON: Record<ChannelType, React.ComponentType<{ className?: string }>> = {
  whatsapp: MessageSquare,
  instagram: Camera,
  facebook: MessageCircle,
  email: Mail,
  webchat: Globe,
  voice: Phone,
};

const TYPES: ChannelType[] = ["whatsapp", "instagram", "facebook", "email", "webchat", "voice"];

export function ChannelPickerModal({ open, onOpenChange }: ChannelPickerModalProps) {
  const [selectedType, setSelectedType] = useState<ChannelType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderDef | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const reset = () => {
    setSelectedType(null);
    setSelectedProvider(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) reset();
          onOpenChange(o);
        }}
      >
        <DialogContent className="bg-[#020817] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight italic">
              {selectedType ? `Escolher provedor de ${CHANNEL_TYPE_LABEL[selectedType]}` : "Conectar novo canal"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[11px]">
              {selectedType
                ? "Escolha o provedor para configurar credenciais e roteamento."
                : "Escolha o tipo de canal que deseja conectar."}
            </DialogDescription>
          </DialogHeader>

          {!selectedType && (
            <div className="grid grid-cols-2 gap-3 pt-4">
              {TYPES.map((type) => {
                const Icon = TYPE_ICON[type];
                const count = providersByType(type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{CHANNEL_TYPE_LABEL[type]}</p>
                      <p className="text-[10px] text-slate-500">
                        {count} provedor{count === 1 ? "" : "es"} disponíve{count === 1 ? "l" : "is"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                );
              })}
            </div>
          )}

          {selectedType && (
            <div className="space-y-2 pt-4 max-h-[60vh] overflow-y-auto">
              {providersByType(selectedType).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProvider(p);
                    setDrawerOpen(true);
                    onOpenChange(false);
                  }}
                  className="w-full flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{p.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.description}</p>
                    {p.externalDependency && (
                      <p className="text-[10px] text-amber-400/80 mt-1">
                        {p.externalDependency}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 mt-1" />
                </button>
              ))}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedType(null)}
                  className="text-slate-400 text-[11px]"
                >
                  ← Voltar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedProvider && (
        <ChannelConfigDrawer
          open={drawerOpen}
          onOpenChange={(o) => {
            setDrawerOpen(o);
            if (!o) {
              setSelectedProvider(null);
              setSelectedType(null);
            }
          }}
          providerId={selectedProvider.id}
        />
      )}
    </>
  );
}

// re-export to keep existing imports working
export { PROVIDERS };