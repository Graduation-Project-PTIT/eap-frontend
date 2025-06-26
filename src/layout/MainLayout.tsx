import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import SidebarNav from "./components/SidebarNav";
import TopNavbar from "./components/TopNavbar";

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
      <Toaster />
    </SidebarProvider>
  );
};

export default MainLayout;
