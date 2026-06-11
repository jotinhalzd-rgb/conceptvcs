import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck, Crown, Eye, EyeOff } from "lucide-react";

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
        // Navigation is handled by the useEffect watching the session
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (role: 'ceo_master' | 'admin' | 'manager' | 'agent') => {
    if (loading) return;
    
    const roleLabels = {
      ceo_master: '👑 CEO MASTER',
      admin: '🏢 EMPRESA (GESTOR)',
      manager: '👨‍💼 GERENTE',
      agent: '🎧 ATENDENTE'
    };

    setLoading(true);
    
    try {
      const mockSession = {
        user: {
          id: `bypass-${role}-id`,
          email: `${role}@onecontact.ai`,
          user_metadata: {
            full_name: roleLabels[role].split(' ').slice(1).join(' '),
            role: role
          }
        },
        access_token: `bypass-token-${role}`,
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };

      localStorage.setItem("onecontact_bypass_session", JSON.stringify(mockSession));
      toast.success(`${roleLabels[role]} ativado (Demo)!`);
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error(`Falha no bypass: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-6 py-12">
        <header className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-2xl shadow-indigo-500/20 mb-6">
            <div className="w-full h-full rounded-[14px] bg-[#020617] flex items-center justify-center">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            ONECONTACT OS
          </h1>
          <p className="text-slate-400 text-sm max-w-[280px] leading-relaxed">
            {isSignUp 
              ? "Crie sua conta corporativa para gerenciar suas operações em escala." 
              : "O sistema operacional definitivo para empresas de alto crescimento."}
          </p>
        </header>

        <section className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500">
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
                  className="bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white pl-12 h-14 rounded-2xl transition-all placeholder:text-slate-600"
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
                  className="bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white pl-12 pr-12 h-14 rounded-2xl transition-all placeholder:text-slate-600"
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

          <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
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

        <section className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-white/[0.05]" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Acesso Rápido</span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          
          <button
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Crown className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-white tracking-wide">CEO DEMO</h3>
                <p className="text-[11px] text-slate-500">Acesso completo para demonstração</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </section>

        <footer className="mt-12 text-center text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold opacity-50">
          &copy; {new Date().getFullYear()} OneContact Enterprise SaaS
        </footer>
      </main>
    </div>
  );
}
