import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProviderField } from "@/lib/channels/providers";

interface ProviderFieldsProps {
  fields: ProviderField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  secretsAlreadyStored?: boolean;
}

export function ProviderFields({
  fields,
  values,
  onChange,
  secretsAlreadyStored,
}: ProviderFieldsProps) {
  if (fields.length === 0) {
    return (
      <p className="text-[11px] text-slate-500">
        Este provedor não exige campos adicionais nesta seção.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {fields.map((f) => {
        const value = values?.[f.key] ?? "";
        const placeholder = f.secret && secretsAlreadyStored
          ? "•••••• (salvo). Preencha para substituir."
          : f.placeholder;
        return (
          <div key={f.key} className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {f.label}
              {f.required && <span className="text-rose-400"> *</span>}
            </Label>
            {f.type === "select" ? (
              <Select
                value={value || undefined}
                onValueChange={(v) => onChange(f.key, v)}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-slate-100">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-slate-200">
                  {f.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={f.type === "password" ? "password" : f.type === "number" ? "number" : "text"}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="bg-white/[0.03] border-white/10 text-slate-100"
              />
            )}
            {f.helper && (
              <p className="text-[10px] text-slate-500">{f.helper}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}