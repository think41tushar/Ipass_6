// status-table.tsx
"use client"

import { useState, useEffect } from "react"
import { Check, Loader2, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

// ——— Types ———
type Step = { id: number; description: string }
type User = {
  id: number
  name: string
  progress: Record<number, "pending" | "loading" | "completed" | "failed">
}

// ——— Static steps ———
const steps: Step[] = [
  { id: 1, description: "Starting Sanity Checks" },
  { id: 2, description: "Summarising the emails and updating context" },
  { id: 3, description: "Sending emails and pushing to Hubspot" },
  { id: 4, description: "Execution Completed" },
]

// ——— Props ———
interface StatusTableProps {
  /** your already‑open SSE connection */
  eventSource?: EventSource | null
}

export default function StatusTable({ eventSource }: StatusTableProps) {
  console.log("StatusTable component rendering with eventSource:", eventSource);
  
  const [initialCheckStatus, setInitialCheckStatus] = useState<
    "idle" | "loading" | "completed"
  >("idle")
  const [users, setUsers] = useState<User[]>([])
  const [hasReceivedData, setHasReceivedData] = useState(false)

  // Add a debugging log function
  const logDebug = (area: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[StatusTable][${timestamp}][${area}] ${message}`, data || '');
  };

  // Render debugging information
  useEffect(() => {
    logDebug('Render', 'Rendering StatusTable component', {
      initialCheckStatus,
      usersCount: users.length,
      users
    });
  }, [initialCheckStatus, users]);

  // Handle messages from EventSource
  useEffect(() => {
    logDebug('Init', 'StatusTable mounted with eventSource', {
      readyState: eventSource?.readyState,
      url: eventSource?.url
    });
    
    // If no EventSource, we'll show an empty table
    if (!eventSource) {
      logDebug('Error', 'EventSource is null or undefined, will show empty table');
      return;
    }
    
    // Check if the EventSource is already being listened to
    logDebug('Check', 'Checking EventSource readyState', {
      readyState: eventSource.readyState,
      hasOnMessage: !!eventSource.onmessage
    });
    
    const onMessage = (e: MessageEvent) => {
      logDebug('Raw', 'Raw event received', e);
      
      try {
        const parsedData = JSON.parse(e.data);
        logDebug('Parse', 'Parsed event data', parsedData);
        console.log("StatusTable received message:", parsedData);

        // Mark that we've received data
        setHasReceivedData(true);

        // Handle different message types based on step_type
        if (parsedData.step_type === "custom_log") {
          logDebug('custom_log', 'Processing custom_log message', parsedData);
          const message = parsedData.message;
          console.log("This is the parsedData received: ", parsedData.message);

          // 1) CHECKING FOR EMAILS.
          if (message === "CHECKING FOR EMAILS") {
            logDebug('Status', 'Setting initial check status to loading');
            setInitialCheckStatus("loading");
            return;
          }

          // 2) new email (no ":") ⇒ complete top loader & add row
          if (message.includes("@") && !message.includes(":")) {
            logDebug('User', 'Adding new user', message);
            setInitialCheckStatus("completed");
            setUsers((prev) => {
              // Check if user already exists
              if (prev.some(u => u.name === message)) {
                logDebug('UserState', 'User already exists, not adding duplicate', message);
                return prev;
              }
              
              const newUser = {
                id: Date.now(),
                name: message,
                progress: Object.fromEntries(
                  steps.map((s) => [s.id, "loading" as "pending" | "loading" | "completed" | "failed"])
                ) as User["progress"],
              };
              logDebug('UserState', 'New user created', newUser);
              const newUsers = [...prev, newUser];
              logDebug('UserState', 'Updated users state', newUsers);
              return newUsers;
            });
            return;
          }

          // 3) email:DONE or email:FAIL ⇒ mark each step in turn
          if (message.includes(":")) {
            const [email, status] = message.split(":");
            const isSuccess = status === "DONE";
            logDebug('Progress', `Updating progress for ${email}`, { status, isSuccess });

            steps.forEach((step, idx) => {
              setTimeout(() => {
                logDebug('Step', `Updating step ${step.id} for ${email} (${idx+1}/${steps.length})`, { 
                  stepIndex: idx, 
                  status: isSuccess ? "completed" : "failed" 
                });
                
                setUsers((prev) => {
                  const userToUpdate = prev.find(u => u.name === email);
                  if (!userToUpdate) {
                    logDebug('Warning', `User ${email} not found in state`, prev);
                    return prev;
                  }
                  
                  const updatedUsers = prev.map((u) =>
                    u.name === email
                      ? {
                          ...u,
                          progress: {
                            ...u.progress,
                            [step.id]: isSuccess ? "completed" as const : "failed" as const,
                          },
                        }
                      : u
                  );
                  logDebug('UserUpdate', `User state after step ${step.id} update`, {
                    before: prev.find(u => u.name === email)?.progress,
                    after: updatedUsers.find(u => u.name === email)?.progress
                  });
                  return updatedUsers;
                });
              }, idx * 500);
            });
          }
        } else if (parsedData.step_type === "execute_action") {
          logDebug('execute_action', 'Tool execution detected', {
            tool: parsedData.executed_action_id,
            params: parsedData.action_parameters
          });
        } else if (parsedData.step_type === "interaction_complete") {
          logDebug('interaction_complete', 'Interaction complete', parsedData);
        } else if (parsedData.response) {
          logDebug('response', 'Direct response received', parsedData.response);
        } else {
          logDebug('unknown', 'Unknown message type', parsedData);
        }
      } catch (error) {
        logDebug('Error', 'Error processing message', error);
        console.error('Error processing SSE message:', error);
      }
    };

    // Clear any existing handler first to avoid duplicates
    if (eventSource.onmessage) {
      logDebug('Warning', 'EventSource already has an onmessage handler, replacing it');
    }
    
    try {
      // Use addEventListener instead of onmessage to ensure we don't override existing handlers
      eventSource.addEventListener('message', onMessage);
      logDebug('Setup', 'Added message event listener to eventSource');
    } catch (error) {
      logDebug('Error', 'Failed to add event listener to EventSource', error);
    }

    return () => {
      logDebug('Cleanup', 'Removing event listener');
      if (eventSource) {
        try {
          eventSource.removeEventListener('message', onMessage);
          logDebug('Cleanup', 'Event listener removed successfully');
        } catch (error) {
          logDebug('Error', 'Failed to remove event listener', error);
        }
      }
    };
  }, [eventSource, steps]);

  const renderStatus = (
    status: "pending" | "loading" | "completed" | "failed"
  ) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin mx-auto" />
      case "completed":
        return <Check className="h-5 w-5 text-green-500 mx-auto" />
      case "failed":
        return <X className="h-5 w-5 text-red-500 mx-auto" />
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 overflow-x-auto">
      <Card className="mb-10">
        <CardContent className="pt-6 flex items-center gap-3">
          <div className="font-medium text-lg">
            Checking for new client compliant emails:
          </div>
          {initialCheckStatus === "loading" && (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          )}
          {initialCheckStatus === "completed" && (
            <Check className="h-5 w-5 text-green-500" />
          )}
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Emails</TableHead>
            {steps.map((step) => (
              <TableHead
                key={step.id}
                className="text-center whitespace-normal"
              >
                {step.description}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasReceivedData ? (
            users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={steps.length + 1} className="text-center py-6 text-gray-500">
                  No users to display.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  {steps.map((step) => (
                    <TableCell key={step.id} className="text-center">
                      {renderStatus(user.progress[step.id])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )
          ) : (
            <TableRow>
              <TableCell colSpan={steps.length + 1} className="text-center py-6 text-gray-500">
                Waiting for data...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
