import { Home, Database, FileText, BarChart3 } from "lucide-react";
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
    title: "Documentation",
    url: ROUTES.DOCUMENTATION,
    icon: FileText,
  },
];

export default sidebarSettings;
