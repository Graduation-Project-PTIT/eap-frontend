import { useState, useCallback } from "react";
import { ReactFlow, applyNodeChanges, applyEdgeChanges, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
} from "@xyflow/react";
import { erdNodeTypes } from "./ERDNode";
import ERDEdge from "./ERDEdge";
import type { ERDNodeData, ERDEdgeData } from "./types";
import { updateEdgeHandlesForNode } from "./utils/updateEdgeHandles";

interface ERDDiagramProps {
  initialNodes: Node<ERDNodeData>[];
  initialEdges: Edge<ERDEdgeData>[];
}

const edgeTypes = {
  erdEdge: ERDEdge,
};

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

  /**
   * Handle node drag stop event to recalculate edge handles.
   * This ensures edges "snap" to the correct handle based on the
   * new geometric relationship between nodes after dragging.
   */
  const onNodeDragStop: OnNodeDrag<Node<ERDNodeData>> = useCallback(
    (_event, node, currentNodes) => {
      // Update edges for the dragged node using the current nodes from the event
      setEdges((currentEdges) => updateEdgeHandlesForNode(node.id, currentNodes, currentEdges));
    },
    [],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={erdNodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default ERDDiagram;
