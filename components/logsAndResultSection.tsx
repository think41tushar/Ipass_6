// src/components/PromptScheduler/LogsAndResultSection.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "./ui/button";

interface LogsAndResultSectionProps {
  logs: string[];
  result: string | null;
  isExecuting: boolean;
  setUpdatedLogs: any;
  updatedLogs: any;
  handleRunTask: any;
}

export const LogsAndResultSection: React.FC<LogsAndResultSectionProps> = ({
  logs,
  result,
  isExecuting,
  setUpdatedLogs,
  updatedLogs,
  handleRunTask,
}) => {
  return (
    <div className="space-y-6">
      {/* Logs Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-300">Execution Logs</h3>
        <Card className="border-background bg-background/30">
          <CardContent className="p-4">
            <ScrollArea className="h-[300px] p-4 border rounded">
              {logs.length > 0 ? (
                <div className="space-y-1 font-mono pt-2 text-sm text-slate-300">
                  {logs.map((log, index) => {
                    const isToolExecution = log.startsWith("Executing tool:");
                    let formattedLog = log;

                    if (isToolExecution) {
                      const match = log.match(/Params:\s*(\{[\s\S]*\})/);
                      if (match) {
                        try {
                          const parsedJson = JSON.parse(match[1]);
                          const prettyJson = JSON.stringify(
                            parsedJson,
                            null,
                            2
                          );
                          formattedLog = log.replace(match[1], prettyJson); // Replace raw JSON with formatted JSON
                        } catch (error) {
                          console.error("Invalid JSON:", error);
                        }
                      }
                    }

                    return isToolExecution ? (
                      <textarea
                        key={index}
                        value={
                          updatedLogs[index] !== undefined
                            ? updatedLogs[index]
                            : formattedLog
                        }
                        className="w-full bg-background text-yellow-300 font-mono text-sm p-2 my-2 border border-yellow-500 rounded resize-y outline-none"
                        rows={Math.max(formattedLog.split("\n").length, 3)}
                        onChange={(e) => {
                          const newLogs = [...updatedLogs];
                          newLogs[index] = e.target.value;
                          setUpdatedLogs(newLogs);
                        }}
                      />
                    ) : (
                      <div
                        key={index}
                        className="border-l-2 border-slate-700 pl-3 py-1 my-2"
                      >
                        {log}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-500 italic text-center py-4">
                  No logs available. Execute a prompt to see logs.
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between">
              <div></div>
              <Button
                onClick={() => {
                  handleRunTask(true);
                }}
                className="mt-4"
              >
                Run Again ?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-300">Result</h3>
        <Card className="border-background bg-background/30">
          <CardContent className="p-4">
            <AnimatePresence mode="wait">
              {isExecuting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-blue-500 animate-spin mb-2"></div>
                    <p className="text-slate-400">Processing prompt...</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-background rounded-md border border-slate-700"
                >
                  <pre className="whitespace-pre-wrap text-slate-300">
                    {result}
                  </pre>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-500 italic text-center py-8"
                >
                  No result available. Execute a prompt to see results.
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
