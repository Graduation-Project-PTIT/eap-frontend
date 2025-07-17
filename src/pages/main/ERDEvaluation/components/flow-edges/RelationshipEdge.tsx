import React from "react";
import { type EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";

interface RelationshipEdgeData {
  relationship: string;
  sourceAttribute: string;
  targetAttribute: string;
  isEditable: boolean;
}

const RelationshipEdge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "one-to-one":
        return "#10b981"; // green
      case "one-to-many":
        return "#3b82f6"; // blue
      case "many-to-one":
        return "#f59e0b"; // amber
      case "many-to-many":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const getRelationshipSymbol = (relationship: string) => {
    switch (relationship) {
      case "one-to-one":
        return "1:1";
      case "one-to-many":
        return "1:N";
      case "many-to-one":
        return "N:1";
      case "many-to-many":
        return "N:N";
      default:
        return "FK";
    }
  };

  const edgeData = data as unknown as RelationshipEdgeData;
  const relationshipColor = getRelationshipColor(edgeData?.relationship || "");
  const relationshipSymbol = getRelationshipSymbol(edgeData?.relationship || "");

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: relationshipColor,
          strokeWidth: 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 10,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <Badge
            variant="secondary"
            className="text-xs px-2 py-1 bg-white border shadow-sm"
            style={{
              borderColor: relationshipColor,
              color: relationshipColor,
            }}
          >
            {relationshipSymbol}
          </Badge>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default RelationshipEdge;
