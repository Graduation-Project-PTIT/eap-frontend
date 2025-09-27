import type { Edge } from "reactflow";
import type { ERDNode } from "./erdDataTransformer";

export interface LayoutOptions {
  direction?: "TB" | "LR" | "BT" | "RL";
  spacing?: {
    x: number;
    y: number;
  };
  padding?: {
    x: number;
    y: number;
  };
}

/**
 * Auto-layout nodes using a simple grid-based algorithm
 */
export function autoLayoutNodes(
  nodes: ERDNode[],
  _edges: Edge[],
  options: LayoutOptions = {},
): ERDNode[] {
  const { direction = "TB", spacing = { x: 300, y: 200 }, padding = { x: 50, y: 50 } } = options;

  // Simple grid layout for now
  const cols = Math.ceil(Math.sqrt(nodes.length));

  return nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    let x: number, y: number;

    if (direction === "TB" || direction === "BT") {
      x = col * spacing.x + padding.x;
      y = row * spacing.y + padding.y;
    } else {
      x = row * spacing.x + padding.x;
      y = col * spacing.y + padding.y;
    }

    return {
      ...node,
      position: { x, y },
    };
  });
}

/**
 * Fit nodes to viewport
 */
export function fitNodesToViewport(
  nodes: ERDNode[],
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 50,
): ERDNode[] {
  if (nodes.length === 0) return nodes;

  // Calculate bounding box
  const minX = Math.min(...nodes.map((n) => n.position.x));
  const maxX = Math.max(...nodes.map((n) => n.position.x + 250)); // Assume node width ~250px
  const minY = Math.min(...nodes.map((n) => n.position.y));
  const maxY = Math.max(...nodes.map((n) => n.position.y + 150)); // Assume node height ~150px

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const availableWidth = viewportWidth - 2 * padding;
  const availableHeight = viewportHeight - 2 * padding;

  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

  const offsetX = (viewportWidth - contentWidth * scale) / 2 - minX * scale;
  const offsetY = (viewportHeight - contentHeight * scale) / 2 - minY * scale;

  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x * scale + offsetX,
      y: node.position.y * scale + offsetY,
    },
  }));
}

/**
 * Organize nodes by relationships (simple hierarchical layout)
 */
export function organizeByRelationships(nodes: ERDNode[], edges: Edge[]): ERDNode[] {
  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((node) => {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    const sourceConnections = adjacency.get(edge.source) || [];
    sourceConnections.push(edge.target);
    adjacency.set(edge.source, sourceConnections);

    const targetInDegree = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, targetInDegree + 1);
  });

  // Find root nodes (no incoming edges)
  const rootNodes = nodes.filter((node) => (inDegree.get(node.id) || 0) === 0);

  if (rootNodes.length === 0) {
    // Fallback to grid layout if no clear hierarchy
    return autoLayoutNodes(nodes, edges);
  }

  // Simple level-based layout
  const levels: string[][] = [];
  const visited = new Set<string>();
  const queue = [...rootNodes.map((n) => n.id)];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: string[] = [];

    for (let i = 0; i < levelSize; i++) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      currentLevel.push(nodeId);

      const connections = adjacency.get(nodeId) || [];
      connections.forEach((connectedId) => {
        if (!visited.has(connectedId)) {
          queue.push(connectedId);
        }
      });
    }

    if (currentLevel.length > 0) {
      levels.push(currentLevel);
    }
  }

  // Position nodes by levels
  return nodes.map((node) => {
    let levelIndex = -1;
    let positionInLevel = -1;

    for (let i = 0; i < levels.length; i++) {
      const pos = levels[i].indexOf(node.id);
      if (pos !== -1) {
        levelIndex = i;
        positionInLevel = pos;
        break;
      }
    }

    if (levelIndex === -1) {
      // Node not in hierarchy, place at bottom
      levelIndex = levels.length;
      positionInLevel = 0;
    }

    const levelWidth = levels[levelIndex]?.length || 1;
    const spacing = 300;
    const levelSpacing = 200;

    return {
      ...node,
      position: {
        x: (positionInLevel - (levelWidth - 1) / 2) * spacing + 400,
        y: levelIndex * levelSpacing + 50,
      },
    };
  });
}
