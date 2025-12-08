import ERDDiagram from "@/components/erd/erd-diagram-view";
import { getNodesForERDDiagram } from "@/components/erd/erd-diagram-view/utils/getNodesForERDDiagram";
import mockData from "./mock";

const initialNodes = getNodesForERDDiagram(mockData.entities);

// const { nodes, edges } = getLayoutedElementsForERDDiagram(initialNodes, getEdgesForERDDiagram(initialNodes));

const ERDDiagramPage = () => {
  return <ERDDiagram initialNodes={initialNodes} />;
};

export default ERDDiagramPage;
