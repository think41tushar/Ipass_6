"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { FileIcon, MailIcon, CalendarIcon, Search } from "lucide-react"
import ReactMarkdown from "react-markdown"

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
    }[]
  }
}

export default function GlobalSearchPage() {
  const { tenant_id } = useParams()
  const [loading, setLoading] = useState(false)
  const [filename, setFilename] = useState("")
  const [error, setError] = useState("")
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

  const endpoint = `https://syncdjango.site/tenant-admin/globalSearch/`

  const searchFile = async () => {
    try {
      setLoading(true)
      setError("")

      const reqbody = { filename }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqbody),
      })

      if (!response.ok) {
        setLoading(false)
        setError("Error fetching file details")
        return
      }

      const result: SearchResult = await response.json()
      console.log(result)
      setSearchResult(result)
      setLoading(false)
      setError("")
    } catch (error: any) {
      setLoading(false)
      setError(`Error searching file: ${error.message}`)
    }
  }

  return (
    <div className="flex flex-col p-8 w-full min-h-screen bg-[#0f1117] text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600">
          <FileIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Global Search</h1>
          <p className="text-gray-400">Search for any files across all integrations</p>
        </div>
      </div>

      <div className="flex w-full max-w-md items-center space-x-2 mb-8">
        <div className="relative flex-1">
          <input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            type="text"
            placeholder="Search files, emails, events..."
            className="w-full px-4 py-2.5 pl-10 rounded-lg bg-[#1a1d29] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={searchFile}
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-medium"
        >
          Search
        </button>
      </div>

      {error !== "" && <div className="text-red-500 mt-4 mb-4">{error}</div>}

      {loading ? (
        <div className="w-full max-w-xl">
          <div className="h-4 mb-4 w-full bg-[#1a1d29] rounded animate-pulse"></div>
          <div className="h-4 mb-4 w-full bg-[#1a1d29] rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-[#1a1d29] rounded animate-pulse"></div>
        </div>
      ) : (
        searchResult && (
          <div className="w-full max-w-xl rounded-xl bg-[#1a1d29] border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center">
                <FileIcon className="mr-2 h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold">Search Results for "{filename}"</h2>
              </div>
            </div>
            <div className="p-5">
              {/* Google Drive Section */}
              {searchResult.results.googleDrive && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 mr-3">
                      <FileIcon className="h-4 w-4 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-200">Google Drive</h3>
                  </div>
                  <div className="ml-11 p-3 rounded-lg bg-[#232631]">
                    <p className="text-gray-300 mb-1">
                      <span className="text-gray-400 mr-2">File:</span>
                      {searchResult.results.googleDrive.fileName}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400 mr-2">Type:</span>
                      {searchResult.results.googleDrive.fileType}
                    </p>
                  </div>
                </div>
              )}

              {/* Emails Section */}
              {searchResult.results.emails && searchResult.results.emails.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 mr-3">
                      <MailIcon className="h-4 w-4 text-red-400" />
                    </div>
                    <h3 className="font-semibold text-gray-200">Emails</h3>
                  </div>
                  <div className="space-y-3">
                    {searchResult.results.emails.map((email, index) => (
                      <div key={index} className="ml-11 p-3 rounded-lg bg-[#232631]">
                        <p className="text-gray-300 mb-1">
                          <span className="text-gray-400 mr-2">Subject:</span>
                          {email.subject}
                        </p>
                        <p className="text-gray-300 mb-1">
                          <span className="text-gray-400 mr-2">From:</span>
                          {email.from}
                        </p>
                        <p className="text-gray-300 mb-1">
                          <span className="text-gray-400 mr-2">Date:</span>
                          {email.date}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400 mr-2">Body:</span>
                          {email.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Events Section */}
              {searchResult.results.calendarEvents && searchResult.results.calendarEvents.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 mr-3">
                      <CalendarIcon className="h-4 w-4 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-gray-200">Calendar Events</h3>
                  </div>
                  <div className="space-y-3">
                    {searchResult.results.calendarEvents.map((event, index) => (
                      <div key={index} className="ml-11 p-3 rounded-lg bg-[#232631]">
                        <p className="text-gray-300 mb-1">
                          <span className="text-gray-400 mr-2">Event:</span>
                          {event.title || "Untitled Event"}
                        </p>
                        <p className="text-gray-300 mb-1">
                          <span className="text-gray-400 mr-2">Date:</span>
                          {event.date}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400 mr-2">Time:</span>
                          {event.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback: if none of the specific sections are provided, render the full message */}
              {!searchResult.results.googleDrive &&
                (!searchResult.results.emails || searchResult.results.emails.length === 0) &&
                (!searchResult.results.calendarEvents || searchResult.results.calendarEvents.length === 0) && (
                  <div className="p-3 rounded-lg bg-[#232631] text-gray-300">
                    <ReactMarkdown>{searchResult.results.message}</ReactMarkdown>
                  </div>
                )}
            </div>
          </div>
        )
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
            <p className="mt-4 text-white font-medium">Searching...</p>
          </div>
        </div>
      )}
    </div>
  )
}


