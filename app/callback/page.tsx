"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const CallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
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

    // Call the Next.js API route
    fetch(`http://ec2-3-91-217-18.compute-1.amazonaws.com:8000/tenant-admin/${tenant_id}/google/callback/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: googleCode, user_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend Response:", data);
        router.push(`/dashboard/${tenant_id}/integrations`);
      })
      .catch((error) => {
        console.error("Error sending data to backend:", error);
      });
  }, [searchParams]);

  return <h2>Processing Google Login...</h2>;
};

export default CallbackPage;