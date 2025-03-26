"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function GlobalSearchPage() {
  const { tenant_id } = useParams();
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [fileDetails, setFileDetails] = useState("");
  const endpoint = `http://127.0.0.1:8000/tenant-admin/globalSearch/`;

  const searchFile = async () => {
    try {
      setLoading(true);
      setError("");
      const reqbody = {
        filename: filename,
      };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqbody),
      });
      if (!response.ok) {
        setLoading(false);
        setError("Error fetching file details");
        return;
      }
      const result = await response.json();
      console.log(result);
      setFileDetails(result.message);
      setLoading(false);
      setError("");
    } catch (error: any) {
      throw new Error("Error searching file: ", error.message);
    }
  };

  return (
    <div className="container mx-auto flex flex-col p-8">
      <div className="text-4xl font-bold">Global Search</div>
      <div className="text-muted-foreground">
        Search for any files across all integrations
      </div>
      <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
        <Input
          value={filename}
          onChange={(e) => {
            setFilename(e.target.value);
          }}
          type="text"
          placeholder="Filename"
        />
        <Button onClick={searchFile} type="submit">
          Search
        </Button>
      </div>
      {error !== "" ? <div className="text-red-500">{error}</div> : ""}
      {loading ? (
        <div className="mt-8">
          <Skeleton className="h-4 mb-2 w-full" />
          <Skeleton className="h-4 mb-2 w-full" />
          <Skeleton className="h-4 w-[75%]" />
        </div>
      ) : (
        fileDetails && (
          <div className="border w-full mt-8 p-4 rounded">{fileDetails}</div>
        )
      )}
    </div>
  );
}
