import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Customer360 } from "@/components/customer-360/customer-view";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">CRM de Próxima Geração</span>
        </div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Customer 360</h1>
      </header>
      
      <Suspense fallback={<div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />}>
        <Customer360 />
      </Suspense>
    </div>
  );
}
