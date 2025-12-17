import { useState, useCallback, useEffect, useRef } from "react";
import type { DBEntity } from "@/api";

export interface SchemaState {
  entities: DBEntity[];
}

/**
 * Deep equality check for schema objects
 * Compares entities by serializing and comparing JSON strings
 */
const isSchemaEqual = (a: SchemaState | null, b: SchemaState | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;

  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

/**
 * Custom hook for managing schema state with dirty tracking
 *
 * Features:
 * - Track local schema edits
 * - Dirty state detection (unsaved changes)
 * - Entity CRUD operations (update, add, remove)
 * - Reset dirty flag after save
 * - Prevents race conditions between user edits and server updates
 *
 * @param initialSchema - Initial schema from conversation
 * @returns Schema state and handlers
 */
export const useSchemaState = (initialSchema: SchemaState | null) => {
  const [schema, setSchema] = useState<SchemaState | null>(initialSchema);
  const [isDirty, setIsDirty] = useState(false);

  // Track the last schema we synced from props
  // This prevents overwriting user edits when props change during editing
  const lastSyncedSchemaRef = useRef<SchemaState | null>(initialSchema);

  // Sync with external schema changes (e.g., from refetch)
  // Only update if:
  // 1. There are no unsaved changes (not dirty), OR
  // 2. The incoming schema is genuinely different from what we last synced
  //    (this handles the case where backend returns updated schema after save)
  useEffect(() => {
    if (!initialSchema) {
      return;
    }

    // If not dirty, always sync to latest from server
    if (!isDirty) {
      if (!isSchemaEqual(schema, initialSchema)) {
        setSchema(initialSchema);
        lastSyncedSchemaRef.current = initialSchema;
      }
      return;
    }

    // If dirty, only update if this is a new schema from server
    // (different from what we started editing)
    // This handles the post-save refetch case
    if (!isSchemaEqual(lastSyncedSchemaRef.current, initialSchema)) {
      // Server has a newer version - this could be from another user's edit
      // or from our own save that completed and refetched
      // For now, we trust the server and update
      // TODO: In the future, implement conflict resolution UI
      setSchema(initialSchema);
      lastSyncedSchemaRef.current = initialSchema;
      setIsDirty(false); // Reset dirty since we're syncing to server state
    }
  }, [initialSchema, isDirty, schema]);

  /**
   * Update an existing entity in the schema
   * Matches by entity name and replaces the entity
   */
  const updateEntity = useCallback((updatedEntity: DBEntity) => {
    setSchema((prev) => {
      if (!prev) return null;

      const entityExists = prev.entities.some((entity) => entity.name === updatedEntity.name);

      if (!entityExists) return prev;

      return {
        entities: prev.entities.map((entity) =>
          entity.name === updatedEntity.name ? updatedEntity : entity,
        ),
      };
    });
    setIsDirty(true);
  }, []);

  /**
   * Add a new entity to the schema
   */
  const addEntity = useCallback((entity: DBEntity) => {
    setSchema((prev) => {
      if (!prev) {
        return { entities: [entity] };
      }

      const entityExists = prev.entities.some((e) => e.name === entity.name);
      if (entityExists) return prev;

      return {
        entities: [...prev.entities, entity],
      };
    });
    setIsDirty(true);
  }, []);

  /**
   * Remove an entity from the schema by name
   */
  const removeEntity = useCallback((entityName: string) => {
    setSchema((prev) => {
      if (!prev) return null;

      const entityExists = prev.entities.some((e) => e.name === entityName);
      if (!entityExists) return prev;

      return {
        entities: prev.entities.filter((e) => e.name !== entityName),
      };
    });
    setIsDirty(true);
  }, []);

  /**
   * Manually set the entire schema
   * Useful for wholesale replacements
   */
  const setSchemaManually = useCallback((newSchema: SchemaState | null) => {
    setSchema(newSchema);
    setIsDirty(true);
  }, []);

  /**
   * Reset the dirty flag after successful save
   * Also updates the last synced schema reference
   */
  const resetDirty = useCallback(() => {
    setIsDirty(false);
    lastSyncedSchemaRef.current = schema;
  }, [schema]);

  /**
   * Discard all local changes and revert to initial schema
   */
  const discardChanges = useCallback(() => {
    setSchema(initialSchema);
    lastSyncedSchemaRef.current = initialSchema;
    setIsDirty(false);
  }, [initialSchema]);

  return {
    schema,
    setSchema: setSchemaManually,
    isDirty,
    updateEntity,
    addEntity,
    removeEntity,
    resetDirty,
    discardChanges,
  };
};
