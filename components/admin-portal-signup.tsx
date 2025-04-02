"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useRouter, useParams } from "next/navigation";
import Loading from "@/components/ui/loading";

// Full signup details schema
const signupDetailsSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
})

// OTP verification schema remains the same.
const otpSchema = z.object({
  otp_id: z.number(),
  otp: z.string(),
});

// Define TypeScript interfaces for props using the full signup schema.
interface SignupDetailsFormProps {
  onSubmit: (values: z.infer<typeof signupDetailsSchema>) => void;
  error?: string;
}

interface OtpFormProps {
  onSubmit: (values: { otp: string; otp_id: number }) => void;
  error?: string;
  otpId: number | null;
  onBack: () => void;
}

// Separate components for signup details and OTP verification
function SignupDetailsForm({ onSubmit, error }: SignupDetailsFormProps) {
  const form = useForm<z.infer<typeof signupDetailsSchema>>({
    resolver: zodResolver(signupDetailsSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

      <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input className="h-9 min-w-[350px]" placeholder="admin" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input className="h-9 min-w-[300px]" placeholder="hello@example.com" {...field} />
              </FormControl>
              <FormDescription>Your email ID.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
       
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full h-9 rounded-md min-w-[300px]">
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
      otp_id: otpId || 0,
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
            <FormItem className="space-y-1">
              <FormLabel>OTP</FormLabel>
              <FormControl>
                <Input placeholder="Enter OTP" {...field} />
              </FormControl>
              <FormDescription>Enter the OTP sent to your email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full py-3 rounded-xl">
          Verify & Complete Signup
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full py-3 rounded-xl mt-2"
          onClick={onBack}
        >
          Back to Signup Form
        </Button>
      </form>
    </Form>
  );
}

export default function AdminPortalSignup() {
  const router = useRouter();
  const { tenant_id } = useParams();
  
  const [step, setStep] = useState<"details" | "otp">("details");
  const [error, setError] = useState("");
  const [otpId, setOtpId] = useState<number | null>(null);
  const [signupData, setSignupData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Handle signup form submission to generate OTP
  const handleSignupSubmit = async (values: z.infer<typeof signupDetailsSchema>) => {
    setError("");
    setLoading(true);
    setSignupData(values);

    try {
      const response = await fetch(
        `https://syncdjango.site/tenant-admin/${tenant_id}/signup/generate/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            name: values.name,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to generate OTP");
      }

      const data = await response.json();
      console.log("OTP generated:", data);

      setOtpId(data.otp_id);
      setStep("otp");
    } catch (err: any) {
      console.error("Error during signup OTP generation:", err);
      setError(err.message || "Something went wrong during OTP generation.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification to complete signup
  const handleOtpSubmit = async (values: { otp: string; otp_id: number }) => {
    setError("");
    setLoading(true);

    try {
      console.log("Submitting OTP verification:", values);
      const response = await fetch(
        `https://syncdjango.site/tenant-admin/${tenant_id}/signup/verify/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp_id: values.otp_id,
            otp: values.otp,
            // Include the signup data from the first step
            username: signupData.username,
            email: signupData.email,
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
      router.push("/dashboard/" + tenant_id);
    } catch (err: any) {
      console.error("Error during OTP verification:", err);
      setError(err.message || "Something went wrong during OTP verification.");
    } finally{
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-[600px] h-auto flex items-center">
      {step === "details" ? (
        <SignupDetailsForm onSubmit={handleSignupSubmit} error={error} />
      ) : (
        <OtpForm 
          onSubmit={handleOtpSubmit} 
          error={error} 
          otpId={otpId}
          onBack={() => {
            setStep("details");
            setError("");
          }}
        />
      )}
    </div>
  );
}