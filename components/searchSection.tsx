"use client"

import { useState, useEffect } from "react" // Import useEffect
import type React from "react"
import {
  FileIcon,
  MailIcon,
  CalendarIcon,
  ChevronRight,
  Search,
  AlertCircle,
  Loader2,
  Briefcase
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

// Define the structure matching the Gemini API response
interface FormattedSearchResult {
  googleDrive: { fileName: string; fileType: string } | null;
  emails: Array<{ subject: string; from: string; date: string; body: string }>;
  calendarEvents: Array<{ title: string; date: string; time: string; description?: string }>;
  hubspot: Array<{ title: string; snippet: string }>;
}

interface SearchResult {
  results: {
    message: string // The original raw message
  } | (FormattedSearchResult & { message: string }) | null; // It can be the raw message initially or the formatted result with message later
}

interface SearchSectionProps {
  searchError: string
  searchLoading: boolean
  showSearchResults: boolean
  searchResult: SearchResult | null
  prompt: string
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchError,
  searchLoading,
  showSearchResults,
  searchResult: initialSearchResult, // Renamed to avoid shadowing
  prompt,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    googleDrive: false,
    emails: false,
    calendar: false,
    hubspot: false,
  });
  const [formattedSearchResult, setFormattedSearchResult] = useState<FormattedSearchResult | null>(null);
  const [formattingLoading, setFormattingLoading] = useState(false);
  const [formattingError, setFormattingError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearchResult?.results?.message && !formattedSearchResult && !formattingLoading && !formattingError) {
      // If we have a raw message and haven't formatted it yet, call the Gemini API
      formatSearchResultWithGemini(initialSearchResult.results.message);
    } else if (initialSearchResult?.results && !(initialSearchResult.results as any)?.message && !formattedSearchResult) {
      // If the initial result is already in the formatted structure (or null), use it directly
      setFormattedSearchResult(initialSearchResult.results as FormattedSearchResult | null);
    }
  }, [initialSearchResult, formattedSearchResult, formattingLoading, formattingError]);

  const formatSearchResultWithGemini = async (rawMessage: string) => {
    setFormattingLoading(true);
    setFormattingError(null);
    try {
      const response = await fetch('http://localhost:3000/api/gemini-searchformatter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawSearchResult: rawMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormattingError(errorData.error || 'Failed to format search result.');
        setFormattingLoading(false);
        return;
      }

      const formattedData: FormattedSearchResult = await response.json();
      setFormattedSearchResult(formattedData);
      setFormattingLoading(false);
    } catch (error: any) {
      console.error('Error formatting search result:', error);
      setFormattingError(error.message || 'An unexpected error occurred.');
      setFormattingLoading(false);
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  if (searchError !== "") {
    return (
      <div className="w-full rounded-xl border border-red-500/20 bg-red-500/5 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>{searchError}</p>
        </div>
      </div>
    );
  }

  if (!showSearchResults) {
    return (
      <div className="w-full rounded-xl border border-gray-800/50 bg-[#1a1d29]/50 p-8 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <Search className="mb-4 h-12 w-12 opacity-50 text-gray-400" />
          <p className="text-lg text-gray-400">
            Enter a command and click the "Search" icon or "Smart Run".
          </p>
        </div>
      </div>
    );
  }

  if (searchLoading || formattingLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Loading Header */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-[#1a1d29] shadow-lg">
          <div className="border-b border-gray-800 bg-gradient-to-r from-[#1a1d29] to-[#232631] p-4">
            <div className="flex items-center">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-500" />
              <div className="h-6 w-48 animate-pulse rounded bg-gray-800"></div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="p-5 space-y-6">
            <div className="w-full overflow-hidden rounded-xl border border-blue-500/10 bg-[#232631] shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                    <FileIcon className="h-5 w-5 text-blue-400 animate-pulse" />
                  </div>
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
            </div>
            <div className="w-full overflow-hidden rounded-xl border border-red-500/10 bg-[#232631] shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                    <MailIcon className="h-5 w-5 text-red-400 animate-pulse" />
                  </div>
                  <div className="h-6 w-24 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-800"></div>
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-800"></div>
                  <div className="h-4 w-5/6 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
            </div>
            <div className="w-full overflow-hidden rounded-xl border border-green-500/10 bg-[#232631] shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                    <CalendarIcon className="h-5 w-5 text-green-400 animate-pulse" />
                  </div>
                  <div className="h-6 w-40 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-800"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-800"></div>
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
            </div>
            <div className="w-full overflow-hidden rounded-xl border border-purple-500/10 bg-[#232631] shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                    <Briefcase className="h-5 w-5 text-purple-400 animate-pulse" />
                  </div>
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (formattingError) {
    return (
      <div className="w-full rounded-xl border border-red-500/20 bg-red-500/5 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>Error formatting search result: {formattingError}</p>
        </div>
      </div>
    );
  }

  if (!showSearchResults) {
    return null;
  }

  if (!formattedSearchResult && initialSearchResult?.results?.message) {
    // Still waiting for the formatted result
    return null; // Or a loading indicator if you prefer
  }

  const resultsToDisplay = formattedSearchResult || (initialSearchResult?.results as FormattedSearchResult) || null;

  return (
    <div className="w-full space-y-6">
      <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-[#1a1d29] shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gradient-to-r from-[#1a1d29] to-[#232631] p-4">
          <div className="flex items-center">
            <Search className="mr-3 h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-100">
              Search Results for "<span className="text-purple-400">{prompt}</span>"
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Google Drive Section */}
          {resultsToDisplay?.googleDrive ? (
            <div className="group w-full overflow-hidden rounded-xl border border-blue-500/10 bg-[#232631] shadow-md transition-all duration-300 hover:border-blue-500/20">
              {/* ... (rest of the Google Drive rendering logic using resultsToDisplay.googleDrive) */}
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 shadow-inner shadow-blue-500/10">
                    <FileIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">Google Drive</h3>
                </div>
              </div>
              <div className={`px-4 pt-0 ${expandedSections.googleDrive ? 'block' : 'hidden'}`}>
                <div className="space-y-2">
                  <p className="flex flex-col text-gray-300 sm:flex-row sm:items-center">
                    <span className="mr-2 min-w-[50px] text-gray-400">File:</span>
                    <span className="font-medium">{resultsToDisplay.googleDrive.fileName}</span>
                  </p>
                  <p className="flex flex-col text-gray-300 sm:flex-row sm:items-center">
                    <span className="mr-2 min-w-[50px] text-gray-400">Type:</span>
                    <span className="font-medium">{resultsToDisplay.googleDrive.fileType}</span>
                  </p>
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button
                  variant="ghost"
                  className="ml-auto text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 group-hover:bg-blue-500/5"
                  onClick={() => toggleSection("googleDrive")}
                >
                  {expandedSections.googleDrive ? "View Less" : "View More"}{" "}
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-transform ${expandedSections.googleDrive ? "rotate-90" : ""}`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-blue-500/10 bg-[#232631] shadow-md">
              {/* ... (no Google Drive results UI) */}
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 shadow-inner shadow-blue-500/10">
                    <FileIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">Google Drive</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-400">No Google Drive files found for this search</p>
                </div>
              </div>
            </div>
          )}

          {/* Emails Section */}
          {resultsToDisplay?.emails && resultsToDisplay.emails.length > 0 ? (
            <div className="group w-full overflow-hidden rounded-xl border border-red-500/10 bg-[#232631] shadow-md transition-all duration-300 hover:border-red-500/20">
              {/* ... (rest of the Emails rendering logic using resultsToDisplay.emails) */}
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-justify-center rounded-xl bg-red-500/20 shadow-inner shadow-red-500/10">
                    <MailIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">Emails</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="space-y-4">
                  {(expandedSections.emails
                    ? resultsToDisplay.emails
                    : resultsToDisplay.emails.slice(0, 1)
                  ).map((email, index) => (
                    <div
                      key={index}
                      className="border border-red-500/10 rounded-xl bg-[#1a1d29] p-4 transition-all duration-200"
                    >
                      <p className="mb-2 flex flex-col text-gray-300 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] text-gray-400">Subject:</span>
                        <span className="font-medium">{email.subject}</span>
                      </p>
                      <p className="mb-2 flex flex-col text-gray-300 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] text-gray-400">From:</span>
                        <span className="font-medium">{email.from}</span>
                      </p>
                      <p className="mb-2 flex flex-col text-gray-300 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] text-gray-400">Date:</span>
                        <span className="font-medium">{email.date}</span>
                      </p>
                      {expandedSections.emails && (
                        <div className="mt-3 border-t border-gray-700/50 pt-3 text-gray-300">
                          <span className="mb-2 block text-gray-400">Body:</span>
                          <p className="font-medium leading-relaxed text-gray-300">{email.body}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {!expandedSections.emails && resultsToDisplay.emails.length > 1 && (
                    <p className="mt-2 text-center text-sm text-gray-400">
                      +{resultsToDisplay.emails.length - 1} more emails
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button
                  variant="ghost"
                  className="ml-auto text-red-400 hover:bg-red-500/10 hover:text-red-300 group-hover:bg-red-500/5"
                  onClick={() => toggleSection("emails")}
                >
                  {expandedSections.emails ? "View Less" : "View More"}{" "}
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-transform ${expandedSections.emails ? "rotate-90" : ""}`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-red-500/10 bg-[#232631] shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 shadow-inner shadow-red-500/10">
                    <MailIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">Emails</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-400">No emails found for this search</p>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Events Section */}
          {resultsToDisplay?.calendarEvents &&
          resultsToDisplay.calendarEvents.length > 0 ? (
            <div className="group w-full overflow-hidden rounded-xl border border-green-500/10 bg-[#232631] shadow-md transition-all duration-300 hover:border-green-500/20">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 shadow-inner shadow-green-500/10">
                    <CalendarIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">Calendar Events</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="space-y-4">
                  {(expandedSections.calendar
                    ? resultsToDisplay.calendarEvents
                    : resultsToDisplay.calendarEvents.slice(0, 1)
                  ).map((event, index) => (
                    <div
                      key={index}
                      className="border border-green-500/10 rounded-xl bg-[#1a1d29] p-4 transition-all duration-200"
                    >
                      <p className="mb-2 flex flex-col text-gray-300 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[60px] text-gray-400">Event:</span>
                        <span className="font-medium">{event.title || "Untitled Event"}</span>
                      </p>
                      <p className="mb-2 flex flex-col text-gray-300 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[60px] text-gray-400">Date:</span>
                        <span className="font-medium">{event.date}</span>
                      </p>
                      <p className="flex flex-col text-gray-300 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[60px] text-gray-400">Time:</span>
                        <span className="font-medium">{event.time}</span>
                      </p>
                    </div>
                  ))}
                  {!expandedSections.calendar &&
                    resultsToDisplay.calendarEvents.length > 1 && (
                      <p className="mt-2 text-center text-sm text-gray-400">
                        +{resultsToDisplay.calendarEvents.length - 1} more events
                      </p>
                    )}
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button
                  variant="ghost"
                  className="ml-auto text-green-400 hover:bg-green-500/10 hover:text-green-300 group-hover:bg-green-500/5"
                  onClick={() => toggleSection("calendar")}
                >
                  {expandedSections.calendar ? "View Less" : "View More"}{" "}
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-transform ${
                      expandedSections.calendar ? "rotate-90" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-green-500/10 bg-[#232631] shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 shadow-inner shadow-green-500/10">
                    <CalendarIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">Calendar Events</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-400">No calendar events found for this search</p>
                </div>
              </div>
            </div>
          )}

          {/* Hubspot Section */}
          {resultsToDisplay?.hubspot &&
          resultsToDisplay.hubspot.length > 0 ? (
            <div className="group w-full overflow-hidden rounded-xl border border-purple-500/10 bg-[#232631] shadow-md transition-all duration-300 hover:border-purple-500/20">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 shadow-inner shadow-purple-500/10">
                    <Briefcase className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">Hubspot</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="space-y-4">
                  {(expandedSections.hubspot
                    ? resultsToDisplay.hubspot
                    : resultsToDisplay.hubspot.slice(0, 1)
                  ).map((item, index) => (
                    <div
                      key={index}
                      className="border border-purple-500/10 rounded-xl bg-[#1a1d29] p-4 transition-all duration-200"
                    >
                      <p className="mb-2 flex flex-col text-gray-300 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] text-gray-400">Title:</span>
                        <span className="font-medium">{item.title}</span>
                      </p>
                      <p className="mb-2 flex flex-col text-gray-300 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] text-gray-400">Snippet:</span>
                        <span className="font-medium">{item.snippet}</span>
                      </p>
                    </div>
                  ))}
                  {!expandedSections.hubspot &&
                    resultsToDisplay.hubspot.length > 1 && (
                      <p className="mt-2 text-center text-sm text-gray-400">
                        +{resultsToDisplay.hubspot.length - 1} more results
                      </p>
                    )}
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button
                  variant="ghost"
                  className="ml-auto text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 group-hover:bg-purple-500/5"
                  onClick={() => toggleSection("hubspot")}
                >
                  {expandedSections.hubspot ? "View Less" : "View More"}{" "}
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-transform ${
                      expandedSections.hubspot ? "rotate-90" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-purple-500/10 bg-[#232631] shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 shadow-inner shadow-purple-500/10">
                    <Briefcase className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">Hubspot</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-400">No Hubspot results found for this search</p>
                </div>
              </div>
            </div>
          )}

          {/* Message Section (if no other results) */}
          {!resultsToDisplay?.googleDrive &&
            (!resultsToDisplay?.emails ||
              resultsToDisplay.emails.length === 0) &&
            (!resultsToDisplay?.calendarEvents ||
              resultsToDisplay.calendarEvents.length === 0) &&
            (!resultsToDisplay?.hubspot ||
              resultsToDisplay.hubspot.length === 0) &&
            initialSearchResult?.results &&
            typeof initialSearchResult.results === 'object' &&
            'message' in initialSearchResult.results && (
              <div className="group w-full overflow-hidden rounded-xl border border-purple-500/10 bg-[#232631] shadow-md transition-all duration-300 hover:border-purple-500/20">
                <div className="p-4 pb-2">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 shadow-inner shadow-purple-500/10">
                      <Search className="h-5 w-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200">Search Message</h3>
                  </div>
                </div>
                <div className="px-4 pt-0 prose prose-invert max-w-none">
                  <ReactMarkdown>{initialSearchResult.results.message}</ReactMarkdown>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};