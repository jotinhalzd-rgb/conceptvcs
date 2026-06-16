import React, { useState } from 'react';
import { useStages, useDeals, useUpdateDealStage } from "@/hooks/crm/use-deals";
import { KanbanColumn } from "./kanban-column";
import { Loader2, Target } from "lucide-react";
import { DealDetailDialog } from "../deal-detail-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

interface KanbanBoardProps {
  pipelineId?: string;
}

export const KanbanBoard = ({ pipelineId }: KanbanBoardProps) => {
  const { data: stages, isLoading: loadingStages } = useStages(pipelineId);
  const { data: deals, isLoading: loadingDeals } = useDeals(pipelineId);
  const updateStage = useUpdateDealStage();
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  if (loadingStages || loadingDeals) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Target}
          title="Nenhuma oportunidade criada ainda"
          description="Crie sua primeira oportunidade para acompanhar negociações no Kanban."
          action={{
            label: "Criar oportunidade",
            onClick: () => toast.info("Use o botão Novo Negócio acima para criar uma oportunidade."),
          }}
        />
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    const dealId = e.dataTransfer.getData("dealId");
    const fromStageId = e.dataTransfer.getData("fromStageId") || undefined;
    if (dealId && fromStageId !== stageId) {
      updateStage.mutate({ dealId, stageId, fromStageId });
    }
  };

  return (
    <>
    <div className="flex-1 overflow-x-auto no-scrollbar p-6">
      <div className="flex gap-6 h-full min-w-max">
        {stages?.map((stage: any) => (
          <KanbanColumn 
            key={stage.id} 
            stage={stage} 
            deals={deals?.filter((d: any) => d.stage_id === stage.id) || []}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            onCardClick={(d) => setSelectedDeal(d)}
          />
        ))}
      </div>
    </div>
    <DealDetailDialog deal={selectedDeal} open={!!selectedDeal} onOpenChange={(v) => !v && setSelectedDeal(null)} />
    </>
  );
};
