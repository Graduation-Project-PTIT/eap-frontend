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
import UserDropdown from "./UserDropdown.tsx";

const TopNavbar = () => {
  const location = useLocation();

  // Map routes to breadcrumb titles
  const getBreadcrumbTitle = (pathname: string) => {
    switch (pathname) {
      case "/":
        return "Dashboard";
      case "/erd-designer":
        return "ERD Designer";
      case "/projects":
        return "Projects";
      case "/settings":
        return "Settings";
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
            <BreadcrumbLink href="/">EAP Platform</BreadcrumbLink>
          </BreadcrumbItem>
          {location.pathname !== "/" && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer to push user dropdown to the right */}
      <div className="ml-auto" />

      {/* User Dropdown */}
      <UserDropdown />
    </header>
  );
};

export default TopNavbar;
