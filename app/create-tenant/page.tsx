"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Building2, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import Loading from "@/components/ui/loading"
import Link from "next/link"

export default function CreateTenant() {
  const router = useRouter()
  const [tenantName, setTenantName] = useState("")
  const [tenantEmail, setTenantEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true)
    e.preventDefault()

    const payload = {
      tenant_name: tenantName,
      email: tenantEmail,
    }

    try {
      const response = await fetch("https://syncdjango.site/tenant/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        // Log more details for debugging
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to create tenant: ${errorText}`)
      }

      // Optionally, handle the response data here
      const data = await response.json()
      console.log("Tenant created:", data)

      // Redirect to tenant admin portal
      // router.push("/tenant-admin-portal/" + data.tenant_id);
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

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
    <div className="min-h-[100vh] flex flex-col justify-center items-center px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-xl animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/3 right-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-2xl animate-[bounce_15s_ease-in-out_infinite]"></div>
        <div className="absolute top-2/3 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-xl animate-[pulse_7s_ease-in-out_infinite]"></div>
      </div>

      <Link
        href="/"
        className="flex gap-2 items-center text-gray-400 self-center mb-6 hover:text-white transition-all duration-300 transform hover:-translate-x-1 group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:text-purple-400" />
        <span className="text-sm font-medium">Back to home</span>
      </Link>

      <div className="w-full max-w-md backdrop-blur-lg bg-black/40 rounded-2xl border border-white/10 shadow-2xl p-8 transition-all duration-300 hover:shadow-purple-500/5">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-4 rounded-full shadow-lg shadow-purple-500/20 mb-4 transform transition-transform duration-300 hover:scale-105">
            <Building2 className="h-10 w-10 text-white drop-shadow-md" />
          </div>

          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 tracking-tight text-center">
            Create new Tenant
          </h1>

          <p className="mt-3 text-gray-400 text-center font-light">
            Setup a new tenant in the system with custom configuration.
          </p>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-gray-500">tenant details</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="tenant-name" className="text-sm font-medium text-gray-300">
              Tenant Name
            </Label>
            <Input
              type="text"
              id="tenant-name"
              placeholder="Enter tenant name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="bg-black/50 border-white/10 rounded-lg focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-300 h-11 placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tenant-email" className="text-sm font-medium text-gray-300">
              Tenant Email
            </Label>
            <Input
              type="email"
              id="tenant-email"
              placeholder="Enter tenant email"
              value={tenantEmail}
              onChange={(e) => setTenantEmail(e.target.value)}
              className="bg-black/50 border-white/10 rounded-lg focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-300 h-11 placeholder:text-gray-500"
              required
            />
          </div>

          <Button
            className="mt-4 h-12 rounded-xl text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none shadow-lg shadow-purple-700/30 hover:shadow-purple-700/50 transition-all duration-300 transform hover:-translate-y-1"
            type="submit"
          >
            Create Tenant
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>All tenant information is securely stored and encrypted</p>
        </div>
      </div>

      <div className="text-center mt-6 text-xs text-gray-600 opacity-70">
        © {new Date().getFullYear()} Tenant Admin System • All Rights Reserved
      </div>
    </div>
  )
}
