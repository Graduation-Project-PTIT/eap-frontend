import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggleSimple } from "@/components/theme-toggle";
import UserDropdown from "./AvatarDropdown.tsx";
import ROUTES from "@/constants/routes";

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive: boolean;
}

const TopNavbar = () => {
  const location = useLocation();

  // Routes that have detail pages (parent route -> detail label)
  const detailRoutes: Record<string, string> = {
    chat: "Chatbot",
    diagrams: "Diagram Gallery",
    "mass-evaluation": "Mass Evaluation",
  };

  // Map route segments to breadcrumb titles
  const getSegmentTitle = (segment: string, isDetailSegment: boolean = false): string => {
    if (isDetailSegment) {
      return "Detail";
    }

    const titleMap: Record<string, string> = {
      "": "Dashboard",
      chat: "Chatbot",
      diagrams: "Diagram Gallery",
      settings: "Settings",
      profile: "Profile",
      "user-management": "User Management",
      "erd-evaluation": "ERD Evaluation",
      "mass-evaluation": "Mass Evaluation",
      "class-management": "Class Management",
      "student-management": "Student Management",
      "erd-designer": "ERD Designer",
      "erd-diagram": "ERD Diagram",
      documentation: "Documentation",
    };
    return titleMap[segment] || segment.replace(/-/g, " ");
  };

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Dashboard",
        path: ROUTES.DASHBOARD,
        isActive: pathname === ROUTES.DASHBOARD,
      },
    ];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isActive = index === segments.length - 1;

      // Check if this is a detail segment (ID/parameter after a detail route)
      const previousSegment = index > 0 ? segments[index - 1] : undefined;
      const isDetailSegment = !!(
        previousSegment &&
        detailRoutes[previousSegment] &&
        index === segments.length - 1
      );

      const label = getSegmentTitle(segment, isDetailSegment);

      breadcrumbs.push({
        label,
        path: currentPath,
        isActive,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1 mr-2" />

      {/* Multi-layer Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <div key={item.path} className="flex items-center gap-2">
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                {item.isActive ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.path}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer to push controls to the right */}
      <div className="ml-auto" />

      {/* Theme Toggle */}
      <ThemeToggleSimple />

      {/* User Dropdown */}
      <UserDropdown />
    </header>
  );
};

export default TopNavbar;
