"use client";

import type React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Settings,
  Shield,
  Mail,
  Calendar,
  Search,
  UserPlus,
  Lock,
  MoreHorizontal,
  ChevronRight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

const UserComponent: React.FC = () => {
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTenantId(localStorage.getItem("tenant_id"));
    }
  }, []);
  // Default users with more sample data
  const displayUsers = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "Administrator",
      lastLogin: "Today, 10:23 AM",
      status: "Active",
      avatar: "AU",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Editor",
      lastLogin: "Yesterday, 3:45 PM",
      status: "Active",
      avatar: "JS",
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      role: "Viewer",
      lastLogin: "Apr 1, 2025, 9:12 AM",
      status: "Inactive",
      avatar: "RJ",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0d14] to-[#111827] text-white p-4 md:p-8">
      {/* Header with purple glow */}
      <div className="relative mb-8">
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10 ml-[8rem] flex items-center gap-4">
          <div className="bg-purple-600/20 p-3 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>

              <circle cx="9" cy="7" r="4"></circle>

              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>

              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300 mb-2">
              User Management
            </h1>

            <p className="text-gray-400">
              Manage user accounts and permissions for tenant ID: {tenantId}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="bg-[#131825] border-0 shadow-xl hover:shadow-purple-900/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold mt-1">243</p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-400">
                <Activity className="h-3 w-3 mr-1" />
                <span>12% increase this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#131825] border-0 shadow-xl hover:shadow-purple-900/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold mt-1">198</p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-400">
                <span>81% of total users</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#131825] border-0 shadow-xl hover:shadow-purple-900/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Admins</p>
                  <p className="text-2xl font-bold mt-1">12</p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-400">
                <span>5% of total users</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#131825] border-0 shadow-xl hover:shadow-purple-900/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">New Users</p>
                  <p className="text-2xl font-bold mt-1">28</p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <UserPlus className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-400">
                <span>Last 30 days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#131825] border-0 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-gray-800 bg-[#0f131e] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl font-semibold">
                User Accounts
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="pl-9 bg-[#0a0d14] border-gray-700 focus:border-purple-500 w-full sm:w-64 h-9 text-sm rounded-md"
                  />
                </div>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white border-0 h-9 px-4 rounded-md flex items-center gap-2 transition-colors duration-200"
                >
                  <UserPlus size={16} />
                  <span>Add User</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {displayUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center bg-[#0a0d14] rounded-lg transition-all duration-200 hover:bg-[#161b2b] border border-gray-800 hover:border-purple-900/50 group"
                >
                  <div className="p-4 sm:p-5 flex items-center flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white font-bold">
                        {user.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-lg font-semibold text-white truncate">
                          {user.name}
                        </p>
                        <span
                          className={`mt-2 sm:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "Active"
                              ? "bg-green-900/30 text-green-400 border border-green-800"
                              : "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                          }`}
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                              user.status === "Active"
                                ? "bg-green-400"
                                : "bg-yellow-400"
                            }`}
                          ></span>
                          {user.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                        <div className="flex items-center text-gray-400">
                          <Mail size={14} className="mr-2 text-gray-500" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Shield size={14} className="mr-2 text-gray-500" />
                          <span>{user.role}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Calendar size={14} className="mr-2 text-gray-500" />
                          <span>Last login: {user.lastLogin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-t sm:border-t-0 sm:border-l border-gray-800 divide-x divide-gray-800">
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-none h-12 text-gray-400 hover:text-purple-400 hover:bg-[#1a1f2e]"
                    >
                      <Settings size={18} />
                      <span className="sr-only">Settings</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-none h-12 text-gray-400 hover:text-purple-400 hover:bg-[#1a1f2e]"
                    >
                      <Lock size={18} />
                      <span className="sr-only">Permissions</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-none h-12 text-gray-400 hover:text-purple-400 hover:bg-[#1a1f2e]"
                    >
                      <MoreHorizontal size={18} />
                      <span className="sr-only">More</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-400">Showing 3 of 243 users</p>
              <Button
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-[#1a1f2e] flex items-center gap-1 transition-colors duration-200"
              >
                <span>View all users</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Button className="bg-[#131825] hover:bg-[#1c2333] border border-gray-800 text-white h-auto py-4 flex items-center justify-start px-4 shadow-md">
            <div className="bg-purple-600/20 p-2 rounded-md mr-3">
              <UserPlus className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium">Bulk Import</p>
              <p className="text-xs text-gray-400 mt-1">
                Import users from CSV
              </p>
            </div>
          </Button>

          <Button className="bg-[#131825] hover:bg-[#1c2333] border border-gray-800 text-white h-auto py-4 flex items-center justify-start px-4 shadow-md">
            <div className="bg-purple-600/20 p-2 rounded-md mr-3">
              <Lock className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium">Role Management</p>
              <p className="text-xs text-gray-400 mt-1">
                Configure user permissions
              </p>
            </div>
          </Button>

          <Button className="bg-[#131825] hover:bg-[#1c2333] border border-gray-800 text-white h-auto py-4 flex items-center justify-start px-4 shadow-md">
            <div className="bg-purple-600/20 p-2 rounded-md mr-3">
              <Settings className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium">User Settings</p>
              <p className="text-xs text-gray-400 mt-1">
                Configure default settings
              </p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserComponent;
