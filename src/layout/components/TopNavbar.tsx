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

const TopNavbar = () => {
  const location = useLocation();

  // Map routes to breadcrumb titles
  const getBreadcrumbTitle = (pathname: string) => {
    switch (pathname) {
      case ROUTES.DASHBOARD:
        return "Dashboard";
      case ROUTES.ERD_DESIGNER:
        return "ERD Designer";
      case ROUTES.SETTINGS:
        return "Settings";
      case ROUTES.DOCUMENTATION:
        return "Documentation";
      default:
        return "Dashboard";
    }
  };

  const currentTitle = getBreadcrumbTitle(location.pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1 mr-2" />

      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href={ROUTES.DASHBOARD}>EAP Platform</BreadcrumbLink>
          </BreadcrumbItem>
          {location.pathname !== ROUTES.DASHBOARD && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
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
