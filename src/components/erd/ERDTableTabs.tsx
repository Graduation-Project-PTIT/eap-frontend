import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Grid3x3, TableIcon } from "lucide-react";
import {
  type DBExtractionResult,
  type DBEntity,
  type ERDExtractionResult,
} from "@/api/services/evaluation-service";
import EntityTable from "./table-view/ERDEntityTable";
import ERDDiagram from "./erd-diagram-view";
import {
  layoutChenNotation,
  type ERDLayoutResult,
} from "./erd-diagram-view/utils/layoutChenNotation";
import DBDiagram from "./db-diagram-view";
import type { DBLayoutResult } from "./db-diagram-view/utils/getLayoutedElementsForDBDiagram";
import getLayoutedElementsForDBDiagram from "./db-diagram-view/utils/getLayoutedElementsForDBDiagram";
import getNodesForDBDiagram from "./db-diagram-view/utils/getNodesForDBDiagram";
import { getEdgesForDBDiagram } from "./db-diagram-view/utils/getEdgesForDBDiagram";

type ViewMode = "table" | "diagram";

interface ERDTableTabsProps {
  data: DBExtractionResult | ERDExtractionResult;
  onDataChange?: (data: DBExtractionResult | ERDExtractionResult) => void;
  isEditable?: boolean;
  className?: string;
}

const ERDTableTabs: React.FC<ERDTableTabsProps> = ({
  data,
  onDataChange,
  isEditable = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<string>(data.entities[0]?.name || "");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [layoutResult, setLayoutResult] = useState<ERDLayoutResult | DBLayoutResult>(() => {
    if (data.type === "ERD") {
      return layoutChenNotation(data.entities, data.relationships, {
        useDagreLayout: true,
        direction: "LR", // Left-to-right layout
        attributeRadius: 180,
        nodeSeparation: 0,
        rankSeparation: 50,
      });
    } else {
      const nodes = getNodesForDBDiagram(data.entities);
      return getLayoutedElementsForDBDiagram(nodes, getEdgesForDBDiagram(nodes));
    }
  });

  useEffect(() => {
    if (data.type === "ERD") {
      const newLayout = layoutChenNotation(data.entities, data.relationships, {
        useDagreLayout: true,
        direction: "LR", // Left-to-right layout
        attributeRadius: 180,
        nodeSeparation: 0,
        rankSeparation: 50,
      });
      setLayoutResult(newLayout);
    }
  }, [data]);

  // Update active tab when data changes
  useEffect(() => {
    if (!activeTab && data.entities.length > 0) {
      setActiveTab(data.entities[0].name);
    }
  }, [data.entities, activeTab]);

  const handleEntityChange = (entityName: string, updatedEntity: DBEntity) => {
    if (onDataChange && data.type === "PHYSICAL_DB") {
      const updatedEntities = data.entities.map((e) => (e.name === entityName ? updatedEntity : e));
      onDataChange({
        type: "PHYSICAL_DB",
        entities: updatedEntities,
        ddlScript: data.ddlScript,
        mermaidDiagram: data.mermaidDiagram,
      });
    }
  };

  const handleDeleteEntity = (entityName: string) => {
    if (onDataChange && data.type === "PHYSICAL_DB") {
      const updatedEntities = data.entities.filter((e) => e.name !== entityName);
      onDataChange({
        type: "PHYSICAL_DB",
        entities: updatedEntities,
        ddlScript: data.ddlScript,
        mermaidDiagram: data.mermaidDiagram,
      });

      // Switch to first available tab
      if (activeTab === entityName && updatedEntities.length > 0) {
        setActiveTab(updatedEntities[0].name);
      }
    }
  };

  if (data.entities.length === 0) {
    return (
      <div className={className || "w-full h-[55vh] border rounded-lg bg-background"}>
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Entities Found</h3>
          <p className="text-gray-500">
            No entities are available to display. Please complete the extraction step first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className || "w-full h-[55vh] border rounded-lg bg-background"}>
      <div className="h-full flex flex-col">
        {/* View Toggle Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">ERD Structure</h3>
            <Badge variant="outline" className="text-xs">
              {data.entities.length} entities
            </Badge>
          </div>

          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-3"
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button
              variant={viewMode === "diagram" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("diagram")}
              className="h-8 px-3"
            >
              <Grid3x3 className="h-4 w-4 mr-1" />
              Diagram
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "table" ? (
            <div className="h-full p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="flex w-full overflow-x-auto">
                  {data.entities.map((entity) => (
                    <TabsTrigger
                      key={entity.name}
                      value={entity.name}
                      className="flex items-center space-x-2"
                    >
                      <Database className="h-4 w-4" />
                      <span>{entity.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {entity.attributes.length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {data.entities.map((entity) => (
                  <TabsContent key={entity.name} value={entity.name} className="mt-4 h-full">
                    <EntityTable
                      entity={entity}
                      isEditable={isEditable}
                      availableEntities={data.entities.map((e) => e.name)}
                      onEntityChange={(updatedEntity) =>
                        handleEntityChange(entity.name, updatedEntity)
                      }
                      onEntityDelete={() => handleDeleteEntity(entity.name)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ) : (
            <div className="h-full w-full">
              {layoutResult.type === "PHYSICAL_DB" && (
                <DBDiagram initialNodes={layoutResult.nodes} initialEdges={layoutResult.edges} />
              )}
              {layoutResult.type === "ERD" && (
                <ERDDiagram initialNodes={layoutResult.nodes} initialEdges={layoutResult.edges} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ERDTableTabs;
