"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminPortalLogin from "@/components/admin-portal-login"
import AdminPortalSignup from "@/components/admin-portal-signup"
import { useParams } from "next/navigation"
import Loading from "@/components/ui/loading"

export default function TenantAdminPortal() {
  const [tenantName, setTenantName] = useState("")
  const [loading, setLoading] = useState(true)
  const params = useParams<{ tenant_id: string }>()
  const tenant_id = params?.tenant_id || ''
  const [error, setError] = useState("")
  
  // Store tenant_id in localStorage (client-side only)
  useEffect(() => {
    if (tenant_id) {
      localStorage.setItem("tenant_id", tenant_id)
    }
  }, [tenant_id])

  useEffect(() => {
    async function fetchTenantInfo() {
      console.log("Attempting to fetch tenant info for tenant_id:", tenant_id)
      try {
        const response = await fetch(`https://syncdjango.site/tenant-admin/${tenant_id}/getTenant/`)
        console.log("Fetch response status:", response.status)
        if (!response.ok) {
          console.error("Fetch failed with status:", response.status)
          throw new Error("Failed to fetch tenant info")
        }
        const data = await response.json()
        console.log("Fetched tenant data:", data)
        setTenantName(data.tenant_name)
      } catch (err: any) {
        console.error("Error while fetching tenant info:", err)
        setError(err.message)
      } finally {
        console.log("Finished fetching tenant info")
        setLoading(false)
      }
    }

    if (tenant_id) {
      fetchTenantInfo()
    } else {
      console.warn("No tenant ID provided in URL.")
      setLoading(false)
      setError("No tenant ID provided in URL.")
    }
  }, [tenant_id])

  // If loading, render the Loading component with enhanced styling
  if (loading) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="p-8 rounded-xl bg-black/40 backdrop-blur-lg border border-white/5 shadow-2xl">
          <Loading />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-xl animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/3 right-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-2xl animate-[bounce_15s_ease-in-out_infinite]"></div>
        <div className="absolute top-2/3 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-xl animate-[pulse_7s_ease-in-out_infinite]"></div>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="backdrop-blur-lg bg-black/40 rounded-2xl border border-white/10 shadow-2xl p-8 transition-all duration-300 hover:shadow-purple-500/5">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-4 rounded-full shadow-lg shadow-purple-500/20 mb-4 transform transition-transform duration-300 hover:scale-105">
              <Building2 className="h-10 w-10 text-white drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 tracking-tight">
              Tenant Admin Portal
            </h1>
            <div className="text-md mt-2 text-gray-400 font-light">
              {error ? (
                <span className="text-red-400 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                  {error}
                </span>
              ) : (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
                  {tenantName}
                </span>
              )}
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-gray-800/50 backdrop-blur-sm border border-white/5 p-1">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 h-px -top-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
            </div>

            <div className="mt-6">
              <TabsContent value="login" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <AdminPortalLogin />
              </TabsContent>
              <TabsContent value="signup" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <AdminPortalSignup />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="text-center mt-6 text-xs text-gray-500 opacity-70">
          © {new Date().getFullYear()} Tenant Admin System • All Rights Reserved
        </div>
      </div>
    </div>
  )
}

