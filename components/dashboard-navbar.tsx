"use client";
import { Building2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface TenantData {
  tenant_name: string;
}

export default function DashboardNavbar() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState<TenantData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure that this code runs only on the client
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("data");
      if (storedData) {
        setTenantName(JSON.parse(storedData));
      }
      const storedTenantId = localStorage.getItem("tenant_id");
      if (storedTenantId) {
        setTenantId(storedTenantId);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // Add your logout logic (e.g., clearing tokens)
    router.push(`/tenant-admin-portal/${tenantId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f1219]">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 h-10 w-10 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg text-gray-400">Tenant</div>
            <div className="text-white font-medium text-lg">
              {tenantName?.tenant_name || "Loading..."}
            </div>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
              <button onClick={handleToggleDropdown}>
                {tenantName?.tenant_name?.charAt(0) || "U"}
              </button>
            </div>
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#0f1219] border rounded shadow-md">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-[#3e4d70]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


