"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MailIcon, FileIcon, CalendarIcon } from "lucide-react";

interface LogsAndResultSectionProps {
  logs: string[];
  result: string | null;
  isExecuting: boolean;
  setUpdatedLogs: (logs: string[]) => void;
  updatedLogs: string[];
  handleRerun: (updatedLogs: string[]) => void;
}

interface FormattedResult {
  type: 'email' | 'drive' | 'calendar' | 'text';
  data: {
    emails?: Array<{
      subject: string;
      from: string;
      date: string;
      body: string;
    }>;
    driveFiles?: Array<{
      fileName: string;
      fileType: string;
      content?: string;
    }>;
    calendarEvents?: Array<{
      title: string;
      date: string;
      time: string;
      description?: string;
    }>;
    text?: string;
  };
}

export const LogsAndResultSection: React.FC<LogsAndResultSectionProps> = ({
  logs,
  result,
  isExecuting,
  setUpdatedLogs,
  updatedLogs,
  handleRerun,
}) => {
  const [editableIndices, setEditableIndices] = useState<number[]>([]);
  
  // Initialize updatedLogs when logs change
  useEffect(() => {
    if (logs.length > 0) {
      // Only initialize updatedLogs if it's empty or doesn't match logs length
      if (updatedLogs.length === 0 || updatedLogs.length !== logs.length) {
        // Make a deep copy of logs
        const initializedLogs = [...logs];
        setUpdatedLogs(initializedLogs);
        console.log("Initialized updatedLogs with actual log values:", initializedLogs);
      }
      
      // Find which logs are editable (tool executions)
      const editableLogIndices = logs
        .map((log, index) => isToolExecution(log) ? index : -1)
        .filter(index => index !== -1);
      
      setEditableIndices(editableLogIndices);
      console.log("Editable log indices:", editableLogIndices);
    }
  }, [logs, setUpdatedLogs, updatedLogs.length]);

  // Handle the rerun action
  const handleRerunClick = () => {
    console.log("Rerunning with logs:", updatedLogs);
    // Make a copy of the updatedLogs to ensure we're sending the latest version
    const currentUpdatedLogs = [...updatedLogs];
    handleRerun(currentUpdatedLogs);
  };

  // Check if a log is editable (tool execution)
  const isToolExecution = (log: string) => {
    return typeof log === 'string' && log.includes("Executing tool:");
  };

  // Handle log edit
  const handleLogEdit = (index: number, newValue: string) => {
    const newLogs = [...updatedLogs];
    newLogs[index] = newValue;
    setUpdatedLogs(newLogs);
    console.log("Updated log at index", index, "to:", newValue);
  };

  const parseResult = (result: string | null): FormattedResult => {
    if (!result) {
      return { type: 'text', data: { text: '' } };
    }

    try {
      // Try to parse the result as JSON first
      const parsed = JSON.parse(result);
      
      if (parsed.emails?.length > 0) {
        return {
          type: 'email',
          data: { emails: parsed.emails }
        };
      }
      
      if (parsed.googleDrive?.length > 0 || parsed.driveFiles?.length > 0) {
        return {
          type: 'drive',
          data: { driveFiles: parsed.googleDrive || parsed.driveFiles }
        };
      }
      
      if (parsed.calendarEvents?.length > 0) {
        return {
          type: 'calendar',
          data: { calendarEvents: parsed.calendarEvents }
        };
      }
    } catch (error) {
      // If not JSON or parsing fails, look for patterns in the text
      if (result.includes('Subject:') && result.includes('From:')) {
        const emails = result.split('\n\n')
          .filter(block => block.includes('Subject:'))
          .map(block => {
            const subject = block.match(/Subject:\s*([^\n]*)/)?.[1] || '';
            const from = block.match(/From:\s*([^\n]*)/)?.[1] || '';
            const date = block.match(/Date:\s*([^\n]*)/)?.[1] || '';
            const bodyStart = block.indexOf('Body:');
            const body = bodyStart > -1 ? block.slice(bodyStart + 5).trim() : '';
            
            return { subject, from, date, body };
          });
          
        if (emails.length > 0) {
          return {
            type: 'email',
            data: { emails }
          };
        }
      }
    }
    
    // Default to text if no structured data is found
    return {
      type: 'text',
      data: { text: result }
    };
  };

  return (
    <div className="space-y-6">
      {/* Logs Section */}
      <Card className="border border-gray-800 bg-[#0f1219] shadow-lg">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <span className="mr-2">📋</span> Execution Logs
          </h3>
          <ScrollArea className="h-[300px] rounded-md border border-gray-800 bg-[#0a0c13] p-4">
            <AnimatePresence mode="wait">
              {logs.length > 0 ? (
                <div className="space-y-1 font-mono pt-2 text-sm text-gray-300">
                  {logs.map((log, index) => {
                    const isEditable = editableIndices.includes(index);
                    let formattedLog = log;

                    if (isEditable) {
                      const match = log.match(/Params:\s*(\{[\s\S]*\})/);
                      if (match) {
                        try {
                          const parsedJson = JSON.parse(match[1]);
                          const prettyJson = JSON.stringify(
                            parsedJson,
                            null,
                            2
                          );
                          formattedLog = log.replace(match[1], prettyJson);
                        } catch (error) {
                          console.error("Invalid JSON:", error);
                        }
                      }
                    }

                    return isEditable ? (
                      <div key={index} className="relative my-4 border-l-4 border-purple-500 pl-3 pr-2 py-2 bg-[#131825] rounded-md">
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded-bl-md">
                          Editable
                        </div>
                        <textarea
                          defaultValue={formattedLog}
                          className="w-full bg-[#111827] text-purple-300 font-mono text-sm p-2 my-2 border border-purple-700 rounded resize-y outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          rows={Math.max(formattedLog.split("\n").length, 3)}
                          onChange={(e) => handleLogEdit(index, e.target.value)}
                        />
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="py-1 whitespace-pre-wrap break-words"
                      >
                        {formattedLog}
                      </div>
                    );
                  })}
                </div>
              ) : isExecuting ? (
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No logs to display</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Result Section */}
      <Card className="border border-gray-800 bg-[#0f1219] shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">✨</span> Result
            </h3>
            {logs.length > 0 && editableIndices.length > 0 && (
              <Button
                onClick={handleRerunClick}
                disabled={isExecuting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Run Again
              </Button>
            )}
          </div>
          <div className="rounded-md border border-gray-800 bg-[#0a0c13] p-4 min-h-[200px] max-h-[300px] overflow-auto">
            <AnimatePresence mode="wait">
              {isExecuting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[200px] space-y-4"
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-[#0a0c13]"></div>
                    </div>
                  </div>
                  <p className="text-purple-300 text-sm font-medium">
                    Processing prompt...
                  </p>
                  <p className="text-gray-400 text-xs">
                    This may take a few moments
                  </p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-300"
                >
                  <div className="space-y-4">
                    {(() => {
                      try {
                        const formattedResult: FormattedResult = parseResult(result);
                        
                        switch (formattedResult.type) {
                          case 'email':
                            return formattedResult.data.emails?.map((email, idx) => (
                              <div key={idx} className="p-4 border border-gray-800 rounded-md bg-[#131825] hover:border-purple-500/20 transition-colors">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <MailIcon className="h-5 w-5 text-purple-400 mr-2" />
                                    <h4 className="font-medium text-purple-300">{email.subject}</h4>
                                  </div>
                                  <div className="text-sm space-y-1 text-gray-400">
                                    <p><span className="text-gray-500">From:</span> {email.from}</p>
                                    <p><span className="text-gray-500">Date:</span> {email.date}</p>
                                  </div>
                                  <div className="mt-2 text-gray-300 whitespace-pre-wrap">
                                    {email.body}
                                  </div>
                                </div>
                              </div>
                            ));
                            
                          case 'drive':
                            return formattedResult.data.driveFiles?.map((file, idx) => (
                              <div key={idx} className="p-4 border border-gray-800 rounded-md bg-[#131825] hover:border-purple-500/20 transition-colors">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <FileIcon className="h-5 w-5 text-blue-400 mr-2" />
                                    <h4 className="font-medium text-blue-300">{file.fileName}</h4>
                                  </div>
                                  <div className="text-sm space-y-1">
                                    <p className="text-gray-400"><span className="text-gray-500">Type:</span> {file.fileType}</p>
                                    {file.content && (
                                      <div className="mt-2 text-gray-300 whitespace-pre-wrap">
                                        {file.content}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ));
                            
                          case 'calendar':
                            return formattedResult.data.calendarEvents?.map((event, idx) => (
                              <div key={idx} className="p-4 border border-gray-800 rounded-md bg-[#131825] hover:border-purple-500/20 transition-colors">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <CalendarIcon className="h-5 w-5 text-green-400 mr-2" />
                                    <h4 className="font-medium text-green-300">{event.title}</h4>
                                  </div>
                                  <div className="text-sm space-y-1 text-gray-400">
                                    <p><span className="text-gray-500">Date:</span> {event.date}</p>
                                    <p><span className="text-gray-500">Time:</span> {event.time}</p>
                                    {event.description && (
                                      <div className="mt-2 text-gray-300">
                                        {event.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ));
                            
                          default:
                            return <div className="whitespace-pre-wrap">{formattedResult.data.text}</div>;
                        }
                      } catch (error) {
                        // If parsing fails, display as plain text
                        return <div className="whitespace-pre-wrap">{result}</div>;
                      }
                    })()}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[200px] space-y-2 text-gray-400"
                >
                  <div className="h-12 w-12 text-gray-600 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p>No result yet</p>
                  <p className="text-xs text-gray-500">
                    Execute a prompt to see results
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {result && (
            <div className="mt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-700 hover:bg-gray-800"
                onClick={() => {
                  if (result) {
                    navigator.clipboard.writeText(result);
                  }
                }}
              >
                Copy Result
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
