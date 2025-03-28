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
import { useRouter, useParams } from "next/navigation";
import Loading from "@/components/ui/loading";

export default function Dashboard() {
  const { tenant_id } = useParams();
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTenantInfo() {
      setError("");
      setLoading(true);
      try {
        const response = await fetch(
          `http://ec2-3-91-217-18.compute-1.amazonaws.com:8000/tenant-admin/${tenant_id}/getTenant/`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tenant info");
        }
        const data = await response.json();
        console.log(data);
        setTenantName(data.name);
        localStorage.setItem("data", JSON.stringify(data));
        console.log(data.tenant_name);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (tenant_id) {
      fetchTenantInfo();
    } else {
      setLoading(false);
      setError("No tenant ID provided in URL.");
    }
  }, [tenant_id]);

  const router = useRouter();

  if (loading) {
    return (
      <div className="max-w-md mx-auto flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 mt-8 flex flex-col items-start">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white">
          Dashboard Tenant {tenantName}
        </h1>
        <p className="text-lg text-muted-foreground">
          Overview of your tenant administration
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Tenant Information
            </CardTitle>
            <CardDescription>Icon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white">Tenant {tenantName}</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm">
              Status: <span className="text-green-400">Active</span>
            </p>
          </CardFooter>
        </Card>
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Users</CardTitle>
            <CardDescription>Icon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-white">234</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm">
              Last Login:{" "}
              <span className="text-muted-foreground">2 days ago</span>
            </p>
          </CardFooter>
        </Card>
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Integrations
            </CardTitle>
            <CardDescription>Icon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-white">0</p>
            <p className="text-muted-foreground">Active Integrations</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/dashboard/${tenant_id}/integrations`)
              }
            >
              Configure
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
