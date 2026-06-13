import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck, Crown, Eye, EyeOff, LogOut, CheckCircle2, Zap, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate({ to: "/dashboard" });
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      if (isSignUp) {
        toast.success("Cadastro realizado! Verifique seu e-mail.");
      } else {
        toast.success("Bem-vindo de volta!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalExit = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sessão encerrada.");
      window.location.href = "/";
    } catch (error) {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#020617] relative">
      {/* Background Decorative Elements for the whole page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/5 blur-[120px]" />
      </div>

      {/* LEFT COLUMN: Auth Form */}
      <div className="relative z-10 w-full md:w-[500px] lg:w-[600px] min-h-screen flex flex-col px-6 py-12 md:px-12 lg:px-20 bg-[#020617]/50 backdrop-blur-sm border-r border-white/5 flex-shrink-0">
        <header className="flex flex-col mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-2xl shadow-indigo-500/20 mb-8">
            <div className="w-full h-full rounded-[14px] bg-[#020617] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
            {isSignUp ? "Comece agora" : "Bem-vindo ao OneContact"}
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-[320px]">
            {isSignUp 
              ? "Crie sua conta corporativa para gerenciar suas operações em escala." 
              : "O sistema operacional definitivo para empresas de alto crescimento."}
          </p>
        </header>

        <section className="animate-in fade-in zoom-in-95 duration-500">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="exemplo@empresa.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white pl-12 h-14 rounded-2xl transition-all placeholder:text-slate-600"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  Senha
                </label>
                {!isSignUp && (
                  <button type="button" className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white pl-12 pr-12 h-14 rounded-2xl transition-all placeholder:text-slate-600"
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              id="auth-submit"
              type="submit" 
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-300 active:scale-[0.98] group relative overflow-hidden" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="tracking-wide">Processando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="tracking-wide">{isSignUp ? "Criar Minha Conta" : "Acessar Plataforma"}</span>
                  {isSignUp ? <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 text-center">
            <p className="text-sm text-slate-500">
              {isSignUp ? "Já possui uma conta ativa?" : "Ainda não tem acesso?"}{" "}
              <button 
                id="toggle-auth-mode"
                type="button"
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors inline-flex items-center gap-1 group"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                <span>{isSignUp ? "Entrar no sistema" : "Solicitar acesso"}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </p>
          </div>
        </section>

        <div className="mt-auto pt-12 pb-4">
          <button
            id="global-exit-btn"
            onClick={handleGlobalExit}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-rose-400 uppercase tracking-[0.2em] transition-all group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Branding/Institutional (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 relative flex-col items-center justify-center p-12 lg:p-24 overflow-hidden">
        {/* Abstract Background Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12)_0%,transparent_70%)] animate-pulse" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" 
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />
        </div>

        <div className="relative z-10 max-w-lg w-full text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3" />
              <span>Plataforma Enterprise</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8 tracking-tighter">
              Gerencie toda sua operação em <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">um só lugar.</span>
            </h2>

            <div className="grid gap-6">
              {[
                { icon: Globe, title: "Omnichannel 2.0", desc: "WhatsApp, Instagram, E-mail e Voz centralizados." },
                { icon: Shield, title: "Segurança de Elite", desc: "Dados protegidos com criptografia ponta a ponta." },
                { icon: CheckCircle2, title: "Automação com IA", desc: "Reduza o tempo de resposta em até 80%." }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1), duration: 0.5 }}
                  className="flex items-start gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center shrink-0 border border-indigo-600/20">
                    <feature.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer info for right column */}
        <div className="absolute bottom-12 left-12 right-12 flex items-center justify-between z-10 opacity-30">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} OneContact
          </div>
          <div className="flex gap-6">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Privacidade</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Termos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
