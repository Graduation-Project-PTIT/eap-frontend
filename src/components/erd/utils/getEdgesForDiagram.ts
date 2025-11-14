import type { Node, Edge } from "@xyflow/react";
import type { ERDNodeData } from "../diagram-view/ERDNode";
import createEdge from "./createEdge";
import type { ERDEdgeData } from "../diagram-view/ERDEdge";

export const getEdgesForDiagram = (nodes: Node<ERDNodeData>[]) => {
  const edges: Edge<ERDEdgeData>[] = [];

  nodes.forEach((sourceNode) => {
    const entity = sourceNode.data.entity;

    entity.attributes.forEach((attribute) => {
      if (attribute.foreignKey && attribute.foreignKeyTable) {
        const targetNode = nodes.find((n) => n.data.entity.name === attribute.foreignKeyTable);

        if (targetNode) {
          // Find the target attribute (usually the PK of the target table)
          const targetAttribute = targetNode.data.entity.attributes.find(
            (attr) => attr.primaryKey || attr.name === attribute.foreignKeyAttribute,
          );

          if (targetAttribute) {
            const edge = createEdge({
              sourceNode,
              targetNode,
              targetAttribute,
              sourceAttribute: attribute,
            });

            edges.push(edge);
          }
        }
      }
    });
  });

  return edges;
};
