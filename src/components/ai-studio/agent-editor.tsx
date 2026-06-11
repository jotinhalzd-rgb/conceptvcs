import React, { useState, useEffect } from 'react';
import { useAgents } from "@/hooks/ai/use-agents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bot, Save, X, BrainCircuit, Sparkles } from "lucide-react";

export const AgentEditor = ({ agent, onCancel }: { agent: any, onCancel: () => void }) => {
  const { createAgent, updateAgent } = useAgents();
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    description: agent?.description || '',
    role_type: agent?.role_type || 'support',
    tone_of_voice: agent?.tone_of_voice || 'professional',
    autonomy_level: agent?.autonomy_level || 'assistant',
    system_prompt: agent?.system_prompt || '',
    is_active: agent?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agent?.id) {
      updateAgent.mutate({ id: agent.id, updates: formData });
    } else {
      createAgent.mutate(formData);
    }
    onCancel();
  };

  return (
    <div className="bg-[#030712] border border-white/5 rounded-3xl p-8 max-w-2xl mx-auto my-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              {agent ? 'Editar Agente' : 'Novo Especialista Digital'}
            </h2>
            <p className="text-slate-500 text-sm">Configure as regras e identidade do seu agente.</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-xl">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome do Agente</Label>
            <Input 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Consultor de Vendas"
              className="bg-white/5 border-white/10 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Departamento</Label>
            <Select 
              value={formData.role_type}
              onValueChange={val => setFormData({...formData, role_type: val})}
            >
              <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10">
                <SelectItem value="sales">Comercial</SelectItem>
                <SelectItem value="support">Suporte</SelectItem>
                <SelectItem value="finance">Financeiro</SelectItem>
                <SelectItem value="hr">RH</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="manager">Gestão</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descrição Curta</Label>
          <Input 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Qual a função deste agente na empresa?"
            className="bg-white/5 border-white/10 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tom de Voz</Label>
            <Select 
              value={formData.tone_of_voice}
              onValueChange={val => setFormData({...formData, tone_of_voice: val})}
            >
              <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10">
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="friendly">Amigável</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
                <SelectItem value="direct">Direto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nível de Autonomia</Label>
            <Select 
              value={formData.autonomy_level}
              onValueChange={val => setFormData({...formData, autonomy_level: val})}
            >
              <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10">
                <SelectItem value="assistant">Modo Assistente (Apenas Sugere)</SelectItem>
                <SelectItem value="semi_autonomous">Semi-Autônomo (Pede Aprovação)</SelectItem>
                <SelectItem value="autonomous">Autônomo (Executa Sozinho)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            System Prompt (Cérebro do Agente)
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </Label>
          <Textarea 
            value={formData.system_prompt}
            onChange={e => setFormData({...formData, system_prompt: e.target.value})}
            placeholder="Instruções detalhadas sobre como o agente deve se comportar, o que pode fazer e o que não pode..."
            className="bg-white/5 border-white/10 rounded-xl min-h-[150px] font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <Label className="text-xs font-bold text-white">Status do Agente</Label>
            <p className="text-[10px] text-slate-500">Ative ou desative este especialista</p>
          </div>
          <Switch 
            checked={formData.is_active}
            onCheckedChange={val => setFormData({...formData, is_active: val})}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-2xl h-12 border-white/10 font-bold uppercase tracking-widest text-xs">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 rounded-2xl h-12 bg-indigo-600 hover:bg-indigo-500 font-bold uppercase tracking-widest text-xs gap-2">
            <Save className="w-4 h-4" />
            {agent ? 'Salvar Alterações' : 'Criar Agente'}
          </Button>
        </div>
      </form>
    </div>
  );
};
