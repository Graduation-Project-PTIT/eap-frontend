import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import type { ERDEdgeData } from "./types";

export type ERDEdgeProps = Edge<ERDEdgeData, "erdEdge">;

const ERDEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  data,
}: EdgeProps<ERDEdgeProps>) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Calculate label positions
  // Source label: 25% along the edge from source
  // Target label: 75% along the edge from source (25% from target)
  const sourceLabelX = sourceX + (targetX - sourceX) * 0.25;
  const sourceLabelY = sourceY + (targetY - sourceY) * 0.25;
  const targetLabelX = sourceX + (targetX - sourceX) * 0.75;
  const targetLabelY = sourceY + (targetY - sourceY) * 0.75;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#3b82f6" : "#374151",
          strokeWidth: selected ? 2 : 1,
        }}
      />

      {/* Render cardinality labels */}
      <EdgeLabelRenderer>
        {data?.sourceLabel && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${sourceLabelX}px, ${sourceLabelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan bg-white px-2 py-1 rounded border border-gray-300 text-xs font-semibold text-gray-700 shadow-sm"
          >
            {data.sourceLabel}
          </div>
        )}

        {data?.targetLabel && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${targetLabelX}px, ${targetLabelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan bg-white px-2 py-1 rounded border border-gray-300 text-xs font-semibold text-gray-700 shadow-sm"
          >
            {data.targetLabel}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default ERDEdge;
