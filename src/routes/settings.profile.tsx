import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth, useProfile } from "@/hooks/auth/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile?.full_name]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome completo</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white/[0.03] border-white/10 text-white" />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">E-mail</Label>
        <Input value={user?.email ?? ""} readOnly className="bg-white/[0.02] border-white/5 text-slate-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Função</Label>
          <Input value={profile?.role ?? ""} readOnly className="bg-white/[0.02] border-white/5 text-slate-400 uppercase" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Organização</Label>
          <Input value={profile?.organization_id ?? ""} readOnly className="bg-white/[0.02] border-white/5 text-slate-400 text-xs" />
        </div>
      </div>
      <Button onClick={save} disabled={saving || !fullName.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-11 rounded-xl gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar alterações
      </Button>
    </div>
  );
}