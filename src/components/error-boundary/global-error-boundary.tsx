import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error(`Error Boundary [${this.props.name || 'Global'}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center bg-[#020617] rounded-3xl border border-white/5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Ops! Algo deu errado.</h2>
          <p className="text-slate-400 max-w-md mb-8">
            Ocorreu um erro inesperado nesta parte do sistema. Nossa equipe técnica já foi notificada.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={this.handleReset}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold px-6"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Componente
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="border-white/10 text-slate-400 hover:text-white rounded-xl"
            >
              Ir para Home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-black/50 rounded-xl text-left text-xs text-rose-400 overflow-auto max-w-full">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
