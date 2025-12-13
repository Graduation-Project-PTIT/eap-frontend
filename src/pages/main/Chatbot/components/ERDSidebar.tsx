import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Share2, Save, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import type { ERDEntity } from "@/api/services/evaluation-service";
import ERDDiagram from "@/components/erd/diagram-view";
import getNodesForDiagram from "@/components/erd/utils/getNodesForDiagram";
import { getEdgesForDiagram } from "@/components/erd/utils/getEdgesForDiagram";
import getLayoutedElements from "@/components/erd/utils/getLayoutedElements";
import ShareDiagramDialog from "./ShareDiagramDialog";
import { useCreateDiagram } from "@/api/services/diagram-service";
import { toast } from "@/lib/toast";

interface ERDSidebarProps {
  schema: { entities: ERDEntity[] } | null;
  ddl: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onEntityUpdate?: (entity: ERDEntity) => void;
  onSaveSchema?: () => void;
  isSchemaDirty?: boolean;
  isSaving?: boolean;
}

const ERDSidebar = ({
  schema,
  ddl,
  isOpen,
  onToggle,
  onEntityUpdate,
  onSaveSchema,
  isSchemaDirty = false,
  isSaving = false,
}: ERDSidebarProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const createDiagram = useCreateDiagram();

  // Generate diagram nodes and edges
  const { nodes, edges } = useMemo(() => {
    if (!schema || !schema.entities || schema.entities.length === 0) {
      return { nodes: [], edges: [] };
    }

    const initialNodes = getNodesForDiagram(schema.entities);
    const initialEdges = getEdgesForDiagram(initialNodes);
    const layouted = getLayoutedElements(initialNodes, initialEdges);

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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">ERD Diagram</h2>
            {isSchemaDirty && (
              <Badge
                variant="secondary"
                className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
              >
                Unsaved changes
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Generated ERD diagram and DDL</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Save button */}
          {isSchemaDirty && onSaveSchema && (
            <Button variant="default" size="sm" onClick={onSaveSchema} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Schema
                </>
              )}
            </Button>
          )}

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
      <div className="flex-1 overflow-y-auto p-4">
        {hasSchema ? (
          <Tabs defaultValue="diagram" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="diagram">Diagram</TabsTrigger>
              <TabsTrigger value="ddl">DDL Script</TabsTrigger>
            </TabsList>

            {/* Diagram Tab */}
            <TabsContent value="diagram" className="flex-1 mt-4">
              <Card className="h-[calc(100vh-200px)] overflow-hidden">
                <ERDDiagram
                  initialNodes={nodes}
                  initialEdges={edges}
                  onEntityUpdate={onEntityUpdate}
                />
              </Card>
            </TabsContent>

            {/* DDL Script Tab */}
            <TabsContent value="ddl" className="flex-1 mt-4">
              {ddl ? (
                <Card className="overflow-hidden h-[calc(100vh-200px)]">
                  <Editor
                    height="100%"
                    defaultLanguage="sql"
                    value={ddl}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: "on",
                      renderLineHighlight: "all",
                      scrollbar: {
                        vertical: "visible",
                        horizontal: "visible",
                      },
                    }}
                    theme="vs-dark"
                  />
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No DDL script available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
