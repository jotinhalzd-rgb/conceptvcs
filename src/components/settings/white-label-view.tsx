import { useEffect, useState } from "react";
import { Palette, Globe, Save, RotateCcw, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { useWhiteLabelConfig, useUpsertWhiteLabel, domainStatus } from "@/hooks/settings/use-white-label";

const DEFAULTS = {
  platform_name: "OneContact OS",
  logo_url: "",
  favicon_url: "",
  primary_color: "#4f46e5",
  secondary_color: "#0f172a",
  custom_domain: "",
  support_email: "",
  help_center_url: "",
};

export function WhiteLabelView() {
  const { data, isLoading } = useWhiteLabelConfig();
  const upsert = useUpsertWhiteLabel();
  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    if (data) {
      setForm({
        platform_name: data.platform_name ?? DEFAULTS.platform_name,
        logo_url: data.logo_url ?? "",
        favicon_url: data.favicon_url ?? "",
        primary_color: data.primary_color ?? DEFAULTS.primary_color,
        secondary_color: data.secondary_color ?? DEFAULTS.secondary_color,
        custom_domain: data.custom_domain ?? "",
        support_email: data.support_email ?? "",
        help_center_url: data.help_center_url ?? "",
      });
    }
  }, [data]);

  const dStatus = domainStatus(form.custom_domain);

  return (
    <GlobalErrorBoundary name="WhiteLabel">
      <div className="space-y-6 max-w-5xl">
        <header className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-lg font-black text-white uppercase italic tracking-tight">White Label</h2>
            <p className="text-xs text-slate-500">Personalize a aparência e o domínio do produto para sua organização.</p>
          </div>
        </header>

        {isLoading ? (
          <div className="h-64 animate-pulse bg-white/[0.02] rounded-2xl" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4 bg-[#030712] border border-white/5 rounded-2xl p-6">
              <div className="space-y-2">
                <Label>Nome da plataforma</Label>
                <Input value={form.platform_name} onChange={(e) => setForm((f) => ({ ...f, platform_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo (URL)</Label>
                  <Input value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Favicon (URL)</Label>
                  <Input value={form.favicon_url} onChange={(e) => setForm((f) => ({ ...f, favicon_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor primária</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.primary_color} onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))} className="w-12 h-10 rounded-lg border border-white/10 bg-transparent" />
                    <Input value={form.primary_color} onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor secundária</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.secondary_color} onChange={(e) => setForm((f) => ({ ...f, secondary_color: e.target.value }))} className="w-12 h-10 rounded-lg border border-white/10 bg-transparent" />
                    <Input value={form.secondary_color} onChange={(e) => setForm((f) => ({ ...f, secondary_color: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail de suporte</Label>
                  <Input type="email" value={form.support_email} onChange={(e) => setForm((f) => ({ ...f, support_email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>URL central de ajuda</Label>
                  <Input value={form.help_center_url} onChange={(e) => setForm((f) => ({ ...f, help_center_url: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Domínio personalizado</Label>
                  {dStatus === "pending_configuration" && (
                    <Badge variant="outline" className="text-[9px] text-amber-300 border-amber-500/40">pending_configuration</Badge>
                  )}
                </div>
                <Input value={form.custom_domain} onChange={(e) => setForm((f) => ({ ...f, custom_domain: e.target.value }))} placeholder="app.suaempresa.com" />
                {dStatus === "pending_configuration" && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Configure o DNS antes de ativar:</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Tipo CNAME — Nome: {form.custom_domain || "subdominio"} — Valor: app.lovable.app</li>
                        <li>Aguarde propagação (até 24h)</li>
                      </ul>
                      <p className="mt-2 opacity-70">O domínio fica salvo, mas só será ativado após validação manual.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => upsert.mutate(form)} disabled={upsert.isPending} className="gap-2">
                  <Save className="w-4 h-4" /> Salvar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Resetar configuração?</AlertDialogTitle>
                      <AlertDialogDescription>As cores, logo e domínio voltam ao padrão. Esta ação grava imediatamente.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { setForm(DEFAULTS); upsert.mutate(DEFAULTS); }}>Resetar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="bg-[#030712] border border-white/5 rounded-2xl p-6">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Preview</p>
              <div className="rounded-xl overflow-hidden border border-white/10" style={{ background: form.secondary_color }}>
                <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${form.primary_color}33` }}>
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="" className="h-6 w-auto" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                  ) : (
                    <div className="w-6 h-6 rounded" style={{ background: form.primary_color }} />
                  )}
                  <span className="text-sm font-black text-white">{form.platform_name}</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-2 rounded" style={{ background: `${form.primary_color}44`, width: "60%" }} />
                  <div className="h-2 rounded" style={{ background: `${form.primary_color}22`, width: "85%" }} />
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 rounded-lg text-white text-xs font-bold"
                    style={{ background: form.primary_color }}
                  >
                    Botão de exemplo
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-3">Preview local — não altera o tema global enquanto não for publicado.</p>
            </div>
          </div>
        )}
      </div>
    </GlobalErrorBoundary>
  );
}