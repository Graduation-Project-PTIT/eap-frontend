import type { ERDEntity } from "@/api";
import type { Node, NodeProps } from "@xyflow/react";

export type ERDNodeData = {
  entity: ERDEntity;
};

type ERDNodeProps = Node<ERDNodeData, "erdNode">;

const ERDNode = ({ data }: NodeProps<ERDNodeProps>) => {
  return <div>{data.entity.name}</div>;
};

export default ERDNode;
