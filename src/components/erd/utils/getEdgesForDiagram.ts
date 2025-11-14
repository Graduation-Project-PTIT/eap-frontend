import type { Node, Edge } from "@xyflow/react";
import type { ERDNodeData } from "../diagram-view/ERDNode";
import { createLeftHandleId, createTargetHandleId } from "../diagram-view/handle-constants";
import type { ERDAttribute } from "../ERDTableTabs";
import type { ERDEdgeData } from "../diagram-view/ERDEdge";

const getRelationMultiLabel = (relationType: ERDAttribute["relationType"]): ERDEdgeData => {
  switch (relationType) {
    case "one-to-one":
      return {
        sourceLabel: "1",
        targetLabel: "1",
      };
    case "one-to-many":
      return {
        sourceLabel: "1",
        targetLabel: "N",
      };
    case "many-to-one":
      return {
        sourceLabel: "N",
        targetLabel: "1",
      };
    default:
      return {
        sourceLabel: "N",
        targetLabel: "N",
      };
  }
};

export const getEdgesForDiagram = (nodes: Node<ERDNodeData>[]) => {
  const edges: Edge[] = [];

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
            // Create handle IDs using the new format
            const sourceHandleId = createLeftHandleId(entity.name, attribute.name, attribute.type);

            const targetHandleId = createTargetHandleId(
              targetNode.data.entity.name,
              targetAttribute.name,
              targetAttribute.type,
              0,
            );

            const relationType = attribute.relationType;

            edges.push({
              id: `${sourceNode.id}-${attribute.name}-${targetNode.id}`,
              source: sourceNode.id,
              target: targetNode.id,
              sourceHandle: sourceHandleId,
              targetHandle: targetHandleId,
              type: "erdEdge",
              data: getRelationMultiLabel(relationType),
              style: {
                stroke: "#333",
                strokeWidth: 2,
                zIndex: 0,
              },
            });
          }
        }
      }
    });
  });

  return edges;
};
