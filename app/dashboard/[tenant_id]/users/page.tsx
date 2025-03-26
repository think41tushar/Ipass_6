"use client";

import React from "react";
// import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Settings,
  Shield,
  Mail,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UserComponent = ({ users = [] }) => {
  // Animation variants (for demonstration, you can integrate framer-motion if needed)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Default user if none provided
  const defaultUser = {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    lastLogin: new Date().toLocaleString(),
    status: "Active",
  };

  const displayUsers = users.length ? users : [defaultUser];

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 pr-4">
              <div className="flex gap-4 items-center">
                <Button size="sm" className="flex items-center">
                  <Users size={16} />
                  <span>Invite User</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Settings size={16} />
                  <span>User Settings</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center"
                >
                  <Shield size={16} />
                  <span>Permissions</span>
                </Button>
                <div className="mt-4 sm:mt-0">
                  <Input type="text" placeholder="Search Users..." />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {displayUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center bg-black p-4 rounded-lg transition duration-200 hover:bg-gray-700"
                >
                  <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                    <span className="text-xl font-bold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-semibold">{user.name}</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user.status === "Active"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1 text-sm">
                      <div className="flex items-center">
                        <Mail size={14} className="mr-2" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Shield size={14} className="mr-2" />
                        <span>{user.role}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        <span>Last login: {user.lastLogin}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayUsers.length > 3 && (
              <div className="mt-6 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <span>View all users</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserComponent;
