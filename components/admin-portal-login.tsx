"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { string, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
  otp_id: z.number(),
  otp: z.string(),
});

interface EmailFormProps {
  onSubmit: (values: { email: string }) => void;
  error?: string;
}

interface OtpFormProps {
  onSubmit: (values: { otp: string; otp_id: number }) => void;
  error?: string;
  otpId: number | null;
  onBack: () => void;
}

// Separate components for email and OTP forms to completely isolate state
function EmailForm({ onSubmit, error }: EmailFormProps) {
  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="hello@example.com" {...field} />
              </FormControl>
              <FormDescription>Enter your email address</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full py-3 rounded-xl">
          Send OTP
        </Button>
      </form>
    </Form>
  );
}

function OtpForm({ onSubmit, error, otpId, onBack }: OtpFormProps) {
  const form = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { 
      otp: "", 
      otp_id: otpId || 0 
    },
  });

  // Ensure otp_id is set correctly
  form.setValue("otp_id", otpId || 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OTP</FormLabel>
              <FormControl>
                <Input placeholder="Enter OTP" {...field} />
              </FormControl>
              <FormDescription>Enter the OTP you received</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full py-3 rounded-xl">
          Verify OTP
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full py-3 rounded-xl mt-2"
          onClick={onBack}
        >
          Back to Email
        </Button>
      </form>
    </Form>
  );
}

export default function AdminPortalLogin() {
  const router = useRouter();
  const { tenant_id } = useParams();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");
  const [otpId, setOtpId] = useState<number | null>(null);

  // Handle email submission to generate OTP
  const handleEmailSubmit = async (values: { email: string }) => {
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tenant-admin/${tenant_id}/login/generate/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to generate OTP");
      }

      const data = await response.json();
      console.log("OTP generated:", data);

      setOtpId(data.otp_id); // Store otp_id in state
      setStep("otp");
    } catch (err: any) {
      console.error("Error during OTP generation:", err);
      setError(err.message || "Something went wrong during OTP generation.");
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (values: { otp: string; otp_id: number }) => {
    setError("");

    try {
      console.log("Submitting OTP verification:", values);
      const response = await fetch(
        `http://127.0.0.1:8000/tenant-admin/${tenant_id}/login/verify/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp_id: values.otp_id,
            otp: values.otp,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to verify OTP");
      }
      // Store the user id in localStorage
      const data = await response.json();
      const tenantID=tenant_id as string;
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("tenant_id", tenantID);
      router.push(`/dashboard/${tenant_id}`);
    } catch (err: any) {
      console.error("Error during OTP verification:", err);
      setError(err.message || "Something went wrong during OTP verification.");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      {step === "email" ? (
        <EmailForm onSubmit={handleEmailSubmit} error={error} />
      ) : (
        <OtpForm 
          onSubmit={handleOtpSubmit} 
          error={error} 
          otpId={otpId} 
          onBack={() => {
            setStep("email");
            setError("");
          }} 
        />
      )}
    </div>
  );
}