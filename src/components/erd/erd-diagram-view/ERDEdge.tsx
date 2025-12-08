import { BaseEdge, getStraightPath, type Edge, type EdgeProps } from "@xyflow/react";

export type ERDEdgeData = {
  sourceLabel: string;
  targetLabel: string;
};

export type ERDEdgeProps = Edge<ERDEdgeData, "dbEdge">;

const ERDEdge = ({ id, sourceX, sourceY, targetX, targetY }: EdgeProps<ERDEdgeProps>) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
    </>
  );
};

export default ERDEdge;
