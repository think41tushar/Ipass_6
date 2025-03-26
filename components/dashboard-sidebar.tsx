"use client";

import Link from "next/link";
import { LayoutDashboard, User, Settings, Search, Rocket } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function DashboardSidebar() {
  const [selected, setSelected] = useState("dashboard");
  const { tenant_id } = useParams();

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
          onClick={() => setSelected("dashboard")}
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
          onClick={() => setSelected("users")}
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
          onClick={() => setSelected("integrations")}
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
          onClick={() => setSelected("global-search")}
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
          onClick={() => setSelected("prompt")}
        >
          <Rocket className="h-6 w-6" />
          <span className="text-lg">Prompt</span>
        </Link>
      </div>
    </div>
  );
}
