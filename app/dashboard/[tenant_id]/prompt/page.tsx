"use client";

import type React from "react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

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
import Loading from "@/components/ui/loading";
import { ScheduledTask } from "@/lib/types";

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
  } = usePromptScheduler();

  const [updatedLogs, setUpdatedLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

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
    isRerun: boolean,
  ) {
    let updated = "";
    updatedLogs.forEach((log) => {
      if (log !== null) {
        updated = log;
      }
    });

    console.log(updated);
    let requestBody = {};
    if (isRerun) {
      requestBody = {
        input: input,
        session_id: session_id,
        rerun: true,
        history: history,
        changed: updated,
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
      setLoading(true);
      setError("");
      console.log(JSON.stringify(requestBody));
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
      console.error("Failed to send prompt request: ", console.error);
    } finally {
      setLoading(false);
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
    // Log session id
    console.log(`Session id set as ${sessid}`);
    // Start event stream for logs
    const waitForSSE = new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${backendUrl}/logevents/${sessid}`);

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        setIsSSEconnected(true);
        resolve(eventSource); // Resolve the promise when connected
      };

      eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        console.log("Message received: ", parsedData);
        if (parsedData.step_type === "interaction_complete") {
          setHistory(parsedData.final_messages_state);
        }

        if (
          parsedData.step_type !== "interaction_complete" ||
          "plan_final_response"
        ) {
          if (parsedData.response) {
            setLogs((prevLogs) => [...prevLogs, parsedData.response]);
          }
          if (parsedData.step_type === "execute_action") {
            setLogs((prevLogs) => [
              ...prevLogs,
              "Executing tool: " +
                parsedData.executed_action_id +
                "\n" +
                "Params: " +
                JSON.stringify(parsedData.action_parameters),
            ]);
          }
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error: ", error);
        setError(error.toString());
        eventSource.close();
        reject(error); // Reject the promise on error
      };

      eventSource.addEventListener("complete", (event) => {
        console.log("Session completed:", event.data);
        eventSource.close();
        setIsSSEconnected(false);
      });
    });
    // Send prompt to backend
    try {
      setLoading(true);
      console.log("STARTING");
      const eventSource = await waitForSSE;
      console.log("ISRERUN: ", isRerun);
      const result = await callPrompt(prompt, sessid, isRerun);
      console.log(result.message.response);
      setPromptResponse(result.message.response);
      return;
    } catch (error) {
      console.error("Failed to establish sse connection: ", console.error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Wrapper for Connect to handle loading indicator
  const handleConnectWithLoading = async () => {
    setConnectLoading(true);
    await handleConnect();
    setConnectLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

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
              />

              <div className="my-4">
                <LogsAndResultSection
                  logs={logs}
                  result={promptResponse}
                  isExecuting={isExecuting}
                  updatedLogs={updatedLogs}
                  setUpdatedLogs={setUpdatedLogs}
                  handleRunTask={handleRunTask}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="scheduled"
              className="p-6 bg-[#0f1219] text-white"
            >
              <ScheduledPromptsSection />
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
