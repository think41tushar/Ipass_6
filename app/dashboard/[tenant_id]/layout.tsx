import DashboardNavbar from "@/components/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <DashboardNavbar />
      <div className="flex">
        <DashboardSidebar />
        {children}
      </div>
    </section>
  );
}
