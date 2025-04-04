"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Trash2, LucideCalendar, ChevronRight, Clock, RefreshCw } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Interface matching the database schema
interface DBScheduledPrompt {
  id: string
  query: string
  execution_time: string  // ISO string
  is_recurring: boolean
  recurrence_type: 'daily' | 'weekly' | 'monthly' | 'interval' | 'custom' | 'none' | null
  days_of_week: string | null  // JSON string array like ["Mon", "Wed", "Fri"] or null
  days_of_month: string | null  // JSON string array like ["1", "15", "30"] or null
  months: string | null  // JSON string array like ["Jan", "Jun", "Dec"] or null
  created_at: string  // ISO string
  last_run: string | null  // ISO string or null
  user_id: string
  status?: 'pending' | 'completed' | 'failed' | 'running'  // Optional, can be derived
}

export const ScheduledPromptsSection: React.FC = () => {
  const [prompts, setPrompts] = useState<DBScheduledPrompt[]>([])
  const [dailyPrompts, setDailyPrompts] = useState<DBScheduledPrompt[]>([])
  const [weeklyPrompts, setWeeklyPrompts] = useState<DBScheduledPrompt[]>([])
  const [monthlyPrompts, setMonthlyPrompts] = useState<DBScheduledPrompt[]>([])
  const [intervalPrompts, setIntervalPrompts] = useState<DBScheduledPrompt[]>([])
  const [customPrompts, setCustomPrompts] = useState<DBScheduledPrompt[]>([])
  const [oneOffPrompts, setOneOffPrompts] = useState<DBScheduledPrompt[]>([])
  const [activeTab, setActiveTab] = useState("interval")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch scheduled prompts from Django backend
  const fetchScheduledPrompts = async () => {
    setIsLoading(true)
    setError(null)
    
    const tenantId = localStorage.getItem("tenant_id");
    const user_id = localStorage.getItem("user_id");
    const payload = {
      "tenant_id": tenantId,
      "user_id": user_id
    }
    try {
      const response = await fetch('https://syncdjango.site/tenant-admin/scheduled-prompts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if required
          // 'Authorization': `Bearer ${yourAuthToken}`
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scheduled prompts: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("API Response:", data); // Debug log

      if (Array.isArray(data.scheduled_prompt)) {
        setPrompts(data.scheduled_prompt); // ✅ Correctly extracting the array
      } else {
        console.error("Expected an array, received:", data);
        setPrompts([]); // Prevents crashes
      }
    } catch (err) {
      console.error("Error fetching scheduled prompts:", err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a scheduled prompt
  const deletePrompt = async (id: string) => {
    try {
      const tenantId = localStorage.getItem("tenant_id");
      const user_id = localStorage.getItem("user_id");
      const payload = {
        "tenant_id": tenantId,
        "user_id": user_id,
        "task_id": id
      }
      const response = await fetch(`https://syncdjango.site/tenant-admin/scheduled-prompts/delete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if required
          // 'Authorization': `Bearer ${yourAuthToken}`
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete prompt: ${response.status}`)
      }
      
      // Remove the deleted prompt from state
      setPrompts(prompts.filter(prompt => prompt.id !== id))
    } catch (err) {
      console.error("Error deleting prompt:", err)
      setError(err instanceof Error ? err.message : 'Failed to delete prompt')
    }
  }

  // Fetch prompts on component mount
  useEffect(() => {
    fetchScheduledPrompts()
  }, [])

  useEffect(() => {
    if (!prompts || prompts.length === 0) {
      setDailyPrompts([]);
      setWeeklyPrompts([]);
      setMonthlyPrompts([]);
      setIntervalPrompts([]);
      setCustomPrompts([]);
      setOneOffPrompts([]);
      setActiveTab(""); // Reset the active tab if no prompts exist
      return;
    }
  
    // Filter one-off (non-recurring) prompts
    const oneOff = prompts.filter(prompt => !prompt.is_recurring);
    
    // Filter recurring prompts by type
    const daily = prompts.filter(prompt => prompt.is_recurring && prompt.recurrence_type === "daily");
    const weekly = prompts.filter(prompt => prompt.is_recurring && prompt.recurrence_type === "weekly");
    const monthly = prompts.filter(prompt => prompt.is_recurring && prompt.recurrence_type === "monthly");
    const interval = prompts.filter(prompt => prompt.is_recurring && prompt.recurrence_type === "interval");
    
    // Any other recurring type goes to custom
    const custom = prompts.filter(prompt => {
      return prompt.is_recurring && 
        prompt.recurrence_type !== "daily" && 
        prompt.recurrence_type !== "weekly" && 
        prompt.recurrence_type !== "monthly" && 
        prompt.recurrence_type !== "interval" && 
        prompt.recurrence_type !== "none" && 
        prompt.recurrence_type !== null;
    });
  
    setOneOffPrompts(oneOff);
    setDailyPrompts(daily);
    setWeeklyPrompts(weekly);
    setMonthlyPrompts(monthly);
    setIntervalPrompts(interval);
    setCustomPrompts(custom);
  
    // Update active tab based on available prompts
    if (oneOff.length > 0) setActiveTab("one-off");
    else if (interval.length > 0) setActiveTab("interval");
    else if (daily.length > 0) setActiveTab("daily");
    else if (weekly.length > 0) setActiveTab("weekly");
    else if (monthly.length > 0) setActiveTab("monthly");
    else if (custom.length > 0) setActiveTab("custom");
    else setActiveTab(""); // Reset tab if no prompts remain
  }, [prompts]);

  // Helper to derive status if not provided
  const getPromptStatus = (prompt: DBScheduledPrompt): 'pending' | 'completed' | 'failed' | 'running' => {
    if (prompt.status) return prompt.status
    
    const executionTime = new Date(prompt.execution_time)
    const now = new Date()
    
    if (prompt.last_run) {
      const lastRun = new Date(prompt.last_run)
      if (lastRun >= executionTime) return 'completed'
    }
    
    if (executionTime > now) return 'pending'
    return 'failed' // If execution time has passed but no last_run
  }

  // Helper to get appropriate status icon
  const getStatusIcon = (status: 'pending' | 'completed' | 'failed' | 'running') => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'completed':
        return <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      case 'failed':
        return <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      case 'running':
        return <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    }
  }

  // Helper to get appropriate status color
  const getStatusColor = (status: 'pending' | 'completed' | 'failed' | 'running') => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600 text-white'
      case 'completed':
        return 'bg-green-600 text-white'
      case 'failed':
        return 'bg-red-600 text-white'
      case 'running':
        return 'bg-blue-600 text-white'
    }
  }

  // Helper to get recurrence label
  const getRecurrenceLabel = (prompt: DBScheduledPrompt) => {
    // Check if it's a one-off (non-recurring) prompt first
    if (!prompt.is_recurring) {
      return 'One-off'
    }
    
    switch (prompt.recurrence_type) {
      case 'daily':
        return 'Daily'
      case 'weekly':
        if (prompt.days_of_week) {
          try {
            const days = JSON.parse(prompt.days_of_week)
            return `Weekly (${days.join(', ')})`
          } catch {
            return 'Weekly'
          }
        }
        return 'Weekly'
      case 'monthly':
        if (prompt.days_of_month) {
          try {
            const days = JSON.parse(prompt.days_of_month)
            return `Monthly (${days.join(', ')})`
          } catch {
            return 'Monthly'
          }
        }
        return 'Monthly'
      case 'interval':
        return 'Interval'
      case 'none':
        return 'One-off'
      default:
        return 'Custom'
    }
  }

  // Default empty state card
  const EmptyStateCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-12 border border-dashed border-gray-800 rounded-lg bg-gray-900/30"
    >
      <div className="bg-purple-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <LucideCalendar className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-medium text-gray-300 mb-2">No scheduled tasks</h3>
      <p className="text-gray-500 max-w-md mx-auto">Create your first scheduled prompt to automate your workflow</p>
      <Button 
        variant="outline" 
        size="sm"
        className="mt-4 text-purple-400 border-purple-800 hover:bg-purple-900/30 hover:text-purple-300 hover:border-purple-600"
      >
        <CalendarIcon className="h-4 w-4 mr-2" />
        Schedule a prompt
      </Button>
    </motion.div>
  )

  // Render prompt list function to avoid duplicating code
  const renderPromptList = (promptList: DBScheduledPrompt[]) => {
    if (promptList.length === 0) {
      return (
        <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg bg-gray-900/30">
          <div className="bg-purple-600 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <LucideCalendar className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-1">No scheduled prompts</h3>
          <p className="text-gray-500">Schedule your first prompt to see it here</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {promptList.map((prompt) => {
          const status = getPromptStatus(prompt)
          const statusIcon = getStatusIcon(status)
          const statusColor = getStatusColor(status)
          const recurrenceLabel = getRecurrenceLabel(prompt)

          return (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-gray-800 bg-gray-900/30 rounded-lg p-4 shadow-lg hover:border-gray-700 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center flex-wrap gap-2">
                  <Badge className={cn("bg-purple-600 text-white", statusColor)}>
                    <span className="flex items-center">
                      {statusIcon}
                      <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </span>
                  </Badge>
                  <Badge variant="outline" className="border-gray-700 text-gray-400">
                    {recurrenceLabel}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-gray-800"
                  onClick={() => deletePrompt(prompt.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-2 text-sm text-gray-400">
                <div className="flex items-center mb-1">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Next run: {format(parseISO(prompt.execution_time), "PPpp")}</span>
                </div>
                {prompt.last_run && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Last run: {format(parseISO(prompt.last_run), "PPpp")}</span>
                  </div>
                )}
              </div>

              <div className="bg-[#111827] p-3 rounded-md border border-gray-800 text-gray-300 text-sm">
                <div className="line-clamp-2">{prompt.query}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Scheduled Prompts</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-400 border-gray-700 hover:text-purple-300 hover:border-purple-600"
            onClick={fetchScheduledPrompts}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
            Refresh
          </Button>
          {prompts.length > 0 && (
            <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Display default card if no prompts and not loading */}
      {!isLoading && prompts.length === 0 && !error && (
        <EmptyStateCard />
      )}

      {/* Only show tabs if there are prompts or we're loading */}
      {(prompts.length > 0 || isLoading) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <TabsTrigger 
              value="daily" 
              className={cn(
                "data-[state=active]:bg-purple-600 data-[state=active]:text-white", 
                "text-gray-400 hover:text-gray-200"
              )}
            >
              Daily
            </TabsTrigger>
            <TabsTrigger 
              value="weekly" 
              className={cn(
                "data-[state=active]:bg-purple-600 data-[state=active]:text-white", 
                "text-gray-400 hover:text-gray-200"
              )}
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger 
              value="monthly" 
              className={cn(
                "data-[state=active]:bg-purple-600 data-[state=active]:text-white", 
                "text-gray-400 hover:text-gray-200"
              )}
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger 
              value="interval" 
              className={cn(
                "data-[state=active]:bg-purple-600 data-[state=active]:text-white", 
                "text-gray-400 hover:text-gray-200"
              )}
            >
              Interval
            </TabsTrigger>
            <TabsTrigger 
              value="one-off" 
              className={cn(
                "data-[state=active]:bg-purple-600 data-[state=active]:text-white", 
                "text-gray-400 hover:text-gray-200"
              )}
            >
              One-off
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              className={cn(
                "data-[state=active]:bg-purple-600 data-[state=active]:text-white", 
                "text-gray-400 hover:text-gray-200"
              )}
            >
              Custom
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
                <p className="text-gray-400">Loading scheduled prompts...</p>
              </div>
            ) : (
              <>
                <TabsContent value="daily">
                  {renderPromptList(dailyPrompts)}
                </TabsContent>
                
                <TabsContent value="weekly">
                  {renderPromptList(weeklyPrompts)}
                </TabsContent>
                
                <TabsContent value="monthly">
                  {renderPromptList(monthlyPrompts)}
                </TabsContent>
                
                <TabsContent value="interval">
                  {renderPromptList(intervalPrompts)}
                </TabsContent>
                
                <TabsContent value="one-off">
                  {renderPromptList(oneOffPrompts)}
                </TabsContent>
                
                <TabsContent value="custom">
                  {renderPromptList(customPrompts)}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      )}
    </div>
  )
}