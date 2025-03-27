"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Check, X, ArrowUpDown, ArrowRight } from "lucide-react"
import ReactMarkdown from "react-markdown"  // Added for markdown formatting

// Type definition for summary card
interface SummaryCard {
  id: number;
  summary: string;
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

    const tenant_id = localStorage.getItem("tenant_id")
    if (!tenant_id) {
      alert("Tenant ID not found")
      return
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/hubspot/hubspotPost/${tenant_id}/`, {
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
    }
  }

  // Fetch summaries from the endpoint
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setIsLoading(true);
        const user_id = 'fdb214f4-cb91-4893-b55c-82238648be9b'; // Replace with your actual user ID or variable
        const response = await fetch(
          'http://ec2-3-91-217-18.compute-1.amazonaws.com:8000/hubspot/send/63c7704c-8ca1-4ec8-9bc4-ae11d66fd2f1/',
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

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-500">Loading summaries...</p>
      </div>
    )
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
    <div className="min-h-screen bg-black text-white p-6">
      <header className="max-w-7xl mx-auto mb-12">
        <h1 className="text-3xl font-medium mb-2">Ship to Hubspot</h1>
        <p className="text-gray-500 text-sm mb-8">Sync your data with Hubspot CRM</p>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-900 text-white w-full pl-10 pr-4 py-2 rounded-md border border-gray-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm transition-all"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <motion.button
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-md border border-gray-800 text-sm transition-colors"
            whileTap={{ scale: 0.98 }}
            onClick={toggleSortOrder}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Sort {sortOrder === "asc" ? "Ascending" : "Descending"}</span>
          </motion.button>
        </div>
      </header>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="group bg-gray-900 border border-gray-800 rounded-md overflow-hidden hover:border-emerald-600/50 transition-all duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
                      <span className="text-xs text-emerald-500 font-medium">Hubspot Entry</span>
                    </div>
                    <span className="text-xs text-gray-500">#{card.id}</span>
                  </div>

                  {/* Render summary with extra spacing */}
                  <motion.div layout className="prose prose-invert mt-4 mb-4">
                    <ReactMarkdown>
                      {isExpanded ? card.summary : preview}
                    </ReactMarkdown>
                  </motion.div>

                  <div className="flex justify-between items-center mt-4">
                    <motion.button
                      className="text-xs text-gray-500 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                      whileHover={{ x: 2 }}
                      onClick={() => toggleExpand(card.id)}
                    >
                      {isExpanded ? "Collapse" : "View details"} <ArrowRight className="h-3 w-3" />
                    </motion.button>

                    <div className="flex gap-2">
                      <motion.button
                        className="p-1.5 rounded-md bg-gray-800 hover:bg-emerald-900 text-emerald-500 transition-colors"
                        whileTap={{ scale: 0.95 }}
                        aria-label="Approve"
                        onClick={() => sendApproval(card.summary)}
                      >
                        <Check className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        className="p-1.5 rounded-md bg-gray-800 hover:bg-red-900 text-red-500 transition-colors"
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
          className="max-w-md mx-auto text-center py-12 px-6 bg-gray-900 rounded-md border border-gray-800"
        >
          <div className="inline-flex justify-center items-center p-3 rounded-full bg-gray-800 mb-4">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-gray-300 text-sm font-medium mb-2">No matching entries found</p>
          <p className="text-gray-500 text-xs mb-4">Try adjusting your search criteria</p>
          <button
            className="text-xs text-emerald-500 border border-emerald-800 rounded-md px-3 py-1.5 hover:bg-emerald-900/20 transition-colors"
            onClick={() => setSearchTerm("")}
          >
            Clear search
          </button>
        </motion.div>
      )}
    </div>
  )
}
