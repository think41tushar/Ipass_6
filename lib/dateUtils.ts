// src/lib/utils/dateUtils.ts
import { format } from "date-fns";
import { RecurrenceType } from "@/lib/types";

export const getRecurrenceLabel = (type: RecurrenceType) => {
  switch (type) {
    case "daily": return "Daily";
    case "weekly": return "Weekly";
    case "monthly": return "Monthly";
    default: return "One-time";
  }
};

export const formatDateTime = (date: Date) => {
  return format(date, "PPpp");
};

export const isDateInPast = (date: Date) => {
  return date < new Date();
};