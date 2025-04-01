"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import {
  Activity,
  Plus,
  Settings,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Layers,
  ExternalLink,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"

interface IntegrationComponentProps {
  google?: boolean
  github?: boolean
  slack?: boolean
  hubspot?: boolean
}

const handleGoogleAuth = async () => {
  const tenant_id = localStorage.getItem("tenant_id")
  const TENANT_ID = tenant_id
  let USER_ID = localStorage.getItem("user_id")
  console.log("This is the user_id: ", USER_ID)
  if (!USER_ID || USER_ID === "") {
    USER_ID = "fdb214f4-cb91-4893-b55c-82238648be9b"
  }
  const CLIENT_ID = "934128942917-lel7crgqajr5dffnhh054sgosffke9fl.apps.googleusercontent.com"
  const REDIRECT_URI = "https://ipass-5-tusharbisht-think41coms-projects.vercel.app/callback"
  const SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
  ]
  const stateData = JSON.stringify({
    tenant_id: TENANT_ID,
    user_id: USER_ID,
  })
  const encodedState = encodeURIComponent(stateData)
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES.join(" "))}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodedState}`

  // Redirect user to Google OAuth page
  window.location.href = googleAuthUrl
}

const handleHubspotAuth = async () => {
  const tenant_id = localStorage.getItem("tenant_id")
  const user_id = localStorage.getItem("user_id")
  console.log("This is the user_id: ", user_id)
  console.log("This is the tenant_id: ", tenant_id)
  if (!tenant_id) {
    toast.error("Tenant ID not found")
    return
  }

  // Create a custom toast with the input
  toast.info(
    ({ closeToast }) => (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative backdrop-blur-xl backdrop-saturate-150 bg-[#1a1f2e]/30 p-8 rounded-2xl shadow-2xl border border-white/10"
        style={{
          WebkitBackdropFilter: 'blur(16px)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-transparent rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-2xl backdrop-blur-xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-[#1c2333]/40 p-2 rounded-lg backdrop-blur-lg">
                <img 
                  src="https://img.icons8.com/?size=100&id=Xq3RA1kWzz3X&format=png&color=000000" 
                  alt="HubSpot" 
                  className="w-8 h-8"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold ml-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-blue-100">
              Connect HubSpot
            </h3>
          </div>
          
          <p className="text-gray-300/90 text-sm mb-6 leading-relaxed backdrop-blur-sm">
            Enter your HubSpot API token to connect your account. You can find this in your HubSpot developer settings.
          </p>

          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <input
              type="text"
              id="hubspotTokenInput"
              placeholder="Enter your HubSpot token"
              className="relative w-full px-4 py-3 bg-[#1c2333]/40 backdrop-blur-lg border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
              style={{ minWidth: '300px' }}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={closeToast}
              className="px-4 py-2 rounded-lg bg-[#1c2333]/40 backdrop-blur-lg text-gray-300 border border-white/10 hover:bg-[#252e42]/40 hover:border-white/20 transition-all duration-300"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ 
                scale: 1.02, 
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const input = document.getElementById('hubspotTokenInput') as HTMLInputElement
                const token = input.value.trim()
                if (!token) {
                  toast.error("Please enter a token", {
                    style: {
                      background: 'rgba(28, 35, 51, 0.4)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      color: '#fff',
                      borderColor: '#ef4444',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    },
                  })
                  return
                }
                
                const callbackUrl = `https://syncdjango.site/hubspot/hubspot_token/${tenant_id}/callback/`
                try {
                  const response = await fetch(callbackUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hubToken: token, user_id: user_id }),
                  })
                  if (response.ok) {
                    localStorage.setItem(`tenant_${tenant_id}_hubspot_integration`, "true")
                    toast.success("HubSpot connected successfully!", {
                      style: {
                        background: 'rgba(28, 35, 51, 0.4)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        color: '#fff',
                        borderColor: '#22c55e',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                      },
                    })
                    closeToast()
                  } else {
                    toast.error("Failed to connect HubSpot. Please check your token and try again.", {
                      style: {
                        background: 'rgba(28, 35, 51, 0.4)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        color: '#fff',
                        borderColor: '#ef4444',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                      },
                    })
                  }
                } catch (error) {
                  console.error(error)
                  toast.error("An error occurred while connecting to HubSpot.", {
                    style: {
                      background: 'rgba(28, 35, 51, 0.4)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      color: '#fff',
                      borderColor: '#ef4444',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    },
                  })
                }
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-lg text-white hover:from-purple-600/90 hover:to-blue-600/90 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Connect
            </motion.button>
          </div>
        </div>
      </motion.div>
    ),
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      className: "!bg-transparent !shadow-none",
      style: {
        background: 'transparent',
        maxWidth: '450px',
        width: '100%',
      },
    }
  )
}

const IntegrationComponent: React.FC = () => {
  // Use the tenant_id from params as your tenantId
  const tenantId = useParams().tenant_id

  // For simplicity, we assume no initial integrations are provided from the page props.
  const initialIntegrations: IntegrationComponentProps = {}

  const [isLoading, setIsLoading] = useState<string | null>(null)

  const [integrations, setIntegrations] = useState<Record<"google" | "github" | "slack" | "hubspot", boolean>>({
    google: initialIntegrations.google || false,
    github: initialIntegrations.github || false,
    slack: initialIntegrations.slack || false,
    hubspot: initialIntegrations.hubspot || false,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)

  // Handle integration click
  const handleIntegrationClick = async (integration: typeof integrationData[0], e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return // Prevent multiple clicks while loading

    setIsLoading(integration.id)
    
    try {
      if (!integrations[integration.id as IntegrationId]) {
        if (integration.id === 'hubspot') {
          await handleHubspotAuth()
          setIntegrations(prev => ({
            ...prev,
            hubspot: true
          }))
        } else {
          await integration.authHandler()
        }
      } else {
        await connectIntegration(integration.id)
      }
    } catch (error) {
      console.error("Error handling integration:", error)
      toast.error("Failed to process integration request")
    } finally {
      setIsLoading(null)
    }
  }

  // Check for Google and HubSpot authentication on component mount and when the component rerenders
  useEffect(() => {
    // Ensure we're running in the browser
    if (typeof window !== "undefined") {
      const tenant_id = localStorage.getItem("tenant_id")

      // Check Google integration status from localStorage
      const googleIntegration = localStorage.getItem(`tenant_${tenant_id}_google_integration`) === "true"

      // Check HubSpot integration status
      const hubspotIntegration = localStorage.getItem(`tenant_${tenant_id}_hubspot_integration`) === "true"

      // Update integration states if changed
      setIntegrations((prev) => ({
        ...prev,
        google: googleIntegration,
        hubspot: hubspotIntegration,
      }))

      // Check for Google OAuth callback
      checkGoogleCallback()
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  // Check for Google OAuth callback and update integration status
  const checkGoogleCallback = () => {
    // Check if the current URL contains the Google callback parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")

    if (code && state) {
      try {
        // Parse the state parameter
        const stateData = JSON.parse(decodeURIComponent(state))
        const tenant_id = stateData.tenant_id

        // Update Google integration in localStorage
        localStorage.setItem(`tenant_${tenant_id}_google_integration`, "true")

        // Update component state
        setIntegrations((prev) => ({
          ...prev,
          google: true,
        }))

        // Optional: Clear the URL parameters to prevent repeated processing
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (error) {
        console.error("Error processing Google callback:", error)
      }
    }
  }

  // Integration data with additional details
  const integrationData = [
    {
      id: "google",
      name: "Google Workspace",
      iconSrc: "https://img.icons8.com/?size=100&id=V5cGWnc9R4xj&format=png&color=000000",
      description: integrations.google
        ? "Connected and available for all users"
        : "Connect Gmail, Calendar, Drive and more",
      connectUrl: "/integrations/connect/google",
      authHandler: handleGoogleAuth,
      features: ["Email", "Calendar", "Drive", "Sheets"],
    },
    {
      id: "github",
      name: "GitHub",
      iconSrc: "https://img.icons8.com/?size=100&id=63777&format=png&color=000000",
      description: integrations.github
        ? "Connected and available for all users"
        : "Connect repositories, issues and pull requests",
      connectUrl: "/integrations/connect/github",
      authHandler: () => {}, // Add GitHub auth handler if needed
      features: ["Repositories", "Issues", "Pull Requests", "Actions"],
    },
    {
      id: "slack",
      name: "Slack",
      iconSrc: "https://img.icons8.com/?size=100&id=19978&format=png&color=000000",
      description: integrations.slack ? "Connected and available for all users" : "Connect channels and messaging",
      connectUrl: "/integrations/connect/slack",
      authHandler: () => {}, // Add Slack auth handler if needed
      features: ["Channels", "Messaging", "Notifications", "Bots"],
    },
    {
      id: "hubspot",
      name: "HubSpot",
      iconSrc: "https://img.icons8.com/?size=100&id=Xq3RA1kWzz3X&format=png&color=000000",
      description: integrations.hubspot
        ? "Connected and available for all users"
        : "Connect CRM, marketing and sales tools",
      connectUrl: "/integrations/connect/hubspot",
      authHandler: handleHubspotAuth,
      features: ["CRM", "Marketing", "Sales", "Service"],
    },
  ]

  const activeIntegrationsCount = Object.values(integrations).filter(Boolean).length

  const refreshIntegrations = () => {
    setIsRefreshing(true)

    // Simulate API call delay
    setTimeout(() => {
      const tenant_id = localStorage.getItem("tenant_id")
      // NEW: Directly check localStorage for integration statuses
      const googleIntegration = localStorage.getItem(`tenant_${tenant_id}_google_integration`) === "true"
      const githubIntegration = localStorage.getItem(`tenant_${tenant_id}_github_integration`) === "true"
      const slackIntegration = localStorage.getItem(`tenant_${tenant_id}_slack_integration`) === "true"
      const hubspotIntegration = localStorage.getItem(`tenant_${tenant_id}_hubspot_integration`) === "true"

      setIntegrations({
        google: googleIntegration,
        github: githubIntegration,
        slack: slackIntegration,
        hubspot: hubspotIntegration,
      })

      setIsRefreshing(false)
    }, 1000)
  }

  const validIntegrationIds = ["google", "github", "slack", "hubspot"] as const
  type IntegrationId = (typeof validIntegrationIds)[number]

  const connectIntegration = (integrationId: string) => {
    // Check if integrationId is one of the allowed keys
    if (!validIntegrationIds.includes(integrationId as IntegrationId)) {
      console.error("Invalid integration id", integrationId)
      return
    }
    // Now safely cast integrationId to IntegrationId
    const key = integrationId as IntegrationId
    const newState = { ...integrations }
    newState[key] = !newState[key]
    localStorage.setItem(`tenant_${tenantId}_${integrationId}_integration`, newState[key].toString())
    setIntegrations(newState)
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName={() => 
          "relative flex p-4 min-h-10 rounded-lg justify-between overflow-hidden cursor-pointer backdrop-blur-xl backdrop-saturate-150 bg-[#1c2333]/40 border border-white/10 mb-4 shadow-lg"
        }
      />
      <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0d14] to-[#111827] text-white p-4 md:p-8">
        {/* Header with purple glow */}
        <div className="relative mb-8">
          <div className="absolute -top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-2">
              <div className="bg-purple-600 p-3 rounded-full mr-4">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300">
                Integration Management
              </h1>
            </div>
            <p className="text-gray-400 ml-16">Connect and manage third-party services for your tenant</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#131825] border border-gray-800 rounded-lg p-6 shadow-xl hover:shadow-purple-900/10 transition-all duration-300"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-400" />
                </div>
                <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{activeIntegrationsCount}</div>
              <div className="text-sm text-gray-400">Connected integrations</div>
              <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeIntegrationsCount / integrationData.length) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                ></motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-[#131825] border border-gray-800 rounded-lg p-6 shadow-xl hover:shadow-purple-900/10 transition-all duration-300"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <Layers className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">Available</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{integrationData.length}</div>
              <div className="text-sm text-gray-400">Total integrations</div>
              <div className="mt-4 flex items-center text-xs text-gray-400">
                <span>More coming soon</span>
                <div className="ml-2 flex space-x-1">
                  <span className="h-1 w-1 rounded-full bg-gray-600 animate-pulse"></span>
                  <span
                    className="h-1 w-1 rounded-full bg-gray-600 animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                  <span
                    className="h-1 w-1 rounded-full bg-gray-600 animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-[#131825] border border-gray-800 rounded-lg p-6 shadow-xl hover:shadow-purple-900/10 transition-all duration-300"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">Status</span>
              </div>
              <div className="mt-1">
                {activeIntegrationsCount > 0 ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                    <span className="text-green-400 font-medium">Connected</span>
                  </motion.div>
                ) : (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mr-2"></div>
                    <span className="text-amber-400 font-medium">Not configured</span>
                  </motion.div>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-400">
                {activeIntegrationsCount > 0
                  ? "Your integrations are working properly"
                  : "Connect your first integration to get started"}
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              variant="default"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white border-0 transition-all duration-300 hover:translate-y-[-2px] shadow-md hover:shadow-lg flex items-center gap-2"
              onClick={() => setShowAlertModal(true)}
            >
              <Plus size={16} className="text-white" />
              <span>Add Integration</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-[#1c2333] hover:text-white transition-all duration-300 hover:translate-y-[-2px] shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Settings size={16} />
              <span>Configure</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="bg-[#1c2333] hover:bg-[#252e42] text-white transition-all duration-300 hover:translate-y-[-2px] shadow-md hover:shadow-lg flex items-center gap-2"
              onClick={refreshIntegrations}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw size={16} className="animate-spin text-gray-300" />
              ) : (
                <Activity size={16} className="text-gray-300" />
              )}
              <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
            </Button>
          </div>

          {/* Integrations List */}
          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {integrationData.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-[#131825] border border-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-purple-900/10 transition-all duration-300 group"
                  onClick={(e) => handleIntegrationClick(integration, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleIntegrationClick(integration, e as any)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative">
                    {/* Purple gradient overlay that appears on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-purple-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="p-5 flex flex-col md:flex-row md:items-center">
                      {/* Icon with glow effect */}
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[#1c2333] to-[#0f131e] flex items-center justify-center mb-4 md:mb-0 md:mr-5 shadow-lg relative group-hover:from-[#1c2333] group-hover:to-[#1a1f2e]"
                      >
                        {/* Purple glow that appears on hover */}
                        <div className="absolute inset-0 bg-purple-600/20 rounded-lg blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                        <img
                          src={integration.iconSrc || "/placeholder.svg"}
                          alt={integration.name}
                          width={28}
                          height={28}
                          className="relative z-10"
                        />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <h3 className="font-semibold text-lg text-white mb-1 md:mb-0">{integration.name}</h3>

                          {/* Status badge */}
                          <div className="flex items-center">
                            {integrations[integration.id as IntegrationId] ? (
                              <motion.span
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></div>
                                Connected
                              </motion.span>
                            ) : (
                              <motion.span
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-400 border border-gray-700"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></div>
                                Not Connected
                              </motion.span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-400 mt-1 mb-3">{integration.description}</p>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          {integration.features.map((feature, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-1 text-xs bg-[#1c2333] text-gray-300 rounded-md"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                        <Button
                          onClick={(e) => handleIntegrationClick(integration, e)}
                          disabled={isLoading === integration.id}
                          className={`w-full md:w-auto ${
                            integrations[integration.id as IntegrationId]
                              ? "bg-[#1c2333] hover:bg-[#252e42] text-white"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          } transition-all duration-300 flex items-center gap-2`}
                        >
                          {isLoading === integration.id ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : integrations[integration.id as IntegrationId] ? (
                            <>
                              <Settings size={16} />
                              <span>Configure</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink size={16} />
                              <span>Connect</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Call to Action */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 hover:gap-3 hover:bg-[#1c2333]"
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
        </div>
      </div>

      {/* Enhanced Modal Alert Box */}
      <AnimatePresence>
        {showAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Backdrop with stronger blur and semi-transparent dark overlay */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-lg"
              onClick={() => setShowAlertModal(false)}
            ></div>

            {/* Modal Content with improved padding, shadow, and rounded corners */}
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative z-50 bg-[#131825]/90 border border-purple-900/60 text-white p-8 rounded-xl shadow-2xl max-w-lg mx-4"
            >
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-600/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <div className="bg-purple-600/20 p-3 rounded-lg mr-4">
                    <AlertCircle size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Integration Information</h3>
                    <p className="text-gray-300 text-sm">
                      Integrations are configured at the tenant level and will be available to all users. Manage
                      permissions in the user settings.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    onClick={() => setShowAlertModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => setShowAlertModal(false)}
                  >
                    Understand
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default IntegrationComponent
