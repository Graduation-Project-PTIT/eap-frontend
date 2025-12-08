import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { X, ChevronDown, ChevronUp, Code, Share2 } from "lucide-react";
import type { ERDEntity } from "@/api/services/evaluation-service";
import ERDDiagram from "@/components/erd/db-diagram-view";
import getNodesForDBDiagram from "@/components/erd/db-diagram-view/utils/getNodesForDBDiagram";
import { getEdgesForDBDiagram } from "@/components/erd/db-diagram-view/utils/getEdgesForDBDiagram";
import getLayoutedElementsForDBDiagram from "@/components/erd/db-diagram-view/utils/getLayoutedElementsForDBDiagram";
import ShareDiagramDialog from "./ShareDiagramDialog";
import { useCreateDiagram } from "@/api/services/diagram-service";
import { toast } from "@/lib/toast";

interface ERDSidebarProps {
  schema: { entities: ERDEntity[] } | null;
  ddl: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

const ERDSidebar = ({ schema, ddl, isOpen, onToggle }: ERDSidebarProps) => {
  const [isDdlOpen, setIsDdlOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const createDiagram = useCreateDiagram();

  // Generate diagram nodes and edges
  const { nodes, edges } = useMemo(() => {
    if (!schema || !schema.entities || schema.entities.length === 0) {
      return { nodes: [], edges: [] };
    }

    const initialNodes = getNodesForDBDiagram(schema.entities);
    const initialEdges = getEdgesForDBDiagram(initialNodes);
    const layouted = getLayoutedElementsForDBDiagram(initialNodes, initialEdges);

    return layouted;
  }, [schema]);

  const handleShare = async (formData: {
    title: string;
    description: string;
    visibility: "public" | "private" | "class";
    classId?: string;
  }) => {
    if (!schema || !ddl) {
      toast.error("No diagram to share");
      return;
    }

    try {
      await createDiagram.mutateAsync({
        title: formData.title,
        description: formData.description,
        schemaJson: schema,
        ddlScript: ddl,
        visibility: formData.visibility,
        classId: formData.classId,
      });
      toast.success("Diagram shared successfully!");
      setIsShareDialogOpen(false);
    } catch {
      toast.error("Failed to share diagram. Please try again.");
    }
  };

  if (!isOpen) return null;

  const hasSchema = schema && schema.entities && schema.entities.length > 0;

  return (
    <div className="fixed right-0 top-0 h-screen w-[70vw] max-w-[70vw] bg-background border-l shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">ERD Diagram</h2>
          <p className="text-sm text-muted-foreground mt-1">Generated ERD diagram and DDL</p>
        </div>
        <div className="flex items-center gap-2">
          {hasSchema && (
            <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasSchema ? (
          <>
            {/* ERD Diagram */}
            <Card className="h-[50vh] overflow-hidden">
              <ERDDiagram initialNodes={nodes} initialEdges={edges} />
            </Card>

            {/* DDL Script */}
            {ddl && (
              <Collapsible open={isDdlOpen} onOpenChange={setIsDdlOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-4">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span className="font-semibold">DDL Script</span>
                      </div>
                      {isDdlOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0">
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                        <code>{ddl}</code>
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No schema available yet. Start a conversation to generate one!</p>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <ShareDiagramDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        onSubmit={handleShare}
        isLoading={createDiagram.isPending}
      />
    </div>
  );
};

export default ERDSidebar;
