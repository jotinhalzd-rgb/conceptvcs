import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, ShieldCheck, Key } from "lucide-react";

interface ConnectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectModal({ isOpen, onOpenChange }: ConnectModalProps) {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: "",
      provider: "twilio",
      identifier: "",
      account_sid: "",
      auth_token: "",
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", session.user.id)
        .single();

      const { data, error } = await supabase
        .from("channels")
        .insert({
          organization_id: profile?.organization_id,
          name: values.name,
          provider: values.provider,
          identifier: values.identifier,
          credentials: {
            account_sid: values.account_sid,
            auth_token: values.auth_token
          },
          is_active: true,
          status: 'connected'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal conectado com sucesso!");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(`Erro ao conectar: ${error.message}`);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#020817] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Conectar Canal Real
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => connectMutation.mutate(v))} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Nome Interno</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white/[0.03] border-white/10" placeholder="Ex: WhatsApp Suporte" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Provedor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/[0.03] border-white/10">
                        <SelectValue placeholder="Selecione o provedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                      <SelectItem value="twilio">Twilio WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400 font-bold uppercase text-[10px]">Número do Canal (Ex: whatsapp:+1415...)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white/[0.03] border-white/10" placeholder="whatsapp:+5511..." />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="bg-indigo-600/5 border border-indigo-500/10 p-4 rounded-xl space-y-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-black uppercase text-indigo-400">Credenciais Seguras</span>
              </div>
              
              <FormField
                control={form.control}
                name="account_sid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-500 font-bold uppercase text-[9px]">Twilio Account SID</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="bg-[#020817] border-white/5 h-9" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auth_token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-500 font-bold uppercase text-[9px]">Twilio Auth Token</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="bg-[#020817] border-white/5 h-9" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={connectMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 rounded-xl mt-6 gap-2"
            >
              {connectMutation.isPending ? "Conectando..." : "Finalizar Conexão"}
              <ShieldCheck className="w-4 h-4" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
