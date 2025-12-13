import type { Node, Edge } from "@xyflow/react";
import type {
  ERDEntity,
  ERDAttribute,
  ERDNodeData,
  ERDEntityNodeData,
  ERDAttributeNodeData,
  ERDRelationshipNodeData,
  ERDEdgeData,
} from "../types";
import { ERD_NODE_TYPES, ERD_EDGE_TYPES } from "../types";

// ============================================================================
// Types
// ============================================================================

export type Position = { x: number; y: number };

export type HandleIds = {
  sourceHandle: string;
  targetHandle: string;
};

export interface LayoutOptions {
  /** Radius for attribute placement around entities (default: 180) */
  attributeRadius?: number;
  /** Horizontal spacing between entity clusters (default: 500) */
  entitySpacing?: number;
  /** Starting X position (default: 100) */
  startX?: number;
  /** Starting Y position (default: 300) */
  startY?: number;
  /** Additional radius for sub-attributes of composite attributes (default: 100) */
  subAttributeRadiusOffset?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  attributeRadius: 180,
  entitySpacing: 500,
  startX: 100,
  startY: 300,
  subAttributeRadiusOffset: 100,
};

// ============================================================================
// Smart Handle Calculation
// ============================================================================

/**
 * Calculate the optimal source and target handle IDs based on the geometric
 * relationship between two node positions.
 *
 * Handle logic based on angle from source to target:
 * - 315° to 45° (Right side) → Source: right-source, Target: left
 * - 45° to 135° (Bottom side) → Source: bottom-source, Target: top
 * - 135° to 225° (Left side) → Source: left-source, Target: right
 * - 225° to 315° (Top side) → Source: top-source, Target: bottom
 */
export const getSmartHandleIds = (sourcePos: Position, targetPos: Position): HandleIds => {
  // Calculate angle from source to target in radians
  const deltaX = targetPos.x - sourcePos.x;
  const deltaY = targetPos.y - sourcePos.y;
  const angleRad = Math.atan2(deltaY, deltaX);

  // Convert to degrees (0-360 range)
  let angleDeg = (angleRad * 180) / Math.PI;
  if (angleDeg < 0) {
    angleDeg += 360;
  }

  // Determine handles based on angle quadrants
  // Right: 315° to 45° (wraps around 0°)
  if (angleDeg >= 315 || angleDeg < 45) {
    return { sourceHandle: "right-source", targetHandle: "left" };
  }
  // Bottom: 45° to 135°
  if (angleDeg >= 45 && angleDeg < 135) {
    return { sourceHandle: "bottom-source", targetHandle: "top" };
  }
  // Left: 135° to 225°
  if (angleDeg >= 135 && angleDeg < 225) {
    return { sourceHandle: "left-source", targetHandle: "right" };
  }
  // Top: 225° to 315°
  return { sourceHandle: "top-source", targetHandle: "bottom" };
};

// ============================================================================
// Attribute Type Helper
// ============================================================================

const getAttributeType = (attribute: ERDAttribute): ERDAttributeNodeData["type"] => {
  if (attribute.primaryKey) return "key-attribute";
  if (attribute.isComposite) return "composite-attribute";
  if (attribute.isMultivalued) return "multivalued-attribute";
  if (attribute.isDerived) return "derived-attribute";
  return "attribute";
};

// ============================================================================
// Layout Chen Notation - Main Function
// ============================================================================

/**
 * Generate nodes and edges for an ERD diagram using Chen notation layout.
 * Each entity is the center of a cluster with its attributes arranged in a circle.
 *
 * TODO: Implement collision detection for overlapping attributes when there are many attributes
 */
export const layoutChenNotation = (
  entities: ERDEntity[],
  options?: LayoutOptions,
): { nodes: Node<ERDNodeData>[]; edges: Edge<ERDEdgeData>[] } => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const nodes: Node<ERDNodeData>[] = [];
  const edges: Edge<ERDEdgeData>[] = [];

  // Track relationships for later processing
  const relationships: Array<{
    name: string;
    sourceEntity: string;
    targetEntity: string;
    relationType?: ERDRelationshipNodeData["relationType"];
  }> = [];

  // Map to store entity positions for relationship placement
  const entityPositions: Map<string, Position> = new Map();

  // First pass: Create entity and attribute nodes
  entities.forEach((entity, entityIndex) => {
    const entityId = `entity-${entity.name}`;
    const entityX = opts.startX + entityIndex * opts.entitySpacing;
    const entityY = opts.startY;
    const entityPos: Position = { x: entityX, y: entityY };

    entityPositions.set(entity.name, entityPos);

    // Create entity node
    const entityNodeData: ERDEntityNodeData = {
      type: entity.isWeakEntity ? "weak-entity" : "entity",
      entity: entity,
      label: entity.name,
    };

    nodes.push({
      id: entityId,
      position: entityPos,
      data: entityNodeData,
      type: ERD_NODE_TYPES.ENTITY,
    });

    // Create attribute nodes in circular pattern
    const totalAttributes = entity.attributes.length;
    entity.attributes.forEach((attribute, attrIndex) => {
      createAttributeNodesWithLayout(
        nodes,
        edges,
        attribute,
        entity.name,
        entityPos,
        attrIndex,
        totalAttributes,
        opts,
      );

      // Track relationships from foreign keys
      if (attribute.foreignKey && attribute.foreignKeyTable) {
        relationships.push({
          name: attribute.relationshipName || `${entity.name}_${attribute.foreignKeyTable}`,
          sourceEntity: entity.name,
          targetEntity: attribute.foreignKeyTable,
          relationType: attribute.relationType,
        });
      }
    });
  });

  // Second pass: Create relationship nodes and their edges
  const uniqueRelationships = deduplicateRelationships(relationships);

  uniqueRelationships.forEach((rel) => {
    const sourcePos = entityPositions.get(rel.sourceEntity);
    const targetPos = entityPositions.get(rel.targetEntity);

    if (!sourcePos || !targetPos) return;

    const relationshipId = `rel-${rel.sourceEntity}-${rel.targetEntity}`;

    // Position relationship node between the two entities, offset vertically
    const relPos: Position = {
      x: (sourcePos.x + targetPos.x) / 2,
      y: Math.min(sourcePos.y, targetPos.y) - 150,
    };

    const relationshipNodeData: ERDRelationshipNodeData = {
      type: "relationship",
      label: rel.name,
      sourceEntity: rel.sourceEntity,
      targetEntity: rel.targetEntity,
      relationType: rel.relationType,
    };

    nodes.push({
      id: relationshipId,
      position: relPos,
      data: relationshipNodeData,
      type: ERD_NODE_TYPES.RELATIONSHIP,
    });

    // Create edges from source entity to relationship
    const sourceEntityId = `entity-${rel.sourceEntity}`;
    const sourceToRelHandles = getSmartHandleIds(sourcePos, relPos);
    edges.push({
      id: `edge-${sourceEntityId}-${relationshipId}`,
      source: sourceEntityId,
      target: relationshipId,
      sourceHandle: sourceToRelHandles.sourceHandle,
      targetHandle: sourceToRelHandles.targetHandle, // Relationship now has target handles without -source suffix
      type: ERD_EDGE_TYPES.DEFAULT,
      data: {
        sourceLabel: getCardinalityLabel(rel.relationType, "source"),
      },
    });

    // Create edges from relationship to target entity
    const targetEntityId = `entity-${rel.targetEntity}`;
    const relToTargetHandles = getSmartHandleIds(relPos, targetPos);
    edges.push({
      id: `edge-${relationshipId}-${targetEntityId}`,
      source: relationshipId,
      target: targetEntityId,
      sourceHandle: relToTargetHandles.sourceHandle, // Relationship now has source handles with -source suffix
      targetHandle: relToTargetHandles.targetHandle,
      type: ERD_EDGE_TYPES.DEFAULT,
      data: {
        targetLabel: getCardinalityLabel(rel.relationType, "target"),
      },
    });
  });

  return { nodes, edges };
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create attribute nodes with proper circular layout and smart edge handles
 */
const createAttributeNodesWithLayout = (
  nodes: Node<ERDNodeData>[],
  edges: Edge<ERDEdgeData>[],
  attribute: ERDAttribute,
  entityName: string,
  entityPos: Position,
  attrIndex: number,
  totalAttributes: number,
  opts: Required<LayoutOptions>,
  parentAttributeName?: string,
  parentPos?: Position,
  parentAngle?: number,
): void => {
  const attributeId = parentAttributeName
    ? `attr-${entityName}-${parentAttributeName}-${attribute.name}`
    : `attr-${entityName}-${attribute.name}`;

  // Calculate position in circular pattern
  // Start from top (-π/2) and go clockwise
  const angleOffset = (Math.PI * 2) / Math.max(totalAttributes, 1);
  const angle = parentAngle !== undefined ? parentAngle : attrIndex * angleOffset - Math.PI / 2;

  // Use parent position for sub-attributes, otherwise use entity position
  const centerPos = parentPos || entityPos;
  const radius = parentPos ? opts.subAttributeRadiusOffset : opts.attributeRadius;

  const attrPos: Position = {
    x: centerPos.x + Math.cos(angle) * radius,
    y: centerPos.y + Math.sin(angle) * radius,
  };

  const attributeNodeData: ERDAttributeNodeData = {
    type: getAttributeType(attribute),
    attribute: attribute,
    label: attribute.name,
    entityName: entityName,
    parentAttributeName: parentAttributeName,
  };

  nodes.push({
    id: attributeId,
    position: attrPos,
    data: attributeNodeData,
    type: ERD_NODE_TYPES.ATTRIBUTE,
  });

  // Create edge from parent (entity or composite attribute) to this attribute
  const sourceId = parentAttributeName
    ? `attr-${entityName}-${parentAttributeName}`
    : `entity-${entityName}`;
  const sourcePos = parentPos || entityPos;

  const handleIds = getSmartHandleIds(sourcePos, attrPos);

  edges.push({
    id: `edge-${sourceId}-${attributeId}`,
    source: sourceId,
    target: attributeId,
    sourceHandle: handleIds.sourceHandle,
    targetHandle: handleIds.targetHandle,
    type: ERD_EDGE_TYPES.DEFAULT,
    data: {},
  });

  // Handle composite attributes with sub-attributes
  if (attribute.isComposite && attribute.subAttributes && attribute.subAttributes.length > 0) {
    const subAttributeCount = attribute.subAttributes.length;
    const subAngleSpread = Math.PI / 3; // 60 degrees spread for sub-attributes
    const subAngleStart = angle - subAngleSpread / 2;

    attribute.subAttributes.forEach((subAttr, subIndex) => {
      const subAngle =
        subAngleStart + (subAngleSpread / Math.max(subAttributeCount - 1, 1)) * subIndex;

      createAttributeNodesWithLayout(
        nodes,
        edges,
        subAttr,
        entityName,
        entityPos,
        subIndex,
        subAttributeCount,
        opts,
        attribute.name,
        attrPos,
        subAngle,
      );
    });
  }
};

/**
 * Deduplicate relationships (A->B is same as B->A)
 */
const deduplicateRelationships = <T extends { sourceEntity: string; targetEntity: string }>(
  relationships: T[],
): T[] => {
  return relationships.filter(
    (rel, index, self) =>
      index ===
      self.findIndex(
        (r) =>
          (r.sourceEntity === rel.sourceEntity && r.targetEntity === rel.targetEntity) ||
          (r.sourceEntity === rel.targetEntity && r.targetEntity === rel.sourceEntity),
      ),
  );
};

/**
 * Get cardinality label based on relationship type
 */
const getCardinalityLabel = (
  relationType: ERDRelationshipNodeData["relationType"],
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
