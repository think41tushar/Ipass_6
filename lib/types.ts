// src/components/PromptScheduler/types.ts
import type { DateRange } from "react-day-picker";

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface ScheduledTask {
  id: string;
  prompt: string;
  dateTime: Date;
  recurrence: RecurrenceType;
  status: "pending" | "completed" | "failed";
  result?: string;
  logs?: string[];
}

export interface PromptInputSectionProps {
  date: DateRange | undefined;
  time: string;
  recurrence: RecurrenceType;
  prompt: string;
  isExecuting: boolean;
  setSessionid: (sessionid: string) => void;
  setIsSSEconnected: (isSSE: boolean) => void;
  session_id: string;
  setDate: (date: DateRange | undefined) => void;
  setTime: (time: string) => void;
  setRecurrence: (recurrence: RecurrenceType) => void;
  setPrompt: (prompt: string) => void;
  setLogs: (logs: string[]) => void;
  promptResponse: string;
  setPromptResponse: (response: string) => void;
  isSSEconnected: boolean;
  setError: (error: string) => void;
  handleExecute: () => void;
  handleSchedule: () => void;
  handleRunTask: (isRerun: boolean) => void;
}
