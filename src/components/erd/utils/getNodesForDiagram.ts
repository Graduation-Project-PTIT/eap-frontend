import type { ERDEntity } from "@/api";
import type { Node } from "@xyflow/react";
import type { ERDNodeData } from "../diagram-view/ERDNode";

const getNodesForDiagram = (entities: ERDEntity[]): Node<ERDNodeData>[] => {
  return entities.map((entity, index) => ({
    id: `n${index + 1}`,
    position: { x: 0, y: 0 },
    data: { entity, isEditable: true },
    type: "erdNode",
  }));
};

export default getNodesForDiagram;
