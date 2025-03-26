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

export default function dashboard() {
  const { tenant_id } = useParams();
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTenantInfo() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/tenant-admin/${tenant_id}/getTenant/`);
        if (!response.ok) {
          throw new Error("Failed to fetch tenant info");
        }
        const data = await response.json();
        console.log(data);
        setTenantName(data.name);
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
  return (
    <div className="container mx-auto flex flex-col items-center mt-8">
      <div className="text-4xl font-bold">Dashboard Tenant {tenantName}</div>
      <div className="text-lg text-muted-foreground">
        Overview of your tenant administration
      </div>
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
              <CardDescription>Icon</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Tenant {tenantName}</p>
            </CardContent>
            <CardFooter>
              <p>
                Status: <span className="text-green-400">Active</span>
              </p>
            </CardFooter>
          </Card>
        </div>
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Icon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">234</p>
            </CardContent>
            <CardFooter>
              <p>
                Last Login:{" "}
                <span className="text-muted-foreground">2 days ago</span>
              </p>
            </CardFooter>
          </Card>
        </div>
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Icon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">0</p>
              <p className="text-muted-foreground">Active Integrations</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard/${tenant_id}/integrations")}
              >
                Configure
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
