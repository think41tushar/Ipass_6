"use client";

import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  RotateCcw,
  Play,
  LucideCalendar,
  ListTodo,
  Clock,
  Repeat,
  CalendarDays,
  Calendar as CalendarIcon2,
  Clock3,
  TimerReset,
  Zap,
  Info,
  CheckCircle2,
  Settings,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Calendar from "@/components/ui/calendar";
import Loading from "@/components/ui/loading";
import { useLoading } from "@/lib/loadingContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ToastContainer, toast } from "react-toastify";
import type { ScheduledTask } from "@/lib/types";

import type { PromptInputSectionProps } from "@/lib/types";

// Memoize Calendar to prevent unnecessary re-renders
const MemoizedCalendar = React.memo(Calendar);

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
  handleSmartRun
}) => {
  const [executionTime, setExecutionTime] = useState("");
  const [intervalValue, setIntervalValue] = useState(""); // New state for interval value
  const [intervalDuration, setIntervalDuration] = useState("minutes"); // Default duration unit
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]); // Initialize empty to avoid UI/state mismatch
  const [months, setMonths] = useState<number[]>([]); // Initialize empty to avoid UI/state mismatch
  const [isTodoCalled, setIsTodoCalled] = useState(false);
  const [isBackendSendCalled, setIsBackendSendCalled] = useState(false);
  const [isSmartRunCalled, setIsSmartRunCalled] = useState(false);
  const { isLoading, setLoading } = useLoading();

  function showToastTodo(success: boolean) {
    if (success) {
      toast.success("Todo fetched successfully!");
    } else {
      toast.error("Failed to fetch todo!");
    }
  }

  function showBackendToast(success: boolean) {
    if (success) {
      toast.success("Summary sent to Hubspot successfully!");
    } else {
      toast.error("Failed to send summary to Hubspot");
    }
  }

  async function sendToBackend() {
    try {
      setIsBackendSendCalled(true);
      setLoading(true); // Set global loading state
      const tenant_id = localStorage.getItem("tenant_id");
      const user_id = localStorage.getItem("user_id");
      const response = await fetch("https://rishit41.online/sendToBackend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: user_id,
          tenantid: tenant_id,
          query: prompt,
        }),
      });
      if (response.ok) {
        setIsBackendSendCalled(false);
        setLoading(false); // Clear global loading state
        showBackendToast(true);
      } else {
        setIsBackendSendCalled(false);
        setLoading(false); // Clear global loading state
        showBackendToast(false);
      }
    } catch (error: any) {
      setIsBackendSendCalled(false);
      setLoading(false); // Clear global loading state
      showBackendToast(false);
      throw new Error("Failed to send to backend: ", error.message);
    }
  }

  async function handleGetTodo() {
    try {
      setIsTodoCalled(true);
      setLoading(true); // Set global loading state
      const response = await fetch("https://rishit41.online/todolist", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        showToastTodo(true);
        setIsTodoCalled(false);
        setLoading(false); // Clear global loading state
      } else {
        setIsTodoCalled(false);
        setLoading(false); // Clear global loading state
        showToastTodo(false);
      }
    } catch (error: any) {
      setIsTodoCalled(false);
      setLoading(false); // Clear global loading state
      showToastTodo(false);
      throw new Error("Failed to send todos: ", error.message);
    }
  }

  const handleCalendarChange = useCallback(
    (newISO: string) => {
      const selectedDate = new Date(newISO);
      setDate({ from: selectedDate, to: selectedDate });

      // Use selected time from the state instead of defaulting to 12:00
      const formattedTime = time ? time : "12:00"; // Fallback in case time isn't set

      // Create a new date object with the selected date and time
      const dateTimeObj = new Date(
        `${format(selectedDate, "yyyy-MM-dd")}T${formattedTime}:00`
      );

      // Use fixed +05:30 for IST timezone
      const tzString = "+05:30";

      const executionDateTime = `${format(
        selectedDate,
        "yyyy-MM-dd"
      )}T${formattedTime}:00${tzString}`;

      setExecutionTime(executionDateTime);
    },
    [setDate, time] // Ensure it reacts to time changes
  );

  // Memoize reset function to prevent unnecessary re-renders
  const handleReset = useCallback(() => {
    setPrompt("");
    setDate({ from: new Date(), to: new Date() });
    setTime("12:00");
    setRecurrence("none");
    setExecutionTime("");
    setIntervalValue(""); // Reset interval value
    setIntervalDuration("minutes");
    setDaysOfWeek([]);
    setMonths([]);
  }, [setPrompt, setDate, setTime, setRecurrence]);

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleMonth = (month: number) => {
    setMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };
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
    };

    // Only add interval values if recurrence type is "interval"
    if (recurrence === "interval") {
      taskData.intervalValue = intervalValue
        ? Number(intervalValue)
        : undefined;
      taskData.intervalDuration = intervalDuration;
    }

    // Only add custom recurrence values if recurrence type is "custom"
    if (recurrence === "custom") {
      taskData.daysOfWeek = daysOfWeek.length > 0 ? daysOfWeek : undefined;
      taskData.months = months.length > 0 ? months : undefined;
    }

    return taskData;
  };

  // Wrap the handleSmartRun function to handle loading state
  const handleSmartRunWithLoading = async () => {
    try {
      setIsSmartRunCalled(true);
      setLoading(true); // Set global loading state
      if (handleSmartRun) {
        await handleSmartRun();
      }
    } finally {
      setIsSmartRunCalled(false);
      setLoading(false); // Clear global loading state
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-gray-900/60 to-gray-900/40 border border-gray-800 rounded-lg p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-purple-900/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-800/70 pb-4">
        <h3 className="text-xl font-semibold text-white mb-4 sm:mb-0 flex items-center">
          <div className="bg-purple-600/20 p-2 rounded-full mr-3">
            <Settings className="h-5 w-5 text-purple-400" />
          </div>
          Task Configuration
        </h3>
      </div>

      {/* Prompt Input */}
      <div className="space-y-3">
        <Label htmlFor="prompt" className="text-gray-300 flex items-center text-sm font-medium">
          <div className="bg-purple-600/10 p-1.5 rounded-md mr-2">
            <Play className="h-4 w-4 text-purple-400" />
          </div>
          Prompt
        </Label>
        <Textarea
          id="prompt"
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] border-gray-700 bg-[#111827]/80 text-white focus:border-purple-500 focus:ring-purple-500/20 rounded-md transition-all duration-300 placeholder:text-gray-500"
        />
        <p className="text-xs text-gray-400 italic">
          Enter the task you want to schedule or execute. Be specific with dates, times, and recurrence patterns if needed.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-800/50 mt-4">
        {/* Left side buttons - Backend and Todo */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 rounded-md"
            onClick={sendToBackend}
            disabled={isBackendSendCalled || !prompt.trim}
          >
            {isBackendSendCalled ? (
              <div className="flex items-center justify-center">
                <Loading variant="inline" />
              </div>
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Generate Summary In GChat
          </Button>
          
          <Button
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white transition-all duration-300 rounded-md shadow-md"
            onClick={handleGetTodo}
            disabled={isTodoCalled}
          >
            {isTodoCalled ? (
              <div className="flex items-center justify-center">
                <Loading variant="inline" />
              </div>
            ) : (
              <ListTodo className="mr-2 h-4 w-4" />
            )}
            Generate Todo In GChat
          </Button>
        </div>
        
        {/* Right side buttons - Reset and Smart Run */}
        <div className="flex flex-wrap gap-3 ml-auto">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300 rounded-md"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="default"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-300 rounded-md shadow-md"
            onClick={handleSmartRunWithLoading}
            disabled={isExecuting || isScheduled || !prompt.trim() || isSmartRunCalled}
          >
            {isSmartRunCalled ? (
              <div className="flex items-center justify-center">
                <Loading variant="inline" />
              </div>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="mr-2 h-4 w-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <path d="M12 17h.01"></path>
              </svg>
            )}
            Smart Run
          </Button>
        </div>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastClassName={() => 
            "relative flex p-4 min-h-10 rounded-lg justify-between overflow-hidden cursor-pointer backdrop-blur-xl backdrop-saturate-150 bg-[#1c2333]/40 border border-white/10 mb-4 shadow-lg"
          }
        />
      </div>
    </div>
  );
};
