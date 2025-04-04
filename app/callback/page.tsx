"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const CallbackContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Add null check for searchParams
    if (!searchParams) {
      console.error("Search parameters not available");
      return;
    }
    
    const googleCode = searchParams.get("code");
    const stateParam = searchParams.get("state");

    if (!googleCode || !stateParam) {
      console.error("Missing Google auth code or state");
      return;
    }

    // Decode tenantId and userId from state
    const { tenant_id, user_id } = JSON.parse(decodeURIComponent(stateParam));

    console.log("Google Auth Code:", googleCode);
    console.log("Tenant ID:", tenant_id);
    console.log("User ID:", user_id);

    // Call the backend API route
    fetch(
      `https://syncdjango.site/tenant-admin/${tenant_id}/google/callback/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: googleCode, user_id }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend Response:", data);
        router.push(`/dashboard/${tenant_id}/integrations?google=true`);
      })
      .catch((error) => {
        console.error("Error sending data to backend:", error);
      });
  }, [searchParams, router]);

  return <h2>Processing Google Login...</h2>;
};

const CallbackPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading callback...</div>}>
      <CallbackContent />
    </Suspense>
  );
};

export default CallbackPage;
