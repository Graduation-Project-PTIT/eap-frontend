import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Share2, Save, Loader2, Network, Database, FileCode } from "lucide-react";
import Editor from "@monaco-editor/react";
import type { DBEntity } from "@/api/services/evaluation-service";
import type { ERDSchema, DiagramType } from "@/api/services/chat-service";
import DBDiagram from "@/components/erd/db-diagram-view";
import ERDDiagram from "@/components/erd/erd-diagram-view";
import getNodesForDBDiagram from "@/components/erd/db-diagram-view/utils/getNodesForDBDiagram";
import { getEdgesForDBDiagram } from "@/components/erd/db-diagram-view/utils/getEdgesForDBDiagram";
import getLayoutedElementsForDBDiagram from "@/components/erd/db-diagram-view/utils/getLayoutedElementsForDBDiagram";
import { layoutChenNotation } from "@/components/erd/erd-diagram-view/utils/layoutChenNotation";
import ShareDiagramDialog from "./ShareDiagramDialog";
import { useCreateDiagram } from "@/api/services/diagram-service";
import { toast } from "@/lib/toast";

interface ERDSidebarProps {
  schema: { entities: DBEntity[] } | null; // Physical DB schema
  erdSchema?: ERDSchema | null; // ERD schema (Chen notation)
  ddl: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onEntityUpdate?: (entity: DBEntity) => void;
  onSaveSchema?: () => void;
  isSchemaDirty?: boolean;
  isSaving?: boolean;
  diagramType?: DiagramType;
  activeTab?: string; // Control which tab is active when opening
}

const ERDSidebar = ({
  schema,
  erdSchema,
  ddl,
  isOpen,
  onToggle,
  onEntityUpdate,
  onSaveSchema,
  isSchemaDirty = false,
  isSaving = false,
  diagramType,
  activeTab,
}: ERDSidebarProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const createDiagram = useCreateDiagram();

  // State for controlling active tab - must be before early return
  const [currentTab, setCurrentTab] = useState<string>("erd");

  // Check schema availability
  const hasPhysicalSchema = schema && schema.entities && schema.entities.length > 0;
  const hasErdSchema = erdSchema && erdSchema.entities && erdSchema.entities.length > 0;
  const hasAnySchema = hasPhysicalSchema || hasErdSchema;

  // Update current tab when activeTab prop changes or sidebar opens
  useEffect(() => {
    console.log(
      "🔄 ERDSidebar effect - isOpen:",
      isOpen,
      "activeTab:",
      activeTab,
      "hasErd:",
      hasErdSchema,
      "hasPhysical:",
      hasPhysicalSchema,
    );
    if (isOpen && activeTab) {
      console.log("📌 Setting currentTab to activeTab:", activeTab);
      setCurrentTab(activeTab);
    } else if (isOpen) {
      // Set default tab when opening without explicit activeTab
      const defaultTab =
        hasErdSchema && !hasPhysicalSchema ? "erd" : hasPhysicalSchema ? "physical" : "erd";
      console.log("📌 Setting currentTab to defaultTab:", defaultTab);
      setCurrentTab(defaultTab);
    }
  }, [isOpen, activeTab, hasErdSchema, hasPhysicalSchema]);

  // Generate Physical DB diagram nodes and edges
  const { dbNodes, dbEdges } = useMemo(() => {
    if (!schema || !schema.entities || schema.entities.length === 0) {
      return { dbNodes: [], dbEdges: [] };
    }

    const initialNodes = getNodesForDBDiagram(schema.entities);
    const initialEdges = getEdgesForDBDiagram(initialNodes);
    const layouted = getLayoutedElementsForDBDiagram(initialNodes, initialEdges);

    return { dbNodes: layouted.nodes, dbEdges: layouted.edges };
  }, [schema]);

  // Generate ERD (Chen notation) diagram nodes and edges
  const { erdNodes, erdEdges } = useMemo(() => {
    if (!erdSchema || !erdSchema.entities || erdSchema.entities.length === 0) {
      console.log("❌ ERD: No schema or empty entities");
      return { erdNodes: [], erdEdges: [] };
    }

    console.log("✅ ERD: Generating layout for", erdSchema.entities.length, "entities");
    const layouted = layoutChenNotation(erdSchema.entities, erdSchema.relationships || [], {
      useDagreLayout: true,
      direction: "LR",
      attributeRadius: 180,
      nodeSeparation: 0,
      rankSeparation: 50,
    });

    console.log(
      "✅ ERD: Generated",
      layouted.nodes.length,
      "nodes and",
      layouted.edges.length,
      "edges",
    );
    return { erdNodes: layouted.nodes, erdEdges: layouted.edges };
  }, [erdSchema]);

  const handleShare = async (formData: {
    title: string;
    description: string;
    visibility: "Public" | "Private" | "Class";
    classId?: string;
  }) => {
    // Check if at least ONE diagram type exists
    const hasERD = erdSchema && erdSchema.entities && erdSchema.entities.length > 0;
    const hasPhysicalDB = schema && schema.entities && schema.entities.length > 0;

    if (!hasERD && !hasPhysicalDB) {
      toast.error("No diagram to share");
      return;
    }

    try {
      await createDiagram.mutateAsync({
        title: formData.title,
        description: formData.description,
        // Include Physical DB schema if it exists
        ...(hasPhysicalDB && { schemaJson: schema }),
        // Include ERD schema if it exists
        ...(hasERD && { erdSchemaJson: erdSchema }),
        // Include DDL if it exists
        ...(ddl && { ddlScript: ddl }),
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

  // Determine header title based on diagram type
  const headerTitle =
    diagramType === "ERD"
      ? "ERD Diagram"
      : diagramType === "PHYSICAL_DB"
        ? "Physical Database"
        : "Diagram";
  const headerSubtitle =
    diagramType === "ERD"
      ? "Conceptual ERD"
      : diagramType === "PHYSICAL_DB"
        ? "Physical database schema and DDL"
        : "Generated diagram";

  // Count available tabs
  const tabCount = (hasErdSchema ? 1 : 0) + (hasPhysicalSchema ? 1 : 0) + (ddl ? 1 : 0);

  return (
    <div className="fixed right-0 top-0 h-screen w-[90vw] max-w-[90vw] bg-background border-l shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{headerTitle}</h2>
            {diagramType && (
              <Badge variant="outline" className="text-xs">
                {diagramType === "ERD" ? "ERD" : "Physical"}
              </Badge>
            )}
            {isSchemaDirty && (
              <Badge
                variant="secondary"
                className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
              >
                Unsaved changes
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{headerSubtitle}</p>
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

          {hasAnySchema && (
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
        {hasAnySchema ? (
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full h-full flex flex-col"
          >
            <TabsList className={`grid w-full max-w-lg grid-cols-${Math.max(tabCount, 2)}`}>
              {hasErdSchema && (
                <TabsTrigger value="erd" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  ERD
                </TabsTrigger>
              )}
              {hasPhysicalSchema && (
                <TabsTrigger value="physical" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Physical DB
                </TabsTrigger>
              )}
              {ddl && (
                <TabsTrigger value="ddl" className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  DDL Script
                </TabsTrigger>
              )}
            </TabsList>

            {/* {console.log("🎨 Rendering ERD TabContent - nodes:", erdNodes.length, "edges:", erdEdges.length)}
                ERD (Chen Notation) Tab */}
            {hasErdSchema && (
              <TabsContent value="erd" className="flex-1 mt-4">
                <Card className="h-[calc(100vh-200px)] overflow-hidden">
                  <ERDDiagram initialNodes={erdNodes} initialEdges={erdEdges} />
                </Card>
              </TabsContent>
            )}

            {/* Physical DB Diagram Tab */}
            {hasPhysicalSchema && (
              <TabsContent value="physical" className="flex-1 mt-4">
                <Card className="h-[calc(100vh-200px)] overflow-hidden">
                  <DBDiagram
                    initialNodes={dbNodes}
                    initialEdges={dbEdges}
                    onEntityUpdate={onEntityUpdate}
                  />
                </Card>
              </TabsContent>
            )}

            {/* DDL Script Tab */}
            {ddl && (
              <TabsContent value="ddl" className="flex-1 mt-4">
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
              </TabsContent>
            )}
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
