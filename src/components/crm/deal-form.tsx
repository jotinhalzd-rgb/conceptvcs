import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePipelines, useStages } from "@/hooks/crm/use-deals";
import { useContacts } from "@/hooks/crm/use-contacts";
import { Textarea } from "@/components/ui/textarea";

interface DealFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function DealForm({ onSubmit, isLoading }: DealFormProps) {
  const { data: pipelines } = usePipelines();
  const { contacts } = useContacts();
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      value: 0,
      pipeline_id: "",
      stage_id: "",
      contact_id: "",
      probability: 50,
      status: "open",
      expected_close_date: "",
    },
  });

  const selectedPipelineId = form.watch("pipeline_id");
  const { data: stages } = useStages(selectedPipelineId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Título do Negócio</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11" placeholder="Ex: Upgrade Enterprise One" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Valor (R$)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11" 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Probabilidade (%)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11" 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contact_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Cliente Relacionado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                  {contacts?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pipeline_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Pipeline</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11">
                      <SelectValue placeholder="Selecione o pipeline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                    {pipelines?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {(p as any).title || (p as any).name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stage_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Estágio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedPipelineId}>
                  <FormControl>
                    <SelectTrigger className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11">
                      <SelectValue placeholder="Selecione o estágio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                    {stages?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expected_close_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Data Prevista</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="won">Ganho</SelectItem>
                    <SelectItem value="lost">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-xl mt-4"
        >
          {isLoading ? "Criando..." : "Criar Negócio"}
        </Button>
      </form>
    </Form>
  );
}
