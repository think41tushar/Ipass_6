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

  const handleSchedule = async () => {
    if (!prompt.trim()) {
      addLog("Error: Prompt cannot be empty");
      return;
    }
    if (!date || !date.from) {
      addLog("Error: Date must be selected");
      return;
    }
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDateTime = new Date(date.from);
    scheduledDateTime.setHours(hours, minutes);
    
    if (scheduledDateTime < new Date()) {
      addLog("Error: Cannot schedule for a past date/time");
      return;
    }
  
    // Function to generate random string
    const getRandomString = (length: number) => {
      return [...Array(length)].map(() => Math.random().toString(36)[2]).join("");
    };
    const djangoUrl = "http://127.0.0.1:8000";
    const tenant_id=localStorage.getItem("tenant_id");
    const user_id=localStorage.getItem("user_id"); // Assuming you're using useParams from earlier
    const sessid = getRandomString(10);
  
    try {
      const schedulePayload = {
        "execution_time": scheduledDateTime.toISOString(),
        "is_recurring": recurrence !== "none", // Convert to boolean
        "user_id": user_id,
        "input": prompt,
        "session_id": sessid,
        "rerun": false,
        "history": [],
        "changed": false,
        // Only include these if is_recurring is true
        ...(recurrence !== "none" && {
          recurrence_type: recurrence,
          // Add additional recurrence details as needed
          ...(recurrence === "weekly" && { days_of_week: [scheduledDateTime.getDay()] }),
          ...(recurrence === "monthly" && { days_of_month: [scheduledDateTime.getDate()] }),
          // ...(recurrence === "yearly" && { months: [scheduledDateTime.getMonth() + 1] })
        })
      };
  
      const response = await fetch(`${djangoUrl}/schedule/prompt/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schedulePayload)
      });
  
      if (!response.ok) {
        throw new Error("Failed to schedule task");
      }
  
      const result = await response.json();
      console.log("Task scheduled successfully:", result);
  
      const newTask: ScheduledTask = {
        id: sessid,
        prompt,
        dateTime: scheduledDateTime,
        recurrence,
        status: "pending",
      };
  
      setTasks([...tasks, newTask]);
      addLog(`Task scheduled for ${format(scheduledDateTime, "PPpp")}`);
      setPrompt("");
      setActiveTab("scheduled");
    } catch (error) {
      console.error("Scheduling error:", error);
      addLog(`Error scheduling task: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const response = await fetch(`http://ec2-3-91-217-18.compute-1.amazonaws.com:8000/schedule/${tenant_id}/send-refresh-token/`, {
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
    isConnected,
    addLog,
    handleExecute,
    handleSchedule,
    deleteTask,
    handleConnect,
    resetForm,
  };
};