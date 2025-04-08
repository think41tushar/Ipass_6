// src/components/PromptScheduler/types.ts
import type { DateRange } from "react-day-picker";

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "interval" | "custom";

export interface ScheduledTask {
  id: string;
  // prompt: string;
  // dateTime: Date;
  // recurrence: RecurrenceType;
  status: "pending" | "completed" | "failed";
  result?: string;
  intervalValue?: number;
  intervalDuration?: string;
  logs?: string[];
  date: Date | undefined;
  time: string;
  recurrence: boolean;
  recurrenceType: RecurrenceType;
  daysOfMonth?: number[];
  prompt: string;
  executionTime?: string;
  daysOfWeek?: number[];
  months?: number[];
}

export interface PromptInputSectionProps {
  date: DateRange | undefined;
  time: string;
  recurrence: RecurrenceType;
  prompt: string;
  isExecuting: boolean;
  isScheduled: boolean;
  setSessionid: (sessionid: string) => void;
  setIsSSEconnected: (isSSE: boolean) => void;
  session_id: string;
  ScheduledTask: ScheduledTask;
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
  handleSchedule: (taskData: ScheduledTask) => void;
  handleRunTask: (isRerun: boolean) => void;
  handleSmartRun?: () => void;
  onSearchClick?: () => void;
}
