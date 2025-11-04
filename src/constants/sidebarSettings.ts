import { Home, Database, FileText, BarChart3, Layers } from "lucide-react";
import ROUTES from "./routes";

const sidebarSettings = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: "ERD Designer",
    url: ROUTES.ERD_DESIGNER,
    icon: Database,
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
    title: "Documentation",
    url: ROUTES.DOCUMENTATION,
    icon: FileText,
  },
];

export default sidebarSettings;
