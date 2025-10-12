import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from "reactflow";
import type { Connection, NodeProps, EdgeProps } from "reactflow";
import "reactflow/dist/style.css";

import type { ERDExtractionResult, ERDEntity } from "@/api/services/evaluation-service";
import ERDEntityNode from "./ERDEntityNode";
import ERDRelationshipEdge from "./ERDRelationshipEdge";
import ERDDiagramControls from "./ERDDiagramControls";
import ERDEntityEditDialog from "./ERDEntityEditDialog";
import ERDDiagramHelp from "./ERDDiagramHelp";
import {
  transformToReactFlow,
  transformFromReactFlow,
  updateEntityInNodes,
  addEntityNode,
  removeEntityNode,
} from "../utils/erdDataTransformer";
import type { ERDNode, ERDNodeData, ERDEdgeData } from "../utils/erdDataTransformer";
import { autoLayoutNodes } from "../utils/layoutUtils";

interface ERDDiagramCanvasProps {
  data: ERDExtractionResult;
  onDataChange?: (data: ERDExtractionResult) => void;
  isEditable?: boolean;
  className?: string;
  onEntityEdit?: (entityName: string) => void;
  onEntityAdd?: () => void;
}

// We'll create the node and edge types with handlers inside the component

const ERDDiagramCanvasContent: React.FC<ERDDiagramCanvasProps> = ({
  data,
  onDataChange,
  isEditable = false,
  className,
  onEntityEdit,
  onEntityAdd,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editingEntity, setEditingEntity] = useState<ERDEntity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Initialize nodes and edges from data
  useEffect(() => {
    if (data && data.entities.length > 0) {
      const { nodes: initialNodes, edges: initialEdges } = transformToReactFlow(data);
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [data, setNodes, setEdges]);

  // Define handlers first
  const handleAutoLayout = useCallback(() => {
    setNodes((nds) => autoLayoutNodes(nds as ERDNode[], edges));
  }, [edges, setNodes]);

  // Define edge delete handler first
  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      if (!isEditable) return;

      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [isEditable, setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isEditable || !params.source || !params.target) return;

      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}-${Date.now()}`,
        type: "erdRelationship",
        data: {
          fromAttribute: "id", // Default, should be configurable
          toAttribute: "id",
          relationType: "many-to-one",
          label: "N:1",
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [isEditable, setEdges],
  );

  const handleEntityEdit = useCallback(
    (entityName: string) => {
      const entity = data.entities.find((e) => e.name === entityName);
      if (entity) {
        setEditingEntity(entity);
        setIsEditDialogOpen(true);
      }
      onEntityEdit?.(entityName);
    },
    [data.entities, onEntityEdit],
  );

  const handleEntitySave = useCallback(
    (updatedEntity: ERDEntity) => {
      if (!onDataChange) return;

      const updatedEntities = data.entities.map((e) =>
        e.name === editingEntity?.name ? updatedEntity : e,
      );

      onDataChange({
        entities: updatedEntities,
        ddlScript: data.ddlScript,
        mermaidDiagram: data.mermaidDiagram,
      });

      // Update the node in the diagram
      setNodes((nds) =>
        updateEntityInNodes(nds as ERDNode[], editingEntity?.name || "", updatedEntity),
      );

      setEditingEntity(null);
      setIsEditDialogOpen(false);
    },
    [data.entities, editingEntity, onDataChange, setNodes],
  );

  const handleAddEntity = useCallback(() => {
    if (!onDataChange) return;

    const newEntity: ERDEntity = {
      name: `Entity_${data.entities.length + 1}`,
      attributes: [
        {
          name: "id",
          type: "INT",
          primaryKey: true,
          foreignKey: false,
          unique: true,
          nullable: false,
        },
      ],
    };

    const updatedEntities = [...data.entities, newEntity];
    onDataChange({
      entities: updatedEntities,
      ddlScript: data.ddlScript,
      mermaidDiagram: data.mermaidDiagram,
    });

    // Add the node to the diagram
    setNodes((nds) => addEntityNode(nds as ERDNode[], newEntity));

    onEntityAdd?.();
  }, [data.entities, onDataChange, onEntityAdd, setNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEditable) return;

      // Ctrl/Cmd + N: Add new entity
      if ((event.ctrlKey || event.metaKey) && event.key === "n") {
        event.preventDefault();
        handleAddEntity();
      }

      // Ctrl/Cmd + L: Auto layout
      if ((event.ctrlKey || event.metaKey) && event.key === "l") {
        event.preventDefault();
        handleAutoLayout();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEditable, handleAddEntity, handleAutoLayout]);

  const handleEntityDelete = useCallback(
    (entityName: string) => {
      if (!isEditable) return;

      setNodes((nds) => removeEntityNode(nds as ERDNode[], entityName));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== entityName && edge.target !== entityName),
      );
    },
    [isEditable, setNodes, setEdges],
  );

  // Edge delete handler is defined above

  const handleAddAttribute = useCallback(
    (entityName: string) => {
      // This would typically open a dialog to add attributes
      // For now, we'll just trigger the entity edit
      handleEntityEdit(entityName);
    },
    [handleEntityEdit],
  );

  const handleExport = useCallback(() => {
    // Export diagram as JSON or image
    const exportData = {
      nodes,
      edges,
      data: transformFromReactFlow(nodes as ERDNode[]),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "erd-diagram.json";
    link.click();

    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Create stable node and edge types with handlers
  const nodeTypesWithHandlers = {
    erdEntity: (props: NodeProps<ERDNodeData>) => (
      <ERDEntityNode
        {...props}
        data={{
          ...props.data,
          onEdit: handleEntityEdit,
          onDelete: handleEntityDelete,
          onAddAttribute: handleAddAttribute,
          isEditable,
        }}
      />
    ),
  };

  const edgeTypesWithHandlers = {
    erdRelationship: (props: EdgeProps<ERDEdgeData>) => (
      <ERDRelationshipEdge
        {...props}
        data={{
          fromAttribute: props.data?.fromAttribute || "",
          toAttribute: props.data?.toAttribute || "",
          relationType: props.data?.relationType || "many-to-one",
          label: props.data?.label,
          onDelete: handleEdgeDelete,
          isEditable,
        }}
      />
    ),
  };

  return (
    <div className={className || "w-full h-[60vh] border rounded-lg bg-background"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypesWithHandlers}
        edgeTypes={edgeTypesWithHandlers}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        deleteKeyCode={isEditable ? ["Backspace", "Delete"] : []}
        multiSelectionKeyCode={isEditable ? ["Meta", "Ctrl"] : []}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#6366f1"
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white border rounded"
        />

        <ERDDiagramControls
          onAutoLayout={handleAutoLayout}
          onAddEntity={handleAddEntity}
          onExport={handleExport}
          isEditable={isEditable}
        />

        <ERDDiagramHelp isEditable={isEditable} />
      </ReactFlow>

      {/* Entity Edit Dialog */}
      <ERDEntityEditDialog
        entity={editingEntity}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingEntity(null);
        }}
        onSave={handleEntitySave}
        availableEntities={data.entities.map((e) => e.name)}
      />
    </div>
  );
};

const ERDDiagramCanvas: React.FC<ERDDiagramCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ERDDiagramCanvasContent {...props} />
    </ReactFlowProvider>
  );
};

export default ERDDiagramCanvas;
