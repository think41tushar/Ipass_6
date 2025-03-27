"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileIcon, MailIcon, CalendarIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
      title?: string;
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

      const reqbody = { filename };

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
      // Optionally clear the filename here:
      // setFilename("");
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
          onChange={(e) => setFilename(e.target.value)}
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
              {searchResult.results.googleDrive && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <FileIcon className="mr-2 h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Google Drive</h3>
                  </div>
                  <div className="pl-7">
                    <p>
                      <strong>File:</strong>{" "}
                      {searchResult.results.googleDrive.fileName}
                    </p>
                    <p>
                      <strong>Type:</strong>{" "}
                      {searchResult.results.googleDrive.fileType}
                    </p>
                  </div>
                </div>
              )}

              {/* Emails Section */}
              {searchResult.results.emails && searchResult.results.emails.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <MailIcon className="mr-2 h-5 w-5 text-red-500" />
                    <h3 className="font-semibold">Emails</h3>
                  </div>
                  <div className="pl-7 space-y-2">
                    {searchResult.results.emails.map((email, index) => (
                      <div key={index}>
                        <p>
                          <strong>Subject:</strong> {email.subject}
                        </p>
                        <p>
                          <strong>From:</strong> {email.from}
                        </p>
                        <p>
                          <strong>Date:</strong> {email.date}
                        </p>
                        <p>
                          <strong>Body:</strong> {email.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Events Section */}
              {searchResult.results.calendarEvents && searchResult.results.calendarEvents.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <CalendarIcon className="mr-2 h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Calendar Events</h3>
                  </div>
                  <div className="pl-7 space-y-2">
                    {searchResult.results.calendarEvents.map((event, index) => (
                      <div key={index}>
                        <p>
                          <strong>Event:</strong> {event.title || "Untitled Event"}
                        </p>
                        <p>
                          <strong>Date:</strong> {event.date}
                        </p>
                        <p>
                          <strong>Time:</strong> {event.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback: if none of the specific sections are provided, render the full message */}
              {(!searchResult.results.googleDrive &&
                (!searchResult.results.emails || searchResult.results.emails.length === 0) &&
                (!searchResult.results.calendarEvents ||
                  searchResult.results.calendarEvents.length === 0)) && (
                <div className="mt-4">
                  <ReactMarkdown>{searchResult.results.message}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
