import React, { useState } from "react";
import { type EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Trash2 } from "lucide-react";

interface RelationshipEdgeData {
  relationship: string;
  sourceAttribute: string;
  targetAttribute: string;
  isEditable: boolean;
  onRelationshipChange?: (newRelationship: string) => void;
  onRelationshipDelete?: () => void;
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  const handleRelationshipChange = (newRelationship: string) => {
    if (edgeData?.onRelationshipChange) {
      edgeData.onRelationshipChange(newRelationship);
    }
    setIsEditDialogOpen(false);
  };

  const handleRelationshipDelete = () => {
    if (edgeData?.onRelationshipDelete) {
      edgeData.onRelationshipDelete();
    }
    setIsEditDialogOpen(false);
  };

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
          {edgeData?.isEditable ? (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-white border shadow-sm cursor-pointer hover:bg-gray-50"
                  style={{
                    borderColor: relationshipColor,
                    color: relationshipColor,
                  }}
                >
                  {relationshipSymbol}
                  <Edit3 className="h-2 w-2 ml-1" />
                </Badge>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Relationship</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Relationship Type</label>
                    <Select
                      value={edgeData?.relationship || "many-to-one"}
                      onValueChange={handleRelationshipChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-to-one">One-to-One (1:1)</SelectItem>
                        <SelectItem value="one-to-many">One-to-Many (1:N)</SelectItem>
                        <SelectItem value="many-to-one">Many-to-One (N:1)</SelectItem>
                        <SelectItem value="many-to-many">Many-to-Many (N:N)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-between space-x-2">
                    <Button variant="destructive" size="sm" onClick={handleRelationshipDelete}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
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
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default RelationshipEdge;
