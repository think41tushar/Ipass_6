"use client"
import { Building2 } from "lucide-react"
import { useEffect, useState } from "react"

interface TenantData {
  tenant_name: string
}

export default function DashboardNavbar() {
  const [tenantName, setTenantName] = useState<TenantData | null>(null)

  useEffect(() => {
    const data = localStorage.getItem("data")
    if (data) {
      setTenantName(JSON.parse(data))
    }
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f1219]">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 h-10 w-10 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Tenant</div>
            <div className="text-white font-medium">{tenantName?.tenant_name || "Loading..."}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
            {tenantName?.tenant_name?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </div>
  )
}

