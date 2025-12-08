/**
 * ERD (Entity-Relationship Diagram) Types
 * Following standard Chen notation for ERDs:
 * - Entity: Rectangle
 * - Attribute: Ellipse/Oval
 * - Relationship: Diamond
 * - Weak Entity: Double Rectangle
 * - Key Attribute: Underlined Ellipse
 * - Multivalued Attribute: Double Ellipse
 * - Derived Attribute: Dashed Ellipse
 * - Composite Attribute: Ellipse with nested attributes
 */

// ============================================================================
// Core ERD Data Model Types
// ============================================================================

/**
 * ERD Attribute Type
 * Represents an attribute in an ERD with support for all Chen notation types
 */
export interface ERDAttribute {
  name: string;
  type: string;

  // Attribute classification flags
  primaryKey: boolean;
  foreignKey: boolean;
  unique: boolean;
  nullable: boolean;

  // ERD-specific attribute properties
  isMultivalued: boolean; // Double ellipse - can hold multiple values
  isDerived: boolean; // Dashed ellipse - computed from other attributes
  isComposite: boolean; // Has sub-attributes (e.g., Address -> Street, City, Zip)

  // Foreign key relationship information (for backward compatibility with mock data)
  foreignKeyTable?: string;
  foreignKeyAttribute?: string;
  relationType?: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  relationshipName?: string; // Name of the relationship (e.g., "has", "belongs to", "manages")

  // Composite attribute support
  subAttributes?: ERDAttribute[];

  // Optional metadata
  description?: string;
  defaultValue?: string;
}

/**
 * ERD Entity Type
 * Represents an entity in an ERD
 */
export interface ERDEntity {
  name: string;
  attributes: ERDAttribute[];

  // Entity classification
  isWeakEntity: boolean; // Double rectangle - depends on another entity

  // Weak entity relationship
  identifyingEntity?: string; // The strong entity this weak entity depends on

  // Optional metadata
  description?: string;
}

/**
 * ERD Relationship Type
 * Represents a relationship between entities in an ERD
 */
export interface ERDRelationship {
  name: string;
  sourceEntity: string;
  targetEntity: string;
  relationType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

  // Participation constraints
  sourceParticipation?: "total" | "partial"; // Total = double line, Partial = single line
  targetParticipation?: "total" | "partial";

  // Relationship attributes (relationships can have their own attributes)
  attributes?: ERDAttribute[];

  // Optional metadata
  description?: string;
}

// ============================================================================
// ERD Diagram Node Types (for React Flow)
// ============================================================================

/**
 * ERD Element Types - all possible node types in an ERD
 */
export type ERDElementType =
  | "entity"
  | "weak-entity"
  | "attribute"
  | "key-attribute"
  | "multivalued-attribute"
  | "derived-attribute"
  | "composite-attribute"
  | "relationship";

/**
 * Entity node data for React Flow
 */
export type ERDEntityNodeData = {
  type: "entity" | "weak-entity";
  entity: ERDEntity;
  label: string;
};

/**
 * Attribute node data for React Flow
 */
export type ERDAttributeNodeData = {
  type:
    | "attribute"
    | "key-attribute"
    | "multivalued-attribute"
    | "derived-attribute"
    | "composite-attribute";
  attribute: ERDAttribute;
  label: string;
  entityName: string;

  // For composite attributes
  parentAttributeName?: string;
};

/**
 * Relationship node data for React Flow
 */
export type ERDRelationshipNodeData = {
  type: "relationship";
  label: string;
  sourceEntity: string;
  targetEntity: string;
  relationType?: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

  // Participation constraints
  sourceParticipation?: "total" | "partial";
  targetParticipation?: "total" | "partial";
};

/**
 * Union type for all ERD node data
 */
export type ERDNodeData = ERDEntityNodeData | ERDAttributeNodeData | ERDRelationshipNodeData;

// ============================================================================
// Type Guards
// ============================================================================

export const isEntityNode = (data: ERDNodeData): data is ERDEntityNodeData => {
  return data.type === "entity" || data.type === "weak-entity";
};

export const isAttributeNode = (data: ERDNodeData): data is ERDAttributeNodeData => {
  return (
    data.type === "attribute" ||
    data.type === "key-attribute" ||
    data.type === "multivalued-attribute" ||
    data.type === "derived-attribute" ||
    data.type === "composite-attribute"
  );
};

export const isRelationshipNode = (data: ERDNodeData): data is ERDRelationshipNodeData => {
  return data.type === "relationship";
};

// ============================================================================
// Edge Types
// ============================================================================

/**
 * Edge data for ERD connections
 */
export type ERDEdgeData = {
  sourceLabel?: string;
  targetLabel?: string;
  cardinality?: "1" | "N" | "M";
  participation?: "total" | "partial";
};

// ============================================================================
// Constants
// ============================================================================

/**
 * Node type identifiers for React Flow
 */
export const ERD_NODE_TYPES = {
  ENTITY: "erdEntityNode",
  ATTRIBUTE: "erdAttributeNode",
  RELATIONSHIP: "erdRelationshipNode",
} as const;

/**
 * Edge type identifiers for React Flow
 */
export const ERD_EDGE_TYPES = {
  DEFAULT: "erdEdge",
} as const;
