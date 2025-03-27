"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPortalLogin from "@/components/admin-portal-login";
import AdminPortalSignup from "@/components/admin-portal-signup";
import { useParams } from "next/navigation";

export default function TenantAdminPortal() {
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(true);
  const { tenant_id } = useParams();
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTenantInfo() {
      console.log("Attempting to fetch tenant info for tenant_id:", tenant_id);
      try {
        const response = await fetch(`http://ec2-3-91-217-18.compute-1.amazonaws.com:8000/tenant-admin/${tenant_id}/getTenant/`);
        console.log("Fetch response status:", response.status);
        if (!response.ok) {
          console.error("Fetch failed with status:", response.status);
          throw new Error("Failed to fetch tenant info");
        }
        const data = await response.json();
        console.log("Fetched tenant data:", data);
        setTenantName(data.tenant_name);
      } catch (err: any) {
        console.error("Error while fetching tenant info:", err);
        setError(err.message);
      } finally {
        console.log("Finished fetching tenant info");
        setLoading(false);
      }
    }
  
    if (tenant_id) {
      fetchTenantInfo();
    } else {
      console.warn("No tenant ID provided in URL.");
      setLoading(false);
      setError("No tenant ID provided in URL.");
    }
  }, [tenant_id]);
  

  return (
    <div className="container mx-auto w-fit h-[100vh] flex flex-col justify-center gap-4">
      <div className="flex gap-4 items-center">
        <Building2 className="h-12 w-12 text-white" />
        <div className="flex flex-col">
          <div className="text-4xl font-bold">Tenant Admin Portal</div>
          <div className="text-md self-center text-muted-foreground">
            {loading
              ? "Loading tenant info..."
              : error
              ? error
              : tenantName}
          </div>
        </div>
      </div>
      <Tabs defaultValue="login" className="w-[400px]">
        <div className="flex justify-center my-2">
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </div>
        <hr className="bg-white h-0.5 my-4" />
        <TabsContent value="login">
          <AdminPortalLogin />
        </TabsContent>
        <TabsContent value="signup">
          <AdminPortalSignup />
        </TabsContent>
      </Tabs>
    </div>
  );
}
