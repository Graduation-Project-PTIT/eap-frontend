import { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ERDNode, { type ERDNodeData } from "@/components/erd/diagram-view/ERDNode";
import dagre from "@dagrejs/dagre";
import mockData from "./mock";
import { getEdgesForDiagram } from "@/components/erd/utils/getEdgesForDiagram";

const initialNodes: Node<ERDNodeData>[] = mockData.entities.map((entity, index) => ({
  id: `n${index + 1}`,
  position: { x: 0, y: 0 },
  data: { entity, isEditable: true },
  type: "erdNode",
}));

const initialEdges: Edge[] = getEdgesForDiagram(initialNodes);

const nodeTypes = {
  erdNode: ERDNode,
};

const nodeWidth = 360;
const nodeHeight = 180;

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB",
): {
  nodes: Node[];
  edges: Edge[];
} => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      position: {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y,
      },
    };

    return newNode as Node;
  });

  return { nodes: newNodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges,
  "LR",
);

const ERDDiagram = () => {
  const [nodes, setNodes] = useState(layoutedNodes);
  const [edges, setEdges] = useState(layoutedEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
export default ERDDiagram;
