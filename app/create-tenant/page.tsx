"use client";

import { Button } from "@/components/ui/button";
import { Building2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Loading from "@/components/ui/loading"
import Link from "next/link";

export default function CreateTenant() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [error, setError] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    const payload = {
      tenant_name: tenantName,
      email: tenantEmail,
    };

    try {
      const response = await fetch("http://ec2-3-91-217-18.compute-1.amazonaws.com:8000/tenant/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Log more details for debugging
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to create tenant: ${errorText}`);
      }

      // Optionally, handle the response data here
      const data = await response.json();
      console.log("Tenant created:", data);

      // Redirect to tenant admin portal
      // router.push("/tenant-admin-portal/" + data.tenant_id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }finally{
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto h-[100vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[100vh] flex flex-col justify-center items-center px-4">
      <Link
        href="/"
        className="flex gap-2 items-center text-muted-foreground self-center mb-6 hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to home</span>
      </Link>
      <div className="flex-col gap-8h-[40vh] max-w-lg p-8 bg-background rounded-xl shadow-lg border border-border justify-center content-center">
        <div className="flex gap-4 items-center mb-4">
          <Building2 className="h-12 w-12 text-white" />
          <h1 className="text-4xl font-bold">Create new Tenant</h1>
        </div>  
        <p className="mb-6 text-lg text-muted-foreground">
          Setup a new tenant in the system.
        </p>
        <hr className="bg-white h-0.5 my-4" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-4">
        <div className="flex flex-col gap-4 my-4">
          <Label htmlFor="tenant-name">Tenant Name</Label>
          <Input
            type="text"
            id="tenant-name"
            placeholder="Tenant Name"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className="rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        <Label htmlFor="tenant-email">Tenant Email</Label>
          <Input
            type="email"
            id="tenant-email"
            placeholder="Tenant Email"
            value={tenantEmail}
            onChange={(e) => setTenantEmail(e.target.value)}
            className="rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button
          className="w-full py-3 rounded-2xl transition-colors hover:bg-primary"
          type="submit"
        >
          Create Tenant
        </Button>
        </form>
      </div>
    </div>
  );
}
