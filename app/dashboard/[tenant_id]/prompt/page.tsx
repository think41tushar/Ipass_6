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
  X 
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
    return [...Array(length)].map(() => Math.random().toString(36)[2]).join("");
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
        const isToolExecution = typeof logs[i] === 'string' && logs[i].startsWith("Executing tool:");
        
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
    await handleConnect();
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
            </div>
            <Button
              onClick={handleConnectWithLoading}
              className={`${
                isConnected
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-700 hover:bg-gray-600"
              } text-white transition-colors duration-200`}
            >
              {isConnected ? (
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
              <TabsTrigger value="information" className="w-[11rem]">
                Information
              </TabsTrigger>
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

            <TabsContent
              value="information"
              className="p-6 bg-[#0f1219] text-white"
            >
              {activeTab === "information" && (
                
                <div className="space-y-8 p-4">
                  {/* Getting Started Guide */}
                  <div className="flex items-center justify-center rounded-lg border h-[25rem] border-gray-700 bg-gradient-to-r from-gray-900/60 to-gray-800/30 p-6 shadow-md overflow-hidden transition-all duration-300 hover:border-green-500/50 hover:shadow-green-900/20 hover:shadow-lg">
                    <div className="flex flex-col justify-center items-center">
                      <div className="flex flex-row items-center mb-5">
                        <div className="bg-green-500/20 p-4 rounded-full mr-5 flex-shrink-0">
                          <AlertCircle className="h-8 w-8 text-green-400" />
                        </div>
                        <h4 className="text-[2rem] font-medium text-white mb-3">Getting Started</h4>
                      </div>
                      <div className="text-center">
                        <p className="text-[1.2rem] text-gray-300 mb-4">
                          To create a new scheduled task, click the <b>"Prompt"</b> tab and follow these steps:
                        </p>
                        <ol className="list-decimal list-inside text-base text-gray-300 space-y-1 ml-2">
                          <li className="pb-3 border-b border-gray-800/30">Enter your prompt in the text area</li>
                          <li className="pb-3 border-b border-gray-800/30">Use natural language to specify scheduling details (date, time, recurrence)</li>
                          <li className="pb-3 border-b border-gray-800/30">Click "Smart Run" to execute immediately or "Todo" to add to your task list</li>
                          <li>View your scheduled tasks in the "Scheduled Tasks" tab</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  {/* Main Scheduling Types */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* One-Time Schedule Card */}
                    <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-6 shadow-md overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-900/20 hover:shadow-lg h-full">
                      <div className="flex flex-col items-center text-center h-full">
                        <div className="bg-purple-500/20 p-4 rounded-full mb-4">
                          <CalendarIcon className="h-10 w-10 text-purple-400" />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-3">One-Time Scheduling</h4>
                        <p className="text-base text-gray-300 mb-4">
                          Schedule tasks to run once at a specific date and time. Perfect for one-off reminders, 
                          future notifications, or delayed actions.
                        </p>
                        <div className="mt-auto bg-gray-900/50 p-4 rounded-md w-full text-left">
                          <h5 className="text-sm font-medium text-purple-400 mb-2">Example:</h5>
                          <p className="text-sm text-gray-400">
                            <code className="bg-gray-800 px-2 py-1 rounded">
                              "Send an email with a trivia fact at 2025-04-05T10:45:00+05:30"
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interval Schedule Card */}
                    <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-6 shadow-md overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-900/20 hover:shadow-lg h-full">
                      <div className="flex flex-col items-center text-center h-full">
                        <div className="bg-blue-500/20 p-4 rounded-full mb-4">
                          <Clock className="h-10 w-10 text-blue-400" />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-3">Interval-Based</h4>
                        <p className="text-base text-gray-300 mb-4">
                          Run tasks repeatedly at specific time intervals, such as every few minutes, 
                          hours, days, or weeks. Ideal for regular check-ins or periodic updates.
                        </p>
                        <div className="mt-auto bg-gray-900/50 p-4 rounded-md w-full text-left">
                          <h5 className="text-sm font-medium text-blue-400 mb-2">Example:</h5>
                          <p className="text-sm text-gray-400">
                            <code className="bg-gray-800 px-2 py-1 rounded">
                              "Send a trivia fact every 2 minutes starting at 2025-04-04T23:18:00+05:30"
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recurring Schedule Card */}
                    <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-6 shadow-md overflow-hidden transition-all duration-300 hover:border-green-500/50 hover:shadow-green-900/20 hover:shadow-lg h-full">
                      <div className="flex flex-col items-center text-center h-full">
                        <div className="bg-green-500/20 p-4 rounded-full mb-4">
                          <Repeat className="h-10 w-10 text-green-400" />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-3">Recurring Patterns</h4>
                        <p className="text-base text-gray-300 mb-4">
                          Configure complex recurring schedules including daily, weekly, monthly, 
                          or custom patterns with specific days and months selection.
                        </p>
                        <div className="mt-auto bg-gray-900/50 p-4 rounded-md w-full text-left">
                          <h5 className="text-sm font-medium text-green-400 mb-2">Example:</h5>
                          <p className="text-sm text-gray-400">
                            <code className="bg-gray-800 px-2 py-1 rounded">
                              "Send a trivia fact daily at 2025-04-04T22:45:00+05:30"
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Scheduling Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Weekly & Monthly Scheduling Card */}
                    <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-6 shadow-md overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-900/20 hover:shadow-lg">
                      <div className="flex items-start">
                        <div className="bg-amber-500/20 p-4 rounded-full mr-5 flex-shrink-0">
                          <Settings className="h-8 w-8 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-white mb-3">Weekly & Monthly Scheduling</h4>
                          <p className="text-base text-gray-300 mb-4">
                            Create schedules that run on specific days of the week or month.
                          </p>
                          <div className="space-y-3">
                            <div className="bg-gray-900/50 p-4 rounded-md">
                              <h5 className="text-sm font-medium text-amber-400 mb-2">Weekly Example:</h5>
                              <p className="text-sm text-gray-400">
                                <code className="bg-gray-800 px-2 py-1 rounded">
                                  "Send a trivia fact every Monday and Wednesday"
                                </code>
                              </p>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-md">
                              <h5 className="text-sm font-medium text-amber-400 mb-2">Monthly Example:</h5>
                              <p className="text-sm text-gray-400">
                                <code className="bg-gray-800 px-2 py-1 rounded">
                                  "Send a trivia fact on the 1st and 15th day of each month"
                                </code>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Custom Advanced Scheduling Card */}
                    <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-6 shadow-md overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-900/20 hover:shadow-lg">
                      <div className="flex items-start">
                        <div className="bg-purple-500/20 p-4 rounded-full mr-5 flex-shrink-0">
                          <Settings className="h-8 w-8 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-white mb-3">Custom Advanced Scheduling</h4>
                          <p className="text-base text-gray-300 mb-4">
                            Combine multiple patterns for maximum flexibility in task execution.
                          </p>
                          <div className="bg-gray-900/50 p-4 rounded-md">
                            <h5 className="text-sm font-medium text-purple-400 mb-2">Complex Example:</h5>
                            <p className="text-sm text-gray-400">
                              <code className="bg-gray-800 px-2 py-1 rounded">
                                "Send a trivia fact every Monday in February and April only"
                              </code>
                            </p>
                            <p className="text-sm text-gray-400 mt-3">
                              This combines day selection (Mondays) with specific months (Feb & Apr)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scheduling Benefits */}
                  <div className="rounded-lg h-[23rem] border border-gray-700 bg-gray-800/30 p-6 shadow-md overflow-hidden mb-8 transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-900/20 hover:shadow-lg">
                    <h4 className="text-[2rem] font-medium text-white mb-10 mt-5 text-center flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 mr-3 text-blue-400" />
                      Why Use Scheduling?
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-900/40 p-5 rounded-md hover:bg-gray-900/60 transition-all duration-300 border border-gray-800/50">
                        <h5 className="text-[1rem] font-medium text-blue-400 mb-3">Automation</h5>
                        <p className="text-[1rem] text-gray-300">
                          Set up tasks once and let them run automatically according to your schedule.
                          No need to manually trigger actions each time.
                        </p>
                      </div>
                      <div className="bg-gray-900/40 p-5 rounded-md hover:bg-gray-900/60 transition-all duration-300 border border-gray-800/50">
                        <h5 className="text-[1rem] font-medium text-green-400 mb-3">Consistency</h5>
                        <p className="text-[1rem] text-gray-300">
                          Ensure regular communication and updates happen exactly when needed,
                          maintaining consistent intervals between tasks.
                        </p>
                      </div>
                      <div className="bg-gray-900/40 p-5 rounded-md hover:bg-gray-900/60 transition-all duration-300 border border-gray-800/50">
                        <h5 className="text-[1rem] font-medium text-purple-400 mb-3">Time Management</h5>
                        <p className="text-[1rem] text-gray-300">
                          Plan your communications in advance and distribute them optimally
                          throughout your schedule for maximum efficiency.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  
                </div>
              )}
            </TabsContent>
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
    </div>
  );
};

export default PromptScheduler;
