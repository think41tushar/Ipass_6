// src/components/PromptScheduler/index.tsx
"use client";

import React from "react";
import { 
  AlertCircle 
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { usePromptScheduler } from "@/lib/usePromptScheduler";
import { PromptInputSection } from "@/components/promptInputSection";
import { LogsAndResultSection } from "@/components/logsAndResultSection";
import { ScheduledTasksSection } from "@/components/scheduledTasksSection";

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
    isConnected,
    handleExecute,
    handleSchedule,
    deleteTask,
    handleConnect,
  } = usePromptScheduler();
  
  const backendUrl = "http://13.203.173.137:3000";
  const djangoUrl = "http://127.0.0.1:8000";

  // Function to generate random string
  const getRandomString = (length: number) => {
    return [...Array(length)].map(() => Math.random().toString(36)[2]).join("");
  };

  // Prompt request function
  async function callPrompt(input: string, session_id: string) {
    const requestBody = {
      query: input,
      session_id: session_id,
    };
    try {
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
    }
  }

   // Handle run prompt now
   const handleRunTask = async () => {
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
        if (parsedData.step_type !== "interaction_complete" || "plan_final_response") {
          if (parsedData.response) {
            setLogs((prevLogs) => [...prevLogs, parsedData.response]);
          }
          if (parsedData.step_type === "execute_action") {
            setLogs((prevLogs) => [
              ...prevLogs,
              "Executing tool: " + parsedData.executed_action_id,
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
      const eventSource = await waitForSSE;
      const result = await callPrompt(prompt, sessid);
      console.log(result.message.response);
      setPromptResponse(result.message.response);
      return;
    } catch (error) {
      console.error("Failed to establish sse connection: ", console.error);
    }
  };


  return (
    <div className="container mx-auto p-8 bg-background">
      <Card className="border-background bg-background shadow-xl overflow-hidden">
        <CardHeader className="pb-2 border-b border-background">
          <CardTitle className="flex gap-8 items-center justify-between">
            <div className="text-4xl font-bold text-white">
              Prompt Scheduler
            </div>
            <Button onClick={handleConnect}>
              {isConnected ? "Connected" : "Connect"}
            </Button>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Schedule and execute prompts with recurrence options
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className="bg-background rounded-none grid grid-cols-3">
              <TabsTrigger
                value="prompt"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                Prompt
              </TabsTrigger>
              <TabsTrigger
                value="result"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                Logs & Result
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                Scheduled Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="prompt"
              className="p-6 bg-background text-white"
            >
              <PromptInputSection
                date={date}
                time={time}
                recurrence={recurrence}
                prompt={prompt}
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
            </TabsContent>

            <TabsContent
              value="result"
              className="p-6 bg-background text-white"
            >
              <LogsAndResultSection
                logs={logs}
                result={result}
                isExecuting={isExecuting}
              />
            </TabsContent>

            <TabsContent
              value="scheduled"
              className="p-6 bg-background text-white"
            >
              <ScheduledTasksSection
                tasks={tasks}
                deleteTask={deleteTask}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
<CardFooter className="p-4 border-t border-background bg-background">
          <div className="flex items-center text-xs text-slate-500 justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>
                Tasks are stored locally and will persist between sessions
              </span>
            </div>
            <div>
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} scheduled
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PromptScheduler;
