import type { ERDEntity } from "@/api/services/evaluation-service";

export interface DetectedRelationship {
  fromEntity: string;
  toEntity: string;
  fromAttribute: string;
  toAttribute: string;
  relationType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  confidence: number; // 0-1 score
}

/**
 * Detect relationships between entities based on foreign keys and naming patterns
 */
export function detectRelationships(entities: ERDEntity[]): DetectedRelationship[] {
  const relationships: DetectedRelationship[] = [];

  entities.forEach((entity) => {
    entity.attributes.forEach((attribute) => {
      // Direct foreign key relationships
      if (attribute.foreignKey && attribute.foreignKeyTable && attribute.foreignKeyAttribute) {
        relationships.push({
          fromEntity: entity.name,
          toEntity: attribute.foreignKeyTable,
          fromAttribute: attribute.name,
          toAttribute: attribute.foreignKeyAttribute,
          relationType: attribute.relationType || "many-to-one",
          confidence: 1.0,
        });
      }

      // Detect potential relationships by naming patterns
      const potentialRelationships = detectByNamingPatterns(entity, attribute, entities);
      relationships.push(...potentialRelationships);
    });
  });

  // Remove duplicates and sort by confidence
  const uniqueRelationships = removeDuplicateRelationships(relationships);
  return uniqueRelationships.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Detect relationships based on naming patterns (e.g., user_id -> User.id)
 */
function detectByNamingPatterns(
  entity: ERDEntity,
  attribute: ERDEntity["attributes"][0],
  allEntities: ERDEntity[],
): DetectedRelationship[] {
  const relationships: DetectedRelationship[] = [];

  // Skip if already a foreign key
  if (attribute.foreignKey) return relationships;

  const attributeName = attribute.name.toLowerCase();

  // Pattern 1: attribute_id -> Attribute.id
  if (attributeName.endsWith("_id")) {
    const entityNamePattern = attributeName.slice(0, -3);
    const targetEntity = findEntityByPattern(entityNamePattern, allEntities);

    if (targetEntity) {
      const primaryKeyAttribute = targetEntity.attributes.find((attr) => attr.primaryKey);
      if (primaryKeyAttribute) {
        relationships.push({
          fromEntity: entity.name,
          toEntity: targetEntity.name,
          fromAttribute: attribute.name,
          toAttribute: primaryKeyAttribute.name,
          relationType: "many-to-one",
          confidence: 0.8,
        });
      }
    }
  }

  // Pattern 2: entityId -> Entity.id
  if (attributeName.endsWith("id") && attributeName.length > 2) {
    const entityNamePattern = attributeName.slice(0, -2);
    const targetEntity = findEntityByPattern(entityNamePattern, allEntities);

    if (targetEntity) {
      const primaryKeyAttribute = targetEntity.attributes.find((attr) => attr.primaryKey);
      if (primaryKeyAttribute) {
        relationships.push({
          fromEntity: entity.name,
          toEntity: targetEntity.name,
          fromAttribute: attribute.name,
          toAttribute: primaryKeyAttribute.name,
          relationType: "many-to-one",
          confidence: 0.7,
        });
      }
    }
  }

  return relationships;
}

/**
 * Find entity by name pattern (case-insensitive, flexible matching)
 */
function findEntityByPattern(pattern: string, entities: ERDEntity[]): ERDEntity | null {
  const normalizedPattern = pattern.toLowerCase();

  // Exact match
  let match = entities.find((entity) => entity.name.toLowerCase() === normalizedPattern);
  if (match) return match;

  // Plural/singular variations
  const pluralPattern = normalizedPattern + "s";
  const singularPattern = normalizedPattern.endsWith("s")
    ? normalizedPattern.slice(0, -1)
    : normalizedPattern;

  match = entities.find((entity) => {
    const entityName = entity.name.toLowerCase();
    return entityName === pluralPattern || entityName === singularPattern;
  });
  if (match) return match;

  // Partial match
  match = entities.find(
    (entity) =>
      entity.name.toLowerCase().includes(normalizedPattern) ||
      normalizedPattern.includes(entity.name.toLowerCase()),
  );

  return match || null;
}

/**
 * Remove duplicate relationships
 */
function removeDuplicateRelationships(
  relationships: DetectedRelationship[],
): DetectedRelationship[] {
  const seen = new Set<string>();
  return relationships.filter((rel) => {
    const key = `${rel.fromEntity}-${rel.fromAttribute}-${rel.toEntity}-${rel.toAttribute}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Suggest relationship type based on attribute names and constraints
 */
export function suggestRelationshipType(
  fromEntity: ERDEntity,
  fromAttribute: ERDEntity["attributes"][0],
): "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many" {
  // If foreign key attribute is unique, likely one-to-one
  if (fromAttribute.unique) {
    return "one-to-one";
  }

  // If foreign key attribute is primary key, could be one-to-one
  if (fromAttribute.primaryKey) {
    return "one-to-one";
  }

  // Check for junction table pattern (many-to-many)
  if (isJunctionTable(fromEntity)) {
    return "many-to-many";
  }

  // Default to many-to-one
  return "many-to-one";
}

/**
 * Check if entity is likely a junction table for many-to-many relationships
 */
function isJunctionTable(entity: ERDEntity): boolean {
  const foreignKeys = entity.attributes.filter((attr) => attr.foreignKey);

  // Junction table typically has 2+ foreign keys and few other attributes
  return foreignKeys.length >= 2 && entity.attributes.length <= foreignKeys.length + 2;
}

/**
 * Validate relationship consistency
 */
export function validateRelationship(
  relationship: DetectedRelationship,
  entities: ERDEntity[],
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  const fromEntity = entities.find((e) => e.name === relationship.fromEntity);
  const toEntity = entities.find((e) => e.name === relationship.toEntity);

  if (!fromEntity) {
    issues.push(`Source entity '${relationship.fromEntity}' not found`);
  }

  if (!toEntity) {
    issues.push(`Target entity '${relationship.toEntity}' not found`);
  }

  if (fromEntity) {
    const fromAttr = fromEntity.attributes.find((a) => a.name === relationship.fromAttribute);
    if (!fromAttr) {
      issues.push(
        `Source attribute '${relationship.fromAttribute}' not found in ${relationship.fromEntity}`,
      );
    }
  }

  if (toEntity) {
    const toAttr = toEntity.attributes.find((a) => a.name === relationship.toAttribute);
    if (!toAttr) {
      issues.push(
        `Target attribute '${relationship.toAttribute}' not found in ${relationship.toEntity}`,
      );
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
