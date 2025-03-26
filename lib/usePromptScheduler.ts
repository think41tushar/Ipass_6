import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  ScheduledTask,
  RecurrenceType
} from "@/lib/types";
import {
  loadTasksFromLocalStorage,
  saveTasksToLocalStorage
} from "@/lib/taskUtil";
import { useParams } from "next/navigation";

export const usePromptScheduler = () => {
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
  const [error,setError]=useState("")
  const [isSSEconnected, setIsSSEconnected] = useState(false);
  // const [promptRespone, setPromptRespone] = useState("");
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

  const handleSchedule = () => {
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
    const newTask: ScheduledTask = {
      id: Date.now().toString(),
      prompt,
      dateTime: scheduledDateTime,
      recurrence,
      status: "pending",
    };
    setTasks([...tasks, newTask]);
    addLog(`Task scheduled for ${format(scheduledDateTime, "PPpp")}`);
    setPrompt("");
    setActiveTab("scheduled");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleConnect = async () => {
    const {tenant_id} = useParams();
    const {user_id} = useParams();
    try {
      const response = await fetch(`http://127.0.0.1:8000/schedule/${tenant_id}/send-refresh-token/`, {
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
      throw new Error("Failed to connect" + error.message);
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