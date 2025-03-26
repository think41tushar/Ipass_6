"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CalendarProps {
  /** ISO-formatted date-time string (e.g., "2025-03-20T10:49:00+05:30") */
  value: string;
  /** Called when a new ISO date-time string is produced */
  onChange: (newISO: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ value, onChange }) => {
  // Derive initial date and time values from the incoming ISO value (if provided)
  const initialDate = value ? value.substring(0, 10) : "";
  const initialTime = value ? value.substring(11, 16) : "12:00";
  const [dateValue, setDateValue] = useState(initialDate);
  const [timeValue, setTimeValue] = useState(initialTime);

  // Whenever date or time changes, update the combined ISO value.
  useEffect(() => {
    if (dateValue && timeValue) {
      // If time doesn't include seconds, append ":00"
      const timeWithSeconds = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
      const combinedISO = `${dateValue}T${timeWithSeconds}`;
      const combinedDate = new Date(combinedISO);
      // Format the date with timezone offset
      const formatted = format(combinedDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
      onChange(formatted);
    }
  }, [dateValue, timeValue, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="text-slate-300">
            Date
          </Label>
          <Input
            type="date"
            id="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="border-slate-700 bg-background text-white"
          />
        </div>
        <div>
          <Label htmlFor="time" className="text-slate-300">
            Time
          </Label>
          <Input
            type="time"
            id="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            className="border-slate-700 bg-background text-white"
          />
        </div>
      </div>
      {dateValue && timeValue && (
        <div className="mt-2 text-slate-300">
          Execution Time: <span className="font-mono">{value}</span>
        </div>
      )}
    </div>
  );
};

export default Calendar;
