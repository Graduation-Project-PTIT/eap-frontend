import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";
import type { DBNodeData } from "../DBNode";
import type { DBEdgeData } from "../DBEdge";

const nodeWidth = 360;
const nodeHeight = 180;

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export interface DBLayoutResult {
  type: "PHYSICAL_DB";
  nodes: Node<DBNodeData>[];
  edges: Edge<DBEdgeData>[];
}

const getLayoutedElementsForDBDiagram = (
  nodes: Node<DBNodeData>[],
  edges: Edge<DBEdgeData>[],
  direction = "LR",
): DBLayoutResult => {
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

    return newNode as Node<DBNodeData>;
  });

  return { type: "PHYSICAL_DB", nodes: newNodes, edges };
};

export default getLayoutedElementsForDBDiagram;
