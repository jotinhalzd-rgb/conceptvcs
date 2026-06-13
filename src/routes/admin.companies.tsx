import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/auth/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/companies")({ component: AdminCompaniesPage });

function AdminCompaniesPage() {
  const { data: profile } = useProfile();
  const isCEO = profile?.role === "ceo_master" || profile?.role === "ceo";

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "organizations"],
    enabled: !!isCEO,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, slug, created_at, settings")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!isCEO) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/[0.02] border-rose-500/20">
          <CardContent className="p-16 flex flex-col items-center gap-3 text-center">
            <ShieldAlert className="w-12 h-12 text-rose-400" />
            <p className="text-white font-bold">Acesso restrito</p>
            <p className="text-slate-400 text-xs">Apenas CEOs podem acessar a gestão de empresas.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">Gestão de Empresas</h1>
        <p className="text-slate-400 text-sm mt-1">{data?.length ?? 0} organizações cadastradas.</p>
      </header>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : !data?.length ? (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-16 flex flex-col items-center gap-3 text-center">
            <Building2 className="w-12 h-12 text-slate-700" />
            <p className="text-slate-400 font-bold">Nenhuma organização encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((o: any) => (
            <Card key={o.id} className="bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-indigo-400" /></div>
                  <Badge className="bg-white/5 text-slate-400 border-none text-[9px]">{o.slug}</Badge>
                </div>
                <h3 className="text-base font-black text-white uppercase italic">{o.name}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Criada em {format(new Date(o.created_at), "dd/MM/yyyy")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}