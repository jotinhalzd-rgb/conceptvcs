import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

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
        navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
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
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20 mb-6">
            <div className="w-full h-full rounded-[14px] bg-[#020617] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            ONECONTACT OS
          </h1>
          <p className="text-slate-400 text-sm max-w-[280px]">
            {isSignUp 
              ? "Crie sua conta corporativa para gerenciar suas operações em escala." 
              : "Entre no sistema operacional definitivo para sua empresa."}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="exemplo@empresa.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white pl-11 h-12 rounded-xl transition-all"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Senha
                </label>
                {!isSignUp && (
                  <button type="button" className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white pl-11 h-12 rounded-xl transition-all"
                  required 
                />
              </div>
            </div>

            <Button 
              id="auth-submit"
              type="submit" 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-[0.98] group" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{isSignUp ? "Criar Minha Conta" : "Acessar Plataforma"}</span>
                  {isSignUp ? <UserPlus className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /> : <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.05]">
            <p className="text-center text-sm text-slate-500">
              {isSignUp ? "Já possui uma conta ativa?" : "Ainda não tem acesso?"}{" "}
              <button 
                id="toggle-auth-mode"
                type="button"
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center gap-1 mx-auto mt-2"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                <span>{isSignUp ? "Entrar no sistema" : "Solicitar acesso agora"}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>

        <footer className="mt-12 text-center text-[11px] text-slate-600 uppercase tracking-[0.2em] font-medium">
          &copy; {new Date().getFullYear()} OneContact Enterprise SaaS OS
        </footer>
      </main>
    </div>
  );
}
