import ERDDiagram from "@/components/erd/erd-diagram-view";
import { getNodesForERDDiagram } from "@/components/erd/erd-diagram-view/utils/getNodesForERDDiagram";
import { getEdgesForERDDiagram } from "@/components/erd/erd-diagram-view/utils/getEdgesForERDDiagram";
import mockData from "./mock";

const initialNodes = getNodesForERDDiagram(mockData.entities);
const initialEdges = getEdgesForERDDiagram(initialNodes);

const ERDDiagramPage = () => {
  return <ERDDiagram initialNodes={initialNodes} initialEdges={initialEdges} />;
};

export default ERDDiagramPage;
