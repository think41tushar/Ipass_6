"use client";
import type React from "react";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Repeat,
  Settings,
  Trash2,
  X,
  Info, // Import the Info icon
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePromptScheduler } from "@/lib/usePromptScheduler";
import { PromptInputSection } from "@/components/promptInputSection";
import { LogsAndResultSection } from "@/components/logsAndResultSection";
import { ScheduledPromptsSection } from "@/components/scheduledTasksSection";
import { ScheduledTask, RecurrenceType } from "@/lib/types";

const PromptScheduler: React.FC = () => {
  const {
    date,
    setDate,
    error,
    setError,
    time,
    setTime,
    recurrence,
    setRecurrence,
    prompt,
    setPrompt,
    promptResponse,
    setPromptResponse,
    tasks,
    logs,
    setLogs,
    result,
    isSSEconnected,
    setIsSSEconnected,
    activeTab,
    session_id,
    setSession_id,
    setActiveTab,
    isExecuting,
    isScheduled,
    isConnected,
    handleExecute,
    handleSchedule,
    deleteTask,
    handleConnect,
    handleSmartRun,
    planScheduling,
    handleRerun,
  } = usePromptScheduler();

  const [updatedLogs, setUpdatedLogs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [connectLoading, setConnectLoading] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Synchronize updatedLogs with logs when logs change
  useEffect(() => {
    // Initialize updatedLogs with the actual log values
    // This ensures we have the correct array length and values
    setUpdatedLogs([...logs]);
    console.log("Page component: Initialized updatedLogs with logs:", logs);
  }, [logs.length]); // Only run when logs length changes

  const backendUrl = "https://rishit41.online";
  const djangoUrl = "https://syncdjango.site";

  // Function to generate random string
  const getRandomString = (length: number) => {
    return [...Array(length)]
      .map(() => Math.random().toString(36)[2])
      .join("");
  };

  const scheduledTaskInstance: ScheduledTask = {
    id: "task-123",
    status: "pending",
    date: new Date(),
    time: "12:00",
    recurrence: false,
    recurrenceType: "none",
    prompt: "Sample task",
  };

  // Prompt request function
  async function callPrompt(
    input: string,
    session_id: string,
    isRerun: boolean
  ) {
    // Find the first tool execution log that has been edited
    let updated = "";
    if (isRerun) {
      for (let i = 0; i < updatedLogs.length; i++) {
        // Check if this is a tool execution log (which can be edited)
        const isToolExecution =
          typeof logs[i] === "string" && logs[i].startsWith("Executing tool:");
        if (isToolExecution && updatedLogs[i] !== logs[i]) {
          // This log has been edited
          updated = updatedLogs[i];
          console.log("Page component: Found edited log for callPrompt:", updated);
          break;
        }
      }
      console.log("Page component: Using edited log for rerun:", updated);
    }
    let requestBody = {};
    if (isRerun) {
      requestBody = {
        input: input,
        session_id: session_id,
        rerun: true,
        history: history,
        changed: updated || false,
      };
    } else {
      requestBody = {
        input: input,
        session_id: session_id,
        rerun: false,
        history: [],
        changed: false,
      };
    }
    try {
      setError("");
      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      const response = await fetch(`${djangoUrl}/schedule/prompt-once/`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Prompt function call response: ", result);
        return result;
      }
    } catch (error) {
      console.error("Failed to send prompt request: ", error);
    }
  }

  // Handle run prompt now
  const handleRunTask = async (isRerun: boolean) => {
    if (!isRerun) {
      setHistory([]);
      setUpdatedLogs([]);
    }
    console.log(`Handle run called with command : ${prompt}`);
    setLogs([]);
    if (prompt === "") {
      setError("Command is required");
      return;
    }
    const sessid = getRandomString(10);
    setSession_id(sessid);
    // Store session id in localStorage for other components to use
    localStorage.setItem("current_session_id", sessid);
    // Log session id
    console.log(`Session id set as ${sessid}`);
    console.log(`Session id set as ${sessid} and stored in localStorage`);
    // Send prompt to backend
    try {
      console.log("STARTING");
      // Connect with the session ID to establish SSE connection
      await handleConnect(sessid);
      console.log("ISRERUN: ", isRerun);
      const result = await callPrompt(prompt, sessid, isRerun);
      console.log(result.message.response);
      setPromptResponse(result.message.response);
      return;
    } catch (error) {
      console.error("Failed to establish sse connection: ", error);
    }
  };

  // Custom handler for rerun with edited logs
  const handleRerunWithEditedLogs = async () => {
    console.log("Page component: Rerunning with edited logs:", updatedLogs);
    try {
      // Don't clear logs to maintain UI state
      await handleRerun(updatedLogs);
    } catch (error) {
      console.error("Failed to rerun with edited logs:", error);
      setError("Failed to rerun with edited logs");
    }
  };

  // NEW: Wrapper for Connect to handle loading indicator
  const handleConnectWithLoading = async () => {
    setConnectLoading(true);
    await handleConnect();
    setConnectLoading(false);
  };

  return (
    <div className="container mx-auto p-8 bg-[#0a0c13]">
      <Card className="border border-gray-800 bg-[#0f1219] shadow-xl overflow-hidden rounded-lg">
        <CardHeader className="pb-2 border-b border-gray-800">
          <CardTitle className="flex gap-8 items-center justify-between">
            <div className="text-4xl font-bold text-white flex items-center">
              <div className="bg-purple-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              Prompt Scheduler
              <button
                onClick={() => setShowInfoModal(true)}
                className="ml-2 text-gray-400 hover:text-white focus:outline-none"
              >
                <Info className="h-8 w-8" />
              </button>
            </div>
            <Button
              onClick={handleConnectWithLoading}
              className={`${
                isConnected
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-700 hover:bg-gray-600"
              } text-white transition-colors duration-200`}
            >
              {connectLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-700 border-t-purple-300 animate-spin"></div>
                </div>
              ) : isConnected ? (
                "Connected"
              ) : (
                "Connect"
              )}
            </Button>
          </CardTitle>

          <CardDescription className="text-gray-400 mt-2">
            Schedule and execute prompts with recurrence options
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className="mx-6">
              <TabsTrigger value="prompt" className="w-[11rem]">
                Prompt
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="w-[11rem]">
                Scheduled Tasks
              </TabsTrigger>
              {/* Removed the Information TabTrigger */}
            </TabsList>
            <TabsContent value="prompt" className="p-6 bg-[#0f1219] text-white">
              <PromptInputSection
                date={date}
                time={time}
                recurrence={recurrence}
                prompt={prompt}
                ScheduledTask={scheduledTaskInstance}
                isScheduled={isScheduled}
                isExecuting={isExecuting}
                isSSEconnected={isSSEconnected}
                setIsSSEconnected={setIsSSEconnected}
                session_id={session_id}
                setSessionid={setSession_id}
                promptResponse={promptResponse}
                setPromptResponse={setPromptResponse}
                setError={setError}
                setLogs={setLogs}
                setDate={setDate}
                setTime={setTime}
                setRecurrence={setRecurrence}
                setPrompt={setPrompt}
                handleExecute={handleExecute}
                handleSchedule={handleSchedule}
                handleRunTask={handleRunTask}
                handleSmartRun={handleSmartRun}
              />
              <div className="my-4">
                <LogsAndResultSection
                  logs={logs}
                  result={result}
                  isExecuting={isExecuting}
                  updatedLogs={updatedLogs}
                  setUpdatedLogs={setUpdatedLogs}
                  handleRerun={handleRerunWithEditedLogs}
                />
              </div>
            </TabsContent>
            <TabsContent
              value="scheduled"
              className="p-6 bg-[#0f1219] text-white"
            >
              <ScheduledPromptsSection />
            </TabsContent>
            {/* No need for Information TabContent anymore */}
          </Tabs>
        </CardContent>
        <CardFooter className="p-4 border-t border-gray-800 bg-[#0f1219]">
          <div className="flex items-center text-xs text-gray-500 justify-between w-full">
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 text-purple-400" />
              <span>
                Tasks are stored locally and will persist between sessions
              </span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-purple-600 mr-2"></div>
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} scheduled
            </div>
          </div>
        </CardFooter>
      </Card>
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center overflow-y-auto pt-16 mt-3">
          <Card className="bg-[#14171f] rounded-lg shadow-xl border border-gray-700 p-8 w-4/5 max-w-3xl relative mx-auto my-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex justify-between items-center">
                Information
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="text-gray-400 hover:text-white focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-8 overflow-y-auto max-h-[70vh]">
              {/* Getting Started Guide */}
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" /> Getting Started
                </h3>
                <p className="mb-3 text-sm leading-relaxed">
                  To create a new scheduled task, click the <b>"Prompt"</b> tab and follow these steps:
                </p>
                <ol className="list-decimal list-inside text-sm ml-5 leading-relaxed">
                  <li className="pb-2 border-b border-gray-700/50">Enter your prompt in the text area.</li>
                  <li className="pb-2 border-b border-gray-700/50">
                    Use natural language to specify scheduling details (date, time, recurrence).
                  </li>
                  <li className="pb-2 border-b border-gray-700/50">
                    Click "Smart Run" to execute immediately or "Todo" to add to your task list.
                  </li>
                  <li>View your scheduled tasks in the "Scheduled Tasks" tab.</li>
                </ol>
              </div>
              {/* Main Scheduling Types */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Main Scheduling Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-900/70 p-5 rounded-md">
                    <h4 className="text-md font-semibold text-purple-400 mb-2 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" /> One-Time Scheduling
                    </h4>
                    <p className="text-sm leading-relaxed">
                      Schedule tasks to run once at a specific date and time.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Example: "Send email on 2025-04-10 at 14:00"
                    </p>
                  </div>
                  <div className="bg-gray-900/70 p-5 rounded-md">
                    <h4 className="text-md font-semibold text-blue-400 mb-2 flex items-center">
                      <Clock className="h-5 w-5 mr-2" /> Interval-Based
                    </h4>
                    <p className="text-sm leading-relaxed">
                      Run tasks repeatedly at specific time intervals (minutes, hours, days).
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Example: "Run every 5 minutes"
                    </p>
                  </div>
                  <div className="bg-gray-900/70 p-5 rounded-md">
                    <h4 className="text-md font-semibold text-green-400 mb-2 flex items-center">
                      <Repeat className="h-5 w-5 mr-2" /> Recurring Patterns
                    </h4>
                    <p className="text-sm leading-relaxed">
                      Configure complex recurring schedules (daily, weekly, monthly).
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Example: "Run every Monday at 9 AM"
                    </p>
                  </div>
                </div>
              </div>
              {/* Additional Scheduling Features */}
              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-3">Additional Scheduling Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/70 p-5 rounded-md">
                    <h4 className="text-md font-semibold text-white mb-2 flex items-center">
                      <Settings className="h-6 w-6 mr-2 text-amber-400" /> Weekly & Monthly
                    </h4>
                    <p className="text-sm leading-relaxed">
                      Run tasks on specific days of the week or specific days of the month.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Example: "Every Tuesday and Friday", "The 1st and 15th of each month"
                    </p>
                  </div>
                  <div className="bg-gray-900/70 p-5 rounded-md">
                    <h4 className="text-md font-semibold text-white mb-2 flex items-center">
                      <Settings className="h-6 w-6 mr-2 text-purple-400" /> Custom Advanced
                    </h4>
                    <p className="text-sm leading-relaxed">
                      Combine multiple scheduling conditions for highly specific execution times.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Example: "Every Monday in March and June"
                    </p>
                  </div>
                </div>
              </div>
              {/* Scheduling Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                  <AlertCircle className="h-6 w-6 mr-2" /> Why Use Scheduling?
                </h3>
                <ul className="list-disc list-inside text-sm ml-5 leading-relaxed">
                  <li className="pb-1">Automate repetitive tasks, freeing up your time.</li>
                  <li className="pb-1">Ensure critical prompts are executed exactly when needed.</li>
                  <li>Maintain consistency and reliability in your workflows.</li>
                  <li>Plan future actions and communications in advance.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PromptScheduler;

