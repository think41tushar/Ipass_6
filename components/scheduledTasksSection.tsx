"use client"

import type React from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { CalendarIcon, Trash2, LucideCalendar, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { ScheduledTask } from "@/lib/types"
import { getRecurrenceLabel } from "@/lib/dateUtils"
import { getStatusColor, getStatusIcon } from "@/lib/renderUtils"

interface ScheduledTasksSectionProps {
  tasks: ScheduledTask[]
  deleteTask: (id: string) => void
}

export const ScheduledTasksSection: React.FC<ScheduledTasksSectionProps> = ({ tasks, deleteTask }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-white">Scheduled Tasks</h3>
      {tasks.length > 0 && (
        <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 flex items-center">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>

    {tasks.length > 0 ? (
      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-gray-800 bg-gray-900/30 rounded-lg p-4 shadow-lg hover:border-gray-700 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Badge className={cn("mr-2 bg-purple-600 text-white", getStatusColor(task.status))}>
                  <span className="flex items-center">
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                  </span>
                </Badge>
                <Badge variant="outline" className="border-gray-700 text-gray-400">
                  {getRecurrenceLabel(task.recurrence)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-gray-800"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-2 text-sm text-gray-400">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                <span>{format(task.dateTime, "PPpp")}</span>
              </div>
            </div>

            <div className="bg-[#111827] p-3 rounded-md border border-gray-800 text-gray-300 text-sm">
              <div className="line-clamp-2">{task.prompt}</div>
            </div>
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg bg-gray-900/30">
        <div className="bg-purple-600 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <LucideCalendar className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-1">No scheduled tasks</h3>
        <p className="text-gray-500">Schedule your first task to see it here</p>
      </div>
    )}
  </div>
)

