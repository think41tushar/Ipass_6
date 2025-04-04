"use client"

import Link from "next/link"
import { LayoutDashboard, User, Settings, Search, Rocket } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, usePathname } from "next/navigation"

export default function DashboardSidebar() {
  const [selected, setSelected] = useState("dashboard")
  const [tenant_id, setTenantId] = useState('')
  const pathname = usePathname() // ADDED: Hook to detect route changes
  const [loading, setLoading] = useState(false) // loading state for route change

  // Get tenant_id from URL path
  useEffect(() => {
    // Extract tenant_id from URL path
    const pathParts = pathname?.split('/') || []
    const urlTenantId = pathParts.length > 2 ? pathParts[2] : ''
    
    // Set tenant_id from URL or localStorage
    if (urlTenantId) {
      setTenantId(urlTenantId)
      // Also store in localStorage for other components
      if (typeof window !== 'undefined') {
        localStorage.setItem('tenant_id', urlTenantId)
      }
    } else if (typeof window !== 'undefined') {
      // Fallback to localStorage if URL doesn't have tenant_id
      const storedTenantId = localStorage.getItem('tenant_id')
      if (storedTenantId) setTenantId(storedTenantId)
    }
  }, [pathname])

  // Reset loading state when the route changes
  useEffect(() => {
    setLoading(false)
  }, [pathname])

  // Handler to update selection and trigger loading overlay.
  const handleLinkClick = (section: string) => {
    setSelected(section)
    setLoading(true) // Set loading true on click.
  }

  return (
    <div>
      <div className="flex flex-col border-r border-gray-800 p-4 gap-4 px-4 h-[100vh] w-[20rem] bg-[#0f1219] sticky top-0 left-0">
        <div className="mb-6 mt-2">
          <div className="text-gray-400 text-lg font-medium uppercase tracking-wider px-4 mb-2">Main Menu</div>
        </div>

        <Link
          href={`/dashboard/${tenant_id}`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md transition-colors duration-200 ${
            selected === "dashboard" ? "bg-[#1a1f2c] text-white border-l-4 border-purple-600" : "text-gray-400"
          } hover:bg-[#1a1f2c] hover:text-white`}
          onClick={() => handleLinkClick("dashboard")}
        >
          <LayoutDashboard className={`h-5 w-5 ${selected === "dashboard" ? "text-purple-500" : ""}`} />
          <span className="text-lg font-medium">Dashboard</span>
        </Link>

        <Link
          href={`/dashboard/${tenant_id}/users`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md transition-colors duration-200 ${
            selected === "users" ? "bg-[#1a1f2c] text-white border-l-4 border-purple-600" : "text-gray-400"
          } hover:bg-[#1a1f2c] hover:text-white`}
          onClick={() => handleLinkClick("users")}
        >
          <User className={`h-5 w-5 ${selected === "users" ? "text-purple-500" : ""}`} />
          <span className="text-lg font-medium">Users</span>
        </Link>

        <Link
          href={`/dashboard/${tenant_id}/integrations`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md transition-colors duration-200 ${
            selected === "integrations" ? "bg-[#1a1f2c] text-white border-l-4 border-purple-600" : "text-gray-400"
          } hover:bg-[#1a1f2c] hover:text-white`}
          onClick={() => handleLinkClick("integrations")}
        >
          <Settings className={`h-5 w-5 ${selected === "integrations" ? "text-purple-500" : ""}`} />
          <span className="text-lg font-medium">Integrations</span>
        </Link>

        <Link
          href={`/dashboard/${tenant_id}/global-search`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md transition-colors duration-200 ${
            selected === "global-search" ? "bg-[#1a1f2c] text-white border-l-4 border-purple-600" : "text-gray-400"
          } hover:bg-[#1a1f2c] hover:text-white`}
          onClick={() => handleLinkClick("global-search")}
        >
          <Search className={`h-5 w-5 ${selected === "global-search" ? "text-purple-500" : ""}`} />
          <span className="text-lg font-medium">Search</span>
        </Link>

        <Link
          href={`/dashboard/${tenant_id}/prompt`}
          className={`flex items-center gap-4 p-2 px-4 rounded-md transition-colors duration-200 ${
            selected === "prompt" ? "bg-[#1a1f2c] text-white border-l-4 border-purple-600" : "text-gray-400"
          } hover:bg-[#1a1f2c] hover:text-white`}
          onClick={() => handleLinkClick("prompt")}
        >
          <Rocket className={`h-5 w-5 ${selected === "prompt" ? "text-purple-500" : ""}`} />
          <span className="text-lg font-medium">Prompt</span>
        </Link>
      </div>

      {/* Loading overlay using your existing class */}
      {loading && (
        <div className="fixed inset-0 bg-[#0a0c13]/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="h-10 w-10 rounded-full border-4 border-gray-700 border-t-purple-500 animate-spin"></div>
        </div>
      )}
    </div>
  )
}

