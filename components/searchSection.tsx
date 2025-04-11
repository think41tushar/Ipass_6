"use client"

import { useState } from "react"
import type React from "react"
import { FileIcon, MailIcon, CalendarIcon, ChevronRight, Search, AlertCircle, Loader2, Briefcase } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface SearchResult {
  results: {
    message: string
    googleDrive?: {
      fileName: string
      fileType: string
    }
    emails?: {
      subject: string
      from: string
      date: string
      body: string
    }[]
    calendarEvents?: {
      title?: string
      date: string
      time: string
      description?: string
    }[]
    hubspot?: {
      title: string
      snippet: string
    }[]
  }
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
  searchResult,
  prompt,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    googleDrive: false,
    emails: false,
    calendar: false,
    hubspot: false,
  })

  // Helper function to clean text from stars
  const cleanText = (text: string) => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove double stars
      .replace(/\*([^*]+)\*/g, "$1") // Remove single stars
  }

  // Helper function to categorize messages
  const categorizeMessage = (message: string) => {
    const cleanedMessage = cleanText(message)
    const lowerMessage = cleanedMessage.toLowerCase()

    if (
      lowerMessage.includes("mail") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("subject:") ||
      lowerMessage.includes("from:")
    ) {
      return {
        type: "email",
        data: {
          subject: cleanText(cleanedMessage.match(/Subject:\s*([^\n]*)/)?.[1] || ""),
          from: cleanText(cleanedMessage.match(/From:\s*([^\n]*)/)?.[1] || ""),
          date: cleanText(cleanedMessage.match(/Date:\s*([^\n]*)/)?.[1] || ""),
          body: cleanText(cleanedMessage.replace(/Subject:.*\n|From:.*\n|Date:.*\n/g, "").trim()),
        },
      }
    } else if (
      lowerMessage.includes("calendar") ||
      lowerMessage.includes("event") ||
      lowerMessage.includes("meeting")
    ) {
      return {
        type: "calendar",
        data: {
          title: cleanText(
            cleanedMessage.match(/Event:\s*([^\n]*)/)?.[1] ||
              cleanedMessage.match(/Title:\s*([^\n]*)/)?.[1] ||
              "Untitled Event",
          ),
          date: cleanText(cleanedMessage.match(/Date:\s*([^\n]*)/)?.[1] || ""),
          time: cleanText(cleanedMessage.match(/Time:\s*([^\n]*)/)?.[1] || ""),
          description: cleanText(cleanedMessage.replace(/Event:.*\n|Title:.*\n|Date:.*\n|Time:.*\n/g, "").trim()),
        },
      }
    } else if (lowerMessage.includes("file:") || lowerMessage.includes("document") || lowerMessage.includes("drive")) {
      return {
        type: "drive",
        data: {
          fileName: cleanText(cleanedMessage.match(/File:\s*([^\n]*)/)?.[1] || ""),
          fileType: cleanText(cleanedMessage.match(/Type:\s*([^\n]*)/)?.[1] || "Document"),
        },
      }
    } else if (lowerMessage.includes("hubspot") || cleanedMessage.includes("HubSpot Notes:")) {
      // Try to extract HubSpot notes format first
      const hubspotMatch = cleanedMessage.match(/HubSpot Notes:[\s\S]*?(?=\n\d|$)/i)
      if (hubspotMatch) {
        const notes = hubspotMatch[0]
        const titleMatch = notes.match(/Title:\s*([^\n]+)/)
        const summaryMatch = notes.match(/Summary:\s*([^\n]+)/)

        if (titleMatch && summaryMatch) {
          return {
            type: "hubspot",
            data: {
              title: cleanText(titleMatch[1].trim()),
              snippet: cleanText(summaryMatch[1].trim()),
            },
          }
        }
      }

      // Fallback to simple format
      const lines = cleanedMessage.split("\n")
      const firstLine = cleanText(lines[0].trim())
      const restContent = cleanText(lines.slice(1).join("\n").trim())

      return {
        type: "hubspot",
        data: {
          title: firstLine,
          snippet: restContent || firstLine,
        },
      }
    }
    return { type: "other", data: cleanText(message) }
  }

  // Process and categorize the messages if they're not already categorized
  const processSearchResult = (result: SearchResult): SearchResult => {
    console.log("Raw Search Result:", result)
    if (
      !result.results.emails &&
      !result.results.calendarEvents &&
      !result.results.googleDrive &&
      !result.results.hubspot &&
      result.results.message
    ) {
      const messages = cleanText(result.results.message)
        .split("\n\n")
        .filter((msg) => msg.trim())

      const categorized = {
        emails: [] as any[],
        calendarEvents: [] as any[],
        hubspot: [] as any[],
        googleDrive: undefined as any,
      }

      messages.forEach((msg) => {
        const { type, data } = categorizeMessage(msg)
        switch (type) {
          case "email":
            categorized.emails.push(data)
            break
          case "calendar":
            categorized.calendarEvents.push(data)
            break
          case "drive":
            if (!categorized.googleDrive) {
              categorized.googleDrive = data
            }
            break
          case "hubspot":
            categorized.hubspot.push(data)
            break
        }
      })

      const processedResult = {
        results: {
          ...result.results,
          message: cleanText(result.results.message),
          emails: categorized.emails.length > 0 ? categorized.emails : undefined,
          calendarEvents: categorized.calendarEvents.length > 0 ? categorized.calendarEvents : undefined,
          hubspot: categorized.hubspot.length > 0 ? categorized.hubspot : undefined,
          googleDrive: categorized.googleDrive,
        },
      }

      return processedResult
    }

    // If the result is already categorized, clean any text content
    return {
      results: {
        ...result.results,
        message: result.results.message ? cleanText(result.results.message) : undefined,
        emails: result.results.emails?.map((email) => ({
          ...email,
          subject: cleanText(email.subject),
          from: cleanText(email.from),
          date: cleanText(email.date),
          body: cleanText(email.body),
        })),
        calendarEvents: result.results.calendarEvents?.map((event) => ({
          ...event,
          title: cleanText(event.title || ""),
          date: cleanText(event.date),
          time: cleanText(event.time),
          description: cleanText(event.description || ""),
        })),
        hubspot: result.results.hubspot?.map((item) => ({
          ...item,
          title: cleanText(item.title),
          snippet: cleanText(item.snippet),
        })),
        googleDrive: result.results.googleDrive
          ? {
              ...result.results.googleDrive,
              fileName: cleanText(result.results.googleDrive.fileName),
              fileType: cleanText(result.results.googleDrive.fileType),
            }
          : undefined,
      },
    }
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }))
  }

  if (searchError !== "") {
    return (
      <div className="w-full rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-500/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-red-500/30">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="h-5 w-5 animate-pulse" />
          <p className="font-medium">{searchError}</p>
        </div>
      </div>
    )
  }

  if (!showSearchResults) {
    return (
      <div className="w-full rounded-xl border border-gray-800/30 bg-gradient-to-br from-[#1a1d29]/80 to-[#1a1d29]/50 p-8 shadow-lg backdrop-blur-sm transition-all duration-300">
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            <Search className="mb-4 h-16 w-16 text-gray-400/90" />
          </motion.div>
          <p className="text-lg text-gray-400/90 max-w-md">
            Enter a command and click the "Search" icon or "Smart Run".
          </p>
        </div>
      </div>
    )
  }

  if (searchLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Loading Header */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-800/30 bg-gradient-to-br from-[#1a1d29]/90 to-[#1a1d29]/70 shadow-lg backdrop-blur-md">
          <div className="border-b border-gray-800/50 bg-gradient-to-r from-[#1a1d29]/90 via-[#232631]/80 to-[#1a1d29]/90 p-4">
            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              </div>
              <div className="h-6 w-48 animate-pulse rounded-full bg-gray-800/50"></div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="p-5 space-y-6">
            {/* Google Drive Loading */}
            <div className="w-full overflow-hidden rounded-xl border border-blue-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 shadow-inner shadow-blue-500/10">
                    <FileIcon className="h-5 w-5 text-blue-400 animate-pulse" />
                  </div>
                  <div className="h-6 w-32 animate-pulse rounded-full bg-gray-800/50"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-800/50"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-800/50"></div>
                </div>
              </div>
            </div>

            {/* Email Loading */}
            <div className="w-full overflow-hidden rounded-xl border border-red-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 shadow-inner shadow-red-500/10">
                    <MailIcon className="h-5 w-5 text-red-400 animate-pulse" />
                  </div>
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-800/50"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded-full bg-gray-800/50"></div>
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-800/50"></div>
                  <div className="h-4 w-5/6 animate-pulse rounded-full bg-gray-800/50"></div>
                </div>
              </div>
            </div>

            {/* Calendar Loading */}
            <div className="w-full overflow-hidden rounded-xl border border-green-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 shadow-inner shadow-green-500/10">
                    <CalendarIcon className="h-5 w-5 text-green-400 animate-pulse" />
                  </div>
                  <div className="h-6 w-40 animate-pulse rounded-full bg-gray-800/50"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-800/50"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-800/50"></div>
                  <div className="h-4 w-1/3 animate-pulse rounded-full bg-gray-800/50"></div>
                </div>
              </div>
            </div>

            {/* Hubspot Loading */}
            <div className="w-full overflow-hidden rounded-xl border border-purple-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20 shadow-inner shadow-purple-500/10">
                    <Briefcase className="h-5 w-5 text-purple-400 animate-pulse" />
                  </div>
                  <div className="h-6 w-32 animate-pulse rounded-full bg-gray-800/50"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-800/50"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-800/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!searchResult) {
    return null
  }

  const processedSearchResult = processSearchResult(searchResult)

  return (
    <div className="w-full space-y-6 transition-all duration-300">
      <div className="w-full overflow-hidden rounded-xl border border-gray-800/30 bg-gradient-to-br from-[#1a1d29]/90 to-[#1a1d29]/70 shadow-lg backdrop-blur-md transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-800/50 bg-gradient-to-r from-[#1a1d29]/90 via-[#232631]/80 to-[#1a1d29]/90 p-4 backdrop-blur-md">
          <div className="flex items-center">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20 shadow-inner shadow-purple-500/10">
              <Search className="h-4 w-4 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-100/90">
              Search Results for "<span className="text-purple-400 font-bold">{prompt}</span>"
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Google Drive Section */}
          {processedSearchResult.results.googleDrive ? (
            <div className="group w-full overflow-hidden rounded-xl border border-blue-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-900/5 hover:shadow-lg">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 shadow-inner shadow-blue-500/10">
                    <FileIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200/90">Google Drive</h3>
                </div>
              </div>
              <div className={`px-4 pt-0 ${expandedSections.googleDrive ? "block" : "hidden"}`}>
                <div className="space-y-2">
                  <p className="flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                    <span className="mr-2 min-w-[50px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                      File:
                    </span>
                    <span className="font-medium tracking-wide">
                      {processedSearchResult.results.googleDrive.fileName}
                    </span>
                  </p>
                  <p className="flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                    <span className="mr-2 min-w-[50px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                      Type:
                    </span>
                    <span className="font-medium tracking-wide">
                      {processedSearchResult.results.googleDrive.fileType}
                    </span>
                  </p>
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button
                  variant="ghost"
                  className="ml-auto text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 group-hover:bg-blue-500/5 transition-all duration-300"
                  onClick={() => toggleSection("googleDrive")}
                >
                  {expandedSections.googleDrive ? "View Less" : "View More"}{" "}
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-transform duration-300 ${expandedSections.googleDrive ? "rotate-90" : ""}`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-blue-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 shadow-inner shadow-blue-500/10">
                    <FileIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200/90">Google Drive</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-400/90">No Google Drive files found for this search</p>
                </div>
              </div>
            </div>
          )}

          {/* Emails Section */}
          {processedSearchResult.results.emails && processedSearchResult.results.emails.length > 0 ? (
            <div className="group w-full overflow-hidden rounded-xl border border-red-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md transition-all duration-300 hover:border-red-500/30 hover:shadow-red-900/5 hover:shadow-lg">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 shadow-inner shadow-red-500/10">
                    <MailIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200/90">Emails</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="space-y-4">
                  {(expandedSections.emails
                    ? processedSearchResult.results.emails
                    : processedSearchResult.results.emails.slice(0, 1)
                  ).map((email, index) => (
                    <div
                      key={index}
                      className="border border-red-500/10 rounded-xl bg-gradient-to-br from-[#1a1d29]/90 to-[#1a1d29]/70 backdrop-blur-sm p-4 transition-all duration-200"
                    >
                      <p className="mb-2 flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                          Subject:
                        </span>
                        <span className="font-medium tracking-wide">{email.subject}</span>
                      </p>
                      <p className="mb-2 flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                          From:
                        </span>
                        <span className="font-medium tracking-wide">{email.from}</span>
                      </p>
                      <p className="mb-2 flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                          Date:
                        </span>
                        <span className="font-medium tracking-wide">{email.date}</span>
                      </p>
                      {expandedSections.emails && (
                        <div className="mt-3 border-t border-gray-700/50 pt-3 text-gray-300/90">
                          <span className="mb-2 block text-gray-400/90">Body:</span>
                          <p className="font-medium tracking-wide leading-relaxed text-gray-300/90">{email.body}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {!expandedSections.emails && processedSearchResult.results.emails.length > 1 && (
                    <p className="mt-2 text-center text-sm text-gray-400/90">
                      +{processedSearchResult.results.emails.length - 1} more emails
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button
                  variant="ghost"
                  className="ml-auto text-red-400 hover:bg-red-500/10 hover:text-red-300 group-hover:bg-red-500/5 transition-all duration-300"
                  onClick={() => toggleSection("emails")}
                >
                  {expandedSections.emails ? "View Less" : "View More"}{" "}
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-transform duration-300 ${expandedSections.emails ? "rotate-90" : ""}`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-red-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 shadow-inner shadow-red-500/10">
                    <MailIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200/90">Emails</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-400/90">No emails found for this search</p>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Events Section */}
          {processedSearchResult.results.calendarEvents && processedSearchResult.results.calendarEvents.length > 0 ? (
            <div className="group w-full overflow-hidden rounded-xl border border-green-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md transition-all duration-300 hover:border-green-500/30 hover:shadow-green-900/5 hover:shadow-lg">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 shadow-inner shadow-green-500/10">
                    <CalendarIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200/90">Calendar Events</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="space-y-4">
                  {(expandedSections.calendar
                    ? processedSearchResult.results.calendarEvents
                    : processedSearchResult.results.calendarEvents.slice(0, 1)
                  ).map((event, index) => (
                    <div
                      key={index}
                      className="border border-green-500/10 rounded-xl bg-gradient-to-br from-[#1a1d29]/90 to-[#1a1d29]/70 backdrop-blur-sm p-4 transition-all duration-200"
                    >
                      <p className="mb-2 flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[60px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                          Event:
                        </span>
                        <span className="font-medium tracking-wide">{event.title || "Untitled Event"}</span>
                      </p>
                      <p className="mb-2 flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[60px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                          Date:
                        </span>
                        <span className="font-medium tracking-wide">{event.date}</span>
                      </p>
                      <p className="flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[60px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                          Time:
                        </span>
                        <span className="font-medium tracking-wide">{event.time}</span>
                      </p>
                    </div>
                  ))}
                  {!expandedSections.calendar && processedSearchResult.results.calendarEvents.length > 1 && (
                    <p className="mt-2 text-center text-sm text-gray-400/90">
                      +{processedSearchResult.results.calendarEvents.length - 1} more events
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button
                  variant="ghost"
                  className="ml-auto text-green-400 hover:bg-green-500/10 hover:text-green-300 group-hover:bg-green-500/5 transition-all duration-300"
                  onClick={() => toggleSection("calendar")}
                >
                  {expandedSections.calendar ? "View Less" : "View More"}{" "}
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-transform duration-300 ${expandedSections.calendar ? "rotate-90" : ""}`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-green-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 shadow-inner shadow-green-500/10">
                    <CalendarIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200/90">Calendar Events</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-400/90">No calendar events found for this search</p>
                </div>
              </div>
            </div>
          )}

          {/* Hubspot Section */}
          {processedSearchResult.results.hubspot && processedSearchResult.results.hubspot.length > 0 ? (
            <div className="group w-full overflow-hidden rounded-xl border border-purple-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md transition-all duration-300 hover:border-purple-500/30 hover:shadow-purple-900/5 hover:shadow-lg">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20 shadow-inner shadow-purple-500/10">
                    <Briefcase className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200/90">Hubspot</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="space-y-4">
                  {(expandedSections.hubspot
                    ? processedSearchResult.results.hubspot
                    : processedSearchResult.results.hubspot.slice(0, 1)
                  ).map((item, index) => (
                    <div
                      key={index}
                      className="border border-purple-500/10 rounded-xl bg-gradient-to-br from-[#1a1d29]/90 to-[#1a1d29]/70 backdrop-blur-sm p-4 transition-all duration-200"
                    >
                      <p className="mb-2 flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                          Title:
                        </span>
                        <span className="font-medium tracking-wide">{item.title}</span>
                      </p>
                      <p className="mb-2 flex flex-col text-gray-300/90 sm:flex-row sm:items-center">
                        <span className="mr-2 min-w-[70px] font-semibold text-xs uppercase tracking-wider text-gray-400/90">
                          Snippet:
                        </span>
                        <span className="font-medium tracking-wide">{item.snippet}</span>
                      </p>
                    </div>
                  ))}
                  {!expandedSections.hubspot && processedSearchResult.results.hubspot.length > 1 && (
                    <p className="mt-2 text-center text-sm text-gray-400/90">
                      +{processedSearchResult.results.hubspot.length - 1} more results
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4 pt-2">
                <Button
                  variant="ghost"
                  className="ml-auto text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 group-hover:bg-purple-500/5 transition-all duration-300"
                  onClick={() => toggleSection("hubspot")}
                >
                  {expandedSections.hubspot ? "View Less" : "View More"}{" "}
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-transform duration-300 ${expandedSections.hubspot ? "rotate-90" : ""}`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-purple-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md">
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20 shadow-inner shadow-purple-500/10">
                    <Briefcase className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200/90">Hubspot</h3>
                </div>
              </div>
              <div className="px-4 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-400/90">No Hubspot results found for this search</p>
                </div>
              </div>
            </div>
          )}

          {/* Message Section (if no other results) */}
          {!processedSearchResult.results.googleDrive &&
            (!processedSearchResult.results.emails || processedSearchResult.results.emails.length === 0) &&
            (!processedSearchResult.results.calendarEvents ||
              processedSearchResult.results.calendarEvents.length === 0) &&
            (!processedSearchResult.results.hubspot || processedSearchResult.results.hubspot.length === 0) &&
            processedSearchResult.results.message && (
              <div className="group w-full overflow-hidden rounded-xl border border-purple-500/10 bg-gradient-to-br from-[#232631]/90 to-[#1a1d29]/80 shadow-md transition-all duration-300 hover:border-purple-500/30 hover:shadow-purple-900/5 hover:shadow-lg">
                <div className="p-4 pb-2">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20 shadow-inner shadow-purple-500/10">
                      <Search className="h-5 w-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200/90">Search Message</h3>
                  </div>
                </div>
                <div className="px-4 pt-0 prose prose-invert max-w-none">
                  <ReactMarkdown>{processedSearchResult.results.message}</ReactMarkdown>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}