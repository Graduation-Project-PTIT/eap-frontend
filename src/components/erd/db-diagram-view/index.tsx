import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnectEnd,
  type FinalConnectionState,
} from "@xyflow/react";
import { type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DBNode, { type DBNodeData } from "@/components/erd/db-diagram-view/DBNode";
import DBEdge, { type DBEdgeData } from "@/components/erd/db-diagram-view/DBEdge";
import createDBDiagramEdge from "./utils/createDBDiagramEdge";
import type { DBEntity } from "@/api";

interface DBDiagramProps {
  initialNodes: Node<DBNodeData>[];
  initialEdges: Edge<DBEdgeData>[];
  onEntityUpdate?: (entity: DBEntity) => void;
}

const nodeTypes = {
  dbNode: DBNode,
};

const edgeTypes = {
  dbEdge: DBEdge,
};

const DBDiagram = ({ initialNodes, initialEdges, onEntityUpdate }: DBDiagramProps) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // Sync state when initial props change (e.g., after schema update)
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  // Add onEntityUpdate to node data
  const nodesWithUpdateHandler = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onEntityUpdate,
      },
    }));
  }, [nodes, onEntityUpdate]);

  const onNodesChange: OnNodesChange<Node<DBNodeData>> = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange: OnEdgesChange<Edge<DBEdgeData>> = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (_event, connectionState: FinalConnectionState) => {
      console.log(connectionState);
      const { fromNode, toNode, fromHandle, toHandle } = connectionState;

      // Only create edge if we have both nodes and handles
      if (!fromNode || !toNode || !fromHandle?.id || !toHandle?.id) {
        return;
      }

      // Find the source and target nodes in our nodes array
      const sourceNode = nodes.find((n) => n.id === fromNode.id);
      const targetNode = nodes.find((n) => n.id === toNode.id);

      if (!sourceNode || !targetNode) {
        return;
      }

      // Parse handle IDs to extract attribute information
      // Handle format: "prefix_entityName-attributeName-type" or "prefix_index_entityName-attributeName-type"
      const parseHandleId = (handleId: string) => {
        // Remove prefix
        let attributeId = handleId;
        if (handleId.startsWith("left_rel_")) {
          attributeId = handleId.replace("left_rel_", "");
        } else if (handleId.startsWith("right_rel_")) {
          attributeId = handleId.replace("right_rel_", "");
        } else if (handleId.startsWith("target_rel_")) {
          // Remove "target_rel_" and the index number (e.g., "target_rel_0_")
          attributeId = handleId.replace(/^target_rel_\d+_/, "");
        }

        // Split by dash to get entity, attribute, and type
        const parts = attributeId.split("-");
        if (parts.length < 3) return null;

        // The parts are sanitized (underscores instead of special chars)
        // We keep them as-is since we'll match against sanitized names
        const entityName = parts[0];
        const attributeName = parts[1];
        const attributeType = parts.slice(2).join("-");

        return { entityName, attributeName, attributeType };
      };

      const sourceHandleInfo = parseHandleId(fromHandle.id);
      const targetHandleInfo = parseHandleId(toHandle.id);

      if (!sourceHandleInfo || !targetHandleInfo) {
        console.error("Failed to parse handle IDs");
        return;
      }

      // Find the attributes in the node data
      // Match by sanitizing the attribute name (replacing special chars with underscores)
      const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9]/g, "_");

      const sourceAttribute = sourceNode.data.entity.attributes.find(
        (attr) => sanitizeName(attr.name) === sourceHandleInfo.attributeName,
      );

      const targetAttribute = targetNode.data.entity.attributes.find(
        (attr) => sanitizeName(attr.name) === targetHandleInfo.attributeName,
      );

      if (!sourceAttribute || !targetAttribute) {
        console.error("Failed to find attributes in node data");
        return;
      }

      // Create the new edge using the createEdge utility
      const newEdge = createDBDiagramEdge({
        sourceNode,
        targetNode,
        sourceAttribute,
        targetAttribute,
        sourceHandleId: fromHandle.id,
        targetHandleId: toHandle.id,
      });

      // Add the new edge to the edges state
      setEdges((eds) => [...eds, newEdge]);
    },
    [nodes],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodesWithUpdateHandler}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
export default DBDiagram;
