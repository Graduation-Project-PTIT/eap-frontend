import type { ERDEntity } from "@/api";

const getNodesForDiagram = (entities: ERDEntity[]) => {
  return entities.map((entity, index) => ({
    id: `n${index + 1}`,
    position: { x: 0, y: 0 },
    data: { entity, isEditable: true },
    type: "erdNode",
  }));
};

export default getNodesForDiagram;
