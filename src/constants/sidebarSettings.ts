import { Home, Database, Bot, BarChart3, Layers } from "lucide-react";
import ROUTES from "./routes";

const sidebarSettings = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: "Chatbot",
    url: ROUTES.CHATBOT,
    icon: Bot,
  },
  {
    title: "ERD Evaluation",
    url: ROUTES.ERD_EVALUATION,
    icon: BarChart3,
  },
  {
    title: "Mass Evaluation",
    url: ROUTES.MASS_EVALUATION.ROOT,
    icon: Layers,
  },
  {
    title: "ERD Diagram",
    url: ROUTES.ERD_DIAGRAM,
    icon: Database,
  },
];

export default sidebarSettings;
