import type { Node, Edge } from "@xyflow/react";
import type { ERDNodeData, ERDEdgeData } from "../types";
import { ERD_EDGE_TYPES } from "../types";
import { isAttributeNode, isRelationshipNode } from "../types";

/**
 * Generate ERD diagram edges from nodes
 * Creates edges connecting:
 * - Entities to their attributes
 * - Composite attributes to their sub-attributes
 * - Entities to relationships
 * - Relationships to target entities
 */
export const getEdgesForERDDiagram = (nodes: Node<ERDNodeData>[]): Edge<ERDEdgeData>[] => {
  const edges: Edge<ERDEdgeData>[] = [];

  // Create edges from entities to their attributes (and composite attributes to sub-attributes)
  nodes.forEach((node) => {
    if (isAttributeNode(node.data)) {
      // If this is a sub-attribute of a composite attribute
      if (node.data.parentAttributeName) {
        const parentAttributeId = `attr-${node.data.entityName}-${node.data.parentAttributeName}`;
        const parentNode = nodes.find((n) => n.id === parentAttributeId);

        if (parentNode) {
          edges.push({
            id: `edge-${parentAttributeId}-${node.id}`,
            source: parentAttributeId,
            target: node.id,
            sourceHandle: "right",
            targetHandle: "left",
            type: ERD_EDGE_TYPES.DEFAULT,
            data: {},
          });
        }
      } else {
        // Regular attribute connected to entity
        const entityNodeId = `entity-${node.data.entityName}`;
        const entityNode = nodes.find((n) => n.id === entityNodeId);

        if (entityNode) {
          edges.push({
            id: `edge-${entityNodeId}-${node.id}`,
            source: entityNodeId,
            target: node.id,
            sourceHandle: "right-source", // Use source handle from entity
            targetHandle: "left",
            type: ERD_EDGE_TYPES.DEFAULT,
            data: {},
          });
        }
      }
    }
  });

  // Create edges for relationships
  nodes.forEach((node) => {
    if (isRelationshipNode(node.data)) {
      const sourceEntityId = `entity-${node.data.sourceEntity}`;
      const targetEntityId = `entity-${node.data.targetEntity}`;

      // Edge from source entity to relationship
      edges.push({
        id: `edge-${sourceEntityId}-${node.id}`,
        source: sourceEntityId,
        target: node.id,
        sourceHandle: "top-source", // Use source handle from entity
        targetHandle: "bottom",
        type: ERD_EDGE_TYPES.DEFAULT,
        data: {
          sourceLabel: getCardinalityLabel(node.data.relationType, "source"),
        },
      });

      // Edge from relationship to target entity
      edges.push({
        id: `edge-${node.id}-${targetEntityId}`,
        source: node.id,
        target: targetEntityId,
        sourceHandle: "right",
        targetHandle: "top", // Use target handle from entity
        type: ERD_EDGE_TYPES.DEFAULT,
        data: {
          targetLabel: getCardinalityLabel(node.data.relationType, "target"),
        },
      });
    }
  });

  return edges;
};

/**
 * Get cardinality label based on relationship type
 */
const getCardinalityLabel = (
  relationType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many" | undefined,
  side: "source" | "target",
): string | undefined => {
  if (!relationType) return undefined;

  switch (relationType) {
    case "one-to-one":
      return "1";
    case "one-to-many":
      return side === "source" ? "1" : "N";
    case "many-to-one":
      return side === "source" ? "N" : "1";
    case "many-to-many":
      return "N";
    default:
      return undefined;
  }
};
