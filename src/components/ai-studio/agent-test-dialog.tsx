import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Sparkles, Beaker } from "lucide-react";
import { testAgent, type TestAgentResult } from "@/lib/ai/test-agent.functions";

export const AgentTestDialog = ({
  agent,
  open,
  onOpenChange,
}: {
  agent: any | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const runTest = useServerFn(testAgent);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestAgentResult | null>(null);

  const handleRun = async () => {
    if (!agent?.id || !input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await runTest({ data: { agentId: agent.id, input: input.trim() } });
      setResult(r);
    } catch (e: any) {
      setResult({ status: "error", reason: e?.message || "Falha inesperada." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#030712] border border-white/10 rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Beaker className="w-5 h-5 text-indigo-400" />
            Testar agente — {agent?.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Esta é uma execução de TESTE manual. A resposta usa o system prompt do agente
            via Lovable AI Gateway e <strong>pode consumir créditos</strong> do workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva uma mensagem que um cliente enviaria..."
            className="bg-white/5 border-white/10 rounded-xl min-h-[100px] text-sm"
            maxLength={2000}
          />

          {result?.status === "ok" && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-black uppercase">
                  TESTE
                </Badge>
                <span className="text-[10px] text-slate-500 font-mono">{result.model}</span>
              </div>
              <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">{result.output}</p>
            </div>
          )}

          {result?.status === "pending_configuration" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-bold text-sm mb-1">Pendente de configuração</p>
                <p className="text-slate-400 text-xs">{result.reason}</p>
              </div>
            </div>
          )}

          {result?.status === "error" && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-300 text-sm">{result.reason}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">
              Fechar
            </Button>
            <Button
              onClick={handleRun}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Rodar teste
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};