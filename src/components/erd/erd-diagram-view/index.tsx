import { useState, useCallback } from "react";
import { ReactFlow, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type Node, type Edge, type OnNodesChange, type OnEdgesChange } from "@xyflow/react";
import type { ERDNodeData } from "./ERDNode";
import type { ERDEdgeData } from "./ERDEdge";

interface ERDDiagramProps {
  initialNodes: Node<ERDNodeData>[];
  initialEdges: Edge<ERDEdgeData>[];
}

const ERDDiagram = ({ initialNodes, initialEdges }: ERDDiagramProps) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange: OnNodesChange<Node<ERDNodeData>> = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange: OnEdgesChange<Edge<ERDEdgeData>> = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
    </div>
  );
};

export default ERDDiagram;
