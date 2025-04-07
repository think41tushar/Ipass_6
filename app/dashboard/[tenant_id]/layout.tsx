import DashboardNavbar from "@/components/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}

      <div className="sticky top-0 z-50">
        <DashboardNavbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}

        <div className="sticky top-0 h-full z-40">
          <DashboardSidebar />
        </div>

        {/* Main Content */}

        <div className="flex-1 overflow-y-auto z-30">{children}</div>
      </div>
    </div>
  );
}
