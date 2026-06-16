import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  assetRequiresExternalProvider,
  useInstallAsset,
  useUninstallAsset,
} from "@/hooks/marketplace/use-marketplace";
import { isChannelAsset } from "@/lib/channels/legacy-map";
import { useNavigate } from "@tanstack/react-router";

interface InstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: any | null;
  install?: any | null;
}

export const InstallModal = ({ open, onOpenChange, asset, install }: InstallModalProps) => {
  const installMut = useInstallAsset();
  const uninstallMut = useUninstallAsset();
  const navigate = useNavigate();

  if (!asset) return null;

  const requiresExternal = assetRequiresExternalProvider(asset) || isChannelAsset(asset);
  const isChannel = isChannelAsset(asset);
  const isInstalled = !!install;
  const status = install?.current_install_status;
  const channelId = install?.channel_id;

  const handleInstall = async () => {
    await installMut.mutateAsync(asset);
    onOpenChange(false);
  };

  const handleUninstall = async () => {
    if (!install) return;
    if (!confirm(`Remover ${asset.asset_title}?`)) return;
    await uninstallMut.mutateAsync(install.id);
    onOpenChange(false);
  };

  const handleConfigure = () => {
    if (!channelId) return;
    onOpenChange(false);
    navigate({ to: "/admin/channels", search: { channel: channelId } as any });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#030712] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-tight">{asset.asset_title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {asset.asset_description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Categoria</span>
            <span className="text-slate-300">{asset.asset_category_code}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Tipo</span>
            <span className="text-slate-300">{asset.asset_type_code}</span>
          </div>
          {isInstalled && (
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Status atual</span>
              <span className="text-slate-300">{status}</span>
            </div>
          )}

          {requiresExternal && !isInstalled && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2 text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                Esta integração depende de provedor externo. Será instalada como{" "}
                <b>pending_configuration</b> até as credenciais serem informadas no Developer Center.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isInstalled ? (
            <>
              <Button
                variant="ghost"
                onClick={handleUninstall}
                disabled={uninstallMut.isPending}
                className="text-red-400 hover:text-red-300 gap-2"
              >
                {uninstallMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Remover
              </Button>
              {isChannel && channelId ? (
                <Button
                  onClick={handleConfigure}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Configurar canal
                </Button>
              ) : (
                <Button onClick={() => onOpenChange(false)}>Fechar</Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleInstall}
                disabled={installMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-500 gap-2"
              >
                {installMut.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirmar instalação
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};