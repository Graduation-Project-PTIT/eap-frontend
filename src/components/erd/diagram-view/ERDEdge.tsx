import { useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { RIGHT_HANDLE_ID_PREFIX } from "./handle-constants";

export type ERDEdgeData = {
  sourceLabel: string;
  targetLabel: string;
};

export type ERDEdgeProps = Edge<ERDEdgeData, "erdEdge">;

// this is a little helper component to render the actual edge label
function EdgeLabel({ transform, label }: { transform: string; label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        fontSize: 11,
        fontWeight: 700,
        width: "18px",
        height: "18px",
        transform,
        background: "#111",
        borderRadius: "50%",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
      className="nodrag nopan"
    >
      {label}
    </div>
  );
}

const ERDEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
  data,
  style,
  selected,
}: EdgeProps<ERDEdgeProps>) => {
  const { getInternalNode, getEdge } = useReactFlow();
  const edges = useStore((store) => store.edges);

  // Get source and target nodes to access their dimensions
  const sourceNode = useMemo(() => getInternalNode(source), [getInternalNode, source]);
  const targetNode = useMemo(() => getInternalNode(target), [getInternalNode, target]);
  const edge = useMemo(() => getEdge(id), [getEdge, id]);

  // Determine which handle is being used (left or right)
  const sourceHandleSide: "left" | "right" = useMemo(
    () => (edge?.sourceHandle?.startsWith?.(RIGHT_HANDLE_ID_PREFIX) ? "right" : "left"),
    [edge?.sourceHandle],
  );

  // Calculate edge number for offset (multiple edges between same tables)
  const edgeNumber = useMemo(() => {
    let index = 0;
    for (const e of edges) {
      if (
        (e.source === source && e.target === target) ||
        (e.source === target && e.target === source)
      ) {
        if (e.id === id) return index;
        index++;
      }
    }
    return 0;
  }, [edges, id, source, target]);

  // Calculate all possible connection points
  const sourceWidth = sourceNode?.measured?.width ?? 0;
  const targetWidth = targetNode?.measured?.width ?? 0;

  const sourceLeftX = sourceHandleSide === "left" ? sourceX + 3 : sourceX - sourceWidth - 10;
  const sourceRightX = sourceHandleSide === "left" ? sourceX + sourceWidth + 9 : sourceX;

  const targetLeftX = targetX - 1;
  const targetRightX = targetX + targetWidth + 10;

  // Determine optimal connection sides based on distance
  const { sourceSide, targetSide } = useMemo(() => {
    const distances = {
      leftToLeft: Math.abs(sourceLeftX - targetLeftX),
      leftToRight: Math.abs(sourceLeftX - targetRightX),
      rightToLeft: Math.abs(sourceRightX - targetLeftX),
      rightToRight: Math.abs(sourceRightX - targetRightX),
    };

    const minDistance = Math.min(
      distances.leftToLeft,
      distances.leftToRight,
      distances.rightToLeft,
      distances.rightToRight,
    );

    const minDistanceKey = Object.keys(distances).find(
      (key) => distances[key as keyof typeof distances] === minDistance,
    ) as keyof typeof distances;

    switch (minDistanceKey) {
      case "leftToRight":
        return { sourceSide: "left", targetSide: "right" };
      case "rightToLeft":
        return { sourceSide: "right", targetSide: "left" };
      case "rightToRight":
        return { sourceSide: "right", targetSide: "right" };
      default:
        return { sourceSide: "left", targetSide: "left" };
    }
  }, [sourceLeftX, sourceRightX, targetLeftX, targetRightX]);

  // Calculate the edge path with dynamic positions
  const edgePath = useMemo(() => {
    // Round values to prevent tiny changes from triggering recalculation
    const roundedSourceX = Math.round(sourceSide === "left" ? sourceLeftX : sourceRightX);
    const roundedTargetX = Math.round(targetSide === "left" ? targetLeftX : targetRightX);
    const roundedSourceY = Math.round(sourceY);
    const roundedTargetY = Math.round(targetY);

    const [path] = getSmoothStepPath({
      sourceX: roundedSourceX,
      sourceY: roundedSourceY,
      targetX: roundedTargetX,
      targetY: roundedTargetY,
      borderRadius: 14,
      sourcePosition: sourceSide === "left" ? Position.Left : Position.Right,
      targetPosition: targetSide === "left" ? Position.Left : Position.Right,
      offset: (edgeNumber + 1) * 14, // Offset for multiple edges
    });
    return path;
  }, [
    sourceLeftX,
    sourceRightX,
    targetLeftX,
    targetRightX,
    sourceY,
    targetY,
    sourceSide,
    targetSide,
    edgeNumber,
  ]);

  // Calculate label positions based on actual connection points
  const sourceLabelX = sourceSide === "left" ? sourceLeftX : sourceRightX;
  const targetLabelX = targetSide === "left" ? targetLeftX : targetRightX;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#51a2ff" : (style?.stroke ?? "#333"),
          strokeWidth: selected ? 3 : (style?.strokeWidth ?? 2),
        }}
      />
      <EdgeLabelRenderer>
        {data?.sourceLabel && (
          <EdgeLabel
            transform={`translate(${sourceLabelX}px,${sourceY}px) translate(${sourceSide === "left" ? "-120%" : "0%"}, -50%)`}
            label={data.sourceLabel}
          />
        )}
        {data?.targetLabel && (
          <EdgeLabel
            transform={`translate(${targetLabelX}px,${targetY}px) translate(${targetSide === "left" ? "-120%" : "0%"}, -50%)`}
            label={data.targetLabel}
          />
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default ERDEdge;
