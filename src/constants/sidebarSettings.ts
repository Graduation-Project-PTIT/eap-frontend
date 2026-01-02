import { Database, Bot, BarChart3, Layers, Users, GraduationCap } from "lucide-react";
import ROUTES from "./routes";

export interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: string;
  group: string;
}

const sidebarSettings: SidebarItem[] = [
  {
    title: "Chatbot",
    url: ROUTES.CHATBOT,
    icon: Bot,
    group: "User",
  },
  {
    title: "Diagram Gallery",
    url: ROUTES.DIAGRAM_GALLERY,
    icon: Database,
    group: "User",
  },
  {
    title: "Diagram Evaluation",
    url: ROUTES.ERD_EVALUATION,
    icon: BarChart3,
    group: "User",
  },
  {
    title: "Mass Evaluation",
    url: ROUTES.MASS_EVALUATION.ROOT,
    icon: Layers,
    group: "Teacher",
  },
  {
    title: "Class Management",
    url: ROUTES.CLASS_MANAGEMENT.ROOT,
    icon: Users,
    requiredRole: "teacher",
    group: "Teacher",
  },
  {
    title: "Student Management",
    url: ROUTES.STUDENT_MANAGEMENT.ROOT,
    icon: GraduationCap,
    requiredRole: "teacher",
    group: "Teacher",
  },
  {
    title: "User Management",
    url: ROUTES.USER_MANAGEMENT,
    icon: Users,
    requiredRole: "admin",
    group: "Admin",
  },
];

export default sidebarSettings;
