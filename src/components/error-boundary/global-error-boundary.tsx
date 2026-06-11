import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20 shadow-2xl shadow-rose-500/10">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Ops! Algo deu errado.</h2>
          <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
            O módulo <span className="text-rose-400 font-bold uppercase tracking-widest px-1.5 py-0.5 bg-rose-500/10 rounded">{this.props.name || "Sistema"}</span> encontrou uma falha inesperada. Nossos supervisores já foram notificados.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={this.handleReset}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 h-11 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20 gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
            <Button 
              variant="ghost"
              onClick={this.handleGoHome}
              className="text-slate-400 hover:text-white hover:bg-white/5 font-bold rounded-xl px-6 h-11 transition-all gap-2"
            >
              <Home className="w-4 h-4" />
              Início do Sistema
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-12 p-6 bg-black/40 border border-white/5 rounded-2xl text-[10px] text-rose-300 text-left max-w-2xl overflow-auto no-scrollbar font-mono leading-relaxed">
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
