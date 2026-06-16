import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFiltersBar } from "./report-filters-bar";
import { ConversationsReport } from "./conversations-report";
import { QueuesReport } from "./queues-report";
import { SlaReport } from "./sla-report";
import { CrmReport } from "./crm-report";
import { CampaignsReport } from "./campaigns-report";
import { SmartBackButton } from "@/components/layout/back-button";

export function ReportsView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header>
        <SmartBackButton className="mb-4" />
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase italic">Relatórios BI</h1>
        <p className="text-slate-400 text-sm mt-1">Inteligência operacional em tempo real.</p>
      </header>

      <ReportFiltersBar />

      <Tabs defaultValue="atendimento" className="w-full">
        <TabsList className="bg-white/[0.02] border border-white/[0.08]">
          <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
          <TabsTrigger value="filas">Filas</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
        </TabsList>
        <TabsContent value="atendimento" className="mt-6"><ConversationsReport /></TabsContent>
        <TabsContent value="filas" className="mt-6"><QueuesReport /></TabsContent>
        <TabsContent value="sla" className="mt-6"><SlaReport /></TabsContent>
        <TabsContent value="crm" className="mt-6"><CrmReport /></TabsContent>
        <TabsContent value="campanhas" className="mt-6"><CampaignsReport /></TabsContent>
      </Tabs>
    </div>
  );
}