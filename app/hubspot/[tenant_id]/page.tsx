"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Check, X, ArrowUpDown, ArrowRight } from "lucide-react"
import ReactMarkdown from "react-markdown" // Added for markdown formatting
import Loading from "@/components/ui/loading"

// Type definition for summary card
interface SummaryCard {
  id: number
  summary: string
}

export default function ShipToHubspot() {
  const [cards, setCards] = useState<SummaryCard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // State to track which cards are expanded
  const [expandedCards, setExpandedCards] = useState<number[]>([])

  // Function to send approval data to the backend
  const sendApproval = async (content: string) => {
    console.log(content)
    console.log(JSON.stringify(content))
    setIsLoading(true);

    const tenant_id = localStorage.getItem("tenant_id")
    if (!tenant_id) {
      alert("Tenant ID not found")
      return
    }
    try {
      const response = await fetch(`https://syncdjango.site/hubspot/hubspotPost/${tenant_id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          "input": content,
          "rerun":false,
          "changed":false,
          "history":[],
          "session_id":"1223" 
        })
      })
      if (response.ok) {
        alert("Data sent successfully!")
        console.log(response)
      } else {
        alert("Failed to send data.")
        console.log(response)
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred while sending data.")
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch summaries from the endpoint
  useEffect(() => {
    const fetchSummaries = async () => {
      const tenant_id = localStorage.getItem("tenant_id");
      try {
        setIsLoading(true);
        const user_id = 'bff85ddd-d98f-44bf-b5c2-004693ed295b'; // Replace with your actual user ID or variable
        const response = await fetch(
          `https://syncdjango.site/hubspot/send/c7708025-2553-448e-8380-ea7bee605e0b/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "user_id": user_id })
          }
        );
  
        if (!response.ok) {
          throw new Error('Failed to fetch summaries');
        }
  
        const data = await response.json();
  
        // Transform summaries into SummaryCard format with incrementing ids
        const fetchedCards = data.summaries.map((summary: string, index: number) => ({
          id: index + 1,
          summary
        }));
  
        setCards(fetchedCards);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSummaries();
  }, []);

  // Filter cards based on search term
  const filteredCards = cards.filter((card) => 
    card.summary.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.id - b.id
    } else {
      return b.id - a.id
    }
  })

  // Remove card
  const removeCard = (id: number) => {
    setCards(cards.filter((card) => card.id !== id))
  }

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // Toggle expand/collapse for a given card
  const toggleExpand = (id: number) => {
    setExpandedCards(prev =>
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0c0e14]/80 flex items-center justify-center z-50">
        <div className="bg-[#151823] p-6 rounded-lg border border-[#2a2d3a] shadow-xl">
          <Loading />
          <p className="text-center text-sm text-gray-400 mt-4">Loading entries...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-md border border-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0e14] text-white p-6">
      <header className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-600 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-medium">Ship to Hubspot</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">Sync your data with Hubspot CRM</p>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-[#151823] text-white w-full pl-10 pr-4 py-2 rounded-md border border-[#2a2d3a] focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-sm transition-all"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <motion.button
            className="flex items-center justify-center gap-2 bg-[#151823] hover:bg-[#1c1f2e] px-4 py-2 rounded-md border border-[#2a2d3a] text-sm transition-colors"
            whileTap={{ scale: 0.98 }}
            onClick={toggleSortOrder}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Sort {sortOrder === "asc" ? "Ascending" : "Descending"}</span>
          </motion.button>
        </div>
      </header>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {sortedCards.map((card) => {
            const isExpanded = expandedCards.includes(card.id)
            const preview =
              card.summary.length > 200 ? card.summary.slice(0, 200) + "..." : card.summary
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="group bg-[#151823] border border-[#2a2d3a] rounded-md overflow-hidden hover:border-purple-600/50 transition-all duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-purple-600 mr-2"></div>
                      <span className="text-xs text-purple-500 font-medium">Hubspot Entry</span>
                    </div>
                    <span className="text-xs text-gray-500">#{card.id}</span>
                  </div>

                  {/* Render summary with extra spacing */}
                  <motion.div layout className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white mt-4 mb-4 max-w-none">
                    <ReactMarkdown>
                      {isExpanded ? card.summary : preview}
                    </ReactMarkdown>
                  </motion.div>

                  <div className="flex justify-between items-center mt-4">
                    <motion.button
                      className="text-xs text-gray-500 hover:text-purple-500 flex items-center gap-1 transition-colors"
                      whileHover={{ x: 2 }}
                      onClick={() => toggleExpand(card.id)}
                    >
                      {isExpanded ? "Collapse" : "View details"} <ArrowRight className="h-3 w-3" />
                    </motion.button>

                    <div className="flex gap-2">
                      <motion.button
                        className="p-1.5 rounded-md bg-[#1c1f2e] hover:bg-purple-900/30 text-purple-500 transition-colors"
                        whileTap={{ scale: 0.95 }}
                        aria-label="Approve"
                        onClick={() => sendApproval(card.summary)}
                      >
                        <Check className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        className="p-1.5 rounded-md bg-[#1c1f2e] hover:bg-red-900/30 text-red-500 transition-colors"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeCard(card.id)}
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {sortedCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md mx-auto text-center py-12 px-6 bg-[#151823] rounded-md border border-[#2a2d3a]"
        >
          <div className="inline-flex justify-center items-center p-3 rounded-full bg-[#1c1f2e] mb-4">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-gray-300 text-sm font-medium mb-2">No matching entries found</p>
          <p className="text-gray-500 text-xs mb-4">Try adjusting your search criteria</p>
          <button
            className="text-xs text-purple-500 border border-purple-900/50 rounded-md px-3 py-1.5 hover:bg-purple-900/20 transition-colors"
            onClick={() => setSearchTerm("")}
          >
            Clear search
          </button>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0c0e14]/80 flex items-center justify-center z-50">
          <div className="bg-[#151823] p-6 rounded-lg border border-[#2a2d3a] shadow-xl">
            <Loading />
            <p className="text-center text-sm text-gray-400 mt-4">Processing your request...</p>
          </div>
        </div>
      )}
    </div>
  )}