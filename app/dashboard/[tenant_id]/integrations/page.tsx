"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Activity,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface IntegrationComponentProps {
  tenantId: string;
  initialIntegrations?: {
    google?: boolean;
    github?: boolean;
    slack?: boolean;
  };
}

const handleGoogleAuth = async () => {
  const TENANT_ID = "63c7704c-8ca1-4ec8-9bc4-ae11d66fd2f1";
  let USER_ID = localStorage.getItem("userid");
  if (!USER_ID || USER_ID === "") {
    USER_ID = "fdb214f4-cb91-4893-b55c-82238648be9b";
  }
  const CLIENT_ID =
    "934128942917-lel7crgqajr5dffnhh054sgosffke9fl.apps.googleusercontent.com";
  const REDIRECT_URI = "http://localhost:3000/callback";
  const SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
  ];
  const stateData = JSON.stringify({
    tenant_id: TENANT_ID,
    user_id: USER_ID,
  });
  const encodedState = encodeURIComponent(stateData);
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES.join(" "))}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodedState}`;

  // Redirect user to Google OAuth page
  window.location.href = googleAuthUrl;
};

const IntegrationComponent: React.FC<IntegrationComponentProps> = ({
  tenantId = "default",
  initialIntegrations = {},
}) => {
  const [integrations, setIntegrations] = useState<
    Record<"google" | "github" | "slack", boolean>
  >({
    google: initialIntegrations.google || false,
    github: initialIntegrations.github || false,
    slack: initialIntegrations.slack || false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Integration data with additional details
  const integrationData = [
    {
      id: "google",
      name: "Google",
      iconSrc:
        "https://img.icons8.com/?size=100&id=V5cGWnc9R4xj&format=png&color=000000",
      description: integrations.google
        ? "Connected and available for all users"
        : "Not connected",
      connectUrl: "/integrations/connect/google",
    },
    {
      id: "github",
      name: "GitHub",
      iconSrc:
        "https://img.icons8.com/?size=100&id=63777&format=png&color=000000",
      description: integrations.github
        ? "Connected and available for all users"
        : "Not connected",
      connectUrl: "/integrations/connect/github",
    },
    {
      id: "slack",
      name: "Slack",
      iconSrc:
        "https://img.icons8.com/?size=100&id=19978&format=png&color=000000",
      description: integrations.slack
        ? "Connected and available for all users"
        : "Not connected",
      connectUrl: "/integrations/connect/slack",
    },
  ];

  const activeIntegrationsCount =
    Object.values(integrations).filter(Boolean).length;

  // Refresh integration status
  const refreshIntegrations = () => {
    setIsRefreshing(true);

    // Simulate API call delay
    setTimeout(() => {
      const googleIntegration =
        localStorage.getItem(`tenant_${tenantId}_google_integration`) ===
        "true";
      const githubIntegration =
        localStorage.getItem(`tenant_${tenantId}_github_integration`) ===
        "true";
      const slackIntegration =
        localStorage.getItem(`tenant_${tenantId}_slack_integration`) === "true";

      setIntegrations({
        google: googleIntegration,
        github: githubIntegration,
        slack: slackIntegration,
      });

      setIsRefreshing(false);
    }, 1000);
  };

  const validIntegrationIds = ["google", "github", "slack"] as const;
  type IntegrationId = (typeof validIntegrationIds)[number];

  const connectIntegration = (integrationId: string) => {
    // Check if integrationId is one of the allowed keys
    if (!validIntegrationIds.includes(integrationId as IntegrationId)) {
      console.error("Invalid integration id", integrationId);
      return;
    }
    // Now safely cast integrationId to IntegrationId
    const key = integrationId as IntegrationId;
    const newState = { ...integrations };
    newState[key] = !newState[key];
    localStorage.setItem(
      `tenant_${tenantId}_${integrationId}_integration`,
      newState[key].toString()
    );
    setIntegrations(newState);
  };

  return (
    <div className="container mx-auto flex p-8">
      <Card className="bg-background">
        <CardHeader className="pb-2 border-b border-slate-800 bg-black">
          <CardTitle className="text-4xl font-bold text-white">
            Integration Management
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage your connected services and applications
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 bg-black text-white">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-slate-800 bg-black/50 rounded-lg p-4 text-center backdrop-blur-sm"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="text-sm text-slate-400">Active</div>
              <div className="text-2xl font-bold text-white">
                {activeIntegrationsCount}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="border border-slate-800 bg-black/50 rounded-lg p-4 text-center backdrop-blur-sm"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="text-sm text-slate-400">Total Available</div>
              <div className="text-2xl font-bold text-white">
                {integrationData.length}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="border border-slate-800 bg-black/50 rounded-lg p-4 text-center backdrop-blur-sm"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="text-sm text-slate-400">Status</div>
              <div className="mt-1">
                {activeIntegrationsCount > 0 ? (
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></div>
                    Connected
                  </motion.span>
                ) : (
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/60 text-amber-300 border border-amber-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></div>
                    Not configured
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white transition-all duration-300 hover:translate-y-[-2px] shadow-md hover:shadow-lg"
            >
              <Plus size={16} className="text-slate-300" />
              <span>Add Integration</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300 hover:translate-y-[-2px] shadow-md hover:shadow-lg"
            >
              <Settings size={16} />
              <span>Configure</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300 hover:translate-y-[-2px] shadow-md hover:shadow-lg"
              onClick={refreshIntegrations}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw size={16} className="animate-spin text-slate-300" />
              ) : (
                <Activity size={16} className="text-slate-300" />
              )}
              <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
            </Button>
          </div>

          {/* Integrations List */}
          <div className="space-y-3 mb-6">
            <AnimatePresence>
              {integrationData.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.01,
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    borderColor: "rgba(71, 85, 105, 0.8)",
                  }}
                  className="flex items-center p-4 border border-slate-800 bg-slate-800/30 rounded-lg cursor-pointer transition-all duration-300"
                  onClick={handleGoogleAuth}
                >
                  <motion.div
                    className="h-10 w-10 flex items-center justify-center bg-slate-700 rounded-md mr-4"
                    whileHover={{ rotate: 5 }}
                  >
                    <img
                      src={integration.iconSrc || "/placeholder.svg"}
                      alt={integration.name}
                      width={24}
                      height={24}
                    />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg text-white">
                        {integration.name}
                      </h3>
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {integrations[integration.id as IntegrationId] ? (
                          <div className="relative">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.2, 1] }}
                              transition={{ duration: 0.5 }}
                              className="absolute -inset-1 rounded-full bg-green-500/20"
                            ></motion.div>
                            <CheckCircle className="h-5 w-5 text-green-500 relative z-10" />
                          </div>
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </motion.div>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {integration.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Call to Action */}
          <div className="text-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 hover:gap-3 hover:bg-slate-800"
            >
              <span>Explore all integrations</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                  duration: 1,
                }}
              >
                <ArrowRight size={16} />
              </motion.div>
            </Button>
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-blue-950/40 border border-blue-900/50 text-blue-300 p-4 rounded-md text-sm backdrop-blur-sm"
          >
            <div className="flex items-start">
              <div className="mr-2 mt-0.5">
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 5,
                    duration: 1,
                  }}
                >
                  <AlertCircle size={16} className="text-blue-400" />
                </motion.div>
              </div>
              <div>
                Integrations are configured at the tenant level and will be
                available to all users. Manage permissions in the user settings.
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationComponent;
