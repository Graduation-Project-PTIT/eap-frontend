import { type FC, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvaluations, type EvaluationRecord } from "@/api/services/evaluation-service";
import EvaluationHistoryCard from "./EvaluationHistoryCard";
import EvaluationDetailDialog from "./EvaluationDetailDialog";

interface HistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const HistorySidebar: FC<HistorySidebarProps> = ({ isOpen, onToggle }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Fetch evaluations from API with auto-refresh
  const { data: evaluations = [], isLoading, error } = useEvaluations({ limit: 10 });

  // Sort evaluations by creation date (newest first)
  const sortedEvaluations = [...evaluations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleViewDetails = (evaluation: EvaluationRecord) => {
    setSelectedEvaluation(evaluation);
    setIsDetailDialogOpen(true);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-80 bg-background border-l transition-transform duration-300 z-40 overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b shrink-0">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Evaluation History</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Previous ERD evaluations and results
            </p>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Loading evaluations...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">Failed to load evaluations</p>
                    <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
                  </div>
                ) : sortedEvaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No evaluations yet</p>
                    <p className="text-sm text-muted-foreground">
                      Complete your first evaluation to see it here
                    </p>
                  </div>
                ) : (
                  sortedEvaluations.map((evaluation) => (
                    <EvaluationHistoryCard
                      key={evaluation.id}
                      evaluation={evaluation}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Evaluation Detail Dialog */}
      <EvaluationDetailDialog
        evaluation={selectedEvaluation}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </>
  );
};

export default HistorySidebar;
