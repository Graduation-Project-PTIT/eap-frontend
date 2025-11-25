import { Home, Database, Bot, BarChart3, Layers, Users, GraduationCap } from "lucide-react";
import ROUTES from "./routes";

export interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: string;
}

const sidebarSettings: SidebarItem[] = [
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
    title: "Diagram Gallery",
    url: ROUTES.DIAGRAM_GALLERY,
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
    title: "ERD Diagram",
    url: ROUTES.ERD_DIAGRAM,
    icon: Database,
  },
  {
    title: "Class Management",
    url: ROUTES.CLASS_MANAGEMENT.ROOT,
    icon: Users,
    requiredRole: "teacher",
  },
  {
    title: "Student Management",
    url: ROUTES.STUDENT_MANAGEMENT.ROOT,
    icon: GraduationCap,
    requiredRole: "teacher",
  },
  {
    title: "User Management",
    url: ROUTES.USER_MANAGEMENT,
    icon: Users,
    requiredRole: "admin",
  },
];

export default sidebarSettings;
