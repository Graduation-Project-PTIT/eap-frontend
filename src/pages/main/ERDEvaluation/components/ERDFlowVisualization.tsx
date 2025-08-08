import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import { type ERDExtractionResult, type ERDEntity } from "@/api/services/evaluation-service";
import EntityNode from "./flow-nodes/EntityNode";
import RelationshipEdge from "./flow-edges/RelationshipEdge";

interface ERDFlowVisualizationProps {
  data: ERDExtractionResult;
  onDataChange?: (data: ERDExtractionResult) => void;
  isEditable?: boolean;
  className?: string;
}

// Custom node types
const nodeTypes: NodeTypes = {
  entity: EntityNode,
};

// Custom edge types
const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

// Layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 200;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const ERDFlowVisualization: React.FC<ERDFlowVisualizationProps> = ({
  data,
  onDataChange,
  isEditable = false,
  className,
}) => {
  // Undo functionality
  const [history, setHistory] = useState<ERDExtractionResult[]>([data]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoingRef = useRef(false);

  // Add current data to history when it changes (but not during undo)
  useEffect(() => {
    if (
      !isUndoingRef.current &&
      data &&
      JSON.stringify(data) !== JSON.stringify(history[historyIndex])
    ) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(data);

      // Limit history to 50 entries to prevent memory issues
      const maxHistorySize = 50;
      if (newHistory.length > maxHistorySize) {
        newHistory.splice(0, newHistory.length - maxHistorySize);
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    isUndoingRef.current = false;
  }, [data, history, historyIndex]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && onDataChange) {
      const previousIndex = historyIndex - 1;
      const previousData = history[previousIndex];
      isUndoingRef.current = true;
      setHistoryIndex(previousIndex);
      onDataChange(previousData);
    }
  }, [historyIndex, history, onDataChange]);

  // Keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      }
    };

    if (isEditable) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isEditable, handleUndo]);
  // Convert ERD data to React Flow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const availableEntities = data.entities.map((e) => e.name);

    const nodes: Node[] = data.entities.map((entity) => ({
      id: entity.name,
      type: "entity",
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        entity,
        isEditable,
        availableEntities,
        onEntityChange: (updatedEntity: ERDEntity) => {
          if (onDataChange) {
            const updatedEntities = data.entities.map((e) =>
              e.name === entity.name ? updatedEntity : e,
            );
            onDataChange({ entities: updatedEntities });
          }
        },
        onEntityDelete: () => {
          if (onDataChange) {
            const updatedEntities = data.entities.filter((e) => e.name !== entity.name);
            // Also remove any foreign key references to this entity
            const cleanedEntities = updatedEntities.map((e) => ({
              ...e,
              attributes: e.attributes.map((attr) =>
                attr.foreignKeyTable === entity.name
                  ? {
                      ...attr,
                      foreignKey: false,
                      foreignKeyTable: undefined,
                      foreignKeyAttribute: undefined,
                      relationType: undefined,
                    }
                  : attr,
              ),
            }));
            onDataChange({ entities: cleanedEntities });
          }
        },
      },
    }));

    const edges: Edge[] = [];

    // Create edges for foreign key relationships
    data.entities.forEach((entity) => {
      entity.attributes.forEach((attr, attrIndex) => {
        if (attr.foreignKey && attr.foreignKeyTable) {
          const edgeId = `${entity.name}-${attr.foreignKeyTable}-${attr.name}`;
          edges.push({
            id: edgeId,
            source: entity.name,
            target: attr.foreignKeyTable,
            type: "relationship",
            data: {
              relationship: attr.relationType || "many-to-one",
              sourceAttribute: attr.name,
              targetAttribute: attr.foreignKeyAttribute || "id",
              isEditable,
              onRelationshipChange: (newRelationship: string) => {
                if (onDataChange) {
                  const updatedEntities = data.entities.map((e) => {
                    if (e.name === entity.name) {
                      return {
                        ...e,
                        attributes: e.attributes.map((a, i) =>
                          i === attrIndex
                            ? {
                                ...a,
                                relationType: newRelationship as
                                  | "one-to-one"
                                  | "one-to-many"
                                  | "many-to-one"
                                  | "many-to-many",
                              }
                            : a,
                        ),
                      };
                    }
                    return e;
                  });
                  onDataChange({ entities: updatedEntities });
                }
              },
              onRelationshipDelete: () => {
                if (onDataChange) {
                  const updatedEntities = data.entities.map((e) => {
                    if (e.name === entity.name) {
                      return {
                        ...e,
                        attributes: e.attributes.map((a, i) =>
                          i === attrIndex
                            ? {
                                ...a,
                                foreignKey: false,
                                foreignKeyTable: undefined,
                                foreignKeyAttribute: undefined,
                                relationType: undefined,
                              }
                            : a,
                        ),
                      };
                    }
                    return e;
                  });
                  onDataChange({ entities: updatedEntities });
                }
              },
            },
            label: attr.relationType || "FK",
          });
        }
      });
    });

    return getLayoutedElements(nodes, edges);
  }, [data, isEditable, onDataChange]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (isEditable && onDataChange && params.source && params.target) {
        // Create a new foreign key relationship when connecting nodes
        const sourceEntity = data.entities.find((e) => e.name === params.source);
        const targetEntity = data.entities.find((e) => e.name === params.target);

        if (sourceEntity && targetEntity) {
          // Add a foreign key attribute to the source entity
          const newAttribute = {
            name: `${targetEntity.name.toLowerCase()}_id`,
            type: "INT",
            primaryKey: false,
            foreignKey: true,
            unique: false,
            nullable: false,
            foreignKeyTable: targetEntity.name,
            foreignKeyAttribute: "id",
            relationType: "many-to-one" as const,
          };

          const updatedSourceEntity = {
            ...sourceEntity,
            attributes: [...sourceEntity.attributes, newAttribute],
          };

          const updatedEntities = data.entities.map((e) =>
            e.name === sourceEntity.name ? updatedSourceEntity : e,
          );

          onDataChange({ entities: updatedEntities });
        }
      }
    },
    [isEditable, onDataChange, data.entities],
  );

  // Auto-layout when data changes
  React.useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className={className || "w-full h-[55vh] border rounded-lg bg-background"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={isEditable}
        nodesConnectable={isEditable}
        elementsSelectable={isEditable}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "entity":
                return "#3b82f6";
              default:
                return "#64748b";
            }
          }}
          className="!bg-background"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

        {/* Undo Button */}
        {isEditable && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="bg-background/80 backdrop-blur-sm"
              title={`Undo (Ctrl+Z / Cmd+Z) - ${historyIndex} steps available`}
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo {historyIndex > 0 && `(${historyIndex})`}
            </Button>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default ERDFlowVisualization;
