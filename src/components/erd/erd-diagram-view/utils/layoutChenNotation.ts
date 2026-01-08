import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";
import type {
  ERDEntity,
  ERDAttribute,
  ERDNodeData,
  ERDEntityNodeData,
  ERDAttributeNodeData,
  ERDRelationshipNodeData,
  ERDEdgeData,
  ERDRelationship,
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
  /** Horizontal spacing between entity clusters - used for non-dagre layout (default: 500) */
  entitySpacing?: number;
  /** Starting X position - used for non-dagre layout (default: 100) */
  startX?: number;
  /** Starting Y position - used for non-dagre layout (default: 300) */
  startY?: number;
  /** Additional radius for sub-attributes of composite attributes (default: 100) */
  subAttributeRadiusOffset?: number;
  /** Enable dagre layout for automatic graph positioning (default: true) */
  useDagreLayout?: boolean;
  /** Dagre layout direction: 'TB' (top-bottom), 'LR' (left-right), 'BT', 'RL' (default: 'LR') */
  direction?: "TB" | "LR" | "BT" | "RL";
  /** Horizontal separation between nodes in dagre layout (default: 100) */
  nodeSeparation?: number;
  /** Vertical separation between ranks in dagre layout (default: 150) */
  rankSeparation?: number;
  /** Padding around entity sections for dagre node size calculation (default: 50) */
  entityPadding?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  attributeRadius: 180,
  entitySpacing: 500,
  startX: 100,
  startY: 300,
  subAttributeRadiusOffset: 100,
  useDagreLayout: true,
  direction: "LR",
  nodeSeparation: 100,
  rankSeparation: 150,
  entityPadding: 50,
};

// Size of relationship diamond node (from ERDNode.tsx)
const RELATIONSHIP_NODE_SIZE = 160;

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
// Dagre Layout Helpers
// ============================================================================

/**
 * Calculate the bounding box size for an entity section (entity + its attributes in a circle).
 * This is used to tell dagre how much space each entity "super node" needs.
 */
const calculateEntitySectionSize = (
  attributeCount: number,
  attributeRadius: number,
  padding: number,
): { width: number; height: number } => {
  // The entity section is a circle with the entity at center and attributes around it
  // Diameter = 2 * attributeRadius + some padding for the attribute nodes themselves
  const attributeNodeSize = 100; // Approximate size of attribute ellipse
  const diameter = attributeRadius * 2 + attributeNodeSize + padding * 2;

  // If no attributes, just use a minimum size for the entity node
  if (attributeCount === 0) {
    return { width: 200, height: 100 };
  }

  return { width: diameter, height: diameter };
};

/**
 * Build a dagre graph for layout calculation.
 * Entity sections and relationships are nodes; edges connect them.
 */
const buildDagreGraph = (
  entities: ERDEntity[],
  relationships: ERDRelationship[],
  opts: Required<LayoutOptions>,
): dagre.graphlib.Graph => {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Configure dagre graph
  dagreGraph.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSeparation,
    ranksep: opts.rankSeparation,
  });

  // Add entity section nodes
  entities.forEach((entity) => {
    const size = calculateEntitySectionSize(
      entity.attributes.length,
      opts.attributeRadius,
      opts.entityPadding,
    );
    dagreGraph.setNode(`entity-${entity.name}`, {
      width: size.width,
      height: size.height,
      label: entity.name,
    });
  });

  // Add relationship nodes and edges
  relationships.forEach((rel) => {
    const relationshipId = `rel-${rel.sourceEntity}-${rel.targetEntity}`;

    // Add relationship node
    dagreGraph.setNode(relationshipId, {
      width: RELATIONSHIP_NODE_SIZE,
      height: RELATIONSHIP_NODE_SIZE,
      label: rel.name,
    });

    // Add edges: source entity -> relationship -> target entity
    dagreGraph.setEdge(`entity-${rel.sourceEntity}`, relationshipId);
    dagreGraph.setEdge(relationshipId, `entity-${rel.targetEntity}`);
  });

  return dagreGraph;
};

// ============================================================================
// Layout Chen Notation - Main Function
// ============================================================================

export interface ERDLayoutResult {
  type: "ERD";
  nodes: Node<ERDNodeData>[];
  edges: Edge<ERDEdgeData>[];
}

/**
 * Generate nodes and edges for an ERD diagram using Chen notation layout.
 * Each entity is the center of a cluster with its attributes arranged in a circle.
 *
 * When useDagreLayout is true (default), dagre is used to calculate optimal positions
 * for entity sections and relationships, preventing overlaps.
 *
 * TODO: Implement collision detection for overlapping attributes when there are many attributes
 */
export const layoutChenNotation = (
  entities: ERDEntity[],
  relationships: ERDRelationship[],
  options?: LayoutOptions,
): ERDLayoutResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const nodes: Node<ERDNodeData>[] = [];
  const edges: Edge<ERDEdgeData>[] = [];

  // Map to store entity positions for edge creation
  const entityPositions: Map<string, Position> = new Map();
  // Map to store relationship positions
  const relationshipPositions: Map<string, Position> = new Map();

  if (opts.useDagreLayout) {
    // Use dagre for macro layout
    const dagreGraph = buildDagreGraph(entities, relationships, opts);
    dagre.layout(dagreGraph);

    // Extract positions from dagre graph and create entity + attribute nodes
    entities.forEach((entity) => {
      const entityId = `entity-${entity.name}`;
      const dagreNode = dagreGraph.node(entityId);

      // Dagre returns center position, we use it directly
      const entityPos: Position = { x: dagreNode.x, y: dagreNode.y };
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

      // Create attribute nodes in circular pattern around entity
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
      });
    });

    // Extract relationship positions from dagre
    relationships.forEach((rel) => {
      const relationshipId = `rel-${rel.sourceEntity}-${rel.targetEntity}`;
      const dagreNode = dagreGraph.node(relationshipId);

      if (dagreNode) {
        const relPos: Position = { x: dagreNode.x, y: dagreNode.y };
        relationshipPositions.set(relationshipId, relPos);
      }
    });
  } else {
    // Use simple linear layout (original behavior)
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
      });
    });

    // Calculate relationship positions (midpoint between entities)
    relationships.forEach((rel) => {
      const sourcePos = entityPositions.get(rel.sourceEntity);
      const targetPos = entityPositions.get(rel.targetEntity);

      if (sourcePos && targetPos) {
        const relationshipId = `rel-${rel.sourceEntity}-${rel.targetEntity}`;
        const relPos: Position = {
          x: (sourcePos.x + targetPos.x) / 2,
          y: Math.min(sourcePos.y, targetPos.y) - 150,
        };
        relationshipPositions.set(relationshipId, relPos);
      }
    });
  }

  // Create relationship nodes and edges (same for both layout modes)
  relationships.forEach((rel) => {
    const relationshipId = `rel-${rel.sourceEntity}-${rel.targetEntity}`;
    const sourcePos = entityPositions.get(rel.sourceEntity);
    const targetPos = entityPositions.get(rel.targetEntity);
    const relPos = relationshipPositions.get(relationshipId);

    if (!sourcePos || !targetPos || !relPos) return;

    const relationshipNodeData: ERDRelationshipNodeData = {
      type: "relationship",
      label: rel.name,
      sourceEntity: rel.sourceEntity,
      targetEntity: rel.targetEntity,
      relationType: rel.relationType,
      isIdentifying: rel.isIdentifying,
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
      targetHandle: sourceToRelHandles.targetHandle,
      type: ERD_EDGE_TYPES.DEFAULT,
      data: {
        sourceLabel: getCardinalityLabel(rel.relationType, "source"),
        participation: rel.sourceParticipation,
      },
    });

    // Create edges from relationship to target entity
    const targetEntityId = `entity-${rel.targetEntity}`;
    const relToTargetHandles = getSmartHandleIds(relPos, targetPos);
    edges.push({
      id: `edge-${relationshipId}-${targetEntityId}`,
      source: relationshipId,
      target: targetEntityId,
      sourceHandle: relToTargetHandles.sourceHandle,
      targetHandle: relToTargetHandles.targetHandle,
      type: ERD_EDGE_TYPES.DEFAULT,
      data: {
        targetLabel: getCardinalityLabel(rel.relationType, "target"),
        participation: rel.targetParticipation,
      },
    });
  });

  return { type: "ERD", nodes, edges };
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
    isPartialKey: attribute?.partialKey || false,
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
