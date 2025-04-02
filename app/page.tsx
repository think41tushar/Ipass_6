"use client"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  return (
    <>
      {/* Enhanced animated background with more elements and effects */}
      <div className="fixed inset-0 -z-1 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-95">
          {/* Improved animated circles with better positioning and effects */}
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-xl animate-[pulse_4s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-1/3 right-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-2xl animate-[bounce_15s_ease-in-out_infinite]"></div>
          <div className="absolute top-2/3 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-xl animate-[pulse_7s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/2 right-1/4 h-56 w-56 rounded-full bg-pink-500/5 blur-xl animate-[pulse_9s_ease-in-out_infinite]"></div>

          {/* Enhanced gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-900/10 to-transparent animate-[background-pan_10s_ease-in-out_infinite] bg-[length:200%_200%]"></div>

          {/* Subtle grid overlay for texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS0yIDRoMnYyaC0ydi0yek0zNCAzMHYyaC0ydi0yaDJ6bTAgOHYyaC0ydi0yaDJ6bS00LTRoMnYyaC0ydi0yek0zMCAzMHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 w-full md:max-w-md h-[100vh] flex flex-col items-center justify-center gap-6 relative z-10">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg shadow-purple-500/20">
          <Building2 className="h-10 w-10 text-white drop-shadow-md" />
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 drop-shadow-sm">
          Tenant Admin
        </h1>

        <p className="text-lg text-gray-300/90 leading-relaxed max-w-sm text-center font-light">
          Multi-tenant administration platform with seamless OAuth integration and elegant user management
        </p>

        <Button
          className="mt-4 px-8 py-6 rounded-xl text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none shadow-lg shadow-purple-700/30 hover:shadow-purple-700/50 transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => router.push("/create-tenant")}
        >
          Create Tenant
        </Button>

        <div className="text-sm text-gray-400 mt-2 font-light tracking-wide">
          <span className="inline-flex items-center">
            <span className="h-1 w-1 rounded-full bg-purple-500 mr-2"></span>
            Admin access only
          </span>
        </div>

        {/* Added subtle floating elements for visual interest */}
        <div className="absolute bottom-10 right-10 opacity-20 animate-pulse">
          <div className="h-20 w-20 rounded-full border border-white/10"></div>
        </div>
        <div className="absolute top-10 left-10 opacity-10 animate-pulse delay-700">
          <div className="h-16 w-16 rounded-full border border-white/10"></div>
        </div>
      </div>
    </>
  )
}