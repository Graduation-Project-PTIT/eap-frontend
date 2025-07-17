import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
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
import { type ERDExtractionResult, type ERDEntity } from "@/api/services/evaluation-service";
import EntityNode from "./flow-nodes/EntityNode";
import RelationshipEdge from "./flow-edges/RelationshipEdge";

interface ERDFlowVisualizationProps {
  data: ERDExtractionResult;
  onDataChange?: (data: ERDExtractionResult) => void;
  isEditable?: boolean;
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
}) => {
  // Convert ERD data to React Flow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = data.entities.map((entity) => ({
      id: entity.name,
      type: "entity",
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        entity,
        isEditable,
        onEntityChange: (updatedEntity: ERDEntity) => {
          if (onDataChange) {
            const updatedEntities = data.entities.map((e) =>
              e.name === entity.name ? updatedEntity : e,
            );
            onDataChange({ entities: updatedEntities });
          }
        },
      },
    }));

    const edges: Edge[] = [];

    // Create edges for foreign key relationships
    data.entities.forEach((entity) => {
      entity.attributes.forEach((attr) => {
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
      if (isEditable) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [isEditable, setEdges],
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
    <div className="w-full h-[600px] border rounded-lg bg-background">
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
      </ReactFlow>
    </div>
  );
};

export default ERDFlowVisualization;
