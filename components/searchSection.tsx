import type React from "react"
import { FileIcon, MailIcon, CalendarIcon } from "lucide-react"
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
  if (searchError !== "") {
    return (
      <div className="text-red-500 mt-2 px-4 py-3 bg-red-500/10 rounded-lg border border-red-500/20">{searchError}</div>
    )
  }

  if (!showSearchResults) {
    return (
      <div className="text-gray-400 px-5 py-4 bg-[#1a1d29]/50 rounded-lg border border-gray-800/50 backdrop-blur-sm">
        Enter a command and click the "Search" icon or "Smart Run".
      </div>
    )
  }

  if (searchLoading) {
    return (
      <div className="w-full max-w-xl">
        <div className="h-4 mb-2 w-full bg-[#1a1d29] rounded animate-pulse"></div>
        <div className="h-4 mb-2 w-full bg-[#1a1d29] rounded animate-pulse"></div>
        <div className="h-4 w-3/4 bg-[#1a1d29] rounded animate-pulse"></div>
      </div>
    )
  }

  if (!searchResult) {
    return null
  }

  return (
    <div className="w-full max-w-xl rounded-xl bg-[#1a1d29] border border-gray-800 overflow-hidden shadow-lg shadow-black/20 transition-all duration-300">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-[#1a1d29] to-[#232631]">
        <div className="flex items-center">
          <FileIcon className="mr-3 h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-100">
            Search Results for "<span className="text-purple-400">{prompt}</span>"
          </h2>
        </div>
      </div>
      <div className="p-5 space-y-6">
        {searchResult.results.googleDrive && (
          <div className="group transition-all duration-200 hover:translate-x-1">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 mr-3 shadow-inner shadow-blue-500/10 group-hover:bg-blue-500/30 transition-all duration-200">
                <FileIcon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-200 text-lg">Google Drive</h3>
            </div>
            <div className="ml-11 p-4 rounded-xl bg-[#232631] border border-blue-500/10 hover:border-blue-500/20 transition-all duration-200 shadow-md shadow-black/10">
              <p className="text-gray-300 mb-2 flex flex-col sm:flex-row sm:items-center">
                <span className="text-gray-400 mr-2 min-w-[50px]">File:</span>
                <span className="font-medium">{searchResult.results.googleDrive.fileName}</span>
              </p>
              <p className="text-gray-300 flex flex-col sm:flex-row sm:items-center">
                <span className="text-gray-400 mr-2 min-w-[50px]">Type:</span>
                <span className="font-medium">{searchResult.results.googleDrive.fileType}</span>
              </p>
            </div>
          </div>
        )}

        {searchResult.results.emails && searchResult.results.emails.length > 0 && (
          <div className="group transition-all duration-200 hover:translate-x-1">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20 mr-3 shadow-inner shadow-red-500/10 group-hover:bg-red-500/30 transition-all duration-200">
                <MailIcon className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-gray-200 text-lg">Emails</h3>
            </div>
            <div className="space-y-4">
              {searchResult.results.emails.map((email, index) => (
                <div
                  key={index}
                  className="ml-11 p-4 rounded-xl bg-[#232631] border border-red-500/10 hover:border-red-500/20 transition-all duration-200 shadow-md shadow-black/10"
                >
                  <p className="text-gray-300 mb-2 flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 mr-2 min-w-[70px]">Subject:</span>
                    <span className="font-medium">{email.subject}</span>
                  </p>
                  <p className="text-gray-300 mb-2 flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 mr-2 min-w-[70px]">From:</span>
                    <span className="font-medium">{email.from}</span>
                  </p>
                  <p className="text-gray-300 mb-2 flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 mr-2 min-w-[70px]">Date:</span>
                    <span className="font-medium">{email.date}</span>
                  </p>
                  <div className="text-gray-300 mt-3 pt-3 border-t border-gray-700/50">
                    <span className="text-gray-400 block mb-2">Body:</span>
                    <p className="font-medium text-gray-300 leading-relaxed">{email.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResult.results.calendarEvents && searchResult.results.calendarEvents.length > 0 && (
          <div className="group transition-all duration-200 hover:translate-x-1">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/20 mr-3 shadow-inner shadow-green-500/10 group-hover:bg-green-500/30 transition-all duration-200">
                <CalendarIcon className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-200 text-lg">Calendar Events</h3>
            </div>
            <div className="space-y-4">
              {searchResult.results.calendarEvents.map((event, index) => (
                <div
                  key={index}
                  className="ml-11 p-4 rounded-xl bg-[#232631] border border-green-500/10 hover:border-green-500/20 transition-all duration-200 shadow-md shadow-black/10"
                >
                  <p className="text-gray-300 mb-2 flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 mr-2 min-w-[60px]">Event:</span>
                    <span className="font-medium">{event.title || "Untitled Event"}</span>
                  </p>
                  <p className="text-gray-300 mb-2 flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 mr-2 min-w-[60px]">Date:</span>
                    <span className="font-medium">{event.date}</span>
                  </p>
                  <p className="text-gray-300 flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 mr-2 min-w-[60px]">Time:</span>
                    <span className="font-medium">{event.time}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searchResult.results.googleDrive &&
          (!searchResult.results.emails || searchResult.results.emails.length === 0) &&
          (!searchResult.results.calendarEvents || searchResult.results.calendarEvents.length === 0) &&
          searchResult.results.message && (
            <div className="p-5 rounded-xl bg-[#232631] text-gray-300 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-200 shadow-md shadow-black/10">
              <ReactMarkdown>
                {searchResult.results.message}
              </ReactMarkdown>
            </div>
          )}
      </div>
    </div>
  )
}
