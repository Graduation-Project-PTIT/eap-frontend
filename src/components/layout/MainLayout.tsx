import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "./SidebarNav";
import TopNavbar from "./TopNavbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <TopNavbar />
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
