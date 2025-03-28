"use client";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <>
      {/* Animated background - positioned absolutely to be behind content */}
      <div className="fixed inset-0 -z-1 overflow-hidden">
        <div className="absolute inset-0 bg-black">
          {/* Animated circles with direct animation properties */}
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-xl animate-[pulse_4s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-1/3 right-1/3 h-80 w-80 rounded-full bg-white/3 blur-2xl animate-[bounce_15s_ease-in-out_infinite]"></div>
          <div className="absolute top-2/3 left-1/3 h-48 w-48 rounded-full bg-white/4 blur-xl animate-[pulse_7s_ease-in-out_infinite]"></div>
          
          {/* Gradient background with animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/2 to-transparent animate-[background-pan_10s_ease-in-out_infinite] bg-[length:200%_200%]"></div>
        </div>
      </div>

      <div className="container mx-auto text-center w-96 h-[100vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="">
          <Building2 className="h-12 w-12 text-white" />
        </div>
        <div className="text-4xl font-bold">Tenant Admin System</div>
        <div className="text-lg text-muted-foreground">
          Multi-tenant administration platform with seamless OAuth integration
          and elegant user management
        </div>
        <Button
          className="p-6 rounded-4xl"
          onClick={() => router.push("/create-tenant")}
        >
          Create Tenant
        </Button>
        <div className="text-sm text-muted-foreground">Admin access only</div>
      </div>
    </>
  );
}