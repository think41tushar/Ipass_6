// src/components/PromptScheduler/LogsAndResultSection.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogsAndResultSectionProps {
  logs: string[];
  result: string | null;
  isExecuting: boolean;
}

export const LogsAndResultSection: React.FC<LogsAndResultSectionProps> = ({
  logs,
  result,
  isExecuting,
}) => (
  <div className="space-y-6">
    {/* Logs Section */}
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-slate-300">Execution Logs</h3>
      <Card className="border-background bg-background/30">
        <CardContent className="p-4">
          <ScrollArea className="h-[150px] rounded">
            {logs.length > 0 ? (
              <div className="space-y-1 font-mono text-sm text-slate-300">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-slate-700 pl-3 py-1"
                  >
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic text-center py-4">
                No logs available. Execute a prompt to see logs.
              </div>
            )}
          </ScrollArea>
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
                <pre className="whitespace-pre-wrap text-slate-300">{result}</pre>
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

