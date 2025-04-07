"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Loading from "@/components/ui/loading"
import { Building2, Users, ChevronRight } from "lucide-react"

export default function Dashboard() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("tenant_id") : null
    setTenantId(id)
  }, [])

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      setError("No tenant ID provided.")
      return
    }
    async function fetchTenantInfo() {
      setError("")
      setLoading(true)
      try {
        const response = await fetch(`https://syncdjango.site/tenant-admin/${tenantId}/getTenant/`)
        if (!response.ok) throw new Error("Failed to fetch tenant info")
        const data = await response.json()
        setTenantName(data.name)
        localStorage.setItem("data", JSON.stringify(data))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTenantInfo()
  }, [tenantId])

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#0a0d14]">
        <Loading />
      </div>
    )

  if (error)
    return <div className="flex justify-center items-center h-screen w-full bg-[#0a0d14] text-red-400">{error}</div>

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0d14] to-[#111827] text-white">
      <div className="relative overflow-hidden pb-10">
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-30 z-0" />
        <div className="container mx-auto p-8 pt-12 relative z-10">
          <div className="flex items-center mb-2">
            <div className="bg-purple-600 p-3 rounded-full mr-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300">
              {tenantName || "Dashboard"}
            </h1>
          </div>
          <p className="text-lg text-gray-400 ml-16">Tenant administration portal</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card className="bg-[#131825] border-0 shadow-xl hover:shadow-purple-900/10 transition-all duration-300 relative group p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-purple-400" />
                  Tenant Information
                </CardTitle>
                <CardDescription className="text-gray-400">Account details</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{tenantName}</p>
                <div className="mt-2 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2" />
                  <p className="text-sm text-gray-300">Active</p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-3 flex justify-between items-center">
                <p className="text-sm text-gray-400">ID: {tenantId}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-purple-400 hover:text-purple-300 hover:bg-transparent"
                >
                  <span className="text-sm">Details</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-[#131825] border-0 shadow-xl hover:shadow-purple-900/10 transition-all duration-300 relative group p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              <div className="absolute inset-0 rounded-lg border border-purple-500/10 group-hover:border-purple-500/30 transition-colors duration-300" />
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-2 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  Quick Action
                </CardTitle>
                <CardDescription className="text-gray-400">Jump straight in</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-6 relative">
                <div className="flex flex-col space-y-4">
                  <p className="text-sm text-gray-300">Manage your tenant users and permissions with a single click</p>
                  <Button
                    className="w-full bg-[#131825] hover:bg-[#1a2035] text-white py-5 rounded-md transition-all duration-300 flex items-center justify-center relative overflow-hidden group/button"
                    onClick={() => router.push(`/dashboard/${tenantId}/users`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 opacity-90 group-hover/button:opacity-100 transition-opacity" />
                    <span className="relative flex items-center font-medium">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                      <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover/button:translate-x-1" />
                    </span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800/30 pt-3 flex justify-between items-center">
                {/* <div className="flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1.5"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-1.5"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500/50"></div>
                </div> */}
                <p className="text-xs text-gray-500">Admin access</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

