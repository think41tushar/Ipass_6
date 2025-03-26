// src/components/PromptScheduler/ScheduledTasksSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Trash2, 
  LucideCalendar 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { ScheduledTask, RecurrenceType } from "@/lib/types";
import { 
  getRecurrenceLabel 
} from "@/lib/dateUtils";
import { 
  getStatusColor, 
  getStatusIcon 
} from "@/lib/renderUtils";

interface ScheduledTasksSectionProps {
  tasks: ScheduledTask[];
  deleteTask: (id: string) => void;
}

export const ScheduledTasksSection: React.FC<ScheduledTasksSectionProps> = ({
  tasks,
  deleteTask,
}) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-slate-300">Scheduled Tasks</h3>

    {tasks.length > 0 ? (
      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-background bg-background/30 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Badge
                  className={cn(
                    "mr-2",
                    getStatusColor(task.status)
                  )}
                >
                  <span className="flex items-center">
                    {getStatusIcon(task.status)}
                    <span className="ml-1">
                      {task.status.charAt(0).toUpperCase() +
                        task.status.slice(1)}
                    </span>
                  </span>
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-700 text-slate-400"
                >
                  {getRecurrenceLabel(task.recurrence)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-background"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-2 text-sm text-slate-400">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
                <span>{format(task.dateTime, "PPpp")}</span>
              </div>
            </div>

            <div className="bg-background p-3 rounded-md border border-slate-700 text-slate-300 text-sm">
              <div className="line-clamp-2">{task.prompt}</div>
            </div>
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 border border-dashed border-background rounded-lg">
        <LucideCalendar className="h-12 w-12 mx-auto text-slate-700 mb-2" />
        <h3 className="text-lg font-medium text-slate-400 mb-1">
          No scheduled tasks
        </h3>
        <p className="text-slate-500">
          Schedule your first task to see it here
        </p>
      </div>
    )}
  </div>
);