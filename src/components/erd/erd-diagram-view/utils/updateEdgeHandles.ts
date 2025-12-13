import type { Node, Edge } from "@xyflow/react";
import type { ERDNodeData, ERDEdgeData } from "../types";
import { getSmartHandleIds } from "./layoutChenNotation";

/**
 * Recalculate edge handles based on current node positions.
 * This function is called after a node is dragged to ensure edges
 * connect to the most geometrically appropriate handles.
 *
 * @param nodes - Current nodes with updated positions
 * @param edges - Current edges to update
 * @returns New edges array with updated handles
 */
export const updateEdgeHandles = (
  nodes: Node<ERDNodeData>[],
  edges: Edge<ERDEdgeData>[],
): Edge<ERDEdgeData>[] => {
  // Create a map of node positions for quick lookup
  const nodePositionMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    nodePositionMap.set(node.id, node.position);
  });

  // Create a map of node data for determining node types
  const nodeDataMap = new Map<string, ERDNodeData>();
  nodes.forEach((node) => {
    nodeDataMap.set(node.id, node.data);
  });

  return edges.map((edge) => {
    const sourcePos = nodePositionMap.get(edge.source);
    const targetPos = nodePositionMap.get(edge.target);

    // If we can't find positions, return edge unchanged
    if (!sourcePos || !targetPos) {
      return edge;
    }

    const handleIds = getSmartHandleIds(sourcePos, targetPos);

    // All node types (Entity, Attribute, Relationship) now follow the same pattern:
    // - Source handles have "-source" suffix (e.g., "right-source")
    // - Target handles have no suffix (e.g., "left")
    // getSmartHandleIds returns the correct format, so we use them directly.

    return {
      ...edge,
      sourceHandle: handleIds.sourceHandle,
      targetHandle: handleIds.targetHandle,
    };
  });
};

/**
 * Update edges for a specific node that was dragged.
 * More efficient than updating all edges when only one node moved.
 *
 * @param draggedNodeId - The ID of the node that was dragged
 * @param nodes - Current nodes with updated positions
 * @param edges - Current edges to update
 * @returns New edges array with updated handles for affected edges
 */
export const updateEdgeHandlesForNode = (
  draggedNodeId: string,
  nodes: Node<ERDNodeData>[],
  edges: Edge<ERDEdgeData>[],
): Edge<ERDEdgeData>[] => {
  // Create a map of node positions for quick lookup
  const nodePositionMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    nodePositionMap.set(node.id, node.position);
  });

  // Create a map of node data for determining node types
  const nodeDataMap = new Map<string, ERDNodeData>();
  nodes.forEach((node) => {
    nodeDataMap.set(node.id, node.data);
  });

  return edges.map((edge) => {
    // Only update edges connected to the dragged node
    if (edge.source !== draggedNodeId && edge.target !== draggedNodeId) {
      return edge;
    }

    const sourcePos = nodePositionMap.get(edge.source);
    const targetPos = nodePositionMap.get(edge.target);

    if (!sourcePos || !targetPos) {
      return edge;
    }

    const handleIds = getSmartHandleIds(sourcePos, targetPos);

    // All node types (Entity, Attribute, Relationship) now follow the same pattern:
    // - Source handles have "-source" suffix (e.g., "right-source")
    // - Target handles have no suffix (e.g., "left")
    // getSmartHandleIds returns the correct format, so we use them directly.

    return {
      ...edge,
      sourceHandle: handleIds.sourceHandle,
      targetHandle: handleIds.targetHandle,
    };
  });
};
