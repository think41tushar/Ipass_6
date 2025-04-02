import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useParams } from "next/navigation";
import {
  ScheduledTask,
  RecurrenceType
} from "@/lib/types";
import {
  loadTasksFromLocalStorage,
  saveTasksToLocalStorage
} from "@/lib/taskUtil";

export const usePromptScheduler = () => {
  const params = useParams(); // Move useParams inside the hook
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [time, setTime] = useState("12:00");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [prompt, setPrompt] = useState("");
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("prompt");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [session_id, setSession_id] = useState("");
  const [error, setError] = useState("");
  const [isSSEconnected, setIsSSEconnected] = useState(false);
  const [promptResponse, setPromptResponse] = useState("");

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const loadedTasks = loadTasksFromLocalStorage();
    setTasks(loadedTasks);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasksToLocalStorage(tasks);
  }, [tasks]);

  const addLog = (message: string) => {
    const timestamp = format(new Date(), "HH:mm:ss");
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleExecute = () => {
    if (!prompt.trim()) {
      addLog("Error: Prompt cannot be empty");
      return;
    }
    setIsExecuting(true);
    setResult(null);
    setLogs([]);
    addLog("Executing prompt...");

    // Simulate execution with a delay
    setTimeout(() => {
      addLog("Processing input...");
      setTimeout(() => {
        addLog("Generating response...");
        setTimeout(() => {
          setIsExecuting(false);
          setResult("This is a simulated result for the prompt: " + prompt);
          addLog("Execution completed successfully");
          setActiveTab("result");
        }, 1000);
      }, 800);
    }, 500);
  };

  const handleSchedule = async (scheduledTaskData: ScheduledTask) => {
    if (!prompt.trim()) {
      addLog("Error: Prompt cannot be empty");
      return;
    }
    if (!date || !date.from) {
      addLog("Error: Date must be selected");
      return;
    }

    const sessid = "123";
    const djangoUrl = "https://syncdjango.site";
    const tenant_id = localStorage.getItem("tenant_id");
    const user_id = localStorage.getItem("user_id");
  
    try {
      const schedulePayload = {
        execution_time: scheduledTaskData.executionTime, // ✅ Correctly mapped
        is_recurring: scheduledTaskData.recurrence, // ✅ Correctly mapped
        user_id,
        input: prompt,
        session_id: sessid,
        rerun: false,
        history: [],
        changed: false,
        ...(scheduledTaskData.recurrence && {
          recurrence_type: scheduledTaskData.recurrenceType,
          interval_every: scheduledTaskData.intervalValue,
          interval_period: scheduledTaskData.intervalDuration,
          days_of_week: scheduledTaskData.daysOfWeek?.length ? scheduledTaskData.daysOfWeek : undefined,
          days_of_month: scheduledTaskData.daysOfMonth?.length ? scheduledTaskData.daysOfMonth : undefined,
          months: scheduledTaskData.months?.length ? scheduledTaskData.months : undefined,
        }),
      };
  
      const response = await fetch(`${djangoUrl}/schedule/prompt/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schedulePayload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to schedule task");
      }
  
      const result = await response.json();
      console.log("Task scheduled successfully:", result);
  
      const newTask: ScheduledTask = {
        id: sessid,
        prompt,
        date: scheduledTaskData.date, // ✅ Correctly mapped
        time: scheduledTaskData.time,
        recurrence: scheduledTaskData.recurrence, // ✅ Correctly mapped
        recurrenceType: scheduledTaskData.recurrenceType,
        status: "pending",
      };
  
      setTasks([...tasks, newTask]);
      addLog(`Task scheduled for ${format(scheduledTaskData.date || new Date(), "PPpp")}`);
      setPrompt("");
      setActiveTab("scheduled");
    } catch (error) {
      console.error("Scheduling error:", error);
      addLog(`Error scheduling task: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleConnect = async () => {
    try {
      const { tenant_id} = params; 
      const user_id=localStorage.getItem("user_id");
      console.log("This is the user_id: ",user_id)
      // Use params here
      const response = await fetch(`https://syncdjango.site/schedule/${tenant_id}/send-refresh-token/`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          "user_id": user_id
        })
      });
      if (!response.ok) {
        throw new Error("Failed to connect");
      }
      console.log("Connected successfully");
      setIsConnected(true);
    } catch (error: any) {
      setError("Failed to connect: " + error.message);
    }
  };

  const resetForm = () => {
    setPrompt("");
    setDate({ from: new Date(), to: new Date() });
    setTime("12:00");
    setRecurrence("none");
  };

  return {
    date,
    setDate,
    time,
    setTime,
    recurrence,
    setRecurrence,
    isSSEconnected,
    setIsSSEconnected,
    session_id,
    setSession_id,
    prompt,
    setPrompt,
    tasks,
    promptResponse,
    setPromptResponse,
    logs,
    setLogs,
    result,
    activeTab,
    error,
    setError,
    setActiveTab,
    isExecuting,
    isScheduled,
    isConnected,
    addLog,
    handleExecute,
    handleSchedule,
    deleteTask,
    handleConnect,
    resetForm,
  };
};