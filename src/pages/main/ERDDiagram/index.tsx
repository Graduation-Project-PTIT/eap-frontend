import ERDDiagram from "@/components/erd/diagram-view";
import { getEdgesForDiagram } from "@/components/erd/utils/getEdgesForDiagram";
import getLayoutedElements from "@/components/erd/utils/getLayoutedElements";
import getNodesForDiagram from "@/components/erd/utils/getNodesForDiagram";
import mockData from "./mock";

const initialNodes = getNodesForDiagram(mockData.entities);

const { nodes, edges } = getLayoutedElements(initialNodes, getEdgesForDiagram(initialNodes));

const ERDDiagramPage = () => {
  return <ERDDiagram initialNodes={nodes} initialEdges={edges} />;
};

export default ERDDiagramPage;
