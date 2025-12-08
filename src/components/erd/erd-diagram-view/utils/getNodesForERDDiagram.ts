import type { ERDEntity } from "@/api";
import type { Node } from "@xyflow/react";
import type { ERDNodeData } from "../ERDNode";

export const getNodesForERDDiagram = (entities: ERDEntity[]): Node<ERDNodeData>[] => {
  return entities.map((entity, index) => ({
    id: `n${index + 1}`,
    position: { x: 0, y: 0 },
    data: { entity, isEditable: true },
    type: "erdNode",
  }));
};
