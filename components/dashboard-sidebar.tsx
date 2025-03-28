"use client";

import Link from "next/link";
import { LayoutDashboard, User, Settings, Search, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Loading from "@/components/ui/loading";

export default function DashboardSidebar() {
  const [selected, setSelected] = useState("dashboard");
  const { tenant_id } = useParams();
  const pathname = usePathname(); // ADDED: Hook to detect route changes
  const [loading, setLoading] = useState(false); // loading state for route change

  // Reset loading state when the route changes
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  // Handler to update selection and trigger loading overlay.
  const handleLinkClick = (section: string) => {
    setSelected(section);
    setLoading(true); // Set loading true on click.
  };

  return (
    <div>
      <div className="flex flex-col border-r border-muted p-4 gap-4 px-4 h-[100vh]">
        <Link
          href={`/dashboard/${tenant_id}`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md ${
            selected === "dashboard"
              ? "bg-white text-black"
              : "text-muted-foreground"
          } hover:bg-muted hover:text-white`}
          onClick={() => handleLinkClick("dashboard")}
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-lg">Dashboard</span>
        </Link>

        <Link
          href={`/dashboard/${tenant_id}/users`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md ${
            selected === "users"
              ? "bg-white text-black"
              : "text-muted-foreground"
          } hover:bg-muted hover:text-white`}
          onClick={() => handleLinkClick("users")}
        >
          <User className="h-6 w-6" />
          <span className="text-lg">Users</span>
        </Link>

        <Link
          href={`/dashboard/${tenant_id}/integrations`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md ${
            selected === "integrations"
              ? "bg-white text-black"
              : "text-muted-foreground"
          } hover:bg-muted hover:text-white`}
          onClick={() => handleLinkClick("integrations")}
        >
          <Settings className="h-6 w-6" />
          <span className="text-lg">Integrations</span>
        </Link>

        <Link
          href={`/dashboard/${tenant_id}/global-search`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md ${
            selected === "global-search"
              ? "bg-white text-black"
              : "text-muted-foreground"
          } hover:bg-muted hover:text-white`}
          onClick={() => handleLinkClick("global-search")}
        >
          <Search className="h-6 w-6" />
          <span className="text-lg">Search</span>
        </Link>
        <Link
          href={`/dashboard/${tenant_id}/prompt`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md ${
            selected === "prompt"
              ? "bg-white text-black"
              : "text-muted-foreground"
          } hover:bg-muted hover:text-white`}
          onClick={() => handleLinkClick("prompt")}
        >
          <Rocket className="h-6 w-6" />
          <span className="text-lg">Prompt</span>
        </Link>
      </div>

      {/* Loading overlay using your existing class */}
      {loading && (
        <div className="container mx-auto h-[100vh] flex items-center justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
}
