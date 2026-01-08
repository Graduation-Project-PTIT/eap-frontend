import type { Node } from "@xyflow/react";
import type {
  ERDEntity,
  ERDAttribute,
  ERDNodeData,
  ERDEntityNodeData,
  ERDAttributeNodeData,
  ERDRelationshipNodeData,
} from "../types";
import { ERD_NODE_TYPES } from "../types";

/**
 * Determines the attribute node type based on attribute properties
 * Now supports multivalued, derived, and composite attributes
 */
const getAttributeType = (attribute: ERDAttribute): ERDAttributeNodeData["type"] => {
  // Priority order: key > composite > multivalued > derived > regular
  if (attribute.primaryKey) {
    return "key-attribute";
  }
  if (attribute.isComposite) {
    return "composite-attribute";
  }
  if (attribute.isMultivalued) {
    return "multivalued-attribute";
  }
  if (attribute.isDerived) {
    return "derived-attribute";
  }
  return "attribute";
};

/**
 * Generate ERD diagram nodes from entities
 * Creates entity nodes (rectangles) and attribute nodes (ellipses)
 * Relationships are extracted from foreign key connections
 * Now supports multivalued, derived, and composite attributes
 */
export const getNodesForERDDiagram = (entities: ERDEntity[]): Node<ERDNodeData>[] => {
  const nodes: Node<ERDNodeData>[] = [];
  const relationships: Array<{
    name: string;
    sourceEntity: string;
    targetEntity: string;
    relationType?: ERDRelationshipNodeData["relationType"];
  }> = [];

  // First pass: Create entity and attribute nodes
  entities.forEach((entity, entityIndex) => {
    const entityId = `entity-${entity.name}`;

    // Entity node (Rectangle or Double Rectangle for weak entities)
    const entityNodeData: ERDEntityNodeData = {
      type: entity.isWeakEntity ? "weak-entity" : "entity",
      entity: entity,
      label: entity.name,
    };

    nodes.push({
      id: entityId,
      position: { x: entityIndex * 400, y: 200 },
      data: entityNodeData,
      type: ERD_NODE_TYPES.ENTITY,
    });

    // Create attribute nodes (Ellipses) for this entity
    let attributeIndex = 0;
    const totalAttributes = entity.attributes.length;

    entity.attributes.forEach((attribute) => {
      createAttributeNodes(
        nodes,
        attribute,
        entity.name,
        entityIndex,
        attributeIndex,
        totalAttributes,
      );
      attributeIndex++;

      // Track relationships from foreign keys
      if (attribute.foreignKey && attribute.foreignKeyTable) {
        // Generate a meaningful relationship name
        const relationshipName =
          attribute.relationshipName || `${entity.name}_${attribute.foreignKeyTable}`;

        relationships.push({
          name: relationshipName,
          sourceEntity: entity.name,
          targetEntity: attribute.foreignKeyTable,
          relationType: attribute.relationType,
        });
      }
    });
  });

  // Second pass: Create relationship nodes (Diamonds)
  // Deduplicate relationships
  const uniqueRelationships = relationships.filter(
    (rel, index, self) =>
      index ===
      self.findIndex(
        (r) =>
          (r.sourceEntity === rel.sourceEntity && r.targetEntity === rel.targetEntity) ||
          (r.sourceEntity === rel.targetEntity && r.targetEntity === rel.sourceEntity),
      ),
  );

  uniqueRelationships.forEach((rel, index) => {
    const relationshipId = `rel-${rel.sourceEntity}-${rel.targetEntity}`;

    // Find positions of connected entities to place relationship in between
    const sourceEntityNode = nodes.find((n) => n.id === `entity-${rel.sourceEntity}`);
    const targetEntityNode = nodes.find((n) => n.id === `entity-${rel.targetEntity}`);

    const midX =
      sourceEntityNode && targetEntityNode
        ? (sourceEntityNode.position.x + targetEntityNode.position.x) / 2
        : index * 200;
    const midY =
      sourceEntityNode && targetEntityNode
        ? (sourceEntityNode.position.y + targetEntityNode.position.y) / 2
        : 100;

    const relationshipNodeData: ERDRelationshipNodeData = {
      type: "relationship",
      label: rel.name, // Use the relationship name, not the cardinality
      sourceEntity: rel.sourceEntity,
      targetEntity: rel.targetEntity,
      relationType: rel.relationType,
    };

    nodes.push({
      id: relationshipId,
      position: { x: midX, y: midY - 100 },
      data: relationshipNodeData,
      type: ERD_NODE_TYPES.RELATIONSHIP,
    });
  });

  return nodes;
};

/**
 * Helper function to create attribute nodes including composite sub-attributes
 */
const createAttributeNodes = (
  nodes: Node<ERDNodeData>[],
  attribute: ERDAttribute,
  entityName: string,
  entityIndex: number,
  attributeIndex: number,
  totalAttributes: number,
  parentAttributeName?: string,
  parentAngle?: number,
  parentRadius?: number,
): void => {
  const attributeId = parentAttributeName
    ? `attr-${entityName}-${parentAttributeName}-${attribute.name}`
    : `attr-${entityName}-${attribute.name}`;

  const attributeType = getAttributeType(attribute);

  const attributeNodeData: ERDAttributeNodeData = {
    type: attributeType,
    attribute: attribute,
    label: attribute.name,
    entityName: entityName,
    parentAttributeName: parentAttributeName,
    isPartialKey: attribute?.partialKey || false,
  };

  // Position attributes in a circular pattern around the entity
  // For composite sub-attributes, position them around the parent attribute
  const baseRadius = parentRadius || 150;
  const radius = parentAttributeName ? baseRadius + 80 : baseRadius;
  const angleOffset = (Math.PI * 2) / Math.max(totalAttributes, 1);
  const angle =
    parentAngle !== undefined ? parentAngle : attributeIndex * angleOffset - Math.PI / 2;

  const baseX = entityIndex * 400;
  const baseY = 200;

  nodes.push({
    id: attributeId,
    position: {
      x: baseX + Math.cos(angle) * radius,
      y: baseY + Math.sin(angle) * radius,
    },
    data: attributeNodeData,
    type: ERD_NODE_TYPES.ATTRIBUTE,
  });

  // If this is a composite attribute, create nodes for sub-attributes
  if (attribute.isComposite && attribute.subAttributes && attribute.subAttributes.length > 0) {
    const subAttributeCount = attribute.subAttributes.length;
    const subAngleSpread = Math.PI / 4; // 45 degrees spread for sub-attributes
    const subAngleStart = angle - subAngleSpread / 2;

    attribute.subAttributes.forEach((subAttr, subIndex) => {
      const subAngle =
        subAngleStart + (subAngleSpread / Math.max(subAttributeCount - 1, 1)) * subIndex;
      createAttributeNodes(
        nodes,
        subAttr,
        entityName,
        entityIndex,
        subIndex,
        subAttributeCount,
        attribute.name,
        subAngle,
        radius,
      );
    });
  }
};
