import { Position } from "reactflow";
import type { Node, Edge } from "reactflow";
import type { ERDExtractionResult, ERDEntity } from "@/api/services/evaluation-service";

export interface ERDNodeData {
  entity: ERDEntity;
  isEditing?: boolean;
  onEdit?: (entityName: string) => void;
  onDelete?: (entityName: string) => void;
  onAddAttribute?: (entityName: string) => void;
  isEditable?: boolean;
}

export interface ERDEdgeData {
  fromAttribute: string;
  toAttribute: string;
  relationType: string;
  label?: string;
  onDelete?: (edgeId: string) => void;
  isEditable?: boolean;
}

export type ERDNode = Node<ERDNodeData>;
export type ERDEdge = Edge<ERDEdgeData>;

/**
 * Convert ERDExtractionResult to React Flow nodes and edges
 */
export function transformToReactFlow(data: ERDExtractionResult): {
  nodes: ERDNode[];
  edges: ERDEdge[];
} {
  const nodes: ERDNode[] = [];
  const edges: ERDEdge[] = [];

  // Create nodes for each entity
  data.entities.forEach((entity, index) => {
    const node: ERDNode = {
      id: entity.name,
      type: "erdEntity",
      position: calculateInitialPosition(index, data.entities.length),
      data: {
        entity,
        isEditing: false,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    nodes.push(node);
  });

  // Create edges for relationships (foreign keys)
  data.entities.forEach((entity) => {
    entity.attributes.forEach((attribute) => {
      if (attribute.foreignKey && attribute.foreignKeyTable && attribute.foreignKeyAttribute) {
        const edge: ERDEdge = {
          id: `${entity.name}-${attribute.name}-${attribute.foreignKeyTable}-${attribute.foreignKeyAttribute}`,
          source: entity.name,
          target: attribute.foreignKeyTable,
          type: "erdRelationship",
          data: {
            fromAttribute: attribute.name,
            toAttribute: attribute.foreignKeyAttribute,
            relationType: attribute.relationType || "many-to-one",
            label: getRelationshipLabel(attribute.relationType || "many-to-one"),
          },
          animated: false,
          style: { stroke: "#6366f1", strokeWidth: 2 },
        };
        edges.push(edge);
      }
    });
  });

  return { nodes, edges };
}

/**
 * Convert React Flow nodes back to ERDExtractionResult
 */
export function transformFromReactFlow(nodes: ERDNode[]): ERDExtractionResult {
  const entities: ERDEntity[] = nodes.map((node) => node.data.entity);
  return { entities };
}

/**
 * Calculate initial position for entity nodes
 */
function calculateInitialPosition(index: number, totalEntities: number): { x: number; y: number } {
  const cols = Math.ceil(Math.sqrt(totalEntities));
  const row = Math.floor(index / cols);
  const col = index % cols;

  return {
    x: col * 300 + 50,
    y: row * 200 + 50,
  };
}

/**
 * Get relationship label based on type
 */
function getRelationshipLabel(relationType: string): string {
  switch (relationType) {
    case "one-to-one":
      return "1:1";
    case "one-to-many":
      return "1:N";
    case "many-to-one":
      return "N:1";
    case "many-to-many":
      return "N:N";
    default:
      return "";
  }
}

/**
 * Update entity in nodes array
 */
export function updateEntityInNodes(
  nodes: ERDNode[],
  entityName: string,
  updatedEntity: ERDEntity,
): ERDNode[] {
  return nodes.map((node) => {
    if (node.id === entityName) {
      return {
        ...node,
        id: updatedEntity.name, // Update ID if name changed
        data: {
          ...node.data,
          entity: updatedEntity,
        },
      };
    }
    return node;
  });
}

/**
 * Add new entity node
 */
export function addEntityNode(nodes: ERDNode[], entity: ERDEntity): ERDNode[] {
  const newNode: ERDNode = {
    id: entity.name,
    type: "erdEntity",
    position: calculateInitialPosition(nodes.length, nodes.length + 1),
    data: {
      entity,
      isEditing: false,
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };

  return [...nodes, newNode];
}

/**
 * Remove entity node
 */
export function removeEntityNode(nodes: ERDNode[], entityName: string): ERDNode[] {
  return nodes.filter((node) => node.id !== entityName);
}
