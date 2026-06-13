import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, BookOpen, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/knowledge")({ component: KnowledgePage });

type Article = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  organization_id: string;
};

function KnowledgePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });

  const articlesQ = useQuery({
    queryKey: ["knowledge_articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_articles" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Article[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user!.id)
        .single();
      if (!profile?.organization_id) throw new Error("Organização não encontrada");

      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (editing) {
        const { error } = await supabase
          .from("knowledge_articles" as any)
          .update({ title: form.title, content: form.content, tags })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("knowledge_articles" as any)
          .insert({ title: form.title, content: form.content, tags, organization_id: profile.organization_id, created_by: userData.user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge_articles"] });
      setOpen(false);
      setEditing(null);
      setForm({ title: "", content: "", tags: "" });
      toast.success(editing ? "Artigo atualizado" : "Artigo criado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("knowledge_articles" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge_articles"] });
      toast.success("Artigo excluído");
    },
  });

  const startEdit = (a: Article) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content, tags: a.tags.join(", ") });
    setOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">Knowledge Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Base de conhecimento operacional.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ title: "", content: "", tags: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 gap-2 h-12 px-6 font-bold uppercase text-[10px] tracking-widest">
              <Plus className="w-4 h-4" /> Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Artigo" : "Novo Artigo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Conteúdo" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} />
              <Input placeholder="Tags (separadas por vírgula)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <DialogFooter>
              <Button onClick={() => saveMutation.mutate()} disabled={!form.title || saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {articlesQ.isLoading ? (
        <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : !articlesQ.data?.length ? (
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardContent className="p-16 flex flex-col items-center text-center gap-3">
            <BookOpen className="w-12 h-12 text-slate-700" />
            <p className="text-slate-400 font-bold">Nenhum artigo ainda.</p>
            <p className="text-slate-600 text-xs">Crie o primeiro artigo da sua base de conhecimento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articlesQ.data.map((a) => (
            <Card key={a.id} className="bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{a.title}</h3>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(a)}><Edit3 className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-400" onClick={() => deleteMutation.mutate(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 whitespace-pre-wrap">{a.content || "—"}</p>
                <div className="flex flex-wrap gap-1">
                  {a.tags.map((t) => <Badge key={t} className="bg-indigo-600/10 text-indigo-400 border-none text-[9px]">{t}</Badge>)}
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{format(new Date(a.created_at), "dd/MM/yyyy")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}