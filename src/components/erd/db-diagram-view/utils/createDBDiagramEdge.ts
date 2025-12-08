import type { Node } from "@xyflow/react";
import type { DBNodeData } from "../DBNode";
import type { ERDAttribute } from "../../ERDTableTabs";
import { createLeftHandleId, createTargetHandleId } from "../handle-constants";
import type { DBEdgeData } from "../DBEdge";

interface CreateDBDiagramEdgeParams {
  sourceNode: Node<DBNodeData>;
  targetNode: Node<DBNodeData>;
  sourceAttribute: ERDAttribute;
  targetAttribute: ERDAttribute;
  sourceHandleId?: string;
  targetHandleId?: string;
}

const getRelationMultiLabel = (relationType: ERDAttribute["relationType"]): DBEdgeData => {
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

const createDBDiagramEdge = ({
  sourceNode,
  targetNode,
  targetAttribute,
  sourceAttribute,
  sourceHandleId,
  targetHandleId,
}: CreateDBDiagramEdgeParams) => {
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
    type: "dbEdge",
    data: getRelationMultiLabel(sourceAttribute.relationType),
    style: {
      stroke: "#333",
      strokeWidth: 2,
      zIndex: 0,
    },
  };
};

export default createDBDiagramEdge;
