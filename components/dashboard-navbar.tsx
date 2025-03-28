"use client";
import { Building2 } from "lucide-react";
export default function DashboardNavbar() {

  const tenantName = JSON.parse(localStorage.getItem("data") || "");
  console.log(tenantName);
  return (
    <div>
      <div className="flex items-center gap-2 p-4 border-b border-muted">
        <div>
          <Building2 className="h-12 w-12 text-white" />
        </div>
        <div>Tenant: {tenantName?.tenant_name}</div>
      </div>
    </div>
  );
}
