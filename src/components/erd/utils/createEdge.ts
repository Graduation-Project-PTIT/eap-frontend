import type { Node } from "@xyflow/react";
import type { ERDNodeData } from "../diagram-view/ERDNode";
import type { ERDAttribute } from "../ERDTableTabs";
import { createLeftHandleId, createTargetHandleId } from "../diagram-view/handle-constants";
import type { ERDEdgeData } from "../diagram-view/ERDEdge";

interface CreateEdgeParams {
  sourceNode: Node<ERDNodeData>;
  targetNode: Node<ERDNodeData>;
  sourceAttribute: ERDAttribute;
  targetAttribute: ERDAttribute;
  sourceHandleId?: string;
  targetHandleId?: string;
}

const getRelationMultiLabel = (relationType: ERDAttribute["relationType"]): ERDEdgeData => {
  switch (relationType) {
    case "one-to-one":
      return {
        sourceLabel: "1",
        targetLabel: "1",
      };
    case "one-to-many":
      return {
        sourceLabel: "1",
        targetLabel: "N",
      };
    case "many-to-one":
      return {
        sourceLabel: "N",
        targetLabel: "1",
      };
    default:
      return {
        sourceLabel: "N",
        targetLabel: "N",
      };
  }
};

const createEdge = ({
  sourceNode,
  targetNode,
  targetAttribute,
  sourceAttribute,
  sourceHandleId,
  targetHandleId,
}: CreateEdgeParams) => {
  if (!sourceHandleId && !targetHandleId) {
    sourceHandleId = createLeftHandleId(
      sourceNode.data.entity.name,
      sourceAttribute.name,
      sourceAttribute.type,
    );

    targetHandleId = createTargetHandleId(
      targetNode.data.entity.name,
      targetAttribute.name,
      targetAttribute.type,
      0,
    );
  }

  return {
    id: `${sourceNode.id}-${sourceAttribute.name}-${targetNode.id}`,
    source: sourceNode.id,
    target: targetNode.id,
    sourceHandle: sourceHandleId,
    targetHandle: targetHandleId,
    type: "erdEdge",
    data: getRelationMultiLabel(sourceAttribute.relationType),
    style: {
      stroke: "#333",
      strokeWidth: 2,
      zIndex: 0,
    },
  };
};

export default createEdge;
