import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";
import type { ERDNodeData } from "../diagram-view/ERDNode";
import type { ERDEdgeData } from "../diagram-view/ERDEdge";

const nodeWidth = 360;
const nodeHeight = 180;

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
  nodes: Node<ERDNodeData>[],
  edges: Edge<ERDEdgeData>[],
  direction = "LR",
): {
  nodes: Node<ERDNodeData>[];
  edges: Edge<ERDEdgeData>[];
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

    return newNode as Node<ERDNodeData>;
  });

  return { nodes: newNodes, edges };
};

export default getLayoutedElements;
