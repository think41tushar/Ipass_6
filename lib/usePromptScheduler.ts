"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useParams } from "next/navigation";
import { ScheduledTask, RecurrenceType } from "@/lib/types";
import {
  loadTasksFromLocalStorage,
  saveTasksToLocalStorage,
} from "@/lib/taskUtil";
// import { GoogleGenAI } from "@google/genai";
import { Console } from "console";

export const usePromptScheduler = () => {
  const params = useParams<{ tenant_id: string }>();
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [time, setTime] = useState("12:00");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [prompt, setPrompt] = useState("");
  const [promptResponse, setPromptResponse] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("prompt");
  const [error, setError] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSSEconnected, setIsSSEconnected] = useState(false);
  const [session_id, setSession_id] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Function to get the current EventSource for external components
  const getEventSource = (): EventSource | null => {
    console.log("getEventSource called, returning:", eventSourceRef.current);
    if (eventSourceRef.current) {
      console.log("EventSource details:", {
        url: eventSourceRef.current.url,
        readyState: eventSourceRef.current.readyState,
        withCredentials: eventSourceRef.current.withCredentials,
        hasOnMessage: !!eventSourceRef.current.onmessage
      });
    }
    return eventSourceRef.current;
  };

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const loadedTasks = loadTasksFromLocalStorage();
    setTasks(loadedTasks);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasksToLocalStorage(tasks);
  }, [tasks]);

  // Add a function to track the last few messages to prevent duplicates
  const lastMessages = useRef<string[]>([]);
  const isDuplicateMessage = (message: string): boolean => {
    // Check if this message is a duplicate of any of the last 3 messages
    const isDuplicate = lastMessages.current.includes(message);

    // Update the last messages array (keep only the last 3)
    lastMessages.current = [...lastMessages.current.slice(-2), message];

    return isDuplicate;
  };

  // Helper function to add a log with timestamp and prevent duplicates
  const addLog = (message: string) => {
    const timestamp = format(new Date(), "HH:mm:ss");

    // Skip duplicate messages
    if (isDuplicateMessage(message)) {
      console.log(`Skipping duplicate message: ${message}`);
      return;
    }

    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Setup SSE connection for real-time logs
  const setupSSEConnection = (sessionId: string): Promise<EventSource> => {
    return new Promise((resolve, reject) => {
      const backendUrl = "https://rishit41.online";
      const url = `${backendUrl}/logevents/${sessionId}`;

      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Create a new EventSource
      const eventSource = new EventSource(url);
      console.log("Event source created for session", sessionId);
      
      // Store the EventSource reference immediately
      eventSourceRef.current = eventSource;

      // Set a timeout for connection
      const connectionTimeout = setTimeout(() => {
        console.error("SSE connection timeout");
        eventSource.close();
        setIsSSEconnected(false);
        setIsExecuting(false);
        addLog("Connection timed out after 30 seconds. Please try again.");
        reject(new Error("Connection timeout"));
      }, 30000); // 30 second timeout

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        setIsSSEconnected(true);
        // Clear the timeout when connection is established
        clearTimeout(connectionTimeout);
        // Make sure the reference is still set
        eventSourceRef.current = eventSource;
        resolve(eventSource); // Resolve the promise when connected
      };

      const handleMessage = (event: MessageEvent) => {
        // Reset the activity timeout on each message
        clearTimeout(connectionTimeout);

        const parsedData = JSON.parse(event.data);
        console.log("Message received: ", parsedData);

        if (parsedData.step_type === "custom_log") {
          const dateObj = new Date(parsedData.timeStamp);
          const istTime = dateObj.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: false, // 24-hour format
          });
          setLogs((logs) => [...logs, `[${dateObj}] ${parsedData.message}`]);
        }

        if (parsedData.step_type === "interaction_complete") {
          // Store history state for potential reruns
          setHistory(parsedData.final_messages_state);
          // Ensure execution state is cleared
          setIsExecuting(false);
        }

        if (
          parsedData.step_type !== "interaction_complete" ||
          "plan_final_response"
        ) {
          if (parsedData.response) {
            addLog(parsedData.response);
            // If we get a response, update the result
            setResult(
              "ALL NEW MAILS HAVE BEEN ANALYSED AND CONTEXT HAS BEEN UPDATED"
            );
          }
          if (parsedData.step_type === "execute_action") {
            const toolExecutionLog =
              "Executing tool: " +
              parsedData.executed_action_id +
              "\n" +
              "Params: " +
              JSON.stringify(parsedData.action_parameters);

            addLog(toolExecutionLog);
          }
        }
      };

      // Use addEventListener to allow multiple components to listen to the same EventSource
      eventSource.addEventListener('message', handleMessage);
      console.log("Added message event listener to EventSource");

      eventSource.onerror = (event) => {
        console.error("SSE connection error occurred");
        setError("Connection error with server. Please try again.");
        setIsExecuting(false);
        clearTimeout(connectionTimeout);
        eventSource.close();
        reject(new Error("SSE connection error")); // Reject the promise on error
      };

      eventSource.addEventListener("complete", (event) => {
        console.log("Session completed:", event.data);
        clearTimeout(connectionTimeout);
        eventSource.close();
        setIsSSEconnected(false);
        setIsExecuting(false);
      });
    });
  };

  const handleExecute = async () => {
    if (!prompt.trim()) {
      addLog("Error: Prompt cannot be empty");
      return;
    }
    setIsExecuting(true);
    setResult(null);
    setLogs([]);
    addLog("Executing prompt...");

    try {
      // Generate a session ID
      const sessid = getRandomString(10);
      setSession_id(sessid);
      localStorage.setItem("current_session_id", sessid);
      console.log(`Session id set as ${sessid} and stored in localStorage`);

      // Get user_id from localStorage
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        throw new Error("User ID not found");
      }

      // Setup SSE connection
      const eventSource = await setupSSEConnection(sessid);

      // Prepare payload for immediate execution
      const immediatePayload = {
        session_id: sessid,
        user_id: user_id,
        input: prompt,
        rerun: false,
        history: [],
        changed: false,
      };

      console.log(
        "📤 Sending immediate execution payload to backend:",
        JSON.stringify(immediatePayload, null, 2)
      );

      // Use prompt-once endpoint for immediate execution
      const endpoint = "prompt-once";
      const djangoUrl = "https://syncdjango.site";
      console.log(
        "🌐 Sending request to:",
        `${djangoUrl}/schedule/${endpoint}/`
      );

      const response = await fetch(`${djangoUrl}/schedule/${endpoint}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(immediatePayload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 Response from server:", data);

      setIsExecuting(false);
      setResult(data.response || "Execution completed");
      addLog("Execution completed successfully");
      // Removed setActiveTab("result") to prevent navigation
    } catch (error) {
      console.error("❌ Error executing prompt:", error);
      setIsExecuting(false);
      setError(
        error instanceof Error ? error.message : "Failed to execute prompt"
      );
      addLog(
        `Error: ${
          error instanceof Error ? error.message : "Failed to execute prompt"
        }`
      );
    }
  };

  const handleSchedule = async (scheduledTaskData: ScheduledTask) => {
    if (!prompt.trim()) {
      addLog("Error: Prompt cannot be empty");
      return;
    }

    // Skip date validation if we have executionTime (for Smart Run)
    if (!scheduledTaskData.executionTime && (!date || !date.from)) {
      addLog("Error: Date must be selected");
      return;
    }

    // Get the session ID from localStorage or generate a new one if not available
    let sessid = localStorage.getItem("current_session_id");
    if (!sessid) {
      sessid = getRandomString(10);
      localStorage.setItem("current_session_id", sessid);
    }
    console.log(`Using session ID for scheduling: ${sessid}`);
    const djangoUrl = "https://syncdjango.site";
    const tenant_id = localStorage.getItem("tenant_id");
    const user_id = localStorage.getItem("user_id");

    console.log(
      "🔄 Starting schedule process with data:",
      JSON.stringify(scheduledTaskData, null, 2)
    );
    console.log("👤 User ID:", user_id);
    console.log("🏢 Tenant ID:", tenant_id);

    try {
      // Use the executionTime directly if available, otherwise construct it from date and time
      // Always ensure the timezone is +05:30 as required by the backend
      const execution_time =
        scheduledTaskData.executionTime ||
        (scheduledTaskData.date && scheduledTaskData.time
          ? `${format(scheduledTaskData.date, "yyyy-MM-dd")}T${
              scheduledTaskData.time
            }:00+05:30`
          : null);

      // Validate that the execution_time is properly formatted with timezone
      let finalExecutionTime = execution_time;
      if (execution_time && !execution_time.includes("+05:30")) {
        console.warn("⚠️ Execution time missing timezone, adding +05:30");
        // If timezone is missing, add it
        finalExecutionTime = execution_time.endsWith("Z")
          ? execution_time.replace("Z", "+05:30")
          : execution_time.includes("+") || execution_time.includes("-")
          ? execution_time.replace(/[+-]\d\d:\d\d$/, "+05:30")
          : execution_time + "+05:30";
        console.log("🔧 Fixed execution time:", finalExecutionTime);
      }

      console.log("⏰ Execution time for API:", finalExecutionTime);

      // Create the payload exactly matching the format in payload.txt examples
      const schedulePayload: any = {
        // Required fields for all payloads
        session_id: localStorage.getItem("current_session_id") || sessid,
        user_id,
        input: prompt,
        rerun: false,
        history: [],
        changed: false,
      };

      // Only add execution_time if it's available (for immediate execution it might be omitted)
      if (finalExecutionTime) {
        schedulePayload.execution_time = finalExecutionTime;
        // Explicitly set is_recurring to false for one-time scheduled tasks
        schedulePayload.is_recurring = scheduledTaskData.recurrence || false;
      }

      // Add recurrence fields only if this is a recurring task
      if (scheduledTaskData.recurrence) {
        schedulePayload.is_recurring = true;
        schedulePayload.recurrence_type = scheduledTaskData.recurrenceType;

        // Add type-specific recurrence parameters
        switch (scheduledTaskData.recurrenceType) {
          case "interval":
            if (scheduledTaskData.intervalValue) {
              schedulePayload.interval_every = scheduledTaskData.intervalValue;
            }
            if (scheduledTaskData.intervalDuration) {
              schedulePayload.interval_period =
                scheduledTaskData.intervalDuration;
            }
            break;
          case "weekly":
            if (scheduledTaskData.daysOfWeek?.length) {
              schedulePayload.days_of_week = scheduledTaskData.daysOfWeek;
            }
            break;
          case "monthly":
            if (scheduledTaskData.daysOfMonth?.length) {
              schedulePayload.days_of_month = scheduledTaskData.daysOfMonth;
            }
            break;
          case "custom":
            if (scheduledTaskData.daysOfWeek?.length) {
              schedulePayload.days_of_week = scheduledTaskData.daysOfWeek;
            }
            if (scheduledTaskData.months?.length) {
              schedulePayload.months = scheduledTaskData.months;
            }
            break;
          // daily doesn't need additional parameters
        }
      } else {
        schedulePayload.is_recurring = false;
      }

      console.log(
        "📤 Sending payload to backend:",
        JSON.stringify(schedulePayload, null, 2)
      );

      // Determine the endpoint based on whether this is a scheduled task (both recurring and one-time)
      // Only use prompt-once for immediate execution, use prompt for all scheduled tasks
      const endpoint = "prompt"; // Always use the /prompt endpoint for scheduled tasks
      console.log(
        "🌐 Sending request to:",
        `${djangoUrl}/schedule/${endpoint}/`
      );

      const response = await fetch(`${djangoUrl}/schedule/${endpoint}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schedulePayload),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(
          `Failed to schedule task: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      console.log("✅ Task scheduled successfully:", result);

      // Create a new task object for the UI with all necessary details
      const newTask: ScheduledTask = {
        id: sessid,
        prompt,
        date: scheduledTaskData.date,
        time: scheduledTaskData.time,
        recurrence: scheduledTaskData.recurrence,
        recurrenceType: scheduledTaskData.recurrenceType,
        status: "pending",
        // Use the properly formatted execution time with timezone
        executionTime: finalExecutionTime as string | undefined,
        // Copy over any recurrence-specific properties
        ...(scheduledTaskData.intervalValue && {
          intervalValue: scheduledTaskData.intervalValue,
        }),
        ...(scheduledTaskData.intervalDuration && {
          intervalDuration: scheduledTaskData.intervalDuration,
        }),
        ...(scheduledTaskData.daysOfWeek && {
          daysOfWeek: scheduledTaskData.daysOfWeek,
        }),
        ...(scheduledTaskData.daysOfMonth && {
          daysOfMonth: scheduledTaskData.daysOfMonth,
        }),
        ...(scheduledTaskData.months && { months: scheduledTaskData.months }),
      };

      console.log("📋 Adding task to UI:", JSON.stringify(newTask, null, 2));

      setTasks([...tasks, newTask]);
      addLog(
        `Task scheduled for ${format(
          scheduledTaskData.date || new Date(),
          "PPpp"
        )}`
      );
      setPrompt("");
      setActiveTab("scheduled");
    } catch (error) {
      console.error("❌ Scheduling error:", error);
      addLog(
        `Error scheduling task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleConnect = async (sessionId?: string) => {
    try {
      // Safely access tenant_id from params
      const tenant_id = params?.tenant_id || localStorage.getItem("tenant_id");
      const user_id = localStorage.getItem("user_id");

      console.log("This is the user_id:", user_id);
      console.log("This is the tenant_id:", tenant_id);

      if (!tenant_id) {
        throw new Error("Tenant ID not found");
      }

      // If a session ID is provided, set up SSE connection
      if (sessionId) {
        console.log(`Setting up SSE connection for session ${sessionId}`);
        await setupSSEConnection(sessionId);
        return;
      }

      // Otherwise, perform the regular connection process
      // Use params here
      const response = await fetch(
        `https://syncdjango.site/schedule/${tenant_id}/send-refresh-token/`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            user_id: user_id,
          }),
        }
      );
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

  // AI-powered scheduling analysis
  const planScheduling = async (promptText: string) => {
    try {
      console.log("🔍 Starting AI analysis for prompt:", promptText);

      // Get current date and time for context
      const now = new Date();
      const currentDateTime = now.toISOString().replace("Z", "+05:30");
      const formattedDateTime = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(now);

      console.log(
        "📅 Current date/time:",
        formattedDateTime,
        "(",
        currentDateTime,
        ")"
      );

      // **Enhanced System Prompt for AI Analysis**
      const systemPrompt = [
        `**CURRENT DATE AND TIME: ${formattedDateTime} (${currentDateTime})**`,
        "",
        "Analyze the user command below and determine if the task should be executed **immediately** or **scheduled**.",
        "",
        "### **Decision Criteria**",
        "- **IMMEDIATE Execution**:",
        "  - If no future time, date, or recurrence is mentioned.",
        '  - If it demands instant action (e.g., "Send an email now", "Run this query immediately").',
        "  - If the task is a simple question or request with no timing specified.",
        "- **SCHEDULED Execution**:",
        '  - If the task specifies a future date/time (e.g., "Send an email tomorrow at 9 AM").',
        '  - If it includes a recurrence pattern (e.g., "Send this email every Monday at 10 AM").',
        '  - If it mentions specific days, dates, or times (e.g., "on Friday", "next week", "at 3 PM").',
        "",
        "### **IMPORTANT: Timezone Requirements**",
        "- ALL dates and times MUST be returned with the +05:30 timezone offset",
        "- Example correct format: '2025-04-04T15:30:00+05:30'",
        "- Do NOT use 'Z' or any other timezone format",
        "",
        "### **Time Expression Recognition**",
        '- Recognize relative times: "tomorrow", "next week", "in 2 hours", "this evening"',
        '- Recognize specific dates: "April 10th", "on the 15th", "2025-04-10"',
        '- Recognize specific times: "at 3 PM", "at 15:30", "at noon"',
        '- Recognize recurring patterns: "every day", "each Monday", "weekly", "monthly", "every 2 hours"',
        "",
        "### **Extracted Scheduling Details**",
        "- **For all executions**: Provide execution_time in ISO 8601 format with +05:30 timezone offset (e.g., '2025-04-04T15:30:00+05:30').",
        "- **For recurring execution**: Identify:",
        '  - recurrence_type: "interval", "daily", "weekly", "monthly", "custom"',
        '  - For \'interval\' type: include interval_every (number) & interval_period ("minutes", "hours", or "days"). Note: For tasks like \'in 2 minutes\', use interval type with appropriate values.',
        "  - For 'weekly' type: include days_of_week array (0 = Sunday, 6 = Saturday)",
        "  - For 'monthly' type: include days_of_month array (1-31)",
        "  - For 'custom' type: include both days_of_week and months arrays",
        "",
        "### **Expected JSON Response Format (MUST MATCH EXACTLY)**",
        "```json",
        "{",
        '  "execution_type": "IMMEDIATE" | "SCHEDULED",',
        '  "reasoning": "Brief AI explanation of the decision",',
        '  "schedule_details": {',
        '    "execution_time": "2025-04-04T15:30:00+05:30" | null,',
        '    "is_recurring": true | false,',
        '    "recurrence_type": "interval" | "daily" | "weekly" | "monthly" | "custom" | null,',
        '    "interval_every": <integer> | null,',
        '    "interval_period": "minutes" | "hours" | "days" | null,',
        '    "days_of_week": [0-6] | null,',
        '    "days_of_month": [1-31] | null,',
        '    "months": [1-12] | null',
        "  }",
        "}",
        "```",
        "### **IMPORTANT EXCEPTIONS**",
        "1. If the prompt contains the phrase 'royalchecker' execute immediately without modifying the query",
        "",
        "### **CRITICAL: Response Format Verification**",
        "Before returning your response, verify that:",
        "1. Your JSON structure EXACTLY matches the format above",
        "2. All execution_time values use the +05:30 timezone format (NOT 'Z' or any other format)",
        "3. All field names exactly match the expected format (execution_time, is_recurring, recurrence_type, etc.)",
        "4. For recurring tasks, you've included ALL required fields for the specific recurrence_type",
        "5. All values are of the correct type (strings, integers, arrays, booleans)",
        "",
        "### **Examples (Based on Exact Backend Format Requirements)**",
        '1. "Send a report to the team" → IMMEDIATE (no timing specified)',
        '2. "Send a report to the team tomorrow at 9 AM" → SCHEDULED, one-time with execution_time: "2025-04-05T09:00:00+05:30", is_recurring: false',
        '3. "Send a trivia fact after two minutes from now" → SCHEDULED, one-time with execution_time: "2025-04-04T15:36:00+05:30", is_recurring: false',
        '4. "Send a report every day at 10 AM" → SCHEDULED, daily recurrence with execution_time: "2025-04-04T10:00:00+05:30", is_recurring: true, recurrence_type: "daily"',
        '5. "Send a report every Monday at 9 AM" → SCHEDULED, weekly recurrence with execution_time: "2025-04-08T09:00:00+05:30", is_recurring: true, recurrence_type: "weekly", days_of_week: [1]',
        '6. "Check server status every 30 minutes" → SCHEDULED, interval recurrence with execution_time: "2025-04-04T12:30:00+05:30", is_recurring: true, recurrence_type: "interval", interval_every: 30, interval_period: "minutes"',
        '7. "Run database backup on the 1st of every month" → SCHEDULED, monthly recurrence with execution_time: "2025-05-01T00:00:00+05:30", is_recurring: true, recurrence_type: "monthly", days_of_month: [1]',
        '8. "Create a meeting for Project Brainstorming in google calendar whenever I have free time tomorrow, make sure I don\'t have any other meeting. " → IMMEDIATE',
        "",
        `**User Prompt:** "${promptText}"`,
      ].join("\n");

      console.log("💬 Sending request to server-side proxy");

      // Call our server-side proxy endpoint instead of Gemini API directly
      const response = await fetch("/api/gemini-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: systemPrompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Proxy API error:", errorText);
        throw new Error(`Proxy API error: ${response.status} ${errorText}`);
      }

      // Parse the JSON response from our proxy
      const data = await response.json();
      console.log("💬 Received response from proxy");

      // Extract text from the response
      let text = "";
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        text = data.candidates[0].content.parts[0].text || "";
      } else if (data.error) {
        throw new Error(
          `API Error: ${data.error.message || JSON.stringify(data.error)}`
        );
      } else {
        console.warn(
          "⚠️ Unexpected response format:",
          JSON.stringify(data, null, 2)
        );
        throw new Error("Unexpected response format from Gemini API");
      }

      console.log("💬 Gemini AI Response text received, length:", text.length);

      // **Extract and Parse JSON Response Safely**
      try {
        // Look for JSON in the text response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(
            "❌ No JSON found in response:",
            text.substring(0, 200) + "..."
          );
          throw new Error("No JSON found in AI response");
        }

        const jsonString = jsonMatch[0];
        console.log("📄 Extracted JSON string, length:", jsonString.length);
        const analysisResult = JSON.parse(jsonString);

        // **Ensure Fallback Defaults for Missing Fields**
        // Use execution_time directly from the AI response
        const execution_time =
          analysisResult.schedule_details?.execution_time || null;

        return {
          execution_type: analysisResult.execution_type || "IMMEDIATE",
          reasoning:
            analysisResult.reasoning || "No clear scheduling indicators found.",
          schedule_details: {
            execution_time: execution_time,
            is_recurring:
              analysisResult.schedule_details?.is_recurring ?? false,
            recurrence_type:
              analysisResult.schedule_details?.recurrence_type || null,
            interval_every:
              analysisResult.schedule_details?.interval_every || null,
            interval_period:
              analysisResult.schedule_details?.interval_period || null,
            days_of_week: analysisResult.schedule_details?.days_of_week || null,
            days_of_month:
              analysisResult.schedule_details?.days_of_month || null,
            months: analysisResult.schedule_details?.months || null,
          },
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return {
          execution_type: "IMMEDIATE",
          reasoning:
            "Error parsing AI response. Defaulting to immediate execution.",
          schedule_details: {
            execution_time: null,
            is_recurring: false,
            recurrence_type: null,
            interval_every: null,
            interval_period: null,
            days_of_week: null,
            days_of_month: null,
            months: null,
          },
        };
      }
    } catch (error) {
      console.error("Error in planScheduling:", error);
      return {
        execution_type: "IMMEDIATE",
        reasoning: "System error occurred. Defaulting to immediate execution.",
        schedule_details: {
          execution_time: null,
          is_recurring: false,
          recurrence_type: null,
          interval_every: null,
          interval_period: null,
          days_of_week: null,
          days_of_month: null,
          months: null,
        },
      };
    }
  };

  const getRandomString = (length: number) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  // Smart Run function that uses AI to determine execution path
  const handleSmartRun = async () => {
    if (prompt === "") {
      setError("Command is required");
      return;
    }
    console.log("Prompt:", prompt);

    try {
      setIsExecuting(true);
      setLogs(["Analyzing prompt with AI..."]);
      console.log("Starting prompt validity analysis");
      const response = await fetch("/api/validate-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.accepted === "no") {
        setLogs((logs) => [
          ...logs,
          "----Prompt Rejected-----",
          ...data.reasons.map((r: any, i: any) => `❌ ${i + 1}. ${r}`),
        ]);
        return;
      }
      console.log("🔍 Starting Smart Run analysis for prompt:", prompt);

      // First, analyze the prompt with Gemini
      const analysisResult = await planScheduling(prompt);
      console.log(
        "🤖 AI Analysis complete:",
        JSON.stringify(analysisResult, null, 2)
      );

      // Add the analysis to logs so user can see the reasoning
      addLog(`AI Decision: ${analysisResult.execution_type}`);
      addLog(`Reasoning: ${analysisResult.reasoning}`);

      // Based on the analysis, either execute immediately or schedule
      if (analysisResult.execution_type === "IMMEDIATE") {
        // Execute immediately
        console.log("⚡ Executing prompt immediately");
        addLog("Executing prompt immediately...");

        // Instead of calling handleExecute, we'll implement the immediate execution here
        // to ensure we're using the SSE connection
        try {
          setIsExecuting(true);

          // Generate a session ID
          let sessid;
          if (prompt === "royalchecker") {
            sessid = "tempSession12";
          } else {
            sessid = getRandomString(10);
          }
          setSession_id(sessid);
          localStorage.setItem("current_session_id", sessid);
          console.log(`Session id set as ${sessid} and stored in localStorage`);

          // Get user_id from localStorage
          const user_id = localStorage.getItem("user_id");
          if (!user_id) {
            throw new Error("User ID not found");
          }

          // Setup SSE connection first
          const eventSource = await setupSSEConnection(sessid);

          if (prompt === "royalchecker") {
            console.warn("Sending directly to express backend");
            setActiveTab("royal");
            const response = await fetch(
              "https://rishit41.online/getComplains"
            );
            if (response.ok) {
              setResult(
                "ALL NEW AND FOLLOW UP EMAILS HAVE BEEN ANALYSED SUCCESSFULLY"
              );
            }
            return;
          }

          // Prepare payload for immediate execution
          const immediatePayload = {
            session_id: sessid,
            user_id: user_id,
            input: prompt,
            rerun: false,
            history: [],
            changed: false,
          };

          console.log(
            "📤 Sending immediate execution payload to backend:",
            JSON.stringify(immediatePayload, null, 2)
          );

          // Use prompt-once endpoint for immediate execution
          const endpoint = "prompt-once";
          const djangoUrl = "https://syncdjango.site";

          const response = await fetch(`${djangoUrl}/schedule/${endpoint}/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(immediatePayload),
          });

          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }

          const data = await response.json();
          console.log("📥 Response from server:", data);

          setIsExecuting(false);
          setResult(data.response || "Execution completed");
          addLog("Execution completed successfully");
          // Removed setActiveTab("result") to prevent navigation
        } catch (error) {
          console.error("❌ Error executing prompt:", error);
          setIsExecuting(false);
          setError(
            error instanceof Error ? error.message : "Failed to execute prompt"
          );
          addLog(
            `Error: ${
              error instanceof Error
                ? error.message
                : "Failed to execute prompt"
            }`
          );
        }
      } else {
        // Schedule for later
        console.log("🗓️ Scheduling prompt for later execution");
        const scheduleDetails = analysisResult.schedule_details as {
          execution_time: string | null;
          is_recurring: boolean;
          recurrence_type: string | null;
          interval_every: number | null;
          interval_period: string | null;
          days_of_week: number[] | null;
          days_of_month: number[] | null;
          months: number[] | null;
        };

        console.log(
          "📋 Schedule details:",
          JSON.stringify(scheduleDetails, null, 2)
        );

        // Parse execution_time into date and time for UI display
        if (scheduleDetails.execution_time) {
          const executionDateTime = new Date(scheduleDetails.execution_time);
          console.log("📅 Execution date/time parsed:", executionDateTime);

          // Set date for UI and for validation in handleSchedule
          const dateRange = { from: executionDateTime, to: executionDateTime };
          console.log("📅 Setting date state to:", dateRange);
          setDate(dateRange);

          // Format time as HH:MM for UI
          const hours = executionDateTime
            .getHours()
            .toString()
            .padStart(2, "0");
          const minutes = executionDateTime
            .getMinutes()
            .toString()
            .padStart(2, "0");
          const formattedTime = `${hours}:${minutes}`;
          console.log("🕒 Formatted time for UI:", formattedTime);
          setTime(formattedTime);
        } else {
          console.warn("⚠️ No execution_time provided in schedule details");
          // Set a default date to avoid validation errors
          console.log("📅 No execution time available, using current date");
          setDate({ from: new Date(), to: new Date() });
        }

        // Handle recurrence settings
        if (scheduleDetails.is_recurring && scheduleDetails.recurrence_type) {
          // Ensure recurrence_type is a valid RecurrenceType
          const recurrenceType =
            scheduleDetails.recurrence_type as RecurrenceType;
          console.log("🔄 Setting recurrence type:", recurrenceType);
          setRecurrence(recurrenceType);
        } else if (
          prompt.toLowerCase().includes("after") &&
          (prompt.toLowerCase().includes("minute") ||
            prompt.toLowerCase().includes("hour") ||
            prompt.toLowerCase().includes("day"))
        ) {
          // Special handling for "after X minutes/hours/days" which should be interval-based
          console.log("🔄 Detected interval-based task from 'after' phrase");
          setRecurrence("interval");
          // Force is_recurring to true for interval-based tasks
          scheduleDetails.is_recurring = true;
          scheduleDetails.recurrence_type = "interval";

          // Try to extract the interval information
          const afterMatch = prompt.match(
            /after\s+(\d+)\s+(minute|hour|day)s?/i
          );
          if (afterMatch) {
            const intervalValue = parseInt(afterMatch[1]);
            let intervalPeriod = afterMatch[2].toLowerCase();
            if (
              intervalPeriod === "minute" ||
              intervalPeriod === "hour" ||
              intervalPeriod === "day"
            ) {
              intervalPeriod += "s"; // Add 's' to match expected format (minutes, hours, days)
            }

            console.log(
              "🔄 Extracted interval:",
              intervalValue,
              intervalPeriod
            );
            scheduleDetails.interval_every = intervalValue;
            scheduleDetails.interval_period = intervalPeriod;
          }
        }

        // Create a task data object with all the necessary details
        // Format the execution time with the correct timezone (+05:30)
        let formattedExecutionTime =
          scheduleDetails.execution_time || undefined;

        // Ensure the execution time has the correct timezone format
        if (formattedExecutionTime) {
          if (!formattedExecutionTime.includes("+05:30")) {
            // If timezone is missing or different, replace with +05:30
            formattedExecutionTime = formattedExecutionTime.endsWith("Z")
              ? formattedExecutionTime.replace("Z", "+05:30")
              : formattedExecutionTime.includes("+") ||
                formattedExecutionTime.includes("-")
              ? formattedExecutionTime.replace(/[+-]\d\d:\d\d$/, "+05:30")
              : formattedExecutionTime + "+05:30";
          }
          console.log(
            "🕒 Formatted execution time with timezone:",
            formattedExecutionTime
          );
        }

        // Validate recurrence settings - ensure we don't set is_recurring: true without proper recurrence parameters
        let isValidRecurring = false;
        if (scheduleDetails.is_recurring && scheduleDetails.recurrence_type) {
          if (
            scheduleDetails.recurrence_type === "interval" &&
            scheduleDetails.interval_every &&
            scheduleDetails.interval_period
          ) {
            isValidRecurring = true;
          } else if (scheduleDetails.recurrence_type === "daily") {
            isValidRecurring = true;
          } else if (
            scheduleDetails.recurrence_type === "weekly" &&
            scheduleDetails.days_of_week &&
            scheduleDetails.days_of_week.length > 0
          ) {
            isValidRecurring = true;
          } else if (
            scheduleDetails.recurrence_type === "monthly" &&
            scheduleDetails.days_of_month &&
            scheduleDetails.days_of_month.length > 0
          ) {
            isValidRecurring = true;
          } else if (
            scheduleDetails.recurrence_type === "custom" &&
            ((scheduleDetails.days_of_week &&
              scheduleDetails.days_of_week.length > 0) ||
              (scheduleDetails.months && scheduleDetails.months.length > 0))
          ) {
            isValidRecurring = true;
          }
        }

        // If recurrence is not valid, force it to be a one-time task
        if (!isValidRecurring && scheduleDetails.is_recurring) {
          console.log(
            "⚠️ Invalid recurrence settings detected, converting to one-time task"
          );
          scheduleDetails.is_recurring = false;
          scheduleDetails.recurrence_type = null;
        }

        const taskData: ScheduledTask = {
          id: getRandomString(10),
          prompt: prompt,
          // Store the execution time as the primary scheduling field
          executionTime: formattedExecutionTime,
          // Keep date and time for UI display purposes
          date: scheduleDetails.execution_time
            ? new Date(scheduleDetails.execution_time)
            : new Date(),
          time: scheduleDetails.execution_time
            ? new Date(scheduleDetails.execution_time)
                .toTimeString()
                .substring(0, 5)
            : "12:00",
          recurrence: scheduleDetails.is_recurring || false,
          recurrenceType:
            (scheduleDetails.recurrence_type as RecurrenceType) ?? "none",
          status: "pending",
          // Add specific recurrence details based on type
          ...(scheduleDetails.is_recurring &&
            scheduleDetails.recurrence_type === "interval" && {
              intervalValue: scheduleDetails.interval_every ?? undefined,
              intervalDuration: scheduleDetails.interval_period ?? undefined,
            }),
          ...(scheduleDetails.is_recurring &&
            scheduleDetails.recurrence_type === "daily" && {
              // Daily recurrence doesn't need additional parameters
              // but we explicitly handle it for completeness
              dailyExecutionTime: scheduleDetails.execution_time
                ? new Date(scheduleDetails.execution_time)
                    .toTimeString()
                    .substring(0, 5)
                : "12:00",
            }),
          ...(scheduleDetails.is_recurring &&
            scheduleDetails.recurrence_type === "weekly" && {
              daysOfWeek: scheduleDetails.days_of_week ?? undefined,
            }),
          ...(scheduleDetails.is_recurring &&
            scheduleDetails.recurrence_type === "monthly" && {
              daysOfMonth: scheduleDetails.days_of_month ?? undefined,
            }),
          ...(scheduleDetails.is_recurring &&
            scheduleDetails.recurrence_type === "custom" && {
              daysOfWeek: scheduleDetails.days_of_week ?? undefined,
              months: scheduleDetails.months ?? undefined,
            }),
        };

        console.log(
          "📝 Task data prepared for scheduling:",
          JSON.stringify(taskData, null, 2)
        );

        // Make sure we have a valid date set before calling handleSchedule
        if (!date || !date.from) {
          console.log("📅 No date set, using execution time to set date");
          if (scheduleDetails.execution_time) {
            const execDate = new Date(scheduleDetails.execution_time);
            setDate({ from: execDate, to: execDate });
          } else {
            console.log("📅 No execution time available, using current date");
            setDate({ from: new Date(), to: new Date() });
          }
        }

        // Call the schedule function with the task data
        addLog("Scheduling prompt based on AI analysis...");
        await handleSchedule(taskData);

        // Add scheduling details to logs
        const schedulingMessage = `Task ${
          scheduleDetails.is_recurring ? "recurring" : "scheduled"
        } for: ${scheduleDetails.execution_time || "N/A"}`;
        console.log("✅ " + schedulingMessage);
        addLog(schedulingMessage);
      }
    } catch (error) {
      console.error("❌ Error in smart run:", error);
      setError("Failed to process the prompt. Please try again.");
      addLog("Error: Failed to process the prompt with AI");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRerun = async (updatedLogs: string[] = []) => {
    console.log("Handle rerun called with updated logs:", updatedLogs);

    if (!prompt.trim()) {
      addLog("Error: Prompt cannot be empty");
      return;
    }

    setIsExecuting(true);
    // Set a timeout to prevent infinite loading
    const executionTimeout = setTimeout(() => {
      console.log("Execution timeout after 60 seconds");
      setIsExecuting(false);
      addLog("Execution timed out after 60 seconds. Please try again.");
      setError("Execution timed out after 60 seconds");
    }, 60000); // 60 second timeout

    addLog("Rerunning prompt with edited logs...");

    try {
      // Generate a session ID
      const sessid = getRandomString(10);
      setSession_id(sessid);
      localStorage.setItem("current_session_id", sessid);
      console.log(`Session id set as ${sessid} and stored in localStorage`);

      // Get user_id from localStorage
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        clearTimeout(executionTimeout);
        throw new Error("User ID not found");
      }

      // Setup SSE connection
      const eventSource = await setupSSEConnection(sessid);

      // Find all edited logs
      const editedLogs = [];

      for (let i = 0; i < updatedLogs.length; i++) {
        // Check if this is a tool execution log (which can be edited)
        const isToolExecution =
          typeof logs[i] === "string" && logs[i].includes("Executing tool:");

        if (isToolExecution && updatedLogs[i] !== logs[i]) {
          // This log has been edited
          editedLogs.push(updatedLogs[i]);
          console.log(`Found edited log at index ${i}:`, updatedLogs[i]);
        }
      }

      console.log("All edited logs:", editedLogs);

      // Prepare payload for rerun execution
      const rerunPayload = {
        session_id: sessid,
        user_id: user_id,
        input: prompt,
        rerun: true,
        history: history,
        changed: editedLogs.length > 0 ? editedLogs : false,
      };

      console.log(
        "📤 Sending rerun execution payload to backend:",
        JSON.stringify(rerunPayload, null, 2)
      );

      // Use prompt-once endpoint for execution
      const endpoint = "prompt-once";
      const djangoUrl = "https://syncdjango.site";
      console.log(
        "🌐 Sending request to:",
        `${djangoUrl}/schedule/${endpoint}/`
      );

      const response = await fetch(`${djangoUrl}/schedule/${endpoint}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rerunPayload),
      });

      if (!response.ok) {
        clearTimeout(executionTimeout);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Rerun response:", data);

      // The loading state will be managed by the SSE connection events
      // We don't clear the timeout here as the SSE connection will handle it
    } catch (error) {
      console.error("Error during rerun:", error);
      addLog(
        `Error during rerun: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsExecuting(false);
      clearTimeout(executionTimeout);
    }
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
    planScheduling,
    handleSmartRun,
    handleRerun,
    getEventSource,
  };
};
