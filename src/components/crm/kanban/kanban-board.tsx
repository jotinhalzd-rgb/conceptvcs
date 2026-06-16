import React, { useState } from 'react';
import { useStages, useDeals, useUpdateDealStage, type DealFilters } from "@/hooks/crm/use-deals";
import { KanbanColumn } from "./kanban-column";
import { Loader2, Target } from "lucide-react";
import { DealDetailDialog } from "../deal-detail-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  pipelineId?: string;
  filters?: DealFilters;
  onCreateDeal?: (stageId?: string) => void;
  onClearFilters?: () => void;
  filtersActive?: boolean;
}

export const KanbanBoard = ({ pipelineId, filters, onCreateDeal, onClearFilters, filtersActive }: KanbanBoardProps) => {
  const { data: stages, isLoading: loadingStages } = useStages(pipelineId);
  const { data: deals, isLoading: loadingDeals } = useDeals(pipelineId, filters);
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
          title={filtersActive ? "Nenhum resultado para os filtros" : "Nenhuma oportunidade criada ainda"}
          description={filtersActive ? "Ajuste ou limpe os filtros para ver mais negócios." : "Crie sua primeira oportunidade para acompanhar negociações no Kanban."}
          action={filtersActive
            ? { label: "Limpar filtros", onClick: () => onClearFilters?.() }
            : { label: "Criar oportunidade", onClick: () => onCreateDeal?.() }}
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
            onAddDeal={(stageId) => onCreateDeal?.(stageId)}
          />
        ))}
      </div>
    </div>
    <DealDetailDialog deal={selectedDeal} open={!!selectedDeal} onOpenChange={(v) => !v && setSelectedDeal(null)} />
    </>
  );
};
