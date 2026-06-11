import React from 'react';
import { usePipelines } from "@/hooks/crm/use-pipelines";
import { useDeals, useUpdateDealStage } from "@/hooks/crm/use-deals";
import { KanbanColumn } from "./kanban-column";
import { Loader2 } from "lucide-react";

export const KanbanBoard = () => {
  const { data: pipelines, isLoading: loadingPipelines } = usePipelines();
  const { data: deals, isLoading: loadingDeals } = useDeals();
  const updateStage = useUpdateDealStage();

  if (loadingPipelines || loadingDeals) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const activePipeline = pipelines?.[0]; // Default para o primeiro pipeline
  const stages = activePipeline?.stages?.sort((a: any, b: any) => a.order_index - b.order_index) || [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    const dealId = e.dataTransfer.getData("dealId");
    if (dealId) {
      updateStage.mutate({ dealId, stageId });
    }
  };

  return (
    <div className="flex-1 overflow-x-auto no-scrollbar p-6">
      <div className="flex gap-6 h-full min-w-max">
        {stages.map((stage: any) => (
          <KanbanColumn 
            key={stage.id} 
            stage={stage} 
            deals={deals?.filter((d: any) => d.stage_id === stage.id) || []}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          />
        ))}
      </div>
    </div>
  );
};
