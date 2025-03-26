"use client";
import { Building2 } from "lucide-react";
export default function DashboardNavbar() {
  return (
    <div>
      <div className="flex items-center gap-2 p-4 border-b border-muted">
        <div>
          <Building2 className="h-12 w-12 text-white" />
        </div>
        <div>Tenant 1234</div>
      </div>
    </div>
  );
}
