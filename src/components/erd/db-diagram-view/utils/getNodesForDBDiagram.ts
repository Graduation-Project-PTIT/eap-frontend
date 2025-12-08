import type { ERDEntity } from "@/api";
import type { Node } from "@xyflow/react";
import type { DBNodeData } from "../DBNode";

const getNodesForDBDiagram = (entities: ERDEntity[]): Node<DBNodeData>[] => {
  return entities.map((entity, index) => ({
    id: `n${index + 1}`,
    position: { x: 0, y: 0 },
    data: { entity, isEditable: true },
    type: "dbNode",
  }));
};

export default getNodesForDBDiagram;
