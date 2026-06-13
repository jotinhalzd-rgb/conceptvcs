import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, MessageSquare, Clock } from "lucide-react";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function ReportsPage() {
  const since = subDays(new Date(), 14).toISOString();

  const conversationsQ = useQuery({
    queryKey: ["reports", "conversations", since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, created_at, status, first_response_at, waiting_since")
        .gte("created_at", since);
      if (error) throw error;
      return data ?? [];
    },
  });

  const messagesQ = useQuery({
    queryKey: ["reports", "messages", since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, created_at")
        .gte("created_at", since);
      if (error) throw error;
      return data ?? [];
    },
  });

  const dealsQ = useQuery({
    queryKey: ["reports", "deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("id, value, status, stage_id, stages(name)");
      if (error) throw error;
      return data ?? [];
    },
  });

  const loading = conversationsQ.isLoading || messagesQ.isLoading || dealsQ.isLoading;

  // Volume per day
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = startOfDay(subDays(new Date(), 13 - i));
    const key = format(d, "dd/MM");
    const convCount = (conversationsQ.data ?? []).filter((c) => format(startOfDay(new Date(c.created_at!)), "dd/MM") === key).length;
    const msgCount = (messagesQ.data ?? []).filter((m) => format(startOfDay(new Date(m.created_at!)), "dd/MM") === key).length;
    return { day: key, conversas: convCount, mensagens: msgCount };
  });

  // Conversions by stage
  const byStage: Record<string, { name: string; total: number; value: number }> = {};
  (dealsQ.data ?? []).forEach((d: any) => {
    const name = d.stages?.name ?? "Sem Estágio";
    if (!byStage[name]) byStage[name] = { name, total: 0, value: 0 };
    byStage[name].total += 1;
    byStage[name].value += Number(d.value || 0);
  });
  const stageData = Object.values(byStage);

  // Response time
  const responseTimes = (conversationsQ.data ?? [])
    .filter((c) => c.first_response_at && c.waiting_since)
    .map((c) => (new Date(c.first_response_at!).getTime() - new Date(c.waiting_since!).getTime()) / 60000);
  const avgResponse = responseTimes.length ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1) : "0";

  const stats = [
    { label: "Conversas (14d)", value: conversationsQ.data?.length ?? 0, icon: MessageSquare },
    { label: "Mensagens (14d)", value: messagesQ.data?.length ?? 0, icon: BarChart3 },
    { label: "Negócios", value: dealsQ.data?.length ?? 0, icon: TrendingUp },
    { label: "TMR Médio (min)", value: avgResponse, icon: Clock },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase italic">Relatórios BI</h1>
        <p className="text-slate-400 text-sm mt-1">Inteligência operacional em tempo real.</p>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="bg-white/[0.02] border-white/[0.08]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <s.icon className="w-4 h-4 text-indigo-400" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                  </div>
                  <p className="text-2xl font-black text-white italic">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Volume por Dia</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                  <Legend />
                  <Line type="monotone" dataKey="conversas" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="mensagens" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardContent className="p-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Negócios por Estágio</h3>
                {stageData.length === 0 ? (
                  <p className="text-slate-500 text-xs">Sem dados.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                      <Bar dataKey="total" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardContent className="p-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Distribuição de Valor</h3>
                {stageData.length === 0 ? (
                  <p className="text-slate-500 text-xs">Sem dados.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={stageData} dataKey="value" nameKey="name" outerRadius={100} label>
                        {stageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}