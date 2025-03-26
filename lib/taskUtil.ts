// src/lib/utils/taskUtils.ts
import { getStatusColor, getStatusIcon } from "@/lib/renderUtils";

export const saveTasksToLocalStorage = (tasks: any[]) => {
  localStorage.setItem("scheduledTasks", JSON.stringify(tasks));
};

export const loadTasksFromLocalStorage = () => {
  const savedTasks = localStorage.getItem("scheduledTasks");
  if (savedTasks) {
    try {
      const parsedTasks = JSON.parse(savedTasks);
      return parsedTasks.map((task: any) => ({
        ...task,
        dateTime: new Date(task.dateTime),
      }));
    } catch (error) {
      console.error("Failed to parse saved tasks:", error);
      return [];
    }
  }
  return [];
};