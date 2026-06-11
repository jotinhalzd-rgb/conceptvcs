"use client";

import { useAuth, useProfile } from "@/hooks/auth/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Navigate } from "@tanstack/react-router";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Ticket, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Clock,
  Briefcase,
  Zap,
  Target,
  DollarSign
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const data = [
  { name: "Seg", conversas: 400, leads: 240, receita: 2400 },
  { name: "Ter", conversas: 300, leads: 139, receita: 2210 },
  { name: "Qua", conversas: 200, leads: 980, receita: 2290 },
  { name: "Qui", conversas: 278, leads: 390, receita: 2000 },
  { name: "Sex", conversas: 189, leads: 480, receita: 2181 },
  { name: "Sáb", conversas: 239, leads: 380, receita: 2500 },
  { name: "Dom", conversas: 349, leads: 430, receita: 2100 },
];

const performanceData = [
  { name: "Vendas", value: 85, color: "#6366f1" },
  { name: "Suporte", value: 92, color: "#10b981" },
  { name: "Marketing", value: 68, color: "#f59e0b" },
  { name: "Ops", value: 74, color: "#8b5cf6" },
];

export function Dashboard() {
  const { user, loading } = useAuth();
  const { data: profile } = useProfile();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  const stats = [
    { label: "Clientes Ativos", value: "1,284", trend: "+12.5%", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Leads Qualificados", value: "456", trend: "+18.2%", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Receita (Simulada)", value: "R$ 45.2k", trend: "+5.4%", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "NPS Médio", value: "9.2", trend: "+2.1%", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Célula de Inteligência Executiva</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            OneContact <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Enterprise OS</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-xl">
            Olá, {profile?.full_name || "Líder"}. A IA identificou <span className="text-indigo-400 font-bold">12 novas oportunidades</span> e <span className="text-rose-400 font-bold">2 riscos de churn</span> hoje.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center gap-2.5 backdrop-blur-md shadow-lg shadow-indigo-500/5">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black text-indigo-100 uppercase tracking-wider">Modo Supervisor IA</span>
          </div>
          <Button className="h-11 bg-white text-[#020617] hover:bg-slate-200 rounded-2xl shadow-xl font-black px-8 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase text-[11px] tracking-widest">
            <TrendingUp className="w-4 h-4 mr-2" />
            Dashboard BI
          </Button>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 group overflow-hidden relative rounded-[2rem] shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent -mr-12 -mt-12 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("p-4 rounded-2xl shadow-inner", stat.bg)}>
                  <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase",
                  stat.trend.startsWith('+') ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                )}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-white tabular-nums tracking-tighter">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.08] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-lg font-bold text-white">Fluxo de Crescimento</CardTitle>
              <CardDescription className="text-slate-500">Volume de conversas e novos leads por dia</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                Conversas
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                Leads
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorConversas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <ChartTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="conversas" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorConversas)" />
                <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Performance Setorial</CardTitle>
            <CardDescription className="text-slate-500">Eficiência por departamento</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 600 }}
                  width={80}
                />
                <ChartTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="bg-white/[0.02] border-white/[0.08]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-white">Atividades Recentes</CardTitle>
            <CardDescription className="text-slate-500">Últimas ações dos agentes e automações</CardDescription>
          </div>
          <Button variant="ghost" className="text-indigo-400 font-bold hover:bg-indigo-500/10">Ver Tudo</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'AI', label: 'IA Agent Sarah', action: 'converteu um novo lead qualificado', time: '2 min atrás', icon: MessageSquare, color: 'text-indigo-400' },
              { type: 'SALE', label: 'Venda Confirmada', action: 'Upgrade de plano para Enterprise - Cliente TechFlow', time: '15 min atrás', icon: DollarSign, color: 'text-emerald-400' },
              { type: 'TICKET', label: 'Ticket Resolvido', action: 'Problema de API reportado por WebScale resolvido em 12min', time: '45 min atrás', icon: Ticket, color: 'text-amber-400' },
              { type: 'SYSTEM', label: 'Nova Automação', action: 'Workflow de Onboarding disparado para 12 novos usuários', time: '1 hora atrás', icon: Zap, color: 'text-purple-400' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.05]">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.03]", activity.color)}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white leading-none mb-1">
                    {activity.label} <span className="font-normal text-slate-400">{activity.action}</span>
                  </p>
                  <p className="text-xs text-slate-600 font-medium tracking-tight uppercase">{activity.time}</p>
                </div>
                <div className="hidden md:block">
                  <div className="px-3 py-1 bg-white/[0.05] rounded-lg text-[10px] font-bold text-slate-400 uppercase">
                    {activity.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

