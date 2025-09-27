import React, { memo } from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "reactflow";
import type { EdgeProps } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ERDEdgeData } from "../utils/erdDataTransformer";

type ERDRelationshipEdgeProps = EdgeProps<ERDEdgeData>;

const ERDRelationshipEdge: React.FC<ERDRelationshipEdgeProps> = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }) => {
    const { onDelete, isEditable = false } = data || {};
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const getRelationshipSymbols = (relationType: string) => {
      switch (relationType) {
        case "one-to-one":
          return { source: "1", target: "1" };
        case "one-to-many":
          return { source: "1", target: "N" };
        case "many-to-one":
          return { source: "N", target: "1" };
        case "many-to-many":
          return { source: "N", target: "N" };
        default:
          return { source: "", target: "" };
      }
    };

    const symbols = getRelationshipSymbols(data?.relationType || "many-to-one");
    const strokeColor = selected ? "#3b82f6" : "#6366f1";
    const strokeWidth = selected ? 3 : 2;

    return (
      <>
        <BaseEdge
          path={edgePath}
          style={{
            stroke: strokeColor,
            strokeWidth,
            transition: "all 0.2s ease-in-out",
          }}
          markerEnd="url(#arrow)"
        />

        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="flex items-center space-x-1"
          >
            {/* Source cardinality */}
            {symbols.source && (
              <Badge variant="secondary" className="text-xs px-1 py-0 bg-white border">
                {symbols.source}
              </Badge>
            )}

            {/* Relationship label */}
            {data?.label && (
              <Badge variant="outline" className="text-xs px-2 py-0 bg-white">
                {data.label}
              </Badge>
            )}

            {/* Target cardinality */}
            {symbols.target && (
              <Badge variant="secondary" className="text-xs px-1 py-0 bg-white border">
                {symbols.target}
              </Badge>
            )}

            {/* Delete button for editable mode */}
            {isEditable && selected && (
              <Button
                variant="destructive"
                size="sm"
                className="h-5 w-5 p-0 ml-2"
                onClick={() => onDelete?.(id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Attribute labels */}
          {data && (
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + 25}px)`,
                pointerEvents: "none",
              }}
              className="text-xs text-gray-600 bg-white px-1 rounded border"
            >
              {data.fromAttribute} → {data.toAttribute}
            </div>
          )}
        </EdgeLabelRenderer>

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={strokeColor} />
          </marker>
        </defs>
      </>
    );
  },
);

ERDRelationshipEdge.displayName = "ERDRelationshipEdge";

export default ERDRelationshipEdge;
