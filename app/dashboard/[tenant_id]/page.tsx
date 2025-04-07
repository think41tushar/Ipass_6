"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import {
  Building2,
  Users,
  Layers,
  ChevronRight,
  Activity,
  BarChart3,
} from "lucide-react";

export default function Dashboard() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Grab tenantId from localStorage on client
  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("tenant_id") : null;
    setTenantId(id);
  }, []);

  // Fetch tenant info whenever tenantId changes
  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      setError("No tenant ID provided.");
      return;
    }

    async function fetchTenantInfo() {
      setError("");
      setLoading(true);
      try {
        const response = await fetch(
          `https://syncdjango.site/tenant-admin/${tenantId}/getTenant/`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tenant info");
        }
        const data = await response.json();
        setTenantName(data.name);
        localStorage.setItem("data", JSON.stringify(data));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTenantInfo();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#0a0d14]">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#0a0d14] text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0d14] to-[#111827] text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
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
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tenant Card */}
          <Card className="bg-[#131825] border-0 shadow-xl hover:shadow-purple-900/10 transition-all duration-300 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

          {/* ...other cards unchanged, just replace any `tenant_id` with `tenantId`... */}

        </div>

        {/* Quick Actions */}
        <div className="mt-10 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="bg-[#131825] hover:bg-[#1c2333] border border-gray-800 text-white py-4 flex items-center px-4 shadow-md"
              onClick={() => router.push(`/dashboard/${tenantId}/users`)}
            >
              <div className="bg-purple-600/20 p-2 rounded-md mr-3">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">Manage Users</p>
                <p className="text-xs text-gray-400 mt-1">Add, remove, or update user accounts</p>
              </div>
            </Button>
            {/* …and so on for the other buttons… */}
          </div>
        </div>
      </div>
    </div>
  );
}
