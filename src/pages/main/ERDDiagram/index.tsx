import ERDDiagram from "@/components/erd/erd-diagram-view";
import { layoutChenNotation } from "@/components/erd/erd-diagram-view/utils/layoutChenNotation";
import mockData from "./mock";

// Use dagre layout for automatic positioning of entity sections and relationships
const { nodes: initialNodes, edges: initialEdges } = layoutChenNotation(mockData.entities, [], {
  useDagreLayout: true,
  direction: "LR", // Left-to-right layout
  attributeRadius: 180,
  nodeSeparation: 0,
  rankSeparation: 50,
});

const ERDDiagramPage = () => {
  return <ERDDiagram initialNodes={initialNodes} initialEdges={initialEdges} />;
};

export default ERDDiagramPage;
