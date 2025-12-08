// Handle ID prefixes for different handle types
export const LEFT_HANDLE_ID_PREFIX = "left_rel_";
export const RIGHT_HANDLE_ID_PREFIX = "right_rel_";
export const TARGET_HANDLE_ID_PREFIX = "target_rel_";

// Table-level handle prefixes
export const TABLE_SOURCE_HANDLE_PREFIX = "table_source_";
export const TABLE_TARGET_HANDLE_PREFIX = "table_target_";

/**
 * Creates a unique attribute identifier using entityName-attributeName-type format
 * This ensures uniqueness without needing separate IDs
 */
export const createAttributeId = (
  entityName: string,
  attributeName: string,
  attributeType: string,
): string => {
  // Sanitize names to remove special characters and spaces
  const sanitizedEntity = entityName.replace(/[^a-zA-Z0-9]/g, "_");
  const sanitizedAttribute = attributeName.replace(/[^a-zA-Z0-9]/g, "_");
  const sanitizedType = attributeType.replace(/[^a-zA-Z0-9]/g, "_");

  return `${sanitizedEntity}-${sanitizedAttribute}-${sanitizedType}`;
};

/**
 * Creates a left handle ID for an attribute
 */
export const createLeftHandleId = (
  entityName: string,
  attributeName: string,
  attributeType: string,
): string => {
  const attributeId = createAttributeId(entityName, attributeName, attributeType);
  return `${LEFT_HANDLE_ID_PREFIX}${attributeId}`;
};

/**
 * Creates a right handle ID for an attribute
 */
export const createRightHandleId = (
  entityName: string,
  attributeName: string,
  attributeType: string,
): string => {
  const attributeId = createAttributeId(entityName, attributeName, attributeType);
  return `${RIGHT_HANDLE_ID_PREFIX}${attributeId}`;
};

/**
 * Creates a target handle ID for an attribute
 * @param index - Index for multiple target handles (default 0)
 */
export const createTargetHandleId = (
  entityName: string,
  attributeName: string,
  attributeType: string,
  index: number = 0,
): string => {
  const attributeId = createAttributeId(entityName, attributeName, attributeType);
  return `${TARGET_HANDLE_ID_PREFIX}${index}_${attributeId}`;
};
