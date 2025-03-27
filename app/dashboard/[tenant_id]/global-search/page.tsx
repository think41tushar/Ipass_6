"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { FileIcon, MailIcon, CalendarIcon } from "lucide-react";

interface SearchResult {
  results: {
    message: string;
    googleDrive?: {
      fileName: string;
      fileType: string;
    };
    emails?: {
      subject: string;
      from: string;
      date: string;
      body: string;
    }[];
    calendarEvents?: {
      title: string;
      date: string;
      time: string;
    }[];
  };
}

export default function GlobalSearchPage() {
  const { tenant_id } = useParams();
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const endpoint = `http://ec2-3-91-217-18.compute-1.amazonaws.com:8000/tenant-admin/globalSearch/`;

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
      
      const result: SearchResult = await response.json();
      console.log(result);
      
      setSearchResult(result);
      setLoading(false);
      setError("");
    } catch (error: any) {
      setLoading(false);
      setError(`Error searching file: ${error.message}`);
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

      {error !== "" && <div className="text-red-500 mt-4">{error}</div>}

      {loading ? (
        <div className="mt-8">
          <Skeleton className="h-4 mb-2 w-full" />
          <Skeleton className="h-4 mb-2 w-full" />
          <Skeleton className="h-4 w-[75%]" />
        </div>
      ) : (
        searchResult && (
          <Card className="w-full max-w-xl mt-6 h-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileIcon className="mr-2 h-6 w-6" />
                Search Results for "{filename}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Google Drive Section */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <FileIcon className="mr-2 h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Google Drive</h3>
                </div>
                <div className="pl-7">
                  <p>File: Very Serious</p>
                  <p>Type: Google Document</p>
                </div>
              </div>

              {/* <Separator className="my-4" /> */}

              {/* Emails Section */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <MailIcon className="mr-2 h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">Emails</h3>
                </div>
                <div className="pl-7">
                  <p><strong>Subject:</strong> very serious</p>
                  <p><strong>From:</strong> itishsrivastavakiit@gmail.com</p>
                  <p><strong>Date:</strong> March 25, 2025</p>
                  <p><strong>Body:</strong> "water bottle is leaking"</p>
                </div>
              </div>

              {/* <Separator className="my-4" /> */}

              {/* Calendar Events Section */}
              <div>
                <div className="flex items-center mb-2">
                  <CalendarIcon className="mr-2 h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Calendar Events</h3>
                </div>
                <div className="pl-7">
                  <p><strong>Event:</strong> Meeting based on recent email from Itish</p>
                  <p><strong>Date:</strong> March 27, 2025</p>
                  <p><strong>Time:</strong> 5:00 PM to 6:00 PM IST</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}