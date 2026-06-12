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

const PROVIDER_FIELDS: Record<string, { key: string; label: string; placeholder?: string }[]> = {
  meta: [
    { key: "access_token", label: "Meta Access Token" },
    { key: "phone_number_id", label: "Phone Number ID" },
    { key: "waba_id", label: "WABA ID" },
    { key: "verify_token", label: "Verify Token (webhook)" },
  ],
  twilio: [
    { key: "account_sid", label: "Twilio Account SID" },
    { key: "auth_token", label: "Twilio Auth Token" },
  ],
  "360dialog": [
    { key: "api_key", label: "360Dialog API Key" },
  ],
  evolution: [
    { key: "base_url", label: "Evolution Base URL", placeholder: "https://evo.exemplo.com" },
    { key: "instance", label: "Instance Name" },
    { key: "api_key", label: "API Key" },
  ],
};

export function ConnectModal({ isOpen, onOpenChange }: ConnectModalProps) {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: "",
      provider: "twilio" as keyof typeof PROVIDER_FIELDS,
      identifier: "",
      credentials: {} as Record<string, string>,
    },
  });
  const provider = form.watch("provider");
  const fields = PROVIDER_FIELDS[provider] || [];

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
          organization_id: profile?.organization_id!,
          name: values.name,
          provider: values.provider,
          identifier: values.identifier,
          credentials: values.credentials || {},
          is_active: true,
          status: 'connected',
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
                      <SelectItem value="meta">WhatsApp Meta Cloud API</SelectItem>
                      <SelectItem value="twilio">WhatsApp Twilio</SelectItem>
                      <SelectItem value="360dialog">WhatsApp 360Dialog</SelectItem>
                      <SelectItem value="evolution">WhatsApp Evolution API</SelectItem>
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

              {fields.map((f) => (
                <FormField
                  key={f.key}
                  control={form.control}
                  name={`credentials.${f.key}` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-500 font-bold uppercase text-[9px]">{f.label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          type={f.key.includes("url") || f.key.includes("instance") ? "text" : "password"}
                          placeholder={f.placeholder}
                          className="bg-[#020817] border-white/5 h-9"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
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
