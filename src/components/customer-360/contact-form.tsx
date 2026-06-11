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

interface ContactFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ContactForm({ initialData, onSubmit, isLoading }: ContactFormProps) {
  const form = useForm({
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      lifecycle_stage: "prospect",
      lead_score: 50,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Nome Completo</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11" placeholder="Ex: Eduardo Rocha" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">E-mail</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11" placeholder="eduardo@exemplo.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Telefone</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11" placeholder="+55 11 99999-9999" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="lifecycle_stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Estágio do Funil</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11">
                    <SelectValue placeholder="Selecione o estágio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="mql">Lead Qualificado Marketing</SelectItem>
                  <SelectItem value="sql">Lead Qualificado Vendas</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="vip">Cliente VIP</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lead_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Lead Score (0-100)</FormLabel>
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

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-xl mt-4"
        >
          {isLoading ? "Processando..." : (initialData ? "Salvar Alterações" : "Criar Contato")}
        </Button>
      </form>
    </Form>
  );
}
