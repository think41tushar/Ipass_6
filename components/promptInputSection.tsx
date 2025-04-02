"use client"

import React, { useState, useCallback } from "react"
import { format } from "date-fns"
import { CalendarIcon, RotateCcw, Play, LucideCalendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Calendar from "@/components/ui/calendar"
import Loading from "@/components/ui/loading"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { ScheduledTask } from "@/lib/types";


import type { PromptInputSectionProps } from "@/lib/types"

// Memoize Calendar to prevent unnecessary re-renders
const MemoizedCalendar = React.memo(Calendar)

export const PromptInputSection: React.FC<PromptInputSectionProps> = ({
  date,
  time,
  recurrence,
  prompt,
  isExecuting,
  isScheduled,
  ScheduledTask,
  setDate,
  setTime,
  setRecurrence,
  setPrompt,
  promptResponse,
  setPromptResponse,
  setLogs,
  isSSEconnected,
  setIsSSEconnected,
  handleExecute,
  handleSchedule,
  handleRunTask,
}) => {
  const [executionTime, setExecutionTime] = useState("")
  const [intervalValue, setIntervalValue] = useState("") // New state for interval value
  const [intervalDuration, setIntervalDuration] = useState("minutes") // Default duration unit
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]) // Initialize empty to avoid UI/state mismatch
  const [months, setMonths] = useState<number[]>([]) // Initialize empty to avoid UI/state mismatch

  // Use useCallback to memoize the calendar change handler
  const handleCalendarChange = useCallback(
    (newISO: string) => {
      const selectedDate = new Date(newISO)
      setDate({ from: selectedDate, to: selectedDate })
      setExecutionTime(newISO)
    },
    [setDate],
  )

  // Memoize reset function to prevent unnecessary re-renders
  const handleReset = useCallback(() => {
    setPrompt("")
    setDate({ from: new Date(), to: new Date() })
    setTime("12:00")
    setRecurrence("none")
    setExecutionTime("")
    setIntervalValue("") // Reset interval value
    setIntervalDuration("minutes") 
    setDaysOfWeek([])
    setMonths([])
  }, [setPrompt, setDate, setTime, setRecurrence])

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const toggleMonth = (month: number) => {
    setMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    )
  }

  const getTaskData = (): ScheduledTask => {
    const taskData: ScheduledTask = {
      id: crypto.randomUUID(), // Generate a unique ID
      date: date?.from, // Ensure it is a valid Date
      time: time,
      recurrence: recurrence === "none" ? false : true,
      recurrenceType: recurrence,
      prompt: prompt,
      executionTime: executionTime,
      status: "pending",
      logs: [],
    }
  
    // Only add interval values if recurrence type is "interval"
    if (recurrence === "interval") {
      taskData.intervalValue = intervalValue ? Number(intervalValue) : undefined;
      taskData.intervalDuration = intervalDuration;
    }
  
    // Only add custom recurrence values if recurrence type is "custom"
    if (recurrence === "custom") {
      taskData.daysOfWeek = daysOfWeek.length > 0 ? daysOfWeek : undefined;
      taskData.months = months.length > 0 ? months : undefined;
    }
  
    return taskData;
  }
  
  return (
    <div className="space-y-6 bg-gray-900/30 border border-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-medium text-white mb-4">Create Task</h3>

      {/* Date and Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-gray-300">
            Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal border-gray-700 bg-[#111827] hover:bg-gray-800 text-gray-300 w-full"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                {date && date.from ? format(date.from, "PPP") : <span>Pick a date</span>}{" "}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-gray-700 bg-[#111827]">
              <MemoizedCalendar
                value={executionTime}
                onChange={handleCalendarChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="text-gray-300">
            Time
          </Label>
          <div className="flex space-x-2">
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border-gray-700 bg-[#111827] text-white"
            />

            <Select value={recurrence} onValueChange={(value: any) => setRecurrence(value)}>
              <SelectTrigger className="w-[180px] border-gray-700 bg-[#111827] text-white">
                <SelectValue placeholder="Recurrence" />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-[#111827] text-white">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="interval">Interval</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Interval Options - Shown Only If "Interval" is Selected */}
      {recurrence === "interval" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="intervalValue" className="text-gray-300">Interval Value</Label>
            <Input
              id="intervalValue"
              type="number"
              value={intervalValue}
              onChange={(e) => setIntervalValue(e.target.value)}
              className="border-gray-700 bg-[#111827] text-white"
              placeholder="Enter interval value"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intervalDuration" className="text-gray-300">Interval Duration</Label>
            <Select value={intervalDuration} onValueChange={setIntervalDuration}>
              <SelectTrigger className="w-full border-gray-700 bg-[#111827] text-white">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-[#111827] text-white">
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Custom Options */}
      {recurrence === "custom" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Days of the Week</Label>
            <div className="grid grid-cols-7 gap-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
                <button
                  key={index}
                  className={`p-2.5 rounded text-sm font-medium w-full text-white cursor-pointer transition-colors ${
                    daysOfWeek.includes(index) ? "bg-purple-600" : "bg-gray-800"
                  }`}
                  onClick={() => toggleDayOfWeek(index)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Months</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <button
                  key={i}
                  className={`p-2 rounded text-sm font-medium w-full text-white cursor-pointer transition-colors ${
                    months.includes(i + 1) ? "bg-purple-600" : "bg-gray-800"
                  }`}
                  onClick={() => toggleMonth(i + 1)}
                  type="button"
                >
                  {new Date(0, i).toLocaleString("default", { month: "short" })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-gray-300">
          Prompt
        </Label>
        <Textarea
          id="prompt"
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] border-gray-700 bg-[#111827] text-white"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
          onClick={handleReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button
          variant="default"
          className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
          onClick={() => {
            handleRunTask(false)
          }}
          disabled={isExecuting || !prompt.trim()}
        >
          {isExecuting ? (
            <div className="flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Execute Now
        </Button>

        <Button
          variant="default"
          className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
          onClick={() => handleSchedule(getTaskData())}
          disabled={isScheduled || !prompt.trim() || !date || !time}
        >
          {isScheduled ? (
            <div className="flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <LucideCalendar className="mr-2 h-4 w-4" />
          )}
          Schedule
        </Button>
      </div>
    </div>
  )
}