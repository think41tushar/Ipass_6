"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "./ui/button"

interface LogsAndResultSectionProps {
  logs: string[]
  result: string | null
  isExecuting: boolean
  setUpdatedLogs: any
  updatedLogs: any
  handleRunTask: any
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
        <h3 className="text-lg font-medium text-white">Execution Logs</h3>
        <Card className="border border-gray-800 bg-gray-900/30 rounded-lg shadow-lg">
          <CardContent className="p-4">
            <ScrollArea className="h-[300px] p-4 border border-gray-800 rounded bg-[#111827]">
              {logs.length > 0 ? (
                <div className="space-y-1 font-mono pt-2 text-sm text-gray-300">
                  {logs.map((log, index) => {
                    const isToolExecution = log.startsWith("Executing tool:")
                    let formattedLog = log

                    if (isToolExecution) {
                      const match = log.match(/Params:\s*(\{[\s\S]*\})/)
                      if (match) {
                        try {
                          const parsedJson = JSON.parse(match[1])
                          const prettyJson = JSON.stringify(parsedJson, null, 2)
                          formattedLog = log.replace(match[1], prettyJson) // Replace raw JSON with formatted JSON
                        } catch (error) {
                          console.error("Invalid JSON:", error)
                        }
                      }
                    }

                    return isToolExecution ? (
                      <textarea
                        key={index}
                        value={updatedLogs[index] !== undefined ? updatedLogs[index] : formattedLog}
                        className="w-full bg-[#111827] text-purple-300 font-mono text-sm p-2 my-2 border border-gray-700 rounded resize-y outline-none"
                        rows={Math.max(formattedLog.split("\n").length, 3)}
                        onChange={(e) => {
                          const newLogs = [...updatedLogs]
                          newLogs[index] = e.target.value
                          setUpdatedLogs(newLogs)
                        }}
                      />
                    ) : (
                      <div key={index} className="border-l-2 border-gray-700 pl-3 py-1 my-2">
                        {log}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-4">
                  No logs available. Execute a prompt to see logs.
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between">
              <div></div>
              <Button
                onClick={() => {
                  handleRunTask(true)
                }}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Run Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">Result</h3>
        <Card className="border border-gray-800 bg-gray-900/30 rounded-lg shadow-lg">
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
                    <div className="h-8 w-8 rounded-full border-2 border-gray-700 border-t-purple-500 animate-spin mb-2"></div>
                    <p className="text-gray-400">Processing prompt...</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-[#111827] rounded-md border border-gray-800"
                >
                  <pre className="whitespace-pre-wrap text-gray-300">{result}</pre>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 italic text-center py-8"
                >
                  No result available. Execute a prompt to see results.
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}