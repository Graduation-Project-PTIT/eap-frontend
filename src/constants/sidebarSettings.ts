import { Home, Database, FileText } from "lucide-react";
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
    title: "Documentation",
    url: ROUTES.DOCUMENTATION,
    icon: FileText,
  },
];

export default sidebarSettings;
